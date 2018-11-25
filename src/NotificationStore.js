import {debug} from 'loglevel';

export default class NotificationStore {
    constructor() {
        this.store = {};
        this.listeners = [];
        this._id_count=0;
    }

    add(notif) {
        let id = ++this._id_count;
        if (id > 1e4) this._id_count = 0;
        if(notif.replaces_id){
            debug('Notification replaces id', notif.replaces_id);
            debug('store has id:', Object.keys(this.store).includes(notif.replaces_id));
            id = notif.replaces_id;
        } else {
            while(Object.keys('store').includes(id)) id++;
        }
        this.store[id] = notif;
        let timeout = setTimeout(() => this.close(id), notif.expire_timeout > 0 ? notif.expire_timeout : 10*1000);
        this.store[id].timeout = timeout;

        this.update();
        return id;
    }
    close(id) {
        debug(`Deleting notification ${id}`);
        if(this.store[id] && this.store[id].timeout)
            clearTimeout(this.store[id].timeout);
        delete this.store[id];
        this.update();
    }
    addUpdateListener(fun) {
        this.listeners.push(fun);
    }
    update() {
        debug('Current store:', this.store);
        this.listeners.forEach(f => f(this.store));
    }
    get _store() {
        return this.store;
    }
}
