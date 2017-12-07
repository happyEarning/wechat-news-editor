import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/views/Home'
import Login from '@/views/Login'
import store from '@/store/store'

Vue.use(Router)

// lazyload

// index
const Index = resolve => require(['../views/index/index'], resolve)
const Index2 = resolve => require(['../views/index/detail'], resolve)


// keeplive 是否缓存当前页面  一般list设为true 详情页为false
// permission  权限设置
const router = new Router({
  routes: [{
    path: '/',
    component: Home,
    children: [{
      path: '/',
      name: 'Index',
      component: Index,
      meta: {
        keepAlive: false,
        permission: 10
      }
    },{
      path: '/detail/:id',
      name: 'Index3',
      component: Index,
      meta: {
        keepAlive: false,
        permission: 10
      }
    }, {
      path: '/index2',
      name: 'Index2',
      component: Index2,
      meta: {
        keepAlive: true,
        permission: 10
      }
    },]
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  }
  ]
})


router.beforeEach((to, from, next) => {
  next()
})
export default router