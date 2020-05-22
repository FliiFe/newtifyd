// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueMaterial from 'vue-material'
import VueI18n from 'vue-i18n'
import 'vue-material/dist/vue-material.min.css'
import './assets/fonts/roboto.css'
import messages from './messages'

import App from './App'


Vue.use(VueI18n)

const i18n = new VueI18n({
    locale: 'en', // set locale
    messages, // set locale messages
})

Vue.use(VueMaterial)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
    el: '#app',
    components: { App },
    template: '<App/>',
    i18n,
})
