import NotificationInterface from './NotificationDaemon'
import NotificationStore from './NotificationStore'
import Frontend from './Frontend'

import log from './Logger'
import config from './config'
log.setDefaultLevel(config.loglevel)

import { hostname } from 'os'
import { readFile } from 'mz/fs'
import { isAbsolute } from 'path'
import DatauriParser from 'datauri/parser'
import FileType from 'file-type'
import { findIcon } from './IconRetreiver'

import { load } from 'cheerio'


const daemon = new NotificationInterface()
const store = new NotificationStore()
const front = new Frontend()

daemon.notify = async notification => {
    log.debug(notification)

    notification.time = Date.now()

    // Notification title and top text
    notification.title = notification.summary || notification.appname || ''
    notification.appname = notification.summary
        ? notification.appname.toLowerCase()
        : hostname()

    // Notification icon
    let imgpath =
        (notification.hints['image-path'] && notification.hints['image-path'].value) ||
        (notification.hints['image_path'] && notification.hints['image_path'].value) ||
        notification.app_icon
    if (imgpath) {
        imgpath = imgpath.replace(/^file:\/\//, '')
        if (!isAbsolute(imgpath)) {
            // Refers to a freedesktop icon. Unimplemented
            let path = findIcon(imgpath)
            if (path) imgpath = path
        }
        // We need to read it here, there is not enough time to wait for the frontend to do it
        let buff = await readFile(imgpath).catch(e => log.error(e))
        if (buff) {
            let icon_ft = await FileType.fromBuffer(buff)
            if (icon_ft.ext === 'xml') icon_ft.ext = 'svg'
            log.debug('Reading buffer as', icon_ft)
            let datauriparser = new DatauriParser()
            notification.icon = datauriparser.format('.' + icon_ft.ext, buff).content
        }
    }
    // TODO: Fix this with dbus-next (with Variant)
    // if (notification.hints['image-data']) log.debug('Got image-data:', notification.hints.icon_data)

    notification = htmlmiddleware(notification)

    // Register the notification in the store and get its id
    let id = store.add(notification)
    log.debug(`Assiging id ${id}`)
    return id
}

daemon.close = front.close = id => {
    log.debug('Closing notification', id)
    store.close(id)
}

daemon.registerDbusService()

front.action = (id, action) => {
    log.debug('Invoking action', action, 'on notification', id)
    daemon.ActionInvoked(parseInt(id), action)
    // if(store._store[id].defaulturl && action === 'default') opn(store._store[id].defaulturl);

    // Closing the notification on action is not expected behavior, but can be wanted behavior
    if (config.closeonclick) store.close(id)
}

store.addUpdateListener(store => front.update(store))

const htmlmiddleware = notification => {
    const $ = load(notification.body)
    $('body > *').not('b,i,u,a,img').each((_, e) => {
        e.replaceWith('')
    })
    $('body > *').each((_, e) => {
        Object.keys(e.attribs).filter(name => !['href', 'src', 'alt'].includes(name))
            .forEach(a => $(e).removeAttr(a))
    })
    $('body > img')
        .each((_, e) =>
            $(e).attr('src', $(e).attr('src').replace('file://', `http://localhost:${config.devServer ? '8080' : config.serverPort}/localfs/`))
        )
    log.debug('Changing body to', $('body').html())
    notification.body = $('body').html()
    return notification
}

process.on('unhandledRejection', r => log.error(r))
