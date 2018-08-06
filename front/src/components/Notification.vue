<template>
    <div class="notification">
        <div class="top">
            <div class="left">
                <img src="../assets/icons/laptop.svg" class="notificationicon"/>
                {{notif.appname}} •
                {{showntime}}
            </div>
            <div class="right">
                <md-icon class="gear-icon">settings</md-icon>
                <md-icon class="clear-icon" @click.native="$emit('close', notif.id)">clear</md-icon>
            </div>
        </div>
        <div class="body" @click="bodyclick">
            <div class="text">
                <div class="title" v-html=notif.title></div>
                <div class="summary-or-body" v-html="notif.body || notif.summary">
                </div>
            </div>
            <div v-if='notif.icon' class="notification-icon">
                <img :src='notif.icon' />
            </div>
        </div>
        <div v-if="notif.actions && notif.actions.length" class="actions">
            <md-button v-for='a in shownactions' :key='a.id' class="action" @click="$emit('action',notif.id,a.id)">{{a.text}}</md-button>
        </div>
    </div>
</template>

<script>

export default {
    name: 'Notification',
    props: {notif: Object},
    data() {
        return {
            now: Date.now()
        };
    },
    methods: {
        bodyclick() {
            if(this.hasaction('default')) {
                this.$emit('action', this.notif.id, 'default')
            } else {
                this.$emit('close', this.notif.id)
            }
        },
        hasaction(a) {
            return this.realactions.some(e => e.id === a)
        },
    },
    computed: {
        realactions() {
            return this.notif.actions.map((el, ind, arr) => ind % 2 ? {id: arr[ind-1], text: el}: undefined).filter(e=>e);
        },
        shownactions() {
            return this.realactions.filter(e=>e.id.match(/^\d+$/))
        },
        showntime() {
            let diff = Math.floor((this.now - this.notif.time) / 60000);
            return diff ? diff + 'm' : 'now';
        },
    },
    mounted() {
        setInterval(_ => this.now = Date.now(), 60*1000);
    }
};
</script>

<style scoped>
.notification {
    background: white;
    width: 360px;
    display: block;
    font-family: 'Roboto', sans-serif;
    margin-left: 5px;
    padding-top: 4px;
    border-radius: 3px;
    user-select: none;
    margin-bottom: 10px;
    box-shadow: 0px 1px 8px 0px rgba(0,0,0,0.5);
}
.top {
    display: flex;
    padding-left: 16px;
    justify-content: space-between;
    color: #555;
    padding-bottom: 8px;
    cursor: default;
}
.top > .left {
    margin-top: 4px;
    display: flex;
    align-items: center;
    font-size: 12.5px;
}

.notificationicon{
    width: 16px;
    height: 16px;
    margin-right: 8px;
}

.gear-icon {
    color: #5a5a5a;
    font-size: 12px !important;
    min-width: 0px;
    width: 16px;
    height: 16px;
    margin-right: 4px;
    cursor: pointer;
}
.clear-icon {
    font-size: 16px !important;
    margin-right: 2px;
    color: #5a5a5a;
    cursor: pointer;
}

.body {
    padding-left: 16px;
    text-align: left;
    color: #666;
    font-size: 16px;
    display: flex;
    cursor: default;
    justify-content: space-between;
}
.summary-or-body {
    text-overflow: ellipsis;
    max-height: 81px;
    overflow: hidden;
    padding-right: 16px;
    /* max-width: calc(360px - 85px); */
    word-wrap: break-word;
}
.body .title {
    font-size: 16px;
    color: black;
    margin-bottom: 4px;
}
.body {
    padding-bottom: 16px;
}

.notification-icon {
    max-width: 70px;
    padding-right: 10px;
    padding-left: 10px;
    padding-top: 4px;
}
.notification-icon img {
    min-width: 50px;
}
.actions {
    background-color: #eeeeee;
}
.action {
    color: #1565c0;
    font-family: 'NotoColorEmoji', 'Roboto', sans-serif;
}
</style>
