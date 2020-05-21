import NotificationInterface from './NotificationDaemon'
import NotificationStore from './NotificationStore'
import Frontend from './Frontend'

import log from './Logger'

import { hostname } from 'os'
import { readFile } from 'mz/fs'
import { isAbsolute } from 'path'
import DataURI from 'datauri'
import ft from 'file-type'
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
        notification.hints['image-path'] ||
        notification.hints['image_path'] ||
        notification.app_icon
    if (imgpath) {
        if (isAbsolute(imgpath)) {
            imgpath = imgpath.replace('file://', '')
        } else {
            // Refers to a freedesktop icon. Unimplemented
            let path = findIcon(imgpath)
            if (path) imgpath = path
        }
        // We need to read it here, there is not enough time to wait for the frontend to do it
        let buff = await readFile(imgpath).catch(e => log.error(e))
        if (buff) {
            let icon_ft = ft(buff)
            if (icon_ft.ext === 'xml') icon_ft.ext = 'svg'
            log.debug('Reading buffer as', icon_ft)
            let datauri = new DataURI()
            datauri.format('.' + icon_ft.ext, buff)
            notification.icon = datauri.content
        }
    }
    if (notification.hints['image-data']) log.debug('Got image-data:', notification.hints.icon_data)

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
    daemon.invokeAction(id, action)
    // if(store._store[id].defaulturl && action === 'default') opn(store._store[id].defaulturl);
    store.close(id)
}

store.addUpdateListener(store => front.update(store))

const htmlmiddleware = notification => {
    const $ = load(notification.body)
    const a = $('a').first()
    const text = a.text()
    const link = a.attr('href')
    if (text) notification.appname = text.toLowerCase()
    $('body > *').not('b,i,u').each(function () {
        $(this).replaceWith('')
    })
    log.debug('Changing body to', $('body').html())
    notification.body = $('body').html()
    notification.defaulturl = link
    return notification
}

process.on('unhandledRejection', r => log.error(r))
