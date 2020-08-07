import Vue from 'vue'
import Stream from './Stream.vue'
import BootstrapVue from 'bootstrap-vue'
import VueLodash from 'vue-lodash'
import lodash from 'lodash'
import {Multiselect} from 'vue-multiselect'
import {library} from '@fortawesome/fontawesome-svg-core'
import {faClock, faFile, faTrashAlt} from '@fortawesome/free-regular-svg-icons'
import {faAnchor, faPoll, faFilter, faTimes} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import VueI18n from 'vue-i18n'
import axios from 'axios'
import VueAxios from 'vue-axios'
import Nl2br from 'vue-nl2br'
import VueConfig from 'vue-configuration'
import infiniteScroll from 'vue-infinite-scroll'
import VueKeepScrollPosition from 'vue-keep-scroll-position'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker'
import VueTypeaheadBootstrap from 'vue-typeahead-bootstrap'

import 'vue-multiselect/dist/vue-multiselect.min.css'
import de from './i18n/de_DE'
import appConfig from './assets/config.js'
import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css'

Vue.config.productionTip = false

library.add(faClock, faFile, faTrashAlt, faAnchor, faPoll, faFilter, faTimes)

Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('pulse-loader', PulseLoader)

Vue.component('multiselect', Multiselect)

Vue.config.productionTip = false
Vue.use(BootstrapVue)
Vue.use(VueLodash, {name: 'custom', lodash: lodash})
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

Vue.component('VueCtkDateTimePicker', VueCtkDateTimePicker)

Vue.component('vue-typeahead-bootstrap', VueTypeaheadBootstrap)

// Create VueI18n instance with options
const i18n = new VueI18n({
    locale: 'de', // set locale
    messages: de
})


window.stream = new Vue({
    i18n,
    render: h => h(Stream),
}).$mount('#stream')
