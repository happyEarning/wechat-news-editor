// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import './common.css'

Vue.use(ElementUI)
// Vue.config.productionTip = false

import Http from './utils/Http'
import moment from 'moment'
window.Site={
	v : '0.1.0',
	http: Http,
}
window.moment=moment;
Vue.prototype.$moment = moment;
Vue.config.silent = true

import store from './store/store'

/* eslint-disable no-new */
Site.app = new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})