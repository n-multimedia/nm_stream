// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import Stream from './Stream'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'vue-multiselect/dist/vue-multiselect.min.css'
import VueLodash from 'vue-lodash'
import { Multiselect } from 'vue-multiselect'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faClock } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faClock)

Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.component('multiselect', Multiselect)

Vue.config.productionTip = false
Vue.use(BootstrapVue)
Vue.use(VueLodash)

const moment = require('moment')
require('moment/locale/de')

Vue.use(require('vue-moment'), {
  moment
})

/* eslint-disable no-new */
window.stream = new Vue({
  el: '#stream',
  components: {Stream},
  template: '<stream ref="stream"></stream>',
  mounted () {
    // this.loadJsonSample()
  },
  methods: {
    loadJsonSample: function (event) {
      // this.$refs.stream.getPosts()
    }
  }
})

// window.stream.loadJsonSample()
