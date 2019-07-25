import Vue from 'vue'
import global from './sc_global.js'
import scMeta from './sc_meta.js'
import {serviceMerchandiseBusinessParams} from './data.js'

const MobileOperateType = {
  /*
  CreateMerchandise: 1, //创建商品
  ModifyMerchandise: 2, //修改商品
  BallparkPrice: 3, //价格预测
  SubmitBuAudit: 4, //提交商务审核
  SubmitTeAudit: 5, //提交技术审核
  BuAuditPass: 6, //商务审核通过
  BuAuditNoPass: 7, //商务审核不通过
  ExperimentDesignPass: 8, //实验方案通过
  ExperimentDesignNoPass: 9, //实验方案不通过
  ContractPass: 10, //合同文本通过
  ContractNoPass: 11, //合同文本不通过
  QuoteComplete: 12, //报价完成
  OptimizeExperimentDesign: 13, //完善实验方案
  SaveBusinessDrafting: 16, //保存商务起草
  */
  submitBuAudit: 4,
  save: 2
}

const MobileRouterName = {
  orders: 'Orders',
  order: 'Order',
  selectCategories: 'SelectCategories',
  selectExperiments: 'SelectExperiments',
  quotePrice: 'QuotePrice',
  regularPrice: 'RegularPrice',
  auditHistory: 'AuditHistory',
  login: 'Login'
}

const Pagination = {
  startIndex: 0,
  pageSize: 10,
  index: 1
}

const QuoteStatus = {
  Draft: 0,
  AuditRefuse: 3
}

const QuoteStatusFromUrl = getUrlParamHref('QuoteStatus')
const QuoteId = getUrlParamHref('QuoteId')

function getParamString (data) {
  let str = ''
  let propertys = getEnumerableKeys(data)
  for (let idx = 0; idx < propertys.length; idx++) {
    if (idx === 0) {
      str += propertys[idx] + '=' + encodeURIComponent(data[propertys[idx]])
    } else {
      str += '&' + propertys[idx] + '=' + encodeURIComponent(data[propertys[idx]])
    }
  }
  return str
}

function getEnumerableKeys (obj) {
  if (!obj) return null
  return Object.keys(obj)
}

