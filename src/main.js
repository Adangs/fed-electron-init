import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import store from './store/index'

// Element UI
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/style/index.scss' // global css

// global request
import http from './utils/x-request'

import * as filters from './utils/x-filters' // global request

// request
Vue.use(http)
// register global utility filters.
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})
Vue.use(ElementUI, { size: 'small' })

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
