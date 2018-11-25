<template>
    <div id="app">
        <!-- <md-button class="md-raised add-button" @click="notify()">Add</md-button> -->
        <transition-group name="notifs" tag="div" class="notification-container" ref="container" :style="{ maxHeight: mh + 'px' }">
            <Notification v-for="n in rnotifications" :key="n.id" :notif="n" @action="actionClicked" @close="closeNotification"/>
        </transition-group>
    </div>
</template>

<script>
import Notification from './components/Notification';
import {ipcRenderer, remote} from 'electron';
import config from './../../src/config';

export default {
    name: 'App',
    components: {
        Notification,
    },
    methods: {
        notify() {
            this.notifications.push({
                appname: 'tests.peter.sh',
                summary: 'This is a message',
                title: 'Notification title ' + (this.notifications.length + 1),
                icon: false,
                time: 'now',
                body: 'This is a message. '.repeat(10),
                actions: ['lol'],
                id: Math.round(Math.random() * 1e3),
            })
        },
        actionClicked(action, id) {
            console.log(`Action ${action} clicked on notification ${id}`);
            ipcRenderer.send('action', action, id);
        },
        closeNotification(toClose) {
            console.log(`Closing notification ${toClose}`);
            // This is done by the server
            // this.notifications = this.notifications.filter(({id})=>id !== toClose);
            ipcRenderer.send('close', toClose);
        }
    },
    data() {
        return {
            notifications: [],
            mh: config.height,
        };
    },
    computed: {
        rnotifications() {
            // Non-destructive reverse
            return this.notifications.reduceRight((a, v) => [...a, v], []);
        }
    },
    mounted() {
        ipcRenderer.on('update', (sender, store) => {
            console.log(store);
            let oldLength = this.notifications.length;
            this.notifications = Object.keys(store).map(id => Object.assign(store[id], { id })).sort(({ time: t1 }, { time: t2 }) => t1-t2);
            if (this.notifications.length) {
                remote.getCurrentWindow().show();
            } else {
                setTimeout(remote.getCurrentWindow().hide, 600);
            }
        });
    }
};

</script>

<style>
html, body {
    margin: 0;
    padding: 0;
    font-family: 'Roboto', sans-serif;
    background-color: rgba(200,200,200,0);
    overflow: hidden;
}

@font-face {
    font-family: 'NotoColorEmoji';
    src: url('./assets/fonts/NotoColorEmoji.ttf');
}

.add-button {
    background-color: white;
}

.notifs-enter-active, .notifs-leave-active {
    transition: all 0.3s;
    max-height: 200px;
}
.notifs-enter, .notifs-leave-to {
    opacity: 0;
    max-height: 0px;
    margin-bottom: 0px;
}

.notification-container {
    overflow: hidden;
    position: absolute;
    bottom: 0;
    min-width: 370px;
    padding-top: 5px;
    background-color: transparent;
}
</style>
