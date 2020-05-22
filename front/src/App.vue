<template>
    <div id="app">
        <!-- <md-button class="md-raised add-button" @click="notify()">Add</md-button> -->
        <transition-group
            name="notifs"
            tag="div"
            class="notification-container"
            ref="container"
            :style="{ maxHeight: mh + 'px' }"
        >
            <Notification
                v-for="n in rnotifications"
                :key="n.id"
                :notif="n"
                @action="actionClicked"
                @close="closeNotification"
            />
        </transition-group>
    </div>
</template>

<script>
import Notification from './components/Notification';
import { ipcRenderer, remote } from 'electron';

export default {
    name: 'App',
    components: {
        Notification
    },
    methods: {
        // this is a testing method please ignore
        notify() {
            this.notifications.push({
                appname: 'tests.peter.sh',
                summary: 'This is a message',
                title: 'Notification title ' + (this.notifications.length + 1),
                icon: false,
                time: 'now',
                body: 'This is a message. '.repeat(10),
                actions: ['lol'],
                id: Math.round(Math.random() * 1e3)
            })
        },
        actionClicked(action, id) {
            console.log(`Action ${action} clicked on notification ${id}`)
            ipcRenderer.send('action', action, id)
        },
        closeNotification(toClose) {
            console.log(`Closing notification ${toClose}`)
            // This is done by the server
            // this.notifications = this.notifications.filter(({id})=>id !== toClose);
            ipcRenderer.send('close', toClose)
        },
    },
    data() {
        return {
            notifications: [],
            mh: 300,
        }
    },
    computed: {
        rnotifications() {
            // Non-destructive reverse
            return this.notifications.reduceRight((a, v) => [...a, v], [])
        },
    },
    mounted() {
        ipcRenderer.on('update', (sender, store) => {
            console.log(store)
            this.notifications = Object.keys(store)
                .map(id => Object.assign(store[id], { id }))
                .sort(({ time: t1 }, { time: t2 }) => t1 - t2)
        })
        ipcRenderer.on('config', (sender, config) => {
            this.mh = config.height
            this.$i18n.locale = config.locale
        })
    },
}
</script>

<style>
html,
body {
    margin: 0;
    padding: 0;
    font-family: 'Roboto', sans-serif;
    background-color: rgba(200, 200, 200, 0);
    overflow: hidden;
}

@font-face {
    font-family: 'NotoColorEmoji';
    src: url('./assets/fonts/NotoColorEmoji.ttf');
    unicode-range: U+0080-02AF, U+0300-03FF, U+0600-06FF, U+0C00-0C7F,
        U+1DC0-1DFF, U+1E00-1EFF, U+2000-209F, U+20D0-214F, U+2190-23FF,
        U+2460-25FF, U+2600-27EF, U+2900-29FF, U+2B00-2BFF, U+2C60-2C7F,
        U+2E00-2E7F, U+3000-303F, U+A490-A4CF, U+E000-F8FF, U+FE00-FE0F,
        U+FE30-FE4F, U+1F000-1F02F, U+1F0A0-1F0FF, U+1F100-1F64F, U+1F680-1F6FF,
        U+1F910-1F96B, U+1F980-1F9E0;
}

.add-button {
    background-color: white;
}

.notifs-enter-active,
.notifs-leave-active {
    transition: all 0.3s;
    max-height: 200px;
}
.notifs-enter,
.notifs-leave-to {
    opacity: 0;
    max-height: 0px;
    margin-bottom: 0px;
}

.notification-container {
    overflow: hidden;
    position: absolute;
    bottom: 0;
    width: 100%;
    padding-top: 5px;
    background-color: transparent;
}
</style>