function callRemoteMethodForBuParam (param, success, error) {
  let metaParam = scMeta.ParamMeta
  let data = serviceMerchandiseBusinessParams
  let params = data.businessParams
  let paramsReturn = []
  params.forEach(param => {
    let merchandiseStatus = getStorage('merchandiseStatus')
    let sfQuoteId = getStorage('sfQuoteIdOfOrder')
    let readonly = readonlyHandler(merchandiseStatus, sfQuoteId)
    let obj = {}
    obj.realParam = param
    obj.isModify = false
    let typeId = param.metaParameterTypeId
    obj.paramName = getStorage('SCMetaData').metaParameters.find(p => p.metaParameterTypeId === typeId).metaParameterName
    if (metaParam[typeId]) {
      let attrs = metaParam[typeId].attrs
      let keys = Object.keys(attrs) // 元数据中描述的属性
      let arr = []
      keys.forEach(key => {
        let mAttr = attrs[key]
        if (readonly) {
          param.readonly = readonly
        }
        let obj = attrMetaHandler(key, param, mAttr)
        if (mAttr.type === scMeta.ParamAttrType.Group || mAttr.type === scMeta.ParamAttrType.Date) { // 组依赖
          obj = groupHandler(mAttr, param, obj)
        } else if (mAttr.type === scMeta.ParamAttrType.List) { // 列表
          obj = listHandler(mAttr.list, param, obj)
        } else if (mAttr.type === scMeta.ParamAttrType.GeneList) { // 基因列表
          obj = listHandler(mAttr.list, param, obj)
        } else if (mAttr.type === scMeta.ParamAttrType.Object) {
          obj = listHandler(mAttr.object, param, obj)
        } else if (mAttr.type === scMeta.ParamAttrType.CellList) { // 细胞列表
          obj = listHandler(mAttr.list, param, obj)
        } else if (mAttr.type === scMeta.ParamAttrType.VirusPlasmidList) { // 乙方提供病毒／质粒列表
          obj = listHandler(mAttr.list, param, obj)
        } else if (mAttr.type === scMeta.ParamAttrType.AntibodyList) { // 抗体列表
          obj = listHandler(mAttr.list, param, obj)
        } else if (mAttr.type === scMeta.ParamAttrType.CheckList) { // 多选列表
          obj = listHandler(mAttr.list, param, obj)
        }
        arr.push(obj)
      })
      obj.attrs = arr
    }
    paramsReturn.push(obj)
    data.businessParams = paramsReturn
  })
  /**
  let paramEncoded = ['Method=' + encodeURIComponent('loadServiceMerchandiseBusinessParams'), 'Json=' + encodeURIComponent(JSON.stringify(param))]
  if (typeof error !== 'function') {
    error = message => alert(message, '错误')
  }
  Vue.http.post('gcapi', paramEncoded.join('&'), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
    }
  }).then(response => {
    response.json().then(obj => {
      if (obj.result) {
        if (typeof success === 'function' && obj.json && obj.json !== '') {
          let metaParam = scMeta.ParamMeta
          let data = JSON.parse(obj.json)
          let params = data.businessParams
          let paramsReturn = []
          params.forEach(param => {
            let merchandiseStatus = getStorage('merchandiseStatus')
            let sfQuoteId = getStorage('sfQuoteIdOfOrder')
            let readonly = readonlyHandler(merchandiseStatus, sfQuoteId)
            let obj = {}
            obj.realParam = param
            obj.isModify = false
            let typeId = param.metaParameterTypeId
            obj.paramName = getStorage('SCMetaData').metaParameters.find(p => p.metaParameterTypeId === typeId).metaParameterName
            if (metaParam[typeId]) {
              let attrs = metaParam[typeId].attrs
              let keys = Object.keys(attrs) // 元数据中描述的属性
              let arr = []
              keys.forEach(key => {
                let mAttr = attrs[key]
                if (readonly) {
                  param.readonly = readonly
                }
                let obj = attrMetaHandler(key, param, mAttr)
                if (mAttr.type === scMeta.ParamAttrType.Group || mAttr.type === scMeta.ParamAttrType.Date) { // 组依赖
                  obj = groupHandler(mAttr, param, obj)
                } else if (mAttr.type === scMeta.ParamAttrType.List) { // 列表
                  obj = listHandler(mAttr.list, param, obj)
                } else if (mAttr.type === scMeta.ParamAttrType.GeneList) { // 基因列表
                  obj = listHandler(mAttr.list, param, obj)
                } else if (mAttr.type === scMeta.ParamAttrType.Object) {
                  obj = listHandler(mAttr.object, param, obj)
                } else if (mAttr.type === scMeta.ParamAttrType.CellList) { // 细胞列表
                  obj = listHandler(mAttr.list, param, obj)
                } else if (mAttr.type === scMeta.ParamAttrType.VirusPlasmidList) { // 乙方提供病毒／质粒列表
                  obj = listHandler(mAttr.list, param, obj)
                } else if (mAttr.type === scMeta.ParamAttrType.AntibodyList) { // 抗体列表
                  obj = listHandler(mAttr.list, param, obj)
                } else if (mAttr.type === scMeta.ParamAttrType.CheckList) { // 多选列表
                  obj = listHandler(mAttr.list, param, obj)
                }
                arr.push(obj)
              })
              obj.attrs = arr
            }
            paramsReturn.push(obj)
            data.businessParams = paramsReturn
          })
          success(data)
        } else {
          success(obj)
        }
      } else if (!obj.result) {
        error(obj.message)
      }
    }, err => {
      error('数据解析错误 ' + err)
    })
  }, err => {
    error('网络连接错误 ' + err)
  })
   */
}

function attrMetaHandler (attrName, attrValue, attrMeta) {
  // attrValue === null && attrMeta === null 说明时来自组件中需要构建attr结构，此时，attr结构基于attrName来构建
  let flag = attrValue === null && attrMeta === null
  let fromListValue = null
  if (flag) { // 来自List组件，构建attr
    fromListValue = attrName.attrValue.meta.default ? attrName.attrValue.meta.default : null
  }
  return {
    attrName: flag ? attrName.attrName : attrName,
    attrValue: {
      value: flag ? attrName.attrValue.meta.type === scMeta.ParamAttrType.SerialNoList ? [] : fromListValue : attrValueHandler(attrName, attrMeta, attrValue),
      meta: flag ? attrName.attrValue.meta : attrMeta,
      options: flag ? attrName.attrValue.options : (attrMeta.enumId ? dictMapHandler(attrMeta.enumId) : []),
      editable: true,
      enable: flag ? false : attrValue.readonly !== undefined ? attrValue.readonly : false, // 设置是否只读模式
      isModified: false,
      validate: true,
      error: null
    }
  }
}

