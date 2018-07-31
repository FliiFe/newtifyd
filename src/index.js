import NotificationDaemon from './NotificationDaemon';
import NotificationStore from './NotificationStore';
import Frontend from './Frontend';

import log from 'loglevel';
import prefix from 'loglevel-plugin-prefix';
import chalk from 'chalk';

import c from './config'

import { hostname } from 'os';
import { readFile } from 'mz/fs';
import { isAbsolute } from 'path';
import DataURI from 'datauri';
import ft from 'file-type';
import { findIcon } from './IconRetreiver'

const colors = {
    TRACE: chalk.magenta,
    DEBUG: chalk.cyan,
    INFO: chalk.blue,
    WARN: chalk.yellow,
    ERROR: chalk.red
};

prefix.reg(log);
log.enableAll();
log.setDefaultLevel(c.loglevel);

prefix.apply(log, {
    format(level, name, timestamp) {
        return `${chalk.gray(`[${timestamp}]`)} ${colors[level.toUpperCase()](
            level
        )}`;
    }
});

const daemon = new NotificationDaemon();
const store = new NotificationStore();
const front = new Frontend();

daemon.notify = async notification => {
    log.debug(notification);

    notification.time = Date.now();

    // Notification title and top text
    notification.title = notification.summary || notification.appname || '';
    notification.appname = notification.summary
        ? notification.appname.toLowerCase()
        : hostname();

    // Notification icon
    let imgpath =
        notification.hints['image-path'] ||
        notification.hints['image_path'] ||
        notification.app_icon;
    if (imgpath) {
        if (isAbsolute(imgpath)) {
            imgpath = imgpath.replace('file://', '');
        } else {
            // Refers to a freedesktop icon. Unimplemented
            let path = findIcon(imgpath)
            if(path) imgpath = path;
        }
        // We need to read it here, there is not enough time to wait for the frontend to do it
        let buff = await readFile(imgpath).catch(e => log.error(e));
        if(buff) {
            let icon_ft = ft(buff);
            if(icon_ft.ext === 'xml') icon_ft.ext = 'svg';
            log.debug('Reading buffer as', icon_ft);
            let datauri = new DataURI();
            datauri.format('.' + icon_ft.ext, buff);
            notification.icon = datauri.content;
        }
    }
    if(notification.hints['image-data']) log.debug('Got image-data:', notification.hints.icon_data)
    // Register the notification in the store and get its id
    let id = store.add(notification);
    log.debug(`Assiging id ${id}`);
    return id;
};

daemon.close = front.close = id => {
    log.debug('Closing notification', id);
    store.close(id);
};

front.action = (id, action) => {
    log.debug('Invoking action', action, 'on notification', id);
    daemon.invokeAction(id, action);
    store.close(id);
}

store.addUpdateListener(store => front.update(store));

process.on('unhandledRejection', r => log.error(r));