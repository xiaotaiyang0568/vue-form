import Vue from 'vue'
import Router from 'vue-router'
import scClient from '../sc_client.js'

import Welcome from '@/views/Welcome'
import Orders2 from '@/views/Orders2'
import Orders from '@/views/Orders'
import Order from '@/views/Order'
import Order2 from '@/views/Order2'
import SelectCategories from '@/views/SelectCategories.vue'
import SelectExperiments from '@/views/SelectExperiments.vue'
import QuotePrice from '@/views/QuotePrice.vue'
import RegularPrice from '@/views/RegularPrice.vue'
import AuditHistory from '@/views/AuditHistory.vue'
import Login from '@/views/Login.vue'

Vue.use(Router)
let router = null

const observer = () => {
  let MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver
  this.domObserver = new MutationObserver(onDomAttached)
  this.domObserver.observe(window.document.body, {
    childList: true, subtree: true
  })
}

let currentRouteInstances = null

const onDomAttached = (mutations) => {
  if (!currentRouteInstances) {
    return
  }
  // console.log(mutations)
  mutations.some(function (mutation) { // some 1
    for (let node of mutation.addedNodes) {
      // console.log(node)
      let someResult = currentRouteInstances.some(function (routeInst) { // some 2
        // console.log(currentRouteInstances)
        return Object.values(routeInst).some(function (comp) { // some 3
          // console.log(comp)
          let element = comp.$el
          if (node === element) {
            attached(comp)
            currentRouteInstances = null
            return true
          }
          if (window.$(element).find(node).length > 0) {
            currentRouteInstances = null
            return true
          }
        }) // end some 3
      }) // end some 2

      if (someResult) return true // since someResult is true, so return true to end the 'some 1'
    } // end for
  }) // end some 1
}

let scrollCallback = null
const attached = (component) => {
  if (scrollCallback) {
    scrollCallback()
  }
  if (component.attached) {
    component.attached()
  }
  // console.log(component)
  console.log('attached (' + component.$vnode.tag + ')')
}

const scrollHandler = (to, from, savedPosition) => {
  if (savedPosition) {
    // savedPosition is only available for popstate navigations.
    return savedPosition
  } else {
    const position = {}

    position.x = 0
    position.y = 0

    // new navigation.
    // scroll to anchor by returning the selector
    if (to.hash) {
      position.selector = to.hash
      position.offset = { x: 0, y: 55 }
    }
    // check if any matched route config has meta that requires scrolling to top
    if (to.matched.some(m => m.meta.scrollToTop)) {
      // cords will be used if no selector is provided,
      // or if the selector didn't match any element.
      position.x = 0
      position.y = 0
    }
    // if the returned position is falsy or an empty object,
    // will retain current scroll position.
    return position
  }
}

router = new Router({
  // mode: 'history',
  // base: __dirname,
  scrollBehavior (to, from, savedPosition) {
    // console.log('scrollBehavior')
    // console.log(this)
    return new Promise((resolve, reject) => {
      scrollCallback = () => {
        resolve(scrollHandler(to, from, savedPosition))
      }
      // setTimeout(scrollCallback, 500)
    })
  },
  routes: [
    {path: '/', name: 'Welcome', component: Welcome},
    {path: '/orders', name: scClient.MobileRouterName.orders, component: Orders, meta: {keepAlive: true, title: '所有订单'}},
    {path: '/orders2', name: 'Orders2', component: Orders2, meta: {keepAlive: true, title: 'Orders2'}},
    {path: '/orders/order', name: scClient.MobileRouterName.order, component: Order, meta: {keepAlive: true, title: '订单详情'}},
    {path: '/orders/order2', name: 'Order2', component: Order2, meta: {keepAlive: true, title: 'Order2'}},
    {path: '/orders/order/category', name: scClient.MobileRouterName.selectCategories, component: SelectCategories, meta: {keepAlive: true, title: '选择商品分类'}},
    {path: '/orders/order/category/experiment', name: scClient.MobileRouterName.selectExperiments, component: SelectExperiments, meta: {keepAlive: true, title: '增加/修改商品'}},
    {path: '/orders/order/quote', name: scClient.MobileRouterName.quotePrice, component: QuotePrice, meta: {keepAlive: true, title: '预报价'}},
    {path: '/orders/order/regular', name: scClient.MobileRouterName.regularPrice, component: RegularPrice, meta: {keepAlive: true, title: '正式报价'}},
    {path: '/orders/order/history', name: scClient.MobileRouterName.auditHistory, component: AuditHistory, meta: {keepAlive: true, title: '审核历史'}},
    {path: '/login', name: scClient.MobileRouterName.login, component: Login, meta: {keepAlive: false, title: '登录'}}
  ]})

router.beforeEach((to, from, next) => {
  /* 路由发生变化修改页面title */
  if (to.meta.title) {
    window.document.title = to.meta.title
  }
  next()
})

router.afterEach((to, from) => {
  currentRouteInstances = []
  to.matched.forEach(function (routeRecord) {
    currentRouteInstances.push(routeRecord.instances)
  })
  currentRouteInstances.reverse()
})

router.onReady(observer)

window.router = router

export default router
