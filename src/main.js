// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Stream from './Stream'
import BootstrapVue from 'bootstrap-vue'
// import 'bootstrap/dist/css/bootstrap.css'
// import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'vue-multiselect/dist/vue-multiselect.min.css'
import VueLodash from 'vue-lodash'
import { Multiselect } from 'vue-multiselect'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faClock, faFile, faTrashAlt } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import VueI18n from 'vue-i18n'
import de from './i18n/de_DE'
import axios from 'axios'
import VueAxios from 'vue-axios'
import Nl2br from 'vue-nl2br'
import VueConfig from 'vue-configuration'
import appConfig from './assets/config.js'
import infiniteScroll from 'vue-infinite-scroll'
import VueKeepScrollPosition from 'vue-keep-scroll-position'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'

library.add(faClock, faFile, faTrashAlt)

Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('pulse-loader', PulseLoader)

Vue.component('multiselect', Multiselect)

Vue.config.productionTip = false
Vue.use(BootstrapVue)
Vue.use(VueLodash)
Vue.use(VueI18n)
Vue.use(VueAxios, axios)
Vue.use(VueConfig, {
  config: appConfig
})
Vue.use(infiniteScroll)
Vue.component('nl2br', Nl2br)
Vue.use(VueKeepScrollPosition)

const moment = require('moment')
require('moment/locale/de')

Vue.use(require('vue-moment'), {
  moment
})

// Create VueI18n instance with options
const i18n = new VueI18n({
  locale: 'de', // set locale
  messages: de
})

/* eslint-disable no-new */
window.stream = new Vue({
  i18n,
  el: '#stream',
  components: {Stream},
  template: '<stream ref="stream"></stream>',
  mounted () {
    // this.loadJsonSample()
  },
  methods: {
    loadJsonSample: function (event) {
      // this.$refs.stream.initializeStream()
    }
  }
})

// window.stream.loadJsonSample()