function attrValueHandler (attrName, attrMeta, attrRawValue) {
  if (attrMeta === null) return null
  let type = attrMeta.type
  if (type === scMeta.ParamAttrType.Number || type === scMeta.ParamAttrType.Text ||
    type === scMeta.ParamAttrType.None || type === scMeta.ParamAttrType.Radio ||
    type === scMeta.ParamAttrType.Input || !type || type === scMeta.ParamAttrType.Check) {
    if (attrRawValue === null) return null
    return attrRawValue[attrName] !== undefined ? attrRawValue[attrName] : attrMeta.default !== undefined ? attrMeta.default : null
  } else if (type === scMeta.ParamAttrType.Group) {
    if (attrRawValue === null) return null
    let obj = {}
    let groupAttr = attrMeta.attrs
    if (groupAttr) {
      Object.keys(groupAttr).forEach(key => {
        if (attrRawValue[key]) {
          obj = groupHandler(attrMeta, attrRawValue, attrMetaHandler(key, attrRawValue, groupAttr[key]))
        }
      })
    }
    return obj
  } else if (type === scMeta.ParamAttrType.Object) {
    if (attrRawValue === null) return null
    let obj = {}
    let paramValue = attrRawValue[attrName] // object
    if (!paramValue) return {}
    let object = attrMeta.object
    if (object) {
      Object.keys(object).forEach(key => {
        obj = attrMetaHandler(key, paramValue, object[key])
      })
    }
    return obj
  } else if (type === scMeta.ParamAttrType.SerialNoList) {
    if (attrRawValue === null) return []
    let res = []
    let paramValue = attrRawValue[attrName]
    if (paramValue) {
      for (let i = 0; i < paramValue.length; i++) {
        let pv = paramValue[i]
        if (typeof pv === 'string') {
          res.push([{
            attrName: attrName,
            attrValue: {
              value: pv,
              meta: attrMeta,
              options: [],
              editable: true,
              enable: true,
              isModified: false,
              validate: true,
              error: null
            }
          }])
        } else {
          res.push(attrMetaHandler(attrName, pv, attrMeta))
        }
      }
    } else {
      return []
    }
    return res
  } else if (type === scMeta.ParamAttrType.Date) {
    // todo
  } else if (type === scMeta.ParamAttrType.Check) {
    if (attrRawValue === null) return []
    return attrRawValue[attrName]
  } else if (type === scMeta.ParamAttrType.List || type === scMeta.ParamAttrType.CellList ||
    type === scMeta.ParamAttrType.GeneList || type === scMeta.ParamAttrType.VirusPlasmidList ||
    type === scMeta.ParamAttrType.CheckList || type === scMeta.ParamAttrType.AntibodyList) {
    if (attrRawValue === null) return null
    if (attrRawValue === null) return []
    let resVal = []
    let paramValue = attrRawValue[attrName]
    if (!paramValue) return []
    paramValue.forEach(value => {
      value.readonly = attrRawValue.readonly
      let obj = {}
      let arr = []
      let listAttr = attrMeta.list
      if (listAttr) {
        let keys = Object.keys(listAttr)
        keys.forEach(key => {
          if (listAttr[key].type === scMeta.ParamAttrType.Group) {
            obj = groupHandler(listAttr[key], value, attrMetaHandler(key, value, listAttr[key]))
            arr.push(obj)
          } else {
            obj = attrMetaHandler(key, value, listAttr[key])
            arr.push(obj)
          }
        })
      }
      resVal.push(arr)
    })
    return resVal
  }
}

function groupHandler (mAttr, param, obj) {
  let gArr = []
  let aGroup = mAttr.attrs
  Object.keys(aGroup).forEach(aKey => {
    let gAttr = aGroup[aKey]
    let attrObj = attrMetaHandler(aKey, param, gAttr)
    let list = gAttr.list
    if (list) {
      // todo
      obj = listHandler(list, param, obj)
      attrObj.attrValue.attributes = obj.attrValue.attributes
    }
    if (gAttr.type === scMeta.ParamAttrType.Group) {
      attrObj = groupHandler(gAttr, param, attrObj)
    }
    gArr.push(attrObj)
  })
  obj.attrValue.attributes = gArr // 添加属性
  return obj
}

