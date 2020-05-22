import log from './Logger'

export default class NotificationStore {
    constructor() {
        this.store = {}
        this.listeners = []
        this._id_count = 0
        this.timeouts = {}
    }

    /**
     * Adds a notification to the store
     *
     * @param {Object} notif the notification object
     * @returns {Number} the notification id
     */
    add(notif) {
        let id = ++this._id_count
        if (id > 1e4) this._id_count = 0
        if (notif.replaces_id) {
            log.debug('Notification replaces id', notif.replaces_id)
            log.debug('store has id:', Object.keys(this.store).includes(notif.replaces_id))
            id = notif.replaces_id
        } else {
            while (Object.keys('store').includes(id)) id++
        }
        this.store[id] = notif
        if (notif.expire_timeout > 0) {
            let timeout = setTimeout(() => this.close(id), notif.expire_timeout)
            this.store[id].timeout = id
            this.timeouts[id] = timeout
        }

        this.update()
        return id
    }

    /**
     * Closes a notification
     *
     * @param {Number} id notification id (returned when the notification is added)
     */
    close(id) {
        log.debug(`Deleting notification ${id}`)
        if (this.store[id] && this.timeouts[this.store[id].timeout])
            clearTimeout(this.timeouts[this.store[id].timeout])
        delete this.store[id]
        delete this.timeouts[id]
        this.update()
    }

    /**
     * Adds a listener to the group of listeners
     *
     * @param {Function} fun the listener
     */
    addUpdateListener(fun) {
        this.listeners.push(fun)
    }

    /**
     * Calls every listener. This should only be called internally,
     * usually after the store has been modified
     *
     */
    update() {
        this.listeners.forEach(f => f(this.store))
    }

    /**
     * Get the store content
     *
     * @returns {Array} array of notifications
     */
    get _store() {
        return this.store
    }
}
