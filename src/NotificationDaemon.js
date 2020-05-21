import dbus from 'dbus-next'
import {name, version} from '../package.json'
import log from './Logger'

const {Interface, method, signal} = dbus.interface
const bus = dbus.sessionBus()

export default class NotificationInterface extends Interface {
    @method({inSignature: 'susssasa{sv}i', outSignature: 'u'})
    Notify(appname, replaces_id, app_icon, summary, body, actions, hints, expire_timeout) {
        return this._notify({
            appname,
            replaces_id,
            app_icon,
            summary,
            body,
            actions,
            hints,
            expire_timeout
        })
    }

    @method({inSignature: 'u'})
    CloseNotification(id) {
        this._close(id)
    }

    @method({outSignature: 'as'})
    GetCapabilities() {
        return [
            'body',
            'actions',
            'body-hyperlinks',
            'body-markup',
            'body-images',
            'icon-static',
            'persistence'
        ]
    }

    @method({outSignature: 'ssss'})
    GetServerInformation() {
        return [name, 'N/A', version, '1.2']
    }

    @signal({signature: 'us'})
    ActionInvoked(id, action_key) {
        return [id, action_key]
    }

    @signal({signature: 'uu'})
    NotificationClosed(id, reason) {
        return [id, reason]
    }

    async registerDbusService() {
        await bus.requestName('org.freedesktop.Notifications')
        bus.export('/org/freedesktop/Notifications', this)
        log.info('Service registered')
    }

    constructor() {
        super('org.freedesktop.Notifications')
        this._notify = this._close = () => undefined
    }
    set notify(fun) {
        this._notify = fun
    }
    get notify() {
        return this.notify
    }
    set close(fun) {
        this._close = fun
    }
    get close() {
        return this.close
    }
    invokeAction(id, action) {
        this.iface.emit('ActionInvoked', id, action)
    }
}