function listHandler (list, param, obj) {
  let lArr = []
  Object.keys(list).forEach(lKey => {
    let lAttr = list[lKey]
    let paramVal = param // 匹配对象的值
    for (let p in param) {
      if (param[p][lKey]) {
        paramVal = param[p]
      }
    }
    let listObj = attrMetaHandler(lKey, paramVal, lAttr)

    if (lAttr.type === scMeta.ParamAttrType.Group) {
      listObj = groupHandler(lAttr, param, listObj)
    }
    lArr.push(listObj)
  })
  obj.attrValue.attributes = lArr // 添加列表包含的初始值，方便添加
  return obj
}

function callRemoteMethod (method, data, showPrompt, success, error) {
  let paramEncoded = ['Method=' + encodeURIComponent(method), 'Json=' + encodeURIComponent(JSON.stringify(data))]
  if (typeof error !== 'function') {
    error = message => alert(message, '错误')
  }
  let url = 'gcapi'
  let param = paramEncoded.join('&')
  if (method.indexOf('gcidifc') >= 0) {
    url = method
    param = data ? getParamString(data) : data
  }
  Vue.http.post(url, param, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
    }
  }).then(response => {
    response.json().then(obj => {
      if (obj.result) {
        if (typeof success === 'function' && obj.json && obj.json !== '') {
          success(JSON.parse(obj.json))
        } else {
          success(obj)
        }
        if (obj.message) {
          window.$.msg('提示：' + obj.message)
        }
      } else if (!obj.result) {
        if (obj.message !== '超出查询范围，没有订单数据') {
          error(obj.message)
        }
        if (obj.message === '您的会话已过期') {
          if (window.router !== undefined) {
            window.router.push({name: MobileRouterName.login})
          }
        }
        window.$('.ui.inverted.dimmer').dimmer('hide')
      }
    }, err => {
      error('数据解析错误 ' + err)
    })
  }, err => {
    error('网络连接错误 ' + err)
  })
}

function orderUpdate (mer, order) {
  if (!mer || !order) return
  let orderNew = order
  let merList = orderNew.merchandiseList
  merList.forEach(dt => {
    if (dt.serviceMerchandiseGUID === mer.serviceMerchandiseGUID) {
      merList.splice(merList.indexOf(dt), 1, mer)
    }
  })
  return orderNew
}

let IsDebug = false
// http://localhost:9090/#/orders?isDebug=1
if (getUrlParamHref('isDebug') === '1') {
  IsDebug = true
}

let BeforeDateOptions = []
let AttrDateBoxOptions = []

function getBeforeDateOptions () {
  let d = new Date()
  for (let i = 0; i < 12; i++) {
    let obj = {}
    let attrObj = {}
    d.setMonth(d.getMonth() - 1)
    let m = d.getMonth() + 1
    m = m < 10 ? '0' + m : m
    let y = d.getFullYear()
    obj.label = y + '-' + m
    obj.value = obj.label + '-01' + ',' + obj.label + '-' + getLastDay(y, m)
    attrObj.label = y + '-' + m
    attrObj.value = y + ',' + m
    BeforeDateOptions.push(obj)
  }
  let year = new Date().getFullYear()
  let month = new Date().getMonth() + 1
  month = month < 10 ? '0' + month : month
  let label = year + '-' + month
  BeforeDateOptions.splice(0, 0, {label: label, value: label + '-01' + ',' + label + '-' + getLastDay(year, d.getMonth() + 1)})
}

getBeforeDateOptions()

function getLastDay (year, month) {
  let newYear = year
  let newMonth = month++ // 取下一个月的第一天，方便计算（最后一天不固定）
  if (month > 12) {
    newMonth -= 12 // 月份减
    newYear++ // 年份增
  }
  let newDate = new Date(newYear, newMonth, 1) // 取当年当月中的第一天
  return (new Date(newDate.getTime() - 1000 * 60 * 60 * 24)).getDate() // 获取当月最后一天日期
}

