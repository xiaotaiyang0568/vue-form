import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import VueResource from 'vue-resource'
import store from './store/index.js'
import scClient from './sc_client.js'
import global from './sc_global'

Vue.config.productionTip = false
Vue.use(VueResource)
window.router = router

/* eslint-disable no-new */
let app = new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
})
window.app = app
window.router.push({name: scClient.MobileRouterName.login})

// let method = 'loadSCMetaData'
// let data = null
// let paramEncoded = ['Method=' + encodeURIComponent(method), 'Json=' + encodeURIComponent(JSON.stringify(data))].join('&')
// Vue.http.post('gcapi', paramEncoded, {
//   headers: {
//     'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
//   }
// }).then(response => {
//   console.log(response)
//   /* eslint-disable no-new */
//   let app = new Vue({
//     el: '#app',
//     store,
//     router,
//     render: h => h(App)
//   })
//   window.app = app
//   if (!response.body.result) { // 非SF
//     window.router.push({name: scClient.MobileRouterName.login})
//   } else { // 来自SF
//     scClient.scMetaDataHandler(JSON.parse(response.body.json))
//     let EmployeeNo = scClient.getUrlParamHref('EmployeeNo')
//     let QuoteId = scClient.getUrlParamHref('QuoteId')
//     let CustomerNo = scClient.getUrlParamHref('CustomerNo')
//     let QuoteStatus = scClient.getUrlParamHref('QuoteStatus')
//     if (EmployeeNo && QuoteId && CustomerNo) {
//       global.FromSalesForce = true
//       window.router.push({name: scClient.MobileRouterName.order, query: {sfParams: JSON.stringify({employeeNo: EmployeeNo, quoteId: QuoteId, customerNo: CustomerNo, quoteStatus: QuoteStatus})}})
//     } else {
//       window.router.push({name: scClient.MobileRouterName.orders})
//     }
//   }
// }).catch(function (error) {
//   console.log('Initialization failed.')
//   console.log(error)
//   if (process.env.NODE_ENV === 'development') {
//     /* eslint-disable no-new */
//     new Vue({
//       el: '#app',
//       store,
//       router,
//       render: h => h(App)
//     })
//   } else {
//     var msg = error.message
//     if (msg) {
//       alert(error)
//     } else if (error.statusText) {
//       alert(error.statusText)
//     } else {
//       alert(error)
//     }
//   }
// })

// debug模式，加载控制台  url中存在isDebug=1，则isDebug为true
if (scClient.IsDebug) {
  const loadScript = (url, callback) => {
    const script = document.createElement('script')
    script.onload = () => callback()
    script.src = url
    document.body.appendChild(script)
  }

  loadScript(
    'https://res.wx.qq.com/mmbizwap/zh_CN/htmledition/js/vconsole/3.0.0/vconsole.min.js',
    () => {
      let VConsole = window.VConsole
      new VConsole()
    })
}
