import DBus from 'dbus'
import { name, version } from '../package.json'

export default class NotificationDaemon {
    constructor() {
        this.service = DBus.registerService(
            'session',
            'org.freedesktop.Notifications'
        )
        this.obj = this.service.createObject('/org/freedesktop/Notifications')
        this.iface = this.obj.createInterface('org.freedesktop.Notifications')

        this.iface.addMethod(
            'Notify',
            {
                in: [
                    { type: 's' },
                    { type: 'u' },
                    { type: 's' },
                    { type: 's' },
                    { type: 's' },
                    { type: 'as' },
                    { type: 'a{sv}' },
                    { type: 'x' }
                ],
                out: DBus.Define(Number)
            },
            (
                appname,
                replaces_id,
                app_icon,
                summary,
                body,
                actions,
                hints,
                expire_timeout,
                callback
            ) => {
                callback(
                    null,
                    this._notify({
                        appname,
                        replaces_id,
                        app_icon,
                        summary,
                        body,
                        actions,
                        hints,
                        expire_timeout
                    })
                )
            }
        )

        this.iface.addMethod(
            'CloseNotification',
            { in: DBus.Define(Number) },
            (id, callback) => {
                callback(this._close(id))
            }
        )

        this.iface.addMethod(
            'GetCapabilities',
            { out: { type: 'as' } },
            callback => {
                callback(null, [
                    'body',
                    'actions',
                    'body-hyperlinks',
                    'body-markup',
                    'body-images',
                    'icon-static',
                    'persistence'
                ])
            }
        )

        this.iface.addMethod(
            'GetServerInformation',
            { out: { type: 'ssss' } },
            callback => {
                callback(null, [name, 'N/A', version, '1.2'])
            }
        )

        this.iface.addSignal('ActionInvoked', {
            types: [{type: 'u'},{type: 's'}]
        })

        this.iface.update()

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