function getAfterDateOptions () {
  let d = new Date()
  for (let i = 0; i < 12; i++) {
    let attrObj = {}
    d.setMonth(d.getMonth() + 1)
    let m = d.getMonth() + 1
    m = m < 10 ? '0' + m : m
    let y = d.getFullYear()
    attrObj.label = y + '-' + m
    attrObj.value = y + ',' + m
    AttrDateBoxOptions.push(attrObj)
  }
  let year = new Date().getFullYear()
  let month = new Date().getMonth() + 1
  month = month < 10 ? '0' + month : month
  let label = year + '-' + month
  AttrDateBoxOptions.splice(0, 0, {label: label, value: year + ',' + month})
}

getAfterDateOptions()

function closeMsg () {
  window.$('.overlay.msg').closest('.overlay').transition('fade')
}

function setStorage (name, content) {
  if (!name) return
  if (typeof content !== 'string') {
    content = JSON.stringify(content)
  }
  window.localStorage.setItem(name, content)
}

function getStorage (name) {
  if (!name) return
  let item = window.localStorage.getItem(name)
  if (!item) return
  if (!isJsonString(item)) return item
  return JSON.parse(item)
}

function isJsonString (str) {
  try {
    if (typeof JSON.parse(str) === 'object') {
      return true
    }
  } catch (e) {
  }
  return false
}

function dictMapHandler (typeId) {
  let arr = []
  let dic = getStorage('SCMetaData').dictionaries
  if (typeId === -1) {
    dic = scMeta.BooleanContent
  }
  dic.forEach(di => {
    if (di.typeID === typeId) {
      let obj = {}
      obj.key = di.dictKey
      obj.value = di.dictValue
      obj.sortCode = di.sortCode
      if (di.extraValue) {
        obj.extraValue = di.extraValue
      }
      arr.push(obj)
    }
  })
  return arr
}

function scMetaDataHandler (response) {
  let metaExp = response.metaExperiments
  let dic = response.dictionaries
  let metaExperimentsMap = {}
  let operationTypeMap = {}
  metaExp.forEach(dt => {
    metaExperimentsMap[dt.metaExperimentId] = dt
  })
  dic.forEach(di => {
    if (di.typeID === global.DictionaryTypeID.OperationType) {
      operationTypeMap[di.dictKey] = di
    }
  })
  response.metaExperimentsMap = metaExperimentsMap
  response.operationTypeMap = operationTypeMap
  setStorage('SCMetaData', response)
}

function getUrlParamHref (val) {
  let uri = window.location.href
  let re = new RegExp('' + val + '=([^&?]*)', 'ig')
  return ((uri.match(re)) ? (uri.match(re)[0].substr(val.length + 1)) : null)
}

function removeRepeats (valueList, dataList, str) {
  if (valueList === null || valueList.length === 0) return dataList
  valueList.forEach(vl => {
    dataList.splice(dataList.indexOf(dataList.find(dl => vl.find(v => v.attrValue.value === dl[str]))), 1)
  })
  return dataList
}

function readonlyHandler (merchandiseStatus, sfQuoteId) {
  // 只读模式===》来自正常登录，除了输入状态；来自sf：1、除了起草和审批拒绝，2、url中带有quoteId等于订单的sfQuoteId
  let isInput = parseInt(merchandiseStatus) === global.MerchandiseStatus.input
  let readonly = false
  if (isInput) { // 输入状态
    if (QuoteId && QuoteId !== null) { // url中带有QuoteId
      if (parseInt(sfQuoteId) !== parseInt(QuoteId)) {
        readonly = true
      } else {
        if (QuoteStatusFromUrl !== null) { // url中带有QuoteStatus
          if (parseInt(QuoteStatusFromUrl) === QuoteStatus.Draft) {
            readonly = false
          } else if (parseInt(QuoteStatusFromUrl) === QuoteStatus.AuditRefuse) {
            readonly = false
          } else {
            readonly = true
          }
        } else {
          readonly = true
        }
      }
    }
  } else { // 非输入状态，只读
    readonly = true
  }
  return readonly
}

export default {
  callRemoteMethod,
  callRemoteMethodForBuParam,
  orderUpdate,
  closeMsg,
  setStorage,
  getStorage,
  scMetaDataHandler,
  getUrlParamHref,
  attrMetaHandler,
  attrValueHandler,
  groupHandler,
  dictMapHandler,
  removeRepeats,
  readonlyHandler,
  BeforeDateOptions,
  MobileOperateType,
  MobileRouterName,
  Pagination,
  AttrDateBoxOptions,
  IsDebug,
  QuoteStatus,
  QuoteStatusFromUrl,
  QuoteId
}
