import Vue from 'vue'
import global from './sc_global.js'
import scMeta from './sc_meta.js'

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

function getParamString(data) {
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

function getEnumerableKeys(obj) {
  if (!obj) return null
  return Object.keys(obj)
}

function callRemoteMethodForBuParam(data, success, error) {
  let paramEncoded = ['Method=' + encodeURIComponent('loadServiceMerchandiseBusinessParams'), 'Json=' + encodeURIComponent(JSON.stringify(data))]
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
}

function attrMetaHandler(attrName, attrValue, attrMeta) {
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

function attrValueHandler(attrName, attrMeta, attrRawValue) {
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

function groupHandler(mAttr, param, obj) {
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

function listHandler(list, param, obj) {
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

function callRemoteMethod(method, data, showPrompt, success, error) {
  if (method.indexOf('userLogin') > -1) {
    return {
      'userInfo': {
        'employeeGuid': 'd49b6750-ed3d-4e27-916c-766c1f02e122',
        'userId': 'zhenghao',
        'name': '郑浩',
        'employeeNo': '000484',
        'session': '0c65a697-1212-429b-8e6d-05e2c79ef59c894157552894',
        'genechemEmployeeFlagID': 1,
        'companyDetail': {
          'companyNo': '101',
          'languageID': '0',
          'companyGuid': '1720510F-A1F7-4F94-8691-CEA4A4DC9572',
          'createDT': {
            'year': 2010,
            'month': 10,
            'dayOfMonth': 26,
            'hourOfDay': 17,
            'minute': 56,
            'second': 25
          },
          'updateDT': {
            'year': 2015,
            'month': 11,
            'dayOfMonth': 3,
            'hourOfDay': 8,
            'minute': 23,
            'second': 51
          },
          'remark': '1'
        },
        'lastActive': 1552894157617,
        'status': 0,
        'currentSalesLevel': -1,
        'roles': 'company_supervisor;hr_mgr;gfa_dispatcher;Bussiness_GoodsRecv;Bussiness_ExpressOut;CustomerGoods_Mgt;Production_Platform;CustomerGoods_Browser;tsmgmt_lab_operator;salesaccount_invoice_admin;sfitf_it;order_view;tpm_order_mgmt;tsmgmt_business;prod_tech_audit;tech_audit;emkt_admin;buss_special;order_mgmt;tsmgmt_lab_management;admin;tsmgmt_department_mgr;tsmgmt_tech_support;business_operation',
        'ssoFlag': 0,
        'domainUserId': 'hzheng',
        'administrator': true
      },
      'result': true,
      'message': ''
    }
  } else if (method.indexOf('loadSCMetaData') > -1) {
    return {
      'scUserInfo': {
        'userId': 'zhenghao',
        'employeeGuid': 'd49b6750-ed3d-4e27-916c-766c1f02e122',
        'name': '郑浩',
        'roles': 'company_supervisor;hr_mgr;gfa_dispatcher;Bussiness_GoodsRecv;Bussiness_ExpressOut;CustomerGoods_Mgt;Production_Platform;CustomerGoods_Browser;tsmgmt_lab_operator;salesaccount_invoice_admin;sfitf_it;order_view;tpm_order_mgmt;tsmgmt_business;prod_tech_audit;tech_audit;emkt_admin;buss_special;order_mgmt;tsmgmt_lab_management;admin;tsmgmt_department_mgr;tsmgmt_tech_support;business_operation',
        'district': '信息技术部管理处'
      },
      'divisions': [
        '华东1区',
        '华东2区',
        '华中南区',
        '华北区',
        '华南区',
        '华东区',
        '被动电销组',
        '主动电销组'
      ],
      'districts': [
        '华东区管理处'
      ],
      'quoteUnits': [
        {
          'quoteUnitId': 5,
          'unitLabel': '',
          'dataType': 5,
          'sortCode': 1
        },
        {
          'quoteUnitId': 7,
          'unitLabel': '',
          'dataType': 2,
          'defaultValue': '0',
          'sortCode': 2
        },
        {
          'quoteUnitId': 8,
          'unitLabel': '',
          'dataType': 2,
          'defaultValue': '0',
          'sortCode': 3
        },
        {
          'quoteUnitId': 20,
          'unitLabel': '',
          'dataType': 1,
          'defaultValue': '3',
          'sortCode': 4
        },
        {
          'quoteUnitId': 30,
          'unitLabel': '',
          'dataType': 1,
          'defaultValue': '3',
          'sortCode': 5
        },
        {
          'quoteUnitId': 40,
          'unitLabel': '',
          'dataType': 1,
          'defaultValue': '1',
          'sortCode': 6
        },
        {
          'quoteUnitId': 50,
          'unitLabel': '',
          'dataType': 2,
          'defaultValue': '0',
          'sortCode': 7
        },
        {
          'quoteUnitId': 60,
          'unitLabel': '',
          'dataType': 1,
          'defaultValue': '1',
          'sortCode': 8
        },
        {
          'quoteUnitId': 70,
          'unitLabel': '',
          'dataType': 1,
          'defaultValue': '1',
          'sortCode': 9
        },
        {
          'quoteUnitId': 80,
          'unitLabel': '',
          'dataType': 3,
          'defaultValue': '1',
          'extraInfo': '52003',
          'sortCode': 10
        },
        {
          'quoteUnitId': 90,
          'unitLabel': '',
          'dataType': 1,
          'defaultValue': '1',
          'sortCode': 11
        },
        {
          'quoteUnitId': 100,
          'unitLabel': '',
          'dataType': 1,
          'defaultValue': '1',
          'sortCode': 12
        },
        {
          'quoteUnitId': 110,
          'unitLabel': '',
          'dataType': 1,
          'defaultValue': '100',
          'sortCode': 13
        },
        {
          'quoteUnitId': 120,
          'unitLabel': '',
          'dataType': 1,
          'defaultValue': '1',
          'sortCode': 14
        },
        {
          'quoteUnitId': 130,
          'unitLabel': '',
          'dataType': 3,
          'defaultValue': '2',
          'extraInfo': '52004',
          'sortCode': 15
        },
        {
          'quoteUnitId': 140,
          'unitLabel': '',
          'dataType': 1,
          'defaultValue': '3',
          'sortCode': 16
        },
        {
          'quoteUnitId': 150,
          'unitLabel': '',
          'dataType': 3,
          'defaultValue': '2',
          'extraInfo': '52004',
          'sortCode': 17
        },
        {
          'quoteUnitId': 160,
          'unitLabel': '',
          'dataType': 3,
          'defaultValue': '1',
          'extraInfo': '52005',
          'sortCode': 18
        },
        {
          'quoteUnitId': 190,
          'unitLabel': '',
          'dataType': 1,
          'defaultValue': '1',
          'sortCode': 19
        },
        {
          'quoteUnitId': 200,
          'unitLabel': '',
          'dataType': 3,
          'defaultValue': '1',
          'extraInfo': '52006',
          'sortCode': 20
        },
        {
          'quoteUnitId': 210,
          'unitLabel': '',
          'dataType': 1,
          'defaultValue': '1',
          'sortCode': 21
        },
        {
          'quoteUnitId': 220,
          'unitLabel': '',
          'dataType': 1,
          'defaultValue': '1',
          'sortCode': 22
        },
        {
          'quoteUnitId': 230,
          'unitLabel': '',
          'dataType': 3,
          'defaultValue': '2',
          'extraInfo': '52004',
          'sortCode': 23
        },
        {
          'quoteUnitId': 240,
          'unitLabel': '',
          'dataType': 1,
          'defaultValue': '1',
          'sortCode': 24
        },
        {
          'quoteUnitId': 250,
          'unitLabel': '',
          'dataType': 3,
          'defaultValue': '1',
          'extraInfo': '52011',
          'sortCode': 25
        },
        {
          'quoteUnitId': 260,
          'unitLabel': '',
          'dataType': 3,
          'defaultValue': '1',
          'extraInfo': '52010',
          'sortCode': 26
        },
        {
          'quoteUnitId': 270,
          'unitLabel': '',
          'dataType': 1,
          'defaultValue': '1',
          'sortCode': 27
        },
        {
          'quoteUnitId': 280,
          'unitLabel': '',
          'dataType': 3,
          'defaultValue': '1',
          'extraInfo': '52014',
          'sortCode': 28
        },
        {
          'quoteUnitId': 290,
          'unitLabel': '',
          'dataType': 3,
          'defaultValue': '1',
          'extraInfo': '52015',
          'sortCode': 29
        },
        {
          'quoteUnitId': 300,
          'unitLabel': '',
          'dataType': 1,
          'defaultValue': '3',
          'sortCode': 30
        },
        {
          'quoteUnitId': 310,
          'unitLabel': '',
          'dataType': 1,
          'defaultValue': '10',
          'sortCode': 31
        },
        {
          'quoteUnitId': 320,
          'unitLabel': '',
          'dataType': 1,
          'defaultValue': '1',
          'sortCode': 32
        },
        {
          'quoteUnitId': 330,
          'unitLabel': '',
          'dataType': 1,
          'defaultValue': '1',
          'sortCode': 33
        },
        {
          'quoteUnitId': 340,
          'unitLabel': '',
          'dataType': 1,
          'defaultValue': '1',
          'sortCode': 34
        },
        {
          'quoteUnitId': 350,
          'unitLabel': '',
          'dataType': 3,
          'defaultValue': '1',
          'extraInfo': '52016',
          'sortCode': 35
        },
        {
          'quoteUnitId': 360,
          'unitLabel': '',
          'dataType': 1,
          'defaultValue': '1',
          'sortCode': 36
        },
        {
          'quoteUnitId': 370,
          'unitLabel': '',
          'dataType': 2,
          'defaultValue': '1',
          'sortCode': 37
        },
        {
          'quoteUnitId': 380,
          'unitLabel': '',
          'dataType': 2,
          'defaultValue': '1',
          'sortCode': 38
        },
        {
          'quoteUnitId': 390,
          'unitLabel': '',
          'dataType': 1,
          'defaultValue': '1',
          'sortCode': 39
        },
        {
          'quoteUnitId': 400,
          'unitLabel': '',
          'dataType': 1,
          'defaultValue': '1',
          'sortCode': 30
        },
        {
          'quoteUnitId': 410,
          'unitLabel': '',
          'dataType': 1,
          'defaultValue': '1',
          'sortCode': 41
        },
        {
          'quoteUnitId': 420,
          'unitLabel': '',
          'dataType': 1,
          'defaultValue': '1',
          'sortCode': 42
        },
        {
          'quoteUnitId': 430,
          'unitLabel': 'ceshi查询次数',
          'dataType': 1,
          'defaultValue': '1',
          'sortCode': 43
        },
        {
          'quoteUnitId': 440,
          'unitLabel': '',
          'dataType': 1,
          'defaultValue': '1',
          'sortCode': 44
        },
        {
          'quoteUnitId': 450,
          'unitLabel': '',
          'dataType': 3,
          'defaultValue': '1',
          'extraInfo': '52053',
          'sortCode': 86
        },
        {
          'quoteUnitId': 460,
          'unitLabel': '',
          'dataType': 1,
          'defaultValue': '2',
          'sortCode': 87
        }
      ],
      'dictionaries': [
        {
          'typeID': 52001,
          'dictKey': 0,
          'dictValue': '',
          'sortCode': 5,
          'valid': 1
        },
        {
          'typeID': 52001,
          'dictKey': 1,
          'dictValue': '输入',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52002,
          'dictKey': 1,
          'dictValue': '创建商品',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52003,
          'dictKey': 1,
          'dictValue': '甲方',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52004,
          'dictKey': 1,
          'dictValue': '是',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52005,
          'dictKey': 1,
          'dictValue': '1E+8TU',
          'sortCode': 10,
          'extraValue': '200',
          'valid': 1
        },
        {
          'typeID': 52006,
          'dictKey': 1,
          'dictValue': 'miRNA芯片检测',
          'sortCode': 10,
          'extraValue': '10',
          'valid': 1
        },
        {
          'typeID': 52007,
          'dictKey': 1,
          'dictValue': '目的细胞）',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52008,
          'dictKey': 1,
          'dictValue': '细胞系',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52009,
          'dictKey': 1,
          'dictValue': '人',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52010,
          'dictKey': 1,
          'dictValue': '1-5个基因',
          'sortCode': 10,
          'extraValue': '330',
          'valid': 1
        },
        {
          'typeID': 52011,
          'dictKey': 1,
          'dictValue': '人',
          'sortCode': 10,
          'extraValue': '320',
          'valid': 1
        },
        {
          'typeID': 52012,
          'dictKey': 1,
          'dictValue': '目的基因',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52013,
          'dictKey': 1,
          'dictValue': '甲方提供',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52014,
          'dictKey': 1,
          'dictValue': '裸鼠',
          'sortCode': 10,
          'extraValue': '400',
          'valid': 1
        },
        {
          'typeID': 52015,
          'dictKey': 1,
          'dictValue': '皮下成瘤模型',
          'sortCode': 10,
          'extraValue': '410',
          'valid': 1
        },
        {
          'typeID': 52016,
          'dictKey': 1,
          'dictValue': '无',
          'sortCode': 10,
          'extraValue': '430',
          'valid': 1
        },
        {
          'typeID': 52017,
          'dictKey': 6,
          'dictValue': 'GV248: hU6-MCS-Ubiquitin-EGFP-IRES-puromycin',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52018,
          'dictKey': 1,
          'dictValue': 'GV314：CMV-MCS-3FLAG-SV40-EGFP',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52019,
          'dictKey': 1,
          'dictValue': 'GV115：hU6-MCS-CMV-EGFP',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52020,
          'dictKey': 1,
          'dictValue': '病毒',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52021,
          'dictKey': 1,
          'dictValue': '肝癌',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52022,
          'dictKey': 1,
          'dictValue': '裸鼠',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52023,
          'dictKey': 1,
          'dictValue': '皮下成瘤模型',
          'sortCode': 10,
          'extraValue': '注：皮下注射细胞，包含饲养周期6周',
          'valid': 1
        },
        {
          'typeID': 52024,
          'dictKey': 1,
          'dictValue': '业务部',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52025,
          'dictKey': 1,
          'dictValue': '瘤内给药',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52026,
          'dictKey': 1,
          'dictValue': '无',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52027,
          'dictKey': 1,
          'dictValue': '-80度冻存',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52028,
          'dictKey': 1,
          'dictValue': '眼球摘除采血',
          'sortCode': 10,
          'extraValue': 'executed',
          'valid': 1
        },
        {
          'typeID': 52029,
          'dictKey': 1,
          'dictValue': '人',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52030,
          'dictKey': 1,
          'dictValue': '关键细胞因子14 plex）',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52031,
          'dictKey': 1,
          'dictValue': '人',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52032,
          'dictKey': 1,
          'dictValue': 'Cardiac Toxicityplex，仅限大鼠）',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52033,
          'dictKey': 1,
          'dictValue': '免疫',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52034,
          'dictKey': 1,
          'dictValue': '癌组织高表达',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52036,
          'dictKey': 1,
          'dictValue': '全身敲入',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52037,
          'dictKey': 1,
          'dictValue': '是',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52038,
          'dictKey': 1,
          'dictValue': '编码基因',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52039,
          'dictKey': 1,
          'dictValue': '增值',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 1,
          'dictValue': 'A549肺癌细胞',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52041,
          'dictKey': 1,
          'dictValue': 'A549肺癌细胞',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52042,
          'dictKey': 1,
          'dictValue': '组成型敲除',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52043,
          'dictKey': 1,
          'dictValue': '甲方品系',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52044,
          'dictKey': 9606,
          'dictValue': 'Human',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52045,
          'dictKey': 1,
          'dictValue': '一半甲醛，一半冻存',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52046,
          'dictKey': 1,
          'dictValue': '甲方提供',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52047,
          'dictKey': 1,
          'dictValue': '野生突变型',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52048,
          'dictKey': 1,
          'dictValue': '空白细胞',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52049,
          'dictKey': 1,
          'dictValue': 'A套系',
          'sortCode': 10,
          'extraValue': '1. 数据的质量评估^2. 数据过滤^3. 显著性差异分析^4. Gene Ontology (GO) 注释及富集分析^5. 基于KEGG & BioCarta的通路注释及富集分析',
          'valid': 1
        },
        {
          'typeID': 52050,
          'dictKey': 0,
          'dictValue': '',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52051,
          'dictKey': 1,
          'dictValue': '预付款消费',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52052,
          'dictKey': 1,
          'dictValue': '流水号',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52053,
          'dictKey': 1,
          'dictValue': '血清样本 6级建库',
          'sortCode': 10,
          'extraValue': '530',
          'valid': 1
        },
        {
          'typeID': 52054,
          'dictKey': 1,
          'dictValue': '发给甲方',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52198,
          'dictKey': 1,
          'dictValue': 'Bottom Line',
          'sortCode': 10,
          'valid': 1
        },
        {
          'typeID': 52036,
          'dictKey': 2,
          'dictValue': '条件敲入',
          'sortCode': 15,
          'valid': 1
        },
        {
          'typeID': 52001,
          'dictKey': 2,
          'dictValue': '待商务审核',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52002,
          'dictKey': 2,
          'dictValue': '修改商品',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52003,
          'dictKey': 2,
          'dictValue': '乙方',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52004,
          'dictKey': 2,
          'dictValue': '否',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52005,
          'dictKey': 2,
          'dictValue': '2E+8TU',
          'sortCode': 20,
          'extraValue': '210',
          'valid': 1
        },
        {
          'typeID': 52006,
          'dictKey': 2,
          'dictValue': '全基因组表达谱芯片检测',
          'sortCode': 20,
          'extraValue': '20',
          'valid': 1
        },
        {
          'typeID': 52007,
          'dictKey': 2,
          'dictValue': '抗体',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52008,
          'dictKey': 2,
          'dictValue': '原代细胞',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52009,
          'dictKey': 2,
          'dictValue': '大鼠',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52010,
          'dictKey': 2,
          'dictValue': '6-10个基因',
          'sortCode': 20,
          'extraValue': '331',
          'valid': 1
        },
        {
          'typeID': 52011,
          'dictKey': 2,
          'dictValue': '鼠',
          'sortCode': 20,
          'extraValue': '321',
          'valid': 1
        },
        {
          'typeID': 52012,
          'dictKey': 2,
          'dictValue': '下游基因',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52013,
          'dictKey': 2,
          'dictValue': '乙方提供',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52014,
          'dictKey': 2,
          'dictValue': 'SCID鼠',
          'sortCode': 20,
          'extraValue': '401',
          'valid': 1
        },
        {
          'typeID': 52015,
          'dictKey': 2,
          'dictValue': '药理药效模型',
          'sortCode': 20,
          'extraValue': '411',
          'valid': 1
        },
        {
          'typeID': 52016,
          'dictKey': 2,
          'dictValue': '荧光',
          'sortCode': 20,
          'extraValue': '431',
          'valid': 1
        },
        {
          'typeID': 52017,
          'dictKey': 5,
          'dictValue': 'GV112: hU6-MCS-CMV-Puromycin',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52020,
          'dictKey': 2,
          'dictValue': '质粒',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52021,
          'dictKey': 2,
          'dictValue': '肺癌',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52022,
          'dictKey': 2,
          'dictValue': 'SCID鼠',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52023,
          'dictKey': 2,
          'dictValue': '药理药效模型',
          'sortCode': 20,
          'extraValue': '注：皮下注射细胞，包含饲养周期6周',
          'valid': 1
        },
        {
          'typeID': 52024,
          'dictKey': 2,
          'dictValue': '商务部',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52025,
          'dictKey': 2,
          'dictValue': '灌胃给药',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52026,
          'dictKey': 2,
          'dictValue': '荧光',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52027,
          'dictKey': 2,
          'dictValue': '甲醛保存',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52028,
          'dictKey': 2,
          'dictValue': '心脏采血',
          'sortCode': 20,
          'extraValue': 'executed',
          'valid': 1
        },
        {
          'typeID': 52030,
          'dictKey': 2,
          'dictValue': '炎症 plex）',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52031,
          'dictKey': 2,
          'dictValue': '大鼠',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52032,
          'dictKey': 2,
          'dictValue': 'Pancreatic Toxicityplex，仅限大鼠）',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52033,
          'dictKey': 2,
          'dictValue': 'miRNA',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52034,
          'dictKey': 2,
          'dictValue': '表达与分期分级相关',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52035,
          'dictKey': 3,
          'dictValue': '小鼠',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52036,
          'dictKey': 3,
          'dictValue': '全身敲除',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52037,
          'dictKey': 2,
          'dictValue': '否',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52038,
          'dictKey': 2,
          'dictValue': 'lncRNA',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52039,
          'dictKey': 2,
          'dictValue': '转移',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 2,
          'dictValue': 'H1299肺癌细胞',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52041,
          'dictKey': 2,
          'dictValue': 'H1299肺癌细胞',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52042,
          'dictKey': 2,
          'dictValue': '条件型敲除',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52043,
          'dictKey': 2,
          'dictValue': '乙方品系',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52044,
          'dictKey': 10090,
          'dictValue': 'Mouse',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52045,
          'dictKey': 2,
          'dictValue': '甲醛保存',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52047,
          'dictKey': 2,
          'dictValue': '启动子',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52048,
          'dictKey': 2,
          'dictValue': '稳定株细胞',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52049,
          'dictKey': 2,
          'dictValue': 'B套系',
          'sortCode': 20,
          'extraValue': '1. 数据的质量评估^2. 数据过滤^3. 显著性差异分析^4. Gene Ontology (GO) 注释及富集分析^5. 基于KEGG & BioCarta的通路注释及富集分析^6. 基于Reactome Pathway Database的基因调控网络分析',
          'valid': 1
        },
        {
          'typeID': 52050,
          'dictKey': 1,
          'dictValue': '此价格为底价',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52051,
          'dictKey': 3,
          'dictValue': '发票',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52052,
          'dictKey': 2,
          'dictValue': '种子待筛',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52053,
          'dictKey': 2,
          'dictValue': '实体组织 12级建库',
          'sortCode': 20,
          'extraValue': '531',
          'valid': 1
        },
        {
          'typeID': 52054,
          'dictKey': 2,
          'dictValue': '发给吉凯用于后续实验',
          'sortCode': 20,
          'valid': 1
        },
        {
          'typeID': 52001,
          'dictKey': 3,
          'dictValue': '待技术审核',
          'sortCode': 30,
          'valid': 1
        },
        {
          'typeID': 52002,
          'dictKey': 3,
          'dictValue': '价格预测',
          'sortCode': 30,
          'valid': 1
        },
        {
          'typeID': 52006,
          'dictKey': 3,
          'dictValue': 'Clariom S 表达谱芯片检测',
          'sortCode': 30,
          'extraValue': '30',
          'valid': 1
        },
        {
          'typeID': 52007,
          'dictKey': 3,
          'dictValue': '药物',
          'sortCode': 30,
          'valid': 1
        },
        {
          'typeID': 52009,
          'dictKey': 3,
          'dictValue': '小鼠',
          'sortCode': 30,
          'valid': 1
        },
        {
          'typeID': 52010,
          'dictKey': 3,
          'dictValue': '11-15个基因',
          'sortCode': 30,
          'extraValue': '332',
          'valid': 1
        },
        {
          'typeID': 52013,
          'dictKey': 3,
          'dictValue': '吉盛代购',
          'sortCode': 30,
          'valid': 1
        },
        {
          'typeID': 52014,
          'dictKey': 3,
          'dictValue': 'NOD-SCID鼠',
          'sortCode': 30,
          'extraValue': '402',
          'valid': 1
        },
        {
          'typeID': 52015,
          'dictKey': 3,
          'dictValue': '皮下转移模型',
          'sortCode': 30,
          'extraValue': '412',
          'valid': 1
        },
        {
          'typeID': 52016,
          'dictKey': 3,
          'dictValue': 'Luciferase',
          'sortCode': 30,
          'extraValue': '432',
          'valid': 1
        },
        {
          'typeID': 52017,
          'dictKey': 1,
          'dictValue': 'GV115: hU6-MCS-CMV-EGFP',
          'sortCode': 30,
          'valid': 1
        },
        {
          'typeID': 52021,
          'dictKey': 3,
          'dictValue': '胃癌',
          'sortCode': 30,
          'valid': 1
        },
        {
          'typeID': 52022,
          'dictKey': 3,
          'dictValue': 'NOD-SCID鼠',
          'sortCode': 30,
          'valid': 1
        },
        {
          'typeID': 52023,
          'dictKey': 3,
          'dictValue': '皮下转移模型',
          'sortCode': 30,
          'extraValue': '注：皮下注射细胞，包含饲养周期12周',
          'valid': 1
        },
        {
          'typeID': 52025,
          'dictKey': 3,
          'dictValue': '肌肉注射',
          'sortCode': 30,
          'valid': 1
        },
        {
          'typeID': 52026,
          'dictKey': 3,
          'dictValue': 'Luciferase',
          'sortCode': 30,
          'valid': 1
        },
        {
          'typeID': 52027,
          'dictKey': 3,
          'dictValue': '其它',
          'sortCode': 30,
          'valid': 1
        },
        {
          'typeID': 52028,
          'dictKey': 3,
          'dictValue': '尾静脉剪除',
          'sortCode': 30,
          'extraValue': 'live',
          'valid': 1
        },
        {
          'typeID': 52029,
          'dictKey': 3,
          'dictValue': '小鼠',
          'sortCode': 30,
          'valid': 1
        },
        {
          'typeID': 52030,
          'dictKey': 3,
          'dictValue': 'Th1/Th2/Th17lex）',
          'sortCode': 30,
          'valid': 1
        },
        {
          'typeID': 52031,
          'dictKey': 3,
          'dictValue': '小鼠',
          'sortCode': 30,
          'valid': 1
        },
        {
          'typeID': 52032,
          'dictKey': 3,
          'dictValue': 'Kidney Toxicityplex）',
          'sortCode': 30,
          'valid': 1
        },
        {
          'typeID': 52034,
          'dictKey': 3,
          'dictValue': '表达与生存期相关',
          'sortCode': 30,
          'valid': 1
        },
        {
          'typeID': 52035,
          'dictKey': 2,
          'dictValue': '大鼠',
          'sortCode': 30,
          'valid': 1
        },
        {
          'typeID': 52036,
          'dictKey': 4,
          'dictValue': '条件敲除',
          'sortCode': 30,
          'valid': 1
        },
        {
          'typeID': 52037,
          'dictKey': 3,
          'dictValue': '不清楚',
          'sortCode': 30,
          'valid': 1
        },
        {
          'typeID': 52038,
          'dictKey': 3,
          'dictValue': 'CircRNA',
          'sortCode': 30,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 3,
          'dictValue': '5637膀胱癌细胞',
          'sortCode': 30,
          'valid': 1
        },
        {
          'typeID': 52041,
          'dictKey': 3,
          'dictValue': 'T24膀胱癌细胞',
          'sortCode': 30,
          'valid': 1
        },
        {
          'typeID': 52042,
          'dictKey': 3,
          'dictValue': '敲入',
          'sortCode': 30,
          'valid': 1
        },
        {
          'typeID': 52044,
          'dictKey': 10116,
          'dictValue': 'Rat',
          'sortCode': 30,
          'valid': 1
        },
        {
          'typeID': 52045,
          'dictKey': 3,
          'dictValue': '冻存保存',
          'sortCode': 30,
          'valid': 1
        },
        {
          'typeID': 52046,
          'dictKey': 3,
          'dictValue': '吉盛代购',
          'sortCode': 30,
          'valid': 1
        },
        {
          'typeID': 52047,
          'dictKey': 3,
          'dictValue': '自定义',
          'sortCode': 30,
          'valid': 1
        },
        {
          'typeID': 52049,
          'dictKey': 3,
          'dictValue': 'C套系',
          'sortCode': 30,
          'extraValue': '1. 数据的质量评估^2. 数据过滤^3. 显著性差异分析^4. 基于IPA的经典通路分析^5. 基于IPA的上游调控分析^6. 基于IPA的疾病和功能分析^7. 基于IPA的调控效应分析^8. 基于IPA的相互作用网络分析',
          'valid': 1
        },
        {
          'typeID': 52050,
          'dictKey': 2,
          'dictValue': '此价格为一株细胞、一个基因的报价',
          'sortCode': 30,
          'valid': 1
        },
        {
          'typeID': 52002,
          'dictKey': 4,
          'dictValue': '提交商务审核',
          'sortCode': 35,
          'valid': 1
        },
        {
          'typeID': 52001,
          'dictKey': 4,
          'dictValue': '商务起草',
          'sortCode': 40,
          'valid': 1
        },
        {
          'typeID': 52002,
          'dictKey': 5,
          'dictValue': '提交技术审核',
          'sortCode': 40,
          'valid': 1
        },
        {
          'typeID': 52006,
          'dictKey': 4,
          'dictValue': 'Clariom D 全转录本芯片检测',
          'sortCode': 40,
          'extraValue': '40',
          'valid': 1
        },
        {
          'typeID': 52007,
          'dictKey': 4,
          'dictValue': '病毒或质粒',
          'sortCode': 40,
          'valid': 1
        },
        {
          'typeID': 52010,
          'dictKey': 4,
          'dictValue': '16-20个基因',
          'sortCode': 40,
          'extraValue': '333',
          'valid': 1
        },
        {
          'typeID': 52014,
          'dictKey': 4,
          'dictValue': 'NSG/NCG/NOG鼠',
          'sortCode': 40,
          'extraValue': '403',
          'valid': 1
        },
        {
          'typeID': 52015,
          'dictKey': 4,
          'dictValue': '尾静脉转移模型',
          'sortCode': 40,
          'extraValue': '413',
          'valid': 1
        },
        {
          'typeID': 52017,
          'dictKey': 2,
          'dictValue': 'GV118: U6-MCS-Ubi-EGFP',
          'sortCode': 40,
          'valid': 1
        },
        {
          'typeID': 52021,
          'dictKey': 4,
          'dictValue': '结直肠癌',
          'sortCode': 40,
          'valid': 1
        },
        {
          'typeID': 52022,
          'dictKey': 4,
          'dictValue': 'NSG/NCG/NOG鼠',
          'sortCode': 40,
          'valid': 1
        },
        {
          'typeID': 52023,
          'dictKey': 4,
          'dictValue': '尾静脉转移模型',
          'sortCode': 40,
          'extraValue': '注：尾静脉注射细胞，包含饲养周期12周',
          'valid': 1
        },
        {
          'typeID': 52025,
          'dictKey': 4,
          'dictValue': '腹腔、皮下给药',
          'sortCode': 40,
          'valid': 1
        },
        {
          'typeID': 52028,
          'dictKey': 4,
          'dictValue': '眼底静脉丛',
          'sortCode': 40,
          'extraValue': 'live',
          'valid': 1
        },
        {
          'typeID': 52030,
          'dictKey': 4,
          'dictValue': 'Th1/Th2lex）',
          'sortCode': 40,
          'valid': 1
        },
        {
          'typeID': 52032,
          'dictKey': 4,
          'dictValue': 'Liver Tox V2plex）',
          'sortCode': 40,
          'valid': 1
        },
        {
          'typeID': 52036,
          'dictKey': 5,
          'dictValue': '特定氨基酸突变',
          'sortCode': 40,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 4,
          'dictValue': 'T24膀胱癌细胞',
          'sortCode': 40,
          'valid': 1
        },
        {
          'typeID': 52041,
          'dictKey': 4,
          'dictValue': 'BEL-7404肝癌细胞',
          'sortCode': 40,
          'valid': 1
        },
        {
          'typeID': 52042,
          'dictKey': 4,
          'dictValue': '特定氨基酸突变',
          'sortCode': 40,
          'valid': 1
        },
        {
          'typeID': 52044,
          'dictKey': 10117,
          'dictValue': '其他',
          'sortCode': 40,
          'valid': 1
        },
        {
          'typeID': 52045,
          'dictKey': 4,
          'dictValue': '不需要保存',
          'sortCode': 40,
          'valid': 1
        },
        {
          'typeID': 52050,
          'dictKey': 3,
          'dictValue': '病毒包装、筛靶的价格为一株细胞、一个基因的报价',
          'sortCode': 40,
          'valid': 1
        },
        {
          'typeID': 52001,
          'dictKey': 5,
          'dictValue': '报价完成',
          'sortCode': 50,
          'valid': 1
        },
        {
          'typeID': 52002,
          'dictKey': 6,
          'dictValue': '商务审核通过',
          'sortCode': 50,
          'valid': 1
        },
        {
          'typeID': 52006,
          'dictKey': 5,
          'dictValue': 'Clariom S 微量、降解、FFPE表达谱芯片检测',
          'sortCode': 50,
          'extraValue': '50',
          'valid': 1
        },
        {
          'typeID': 52007,
          'dictKey': 5,
          'dictValue': '试剂盒',
          'sortCode': 50,
          'valid': 1
        },
        {
          'typeID': 52015,
          'dictKey': 5,
          'dictValue': '肝原位模型',
          'sortCode': 50,
          'extraValue': '414',
          'valid': 1
        },
        {
          'typeID': 52017,
          'dictKey': 3,
          'dictValue': 'GV358: Ubi-MCS-3FLAG-SV40-EGFP-IRES-puromycin',
          'sortCode': 50,
          'valid': 1
        },
        {
          'typeID': 52021,
          'dictKey': 5,
          'dictValue': '脑胶质瘤',
          'sortCode': 50,
          'valid': 1
        },
        {
          'typeID': 52022,
          'dictKey': 5,
          'dictValue': '其它',
          'sortCode': 50,
          'valid': 1
        },
        {
          'typeID': 52023,
          'dictKey': 5,
          'dictValue': '肝原位模型',
          'sortCode': 50,
          'extraValue': '注：肝脏原位移植瘤块，包含饲养周期18周',
          'valid': 1
        },
        {
          'typeID': 52025,
          'dictKey': 5,
          'dictValue': '尾静脉给药',
          'sortCode': 50,
          'valid': 1
        },
        {
          'typeID': 52028,
          'dictKey': 5,
          'dictValue': '采血后需要分离血清',
          'sortCode': 50,
          'extraValue': 'extra',
          'valid': 1
        },
        {
          'typeID': 52030,
          'dictKey': 5,
          'dictValue': '关键细胞因子lex）',
          'sortCode': 50,
          'valid': 1
        },
        {
          'typeID': 52032,
          'dictKey': 5,
          'dictValue': 'Cardiology V2plex）',
          'sortCode': 50,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 5,
          'dictValue': 'CNE-2Z鼻咽癌细胞',
          'sortCode': 50,
          'valid': 1
        },
        {
          'typeID': 52041,
          'dictKey': 5,
          'dictValue': 'SMMC-7721肝癌细胞',
          'sortCode': 50,
          'valid': 1
        },
        {
          'typeID': 52044,
          'dictKey': 10118,
          'dictValue': 'Gallus gallus',
          'sortCode': 50,
          'valid': 1
        },
        {
          'typeID': 52001,
          'dictKey': 6,
          'dictValue': '作废',
          'sortCode': 60,
          'valid': 1
        },
        {
          'typeID': 52002,
          'dictKey': 7,
          'dictValue': '商务审核不通过',
          'sortCode': 60,
          'valid': 1
        },
        {
          'typeID': 52006,
          'dictKey': 6,
          'dictValue': 'Clariom D 微量、降解、FFPE表达谱芯片检测',
          'sortCode': 60,
          'extraValue': '60',
          'valid': 1
        },
        {
          'typeID': 52007,
          'dictKey': 6,
          'dictValue': '其它',
          'sortCode': 60,
          'valid': 1
        },
        {
          'typeID': 52015,
          'dictKey': 6,
          'dictValue': '脾脏转移模型',
          'sortCode': 60,
          'extraValue': '415',
          'valid': 1
        },
        {
          'typeID': 52017,
          'dictKey': 4,
          'dictValue': 'GV492: Ubi-MCS-3FLAG-CBh-gcGFP-IRES-puromycin',
          'sortCode': 60,
          'valid': 1
        },
        {
          'typeID': 52021,
          'dictKey': 6,
          'dictValue': '乳腺癌',
          'sortCode': 60,
          'valid': 1
        },
        {
          'typeID': 52023,
          'dictKey': 6,
          'dictValue': '脾脏转移模型',
          'sortCode': 60,
          'extraValue': '注：脾脏接种细胞，包含饲养周期12周',
          'valid': 1
        },
        {
          'typeID': 52032,
          'dictKey': 6,
          'dictValue': 'Neurology V2 plex）',
          'sortCode': 60,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 6,
          'dictValue': 'MDA-MB-231乳腺癌细胞',
          'sortCode': 60,
          'valid': 1
        },
        {
          'typeID': 52041,
          'dictKey': 6,
          'dictValue': 'MDA-MB-231乳腺癌细胞',
          'sortCode': 60,
          'valid': 1
        },
        {
          'typeID': 52044,
          'dictKey': 10119,
          'dictValue': 'thale cress',
          'sortCode': 60,
          'valid': 1
        },
        {
          'typeID': 52001,
          'dictKey': 9,
          'dictValue': '待签署',
          'sortCode': 65,
          'valid': 1
        },
        {
          'typeID': 52001,
          'dictKey': 7,
          'dictValue': '待录入合同',
          'sortCode': 70,
          'valid': 1
        },
        {
          'typeID': 52002,
          'dictKey': 8,
          'dictValue': '实验方案通过',
          'sortCode': 70,
          'valid': 1
        },
        {
          'typeID': 52017,
          'dictKey': 7,
          'dictValue': 'GV493: hU6-MCS-CBh-gcGFP-IRES-puromycin',
          'sortCode': 70,
          'valid': 1
        },
        {
          'typeID': 52021,
          'dictKey': 7,
          'dictValue': '食管癌',
          'sortCode': 70,
          'valid': 1
        },
        {
          'typeID': 52032,
          'dictKey': 7,
          'dictValue': 'Immunology V2plex）',
          'sortCode': 70,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 7,
          'dictValue': 'GBC-SD胆囊癌细胞',
          'sortCode': 70,
          'valid': 1
        },
        {
          'typeID': 52041,
          'dictKey': 7,
          'dictValue': 'HCC1937乳腺癌细胞',
          'sortCode': 70,
          'valid': 1
        },
        {
          'typeID': 52044,
          'dictKey': 10120,
          'dictValue': 'rice',
          'sortCode': 70,
          'valid': 1
        },
        {
          'typeID': 52001,
          'dictKey': 8,
          'dictValue': '录入完成',
          'sortCode': 80,
          'valid': 1
        },
        {
          'typeID': 52002,
          'dictKey': 9,
          'dictValue': '实验方案不通过',
          'sortCode': 80,
          'valid': 1
        },
        {
          'typeID': 52021,
          'dictKey': 8,
          'dictValue': '胎盘绒毛癌',
          'sortCode': 80,
          'valid': 1
        },
        {
          'typeID': 52032,
          'dictKey': 8,
          'dictValue': 'Oncology V2plex）',
          'sortCode': 80,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 8,
          'dictValue': 'BEL-7404肝癌细胞',
          'sortCode': 80,
          'valid': 1
        },
        {
          'typeID': 52041,
          'dictKey': 8,
          'dictValue': 'AGS胃癌细胞',
          'sortCode': 80,
          'valid': 1
        },
        {
          'typeID': 52044,
          'dictKey': 10121,
          'dictValue': 'zebrafish',
          'sortCode': 80,
          'valid': 1
        },
        {
          'typeID': 52002,
          'dictKey': 10,
          'dictValue': '合同文本通过',
          'sortCode': 90,
          'valid': 1
        },
        {
          'typeID': 52021,
          'dictKey': 9,
          'dictValue': '甲状腺癌',
          'sortCode': 90,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 9,
          'dictValue': 'SMMC-7721肝癌细胞',
          'sortCode': 90,
          'valid': 1
        },
        {
          'typeID': 52041,
          'dictKey': 9,
          'dictValue': 'SGC-7901胃癌细胞',
          'sortCode': 90,
          'valid': 1
        },
        {
          'typeID': 52044,
          'dictKey': 10122,
          'dictValue': 'Fruit fly',
          'sortCode': 90,
          'valid': 1
        },
        {
          'typeID': 52002,
          'dictKey': 11,
          'dictValue': '合同文本不通过',
          'sortCode': 100,
          'valid': 1
        },
        {
          'typeID': 52021,
          'dictKey': 10,
          'dictValue': '膀胱癌',
          'sortCode': 100,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 10,
          'dictValue': 'REB肝胆管癌细胞',
          'sortCode': 100,
          'valid': 1
        },
        {
          'typeID': 52041,
          'dictKey': 10,
          'dictValue': 'MGC-803胃癌细胞',
          'sortCode': 100,
          'valid': 1
        },
        {
          'typeID': 52044,
          'dictKey': 10123,
          'dictValue': 'pig',
          'sortCode': 100,
          'valid': 1
        },
        {
          'typeID': 52051,
          'dictKey': -1,
          'dictValue': '',
          'sortCode': 100,
          'valid': 1
        },
        {
          'typeID': 52002,
          'dictKey': 12,
          'dictValue': '报价完成',
          'sortCode': 110,
          'valid': 1
        },
        {
          'typeID': 52021,
          'dictKey': 11,
          'dictValue': '骨肉瘤',
          'sortCode': 110,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 11,
          'dictValue': 'Hela宫颈癌细胞',
          'sortCode': 110,
          'valid': 1
        },
        {
          'typeID': 52041,
          'dictKey': 11,
          'dictValue': 'Saos-2骨肉瘤细胞',
          'sortCode': 110,
          'valid': 1
        },
        {
          'typeID': 52044,
          'dictKey': 10124,
          'dictValue': 'sheep',
          'sortCode': 110,
          'valid': 1
        },
        {
          'typeID': 52049,
          'dictKey': 4,
          'dictValue': 'A套系',
          'sortCode': 110,
          'extraValue': '1. 数据的质量评估^2. 数据过滤^3. 显著性差异分析^4. 磷酸化位点motif分析^5. Gene Ontology (GO) 注释及富集分析^6. 基于KEGG & BioCarta的通路注释及富集分析',
          'valid': 1
        },
        {
          'typeID': 52021,
          'dictKey': 12,
          'dictValue': '胆囊癌',
          'sortCode': 120,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 12,
          'dictValue': 'SiHa宫颈癌细胞',
          'sortCode': 120,
          'valid': 1
        },
        {
          'typeID': 52041,
          'dictKey': 12,
          'dictValue': 'MG-63骨肉瘤细胞',
          'sortCode': 120,
          'valid': 1
        },
        {
          'typeID': 52044,
          'dictKey': 10125,
          'dictValue': 'rabbit',
          'sortCode': 120,
          'valid': 1
        },
        {
          'typeID': 52049,
          'dictKey': 5,
          'dictValue': 'B套系',
          'sortCode': 120,
          'extraValue': '1. 数据的质量评估^2. 数据过滤^3. 显著性差异分析^4. 磷酸化位点motif分析^5. Gene Ontology (GO) 注释及富集分析^6. 基于KEGG & BioCarta的通路注释及富集分析^7. 基于Reactome Pathway Database的基因调控网络分析',
          'valid': 1
        },
        {
          'typeID': 52002,
          'dictKey': 13,
          'dictValue': '完善实验方案',
          'sortCode': 130,
          'valid': 1
        },
        {
          'typeID': 52021,
          'dictKey': 13,
          'dictValue': '黑色素瘤',
          'sortCode': 130,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 13,
          'dictValue': 'HOS骨肉瘤细胞',
          'sortCode': 130,
          'valid': 1
        },
        {
          'typeID': 52041,
          'dictKey': 13,
          'dictValue': 'SKOV3卵巢癌细胞',
          'sortCode': 130,
          'valid': 1
        },
        {
          'typeID': 52044,
          'dictKey': 10126,
          'dictValue': 'domestic silkworm',
          'sortCode': 130,
          'valid': 1
        },
        {
          'typeID': 52049,
          'dictKey': 6,
          'dictValue': 'C套系',
          'sortCode': 130,
          'extraValue': '1. 数据的质量评估^2. 数据过滤^3. 显著性差异分析^4. 基于IPA的经典通路分析^5. 基于IPA的上游调控分析^6. 基于IPA的疾病和功能分析^7. 基于IPA的调控效应分析^8. 基于IPA的相互作用网络分析',
          'valid': 1
        },
        {
          'typeID': 52002,
          'dictKey': 14,
          'dictValue': '上传文件',
          'sortCode': 140,
          'valid': 1
        },
        {
          'typeID': 52021,
          'dictKey': 14,
          'dictValue': '肝胆管癌',
          'sortCode': 140,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 14,
          'dictValue': 'Saos-2骨肉瘤细胞',
          'sortCode': 140,
          'valid': 1
        },
        {
          'typeID': 52041,
          'dictKey': 14,
          'dictValue': 'PANC-1胰腺癌细胞',
          'sortCode': 140,
          'valid': 1
        },
        {
          'typeID': 52044,
          'dictKey': 10127,
          'dictValue': 'African clawed frog',
          'sortCode': 140,
          'valid': 1
        },
        {
          'typeID': 52002,
          'dictKey': 15,
          'dictValue': '删除文件',
          'sortCode': 150,
          'valid': 1
        },
        {
          'typeID': 52021,
          'dictKey': 15,
          'dictValue': '下咽癌',
          'sortCode': 150,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 15,
          'dictValue': 'U-2OS骨肉瘤细胞',
          'sortCode': 150,
          'valid': 1
        },
        {
          'typeID': 52041,
          'dictKey': 15,
          'dictValue': '786-O肾癌细胞',
          'sortCode': 150,
          'valid': 1
        },
        {
          'typeID': 52044,
          'dictKey': 10128,
          'dictValue': 'yeast',
          'sortCode': 150,
          'valid': 1
        },
        {
          'typeID': 52002,
          'dictKey': 16,
          'dictValue': '保存商务起草',
          'sortCode': 160,
          'valid': 1
        },
        {
          'typeID': 52021,
          'dictKey': 16,
          'dictValue': '卵巢癌',
          'sortCode': 160,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 16,
          'dictValue': 'A375黑色素瘤细胞',
          'sortCode': 160,
          'valid': 1
        },
        {
          'typeID': 52041,
          'dictKey': 16,
          'dictValue': 'CAL 27舌鳞癌细胞',
          'sortCode': 160,
          'valid': 1
        },
        {
          'typeID': 52002,
          'dictKey': 17,
          'dictValue': '设置成交价',
          'sortCode': 170,
          'valid': 1
        },
        {
          'typeID': 52021,
          'dictKey': 17,
          'dictValue': '前列腺癌',
          'sortCode': 170,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 17,
          'dictValue': 'K1甲状腺癌细胞',
          'sortCode': 170,
          'valid': 1
        },
        {
          'typeID': 52041,
          'dictKey': 17,
          'dictValue': 'FaDu下咽癌细胞',
          'sortCode': 170,
          'valid': 1
        },
        {
          'typeID': 52002,
          'dictKey': 18,
          'dictValue': '启动订单',
          'sortCode': 180,
          'valid': 1
        },
        {
          'typeID': 52021,
          'dictKey': 18,
          'dictValue': '舌麟癌',
          'sortCode': 180,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 18,
          'dictValue': 'U251胶质瘤细胞',
          'sortCode': 180,
          'valid': 1
        },
        {
          'typeID': 52041,
          'dictKey': 18,
          'dictValue': 'GBC-SD胆囊癌细胞',
          'sortCode': 180,
          'valid': 1
        },
        {
          'typeID': 52002,
          'dictKey': 19,
          'dictValue': '合同录入完成',
          'sortCode': 190,
          'valid': 1
        },
        {
          'typeID': 52021,
          'dictKey': 19,
          'dictValue': '肾癌',
          'sortCode': 190,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 19,
          'dictValue': 'U87胶质瘤细胞',
          'sortCode': 190,
          'valid': 1
        },
        {
          'typeID': 52041,
          'dictKey': 19,
          'dictValue': 'Hela宫颈癌细胞',
          'sortCode': 190,
          'valid': 1
        },
        {
          'typeID': 52002,
          'dictKey': 20,
          'dictValue': '作废',
          'sortCode': 200,
          'valid': 1
        },
        {
          'typeID': 52009,
          'dictKey': 20,
          'dictValue': '其它',
          'sortCode': 200,
          'valid': 1
        },
        {
          'typeID': 52021,
          'dictKey': 20,
          'dictValue': '胰腺癌',
          'sortCode': 200,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 20,
          'dictValue': 'RKO结直肠癌细胞',
          'sortCode': 200,
          'valid': 1
        },
        {
          'typeID': 52041,
          'dictKey': 20,
          'dictValue': 'HCT116结直肠癌细胞',
          'sortCode': 200,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 21,
          'dictValue': 'HCT116结直肠癌细胞',
          'sortCode': 210,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 22,
          'dictValue': 'SKOV3卵巢癌细胞',
          'sortCode': 220,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 23,
          'dictValue': 'ES-2卵巢透明癌细胞',
          'sortCode': 230,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 24,
          'dictValue': 'PC-3前列腺癌细胞',
          'sortCode': 240,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 25,
          'dictValue': 'Tca-8113舌鳞癌细胞可能为Hela污染株）',
          'sortCode': 250,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 26,
          'dictValue': 'CAL 27舌鳞癌细胞',
          'sortCode': 260,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 27,
          'dictValue': '786-O肾癌细胞',
          'sortCode': 270,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 28,
          'dictValue': 'Eca-109食管癌细胞',
          'sortCode': 280,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 29,
          'dictValue': 'TE-1食管癌细胞',
          'sortCode': 290,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 30,
          'dictValue': 'JAR胎盘绒毛癌细胞',
          'sortCode': 300,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 31,
          'dictValue': 'AGS胃癌细胞',
          'sortCode': 310,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 32,
          'dictValue': 'SGC-7901胃癌细胞',
          'sortCode': 320,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 33,
          'dictValue': 'HEP-2喉癌细胞可能为Hela污染株）',
          'sortCode': 330,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 34,
          'dictValue': 'FaDu下咽癌细胞',
          'sortCode': 340,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 35,
          'dictValue': 'PANC-1胰腺癌细胞',
          'sortCode': 350,
          'valid': 1
        },
        {
          'typeID': 52021,
          'dictKey': 200,
          'dictValue': '其它',
          'sortCode': 2000,
          'valid': 1
        },
        {
          'typeID': 52040,
          'dictKey': 200,
          'dictValue': '其它',
          'sortCode': 2000,
          'valid': 1
        },
        {
          'typeID': 52041,
          'dictKey': 200,
          'dictValue': '其它',
          'sortCode': 2000,
          'valid': 1
        }
      ],
      'metaExperiments': [
        {
          'metaExperimentId': 5,
          'experimentName': '氧处理',
          'experimentCategoryId': 1,
          'supportBallpark': 1,
          'workDays': 5,
          'version': 1
        },
        {
          'metaExperimentId': 8,
          'experimentName': '染预实验',
          'experimentCategoryId': 1,
          'supportBallpark': 1,
          'contractItemSetId': 1,
          'workDays': 10,
          'version': 1
        },
        {
          'metaExperimentId': 2100,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': -7601,
          'version': 1
        },
        {
          'metaExperimentId': 14,
          'experimentName': '染预实验',
          'experimentCategoryId': 1,
          'supportBallpark': 1,
          'contractItemSetId': 1,
          'workDays': 10,
          'version': 1
        },
        {
          'metaExperimentId': 20,
          'experimentName': '验',
          'experimentCategoryId': 1,
          'supportBallpark': 1,
          'workDays': 10,
          'version': 1
        },
        {
          'metaExperimentId': 30,
          'experimentName': '预实验',
          'experimentCategoryId': 1,
          'supportBallpark': 1,
          'contractItemSetId': 2,
          'workDays': 10,
          'version': 1
        },
        {
          'metaExperimentId': 40,
          'experimentName': '预实验',
          'experimentCategoryId': 1,
          'supportBallpark': 1,
          'contractItemSetId': 3,
          'workDays': 10,
          'version': 1
        },
        {
          'metaExperimentId': 50,
          'experimentName': '检测实验',
          'experimentCategoryId': 2,
          'supportBallpark': 1,
          'contractItemSetId': 4,
          'workDays': 5,
          'version': 1
        },
        {
          'metaExperimentId': 60,
          'experimentName': '实验',
          'experimentCategoryId': 2,
          'supportBallpark': 1,
          'contractItemSetId': 5,
          'workDays': 5,
          'version': 1
        },
        {
          'metaExperimentId': 2110,
          'experimentName': '-sgRNA、donor质粒或ssODN修复模板设计与合成',
          'supportBallpark': 1,
          'workDays': 20,
          'version': 1
        },
        {
          'metaExperimentId': 70,
          'experimentName': '检测',
          'experimentCategoryId': 3,
          'supportBallpark': 1,
          'contractItemSetId': 6,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 2120,
          'experimentName': '胞筛靶及靶细胞KI验证',
          'supportBallpark': 1,
          'workDays': 10,
          'version': 1
        },
        {
          'metaExperimentId': 80,
          'experimentName': '测',
          'experimentCategoryId': 3,
          'supportBallpark': 1,
          'contractItemSetId': 7,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 2130,
          'experimentName': '隆稳定细胞株构建I株）',
          'supportBallpark': 1,
          'workDays': 40,
          'version': 1
        },
        {
          'metaExperimentId': 90,
          'experimentName': '测',
          'experimentCategoryId': 3,
          'supportBallpark': 1,
          'contractItemSetId': 8,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 100,
          'experimentName': '敏检测',
          'experimentCategoryId': 3,
          'supportBallpark': 1,
          'contractItemSetId': 8,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 2140,
          'experimentName': '隆稳定细胞株发货',
          'supportBallpark': 1,
          'workDays': -7601,
          'version': 1
        },
        {
          'metaExperimentId': 110,
          'experimentName': '测',
          'experimentCategoryId': 3,
          'supportBallpark': 1,
          'contractItemSetId': 8,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 120,
          'experimentName': '8检测',
          'experimentCategoryId': 3,
          'supportBallpark': 1,
          'contractItemSetId': 8,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 130,
          'experimentName': 'go细胞增殖检测',
          'experimentCategoryId': 3,
          'supportBallpark': 1,
          'contractItemSetId': 8,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 140,
          'experimentName': 'go药敏检测',
          'experimentCategoryId': 3,
          'supportBallpark': 1,
          'contractItemSetId': 8,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 150,
          'experimentName': '预实验',
          'experimentCategoryId': 3,
          'supportBallpark': 1,
          'contractItemSetId': 9,
          'workDays': 12,
          'version': 1
        },
        {
          'metaExperimentId': 160,
          'experimentName': '实验',
          'experimentCategoryId': 3,
          'supportBallpark': 1,
          'contractItemSetId': 9,
          'workDays': 12,
          'version': 1
        },
        {
          'metaExperimentId': 170,
          'experimentName': '隆形成预实验',
          'experimentCategoryId': 3,
          'supportBallpark': 1,
          'contractItemSetId': 9,
          'workDays': 20,
          'version': 1
        },
        {
          'metaExperimentId': 180,
          'experimentName': '隆形成实验',
          'experimentCategoryId': 3,
          'supportBallpark': 1,
          'contractItemSetId': 9,
          'workDays': 20,
          'version': 1
        },
        {
          'metaExperimentId': 190,
          'experimentName': '检测',
          'experimentCategoryId': 3,
          'supportBallpark': 1,
          'contractItemSetId': 11,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 200,
          'experimentName': '检测单染',
          'experimentCategoryId': 3,
          'supportBallpark': 1,
          'contractItemSetId': 10,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 210,
          'experimentName': '检测双染',
          'experimentCategoryId': 3,
          'supportBallpark': 1,
          'contractItemSetId': 10,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 220,
          'experimentName': 'ase 3/7 活性检测',
          'experimentCategoryId': 3,
          'supportBallpark': 1,
          'contractItemSetId': 11,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 230,
          'experimentName': 'l检测',
          'experimentCategoryId': 3,
          'supportBallpark': 1,
          'contractItemSetId': 11,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 240,
          'experimentName': 'gal染色）检测',
          'experimentCategoryId': 3,
          'supportBallpark': 1,
          'contractItemSetId': 11,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 250,
          'experimentName': '预实验',
          'experimentCategoryId': 4,
          'supportBallpark': 1,
          'contractItemSetId': 9,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 2501,
          'experimentName': '实验备、 SDS-PAGE鉴定 ）',
          'supportBallpark': 1,
          'workDays': 10,
          'version': 1
        },
        {
          'metaExperimentId': 2502,
          'experimentName': '实验MS/MS分析预实验）',
          'supportBallpark': 1,
          'workDays': 10,
          'version': 1
        },
        {
          'metaExperimentId': 260,
          'experimentName': '实验',
          'experimentCategoryId': 4,
          'supportBallpark': 1,
          'contractItemSetId': 9,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 270,
          'experimentName': 'nswell）预实验',
          'experimentCategoryId': 4,
          'supportBallpark': 1,
          'contractItemSetId': 9,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 280,
          'experimentName': 'nswell）实验',
          'experimentCategoryId': 4,
          'supportBallpark': 1,
          'contractItemSetId': 9,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 290,
          'experimentName': '预实验',
          'experimentCategoryId': 4,
          'supportBallpark': 1,
          'contractItemSetId': 12,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 300,
          'experimentName': '',
          'experimentCategoryId': 4,
          'supportBallpark': 1,
          'contractItemSetId': 12,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 310,
          'experimentName': ' plate划痕预实验',
          'experimentCategoryId': 4,
          'supportBallpark': 1,
          'contractItemSetId': 13,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 320,
          'experimentName': ' plate划痕实验',
          'experimentCategoryId': 4,
          'supportBallpark': 1,
          'contractItemSetId': 13,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 330,
          'experimentName': '预实验',
          'experimentCategoryId': 5,
          'supportBallpark': 1,
          'contractItemSetId': 9,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 340,
          'experimentName': '实验',
          'experimentCategoryId': 5,
          'supportBallpark': 1,
          'contractItemSetId': 9,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 350,
          'experimentName': '焦成像检测预实验',
          'experimentCategoryId': 5,
          'supportBallpark': 1,
          'contractItemSetId': 14,
          'workDays': 15,
          'version': 1
        },
        {
          'metaExperimentId': 360,
          'experimentName': '焦成像检测实验',
          'experimentCategoryId': 5,
          'supportBallpark': 1,
          'contractItemSetId': 14,
          'workDays': 15,
          'version': 1
        },
        {
          'metaExperimentId': 370,
          'experimentName': '预实验',
          'experimentCategoryId': 5,
          'supportBallpark': 1,
          'contractItemSetId': 15,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 380,
          'experimentName': '',
          'experimentCategoryId': 5,
          'supportBallpark': 1,
          'contractItemSetId': 15,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 390,
          'experimentName': '判读',
          'experimentCategoryId': 5,
          'supportBallpark': 1,
          'contractItemSetId': 15,
          'workDays': 10,
          'version': 1
        },
        {
          'metaExperimentId': 400,
          'experimentName': '预实验',
          'experimentCategoryId': 5,
          'supportBallpark': 1,
          'contractItemSetId': 16,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 410,
          'experimentName': '正式实验描图片、判读、统计分析）',
          'experimentCategoryId': 5,
          'supportBallpark': 1,
          'contractItemSetId': 16,
          'workDays': 15,
          'version': 1
        },
        {
          'metaExperimentId': 420,
          'experimentName': '预实验',
          'experimentCategoryId': 5,
          'supportBallpark': 1,
          'contractItemSetId': 17,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 430,
          'experimentName': '',
          'experimentCategoryId': 5,
          'supportBallpark': 1,
          'contractItemSetId': 17,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 440,
          'experimentName': '表面分子检测预实验体）',
          'experimentCategoryId': 5,
          'supportBallpark': 1,
          'contractItemSetId': 18,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 450,
          'experimentName': '表面分子检测实验体）',
          'experimentCategoryId': 5,
          'supportBallpark': 1,
          'contractItemSetId': 18,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 460,
          'experimentName': 'R分型鉴定',
          'experimentCategoryId': 5,
          'supportBallpark': 1,
          'workDays': 20,
          'version': 1
        },
        {
          'metaExperimentId': 470,
          'experimentName': 'A检测',
          'experimentCategoryId': 5,
          'supportBallpark': 1,
          'contractItemSetId': 19,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 480,
          'experimentName': 'ferase检测实验',
          'experimentCategoryId': 5,
          'supportBallpark': 1,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 490,
          'experimentName': '',
          'experimentCategoryId': 5,
          'supportBallpark': 1,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 500,
          'experimentName': '',
          'experimentCategoryId': 5,
          'supportBallpark': 1,
          'workDays': 10,
          'version': 1
        },
        {
          'metaExperimentId': 510,
          'experimentName': '切片',
          'experimentCategoryId': 5,
          'supportBallpark': 1,
          'workDays': 10,
          'version': 1
        },
        {
          'metaExperimentId': 511,
          'experimentName': '提心）',
          'experimentCategoryId': 5,
          'supportBallpark': 0,
          'contractItemSetId': 23,
          'workDays': 10,
          'version': 1
        },
        {
          'metaExperimentId': 512,
          'experimentName': '提B）',
          'experimentCategoryId': 5,
          'supportBallpark': 0,
          'contractItemSetId': 20,
          'workDays': 5,
          'version': 1
        },
        {
          'metaExperimentId': 514,
          'experimentName': '提镜观察）',
          'experimentCategoryId': 5,
          'supportBallpark': 0,
          'contractItemSetId': 20,
          'workDays': 5,
          'version': 1
        },
        {
          'metaExperimentId': 516,
          'experimentName': 'B验证/CD63/TSG101蛋白）',
          'experimentCategoryId': 5,
          'supportBallpark': 0,
          'workDays': 5,
          'version': 1
        },
        {
          'metaExperimentId': 518,
          'experimentName': '镜观察',
          'experimentCategoryId': 5,
          'supportBallpark': 0,
          'contractItemSetId': 21,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 520,
          'experimentName': '噬过程观察',
          'experimentCategoryId': 5,
          'supportBallpark': 0,
          'contractItemSetId': 22,
          'workDays': 10,
          'version': 1
        },
        {
          'metaExperimentId': 550,
          'experimentName': '',
          'experimentCategoryId': 5,
          'supportBallpark': 0,
          'workDays': -7602,
          'version': 1
        },
        {
          'metaExperimentId': 820,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': 25,
          'version': 1
        },
        {
          'metaExperimentId': 830,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': 15,
          'version': 1
        },
        {
          'metaExperimentId': 880,
          'experimentName': '细胞株构建',
          'supportBallpark': 1,
          'workDays': 35,
          'version': 1
        },
        {
          'metaExperimentId': 882,
          'experimentName': '货',
          'supportBallpark': 1,
          'workDays': -7601,
          'version': 1
        },
        {
          'metaExperimentId': 900,
          'experimentName': '提',
          'supportBallpark': 1,
          'workDays': 10,
          'version': 1
        },
        {
          'metaExperimentId': 910,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': 20,
          'version': 1
        },
        {
          'metaExperimentId': 920,
          'experimentName': '组织芯片刮片',
          'supportBallpark': 1,
          'workDays': 5,
          'version': 1
        },
        {
          'metaExperimentId': 930,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': 3,
          'version': 1
        },
        {
          'metaExperimentId': 940,
          'experimentName': '',
          'supportBallpark': 0,
          'workDays': -7602,
          'version': 1
        },
        {
          'metaExperimentId': 1000,
          'experimentName': '制备',
          'supportBallpark': 1,
          'workDays': 10,
          'version': 1
        },
        {
          'metaExperimentId': 1010,
          'experimentName': '度蛋白去除',
          'supportBallpark': 1,
          'workDays': 10,
          'version': 1
        },
        {
          'metaExperimentId': 1020,
          'experimentName': 'q实验',
          'supportBallpark': 1,
          'workDays': 50,
          'version': 1
        },
        {
          'metaExperimentId': 1022,
          'experimentName': '验',
          'supportBallpark': 1,
          'workDays': 52,
          'version': 1
        },
        {
          'metaExperimentId': 1030,
          'experimentName': 'l freceshie实验',
          'supportBallpark': 1,
          'workDays': 45,
          'version': 1
        },
        {
          'metaExperimentId': 1040,
          'experimentName': 'gun实验',
          'supportBallpark': 1,
          'workDays': 20,
          'version': 1
        },
        {
          'metaExperimentId': 1050,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': -7601,
          'version': 1
        },
        {
          'metaExperimentId': 1060,
          'experimentName': '制备',
          'supportBallpark': 1,
          'workDays': 10,
          'version': 1
        },
        {
          'metaExperimentId': 1070,
          'experimentName': '提和2100质检',
          'supportBallpark': 1,
          'workDays': 5,
          'version': 1
        },
        {
          'metaExperimentId': 1080,
          'experimentName': '检测实验',
          'supportBallpark': 1,
          'workDays': 5,
          'version': 1
        },
        {
          'metaExperimentId': 1090,
          'experimentName': '+IPA分析',
          'supportBallpark': 1,
          'workDays': 20,
          'version': 1
        },
        {
          'metaExperimentId': 1100,
          'experimentName': '验证基因，3复孔）',
          'supportBallpark': 1,
          'workDays': 15,
          'version': 1
        },
        {
          'metaExperimentId': 1110,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': 15,
          'version': 1
        },
        {
          'metaExperimentId': 1120,
          'experimentName': '提',
          'supportBallpark': 1,
          'workDays': -7603,
          'version': 1
        },
        {
          'metaExperimentId': 1130,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': -7603,
          'version': 1
        },
        {
          'metaExperimentId': 1140,
          'experimentName': 'PCR扩增纯化',
          'supportBallpark': 1,
          'workDays': -7604,
          'version': 1
        },
        {
          'metaExperimentId': 1150,
          'experimentName': 'er测序检测目的片段',
          'supportBallpark': 1,
          'workDays': -7604,
          'version': 1
        },
        {
          'metaExperimentId': 1160,
          'experimentName': '分析',
          'supportBallpark': 1,
          'workDays': -7604,
          'version': 1
        },
        {
          'metaExperimentId': 1170,
          'experimentName': 'A抽提质检',
          'supportBallpark': 1,
          'workDays': 5,
          'version': 1
        },
        {
          'metaExperimentId': 1180,
          'experimentName': 'A抽提质检',
          'supportBallpark': 1,
          'workDays': 5,
          'version': 1
        },
        {
          'metaExperimentId': 1190,
          'experimentName': '序检测样本',
          'supportBallpark': 1,
          'workDays': 30,
          'version': 1
        },
        {
          'metaExperimentId': 1200,
          'experimentName': '信息学分析',
          'supportBallpark': 1,
          'workDays': 10,
          'version': 1
        },
        {
          'metaExperimentId': 1210,
          'experimentName': '建库测序',
          'supportBallpark': 1,
          'workDays': 45,
          'version': 1
        },
        {
          'metaExperimentId': 1220,
          'experimentName': '信息学分析(WGBS, RRBS)',
          'supportBallpark': 1,
          'workDays': 10,
          'version': 1
        },
        {
          'metaExperimentId': 1230,
          'experimentName': '建库测序',
          'supportBallpark': 1,
          'workDays': 25,
          'version': 1
        },
        {
          'metaExperimentId': 1240,
          'experimentName': '点条件摸索',
          'supportBallpark': 1,
          'workDays': -7605,
          'version': 1
        },
        {
          'metaExperimentId': 1250,
          'experimentName': '点测序分析',
          'supportBallpark': 1,
          'workDays': -7605,
          'version': 1
        },
        {
          'metaExperimentId': 1260,
          'experimentName': '信息学分析(BSAS)',
          'supportBallpark': 1,
          'workDays': 10,
          'version': 1
        },
        {
          'metaExperimentId': 1270,
          'experimentName': '预实验',
          'supportBallpark': 1,
          'workDays': 35,
          'version': 1
        },
        {
          'metaExperimentId': 1280,
          'experimentName': '细胞制备-细胞感染',
          'supportBallpark': 1,
          'workDays': 20,
          'version': 1
        },
        {
          'metaExperimentId': 1290,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': 30,
          'version': 1
        },
        {
          'metaExperimentId': 1300,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': -7601,
          'version': 1
        },
        {
          'metaExperimentId': 1310,
          'experimentName': '活体成像',
          'supportBallpark': 1,
          'workDays': -7601,
          'version': 1
        },
        {
          'metaExperimentId': 1320,
          'experimentName': '发货',
          'supportBallpark': 1,
          'workDays': -7601,
          'version': 1
        },
        {
          'metaExperimentId': 1330,
          'experimentName': 'er panel高通量测序检测样本',
          'supportBallpark': 1,
          'workDays': 30,
          'version': 1
        },
        {
          'metaExperimentId': 1340,
          'experimentName': 'er panel生信分析',
          'supportBallpark': 1,
          'workDays': 10,
          'version': 1
        },
        {
          'metaExperimentId': 1350,
          'experimentName': '与合成',
          'supportBallpark': 1,
          'workDays': 10,
          'version': 1
        },
        {
          'metaExperimentId': 1360,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': 5,
          'version': 1
        },
        {
          'metaExperimentId': 1370,
          'experimentName': '提质检',
          'supportBallpark': 1,
          'workDays': 5,
          'version': 1
        },
        {
          'metaExperimentId': 1380,
          'experimentName': '谱SNP基因分型预实验',
          'supportBallpark': 1,
          'workDays': 5,
          'version': 1
        },
        {
          'metaExperimentId': 1390,
          'experimentName': '谱SNP基因分型',
          'supportBallpark': 1,
          'workDays': 15,
          'version': 1
        },
        {
          'metaExperimentId': 1400,
          'experimentName': '制备',
          'supportBallpark': 1,
          'workDays': 10,
          'version': 1
        },
        {
          'metaExperimentId': 1410,
          'experimentName': '检测',
          'supportBallpark': 1,
          'workDays': 10,
          'version': 1
        },
        {
          'metaExperimentId': 1420,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': -7601,
          'version': 1
        },
        {
          'metaExperimentId': 1430,
          'experimentName': '成预实验',
          'supportBallpark': 1,
          'workDays': -7606,
          'version': 1
        },
        {
          'metaExperimentId': 1440,
          'experimentName': '药筛预实验',
          'supportBallpark': 1,
          'workDays': -7606,
          'version': 1
        },
        {
          'metaExperimentId': 1450,
          'experimentName': '染预实验',
          'supportBallpark': 1,
          'workDays': -7606,
          'version': 1
        },
        {
          'metaExperimentId': 1460,
          'experimentName': '检测预实验',
          'supportBallpark': 1,
          'workDays': -7606,
          'version': 1
        },
        {
          'metaExperimentId': 1470,
          'experimentName': '-sgRNA质粒构建',
          'supportBallpark': 1,
          'workDays': 15,
          'version': 1
        },
        {
          'metaExperimentId': 1480,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': 10,
          'version': 1
        },
        {
          'metaExperimentId': 1490,
          'experimentName': '隆稳定细胞株构建O株）',
          'supportBallpark': 1,
          'workDays': 30,
          'version': 1
        },
        {
          'metaExperimentId': 1500,
          'experimentName': '定株挑取及测序鉴定',
          'supportBallpark': 1,
          'workDays': 15,
          'version': 1
        },
        {
          'metaExperimentId': 1510,
          'experimentName': '隆稳定细胞株发货',
          'supportBallpark': 1,
          'workDays': -7601,
          'version': 1
        },
        {
          'metaExperimentId': 1520,
          'experimentName': '的空细胞发货',
          'supportBallpark': 1,
          'workDays': -7601,
          'version': 1
        },
        {
          'metaExperimentId': 1530,
          'experimentName': '预实验',
          'supportBallpark': 1,
          'workDays': 10,
          'version': 1
        },
        {
          'metaExperimentId': 1540,
          'experimentName': '蛋白工具株使用',
          'supportBallpark': 1,
          'workDays': -7601,
          'version': 1
        },
        {
          'metaExperimentId': 1550,
          'experimentName': '混合稳定细胞株-构建',
          'supportBallpark': 1,
          'workDays': 25,
          'version': 1
        },
        {
          'metaExperimentId': 1560,
          'experimentName': '-Easy-慢病毒(双载体)包装',
          'supportBallpark': 1,
          'workDays': 25,
          'version': 1
        },
        {
          'metaExperimentId': 1570,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': 15,
          'version': 1
        },
        {
          'metaExperimentId': 1580,
          'experimentName': '蛋白稳定细胞株发货',
          'supportBallpark': 1,
          'workDays': -7601,
          'version': 1
        },
        {
          'metaExperimentId': 1590,
          'experimentName': '序克隆）',
          'supportBallpark': 1,
          'workDays': 15,
          'version': 1
        },
        {
          'metaExperimentId': 1600,
          'experimentName': '分布统计',
          'supportBallpark': 1,
          'workDays': 2,
          'version': 1
        },
        {
          'metaExperimentId': 1610,
          'experimentName': '信号强度统计',
          'supportBallpark': 1,
          'workDays': 2,
          'version': 1
        },
        {
          'metaExperimentId': 1620,
          'experimentName': '析',
          'supportBallpark': 1,
          'workDays': 2,
          'version': 1
        },
        {
          'metaExperimentId': 1630,
          'experimentName': '析',
          'supportBallpark': 1,
          'workDays': 2,
          'version': 1
        },
        {
          'metaExperimentId': 1640,
          'experimentName': '异分析',
          'supportBallpark': 1,
          'workDays': 2,
          'version': 1
        },
        {
          'metaExperimentId': 1650,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': 2,
          'version': 1
        },
        {
          'metaExperimentId': 1660,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': 2,
          'version': 1
        },
        {
          'metaExperimentId': 1670,
          'experimentName': '分析',
          'supportBallpark': 1,
          'workDays': 2,
          'version': 1
        },
        {
          'metaExperimentId': 1680,
          'experimentName': ' Ontology (GO) 注释及富集分析',
          'supportBallpark': 1,
          'workDays': 2,
          'version': 1
        },
        {
          'metaExperimentId': 1690,
          'experimentName': 'GG & BioCarta的通路注释及富集分析',
          'supportBallpark': 1,
          'workDays': 2,
          'version': 1
        },
        {
          'metaExperimentId': 1700,
          'experimentName': '网络分析',
          'supportBallpark': 1,
          'workDays': 2,
          'version': 1
        },
        {
          'metaExperimentId': 1720,
          'experimentName': 'A靶基因预测',
          'supportBallpark': 1,
          'workDays': 2,
          'version': 1
        },
        {
          'metaExperimentId': 1730,
          'experimentName': '染色体分布分析',
          'supportBallpark': 1,
          'workDays': 2,
          'version': 1
        },
        {
          'metaExperimentId': 1740,
          'experimentName': '分析',
          'supportBallpark': 1,
          'workDays': 2,
          'version': 1
        },
        {
          'metaExperimentId': 1750,
          'experimentName': 'NA靶基因预测',
          'supportBallpark': 1,
          'workDays': 3,
          'version': 1
        },
        {
          'metaExperimentId': 1760,
          'experimentName': '络分析',
          'supportBallpark': 1,
          'workDays': 3,
          'version': 1
        },
        {
          'metaExperimentId': 1770,
          'experimentName': '分析',
          'supportBallpark': 1,
          'workDays': 3,
          'version': 1
        },
        {
          'metaExperimentId': 1780,
          'experimentName': '验：符号检验',
          'supportBallpark': 1,
          'workDays': 3,
          'version': 1
        },
        {
          'metaExperimentId': 1790,
          'experimentName': '验：Wilcoxon检验',
          'supportBallpark': 1,
          'workDays': 3,
          'version': 1
        },
        {
          'metaExperimentId': 1800,
          'experimentName': '验：Mann-Whitney U检验',
          'supportBallpark': 1,
          'workDays': 3,
          'version': 1
        },
        {
          'metaExperimentId': 1810,
          'experimentName': '验：Spearman',
          'supportBallpark': 1,
          'workDays': 3,
          'version': 1
        },
        {
          'metaExperimentId': 1820,
          'experimentName': '存分析',
          'supportBallpark': 1,
          'workDays': 3,
          'version': 1
        },
        {
          'metaExperimentId': 1830,
          'experimentName': '存分析',
          'supportBallpark': 1,
          'workDays': 3,
          'version': 1
        },
        {
          'metaExperimentId': 1831,
          'experimentName': 'apping',
          'supportBallpark': 1,
          'workDays': 2,
          'version': 1
        },
        {
          'metaExperimentId': 1832,
          'experimentName': '系数的相关性网络分析',
          'supportBallpark': 1,
          'workDays': 2,
          'version': 1
        },
        {
          'metaExperimentId': 1833,
          'experimentName': 'tScape的基因vs代谢物调控网络分析',
          'supportBallpark': 1,
          'workDays': 3,
          'version': 1
        },
        {
          'metaExperimentId': 1840,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': 2,
          'version': 1
        },
        {
          'metaExperimentId': 1850,
          'experimentName': '库数据下载与上传',
          'supportBallpark': 1,
          'workDays': 2,
          'version': 1
        },
        {
          'metaExperimentId': 1860,
          'experimentName': '整合',
          'supportBallpark': 1,
          'workDays': 2,
          'version': 1
        },
        {
          'metaExperimentId': 1870,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': 2,
          'version': 1
        },
        {
          'metaExperimentId': 1880,
          'experimentName': '分析',
          'supportBallpark': 1,
          'workDays': 1,
          'version': 1
        },
        {
          'metaExperimentId': 1890,
          'experimentName': 'GA标签',
          'supportBallpark': 1,
          'workDays': 1,
          'version': 1
        },
        {
          'metaExperimentId': 1900,
          'experimentName': '相关查询',
          'supportBallpark': 1,
          'workDays': 3,
          'version': 1
        },
        {
          'metaExperimentId': 1910,
          'experimentName': 'A的基因信息',
          'supportBallpark': 1,
          'workDays': 3,
          'version': 1
        },
        {
          'metaExperimentId': 1920,
          'experimentName': 'A的补充文件',
          'supportBallpark': 1,
          'workDays': 3,
          'version': 1
        },
        {
          'metaExperimentId': 1930,
          'experimentName': 'A功能基因列表',
          'supportBallpark': 1,
          'workDays': 3,
          'version': 1
        },
        {
          'metaExperimentId': 1940,
          'experimentName': '信息查询',
          'supportBallpark': 1,
          'workDays': 2,
          'version': 1
        },
        {
          'metaExperimentId': 1950,
          'experimentName': 'athway个性化分析',
          'supportBallpark': 1,
          'workDays': 2,
          'version': 1
        },
        {
          'metaExperimentId': 1960,
          'experimentName': 'A的MicroRNA靶基因预测',
          'supportBallpark': 1,
          'workDays': 3,
          'version': 1
        },
        {
          'metaExperimentId': 1970,
          'experimentName': 'A的经典通路分析',
          'supportBallpark': 1,
          'workDays': 3,
          'version': 1
        },
        {
          'metaExperimentId': 1980,
          'experimentName': 'A的上游调控分析',
          'supportBallpark': 1,
          'workDays': 3,
          'version': 1
        },
        {
          'metaExperimentId': 1990,
          'experimentName': 'A的疾病和功能分析',
          'supportBallpark': 1,
          'workDays': 3,
          'version': 1
        },
        {
          'metaExperimentId': 2000,
          'experimentName': 'A的调控效应分析',
          'supportBallpark': 1,
          'workDays': 3,
          'version': 1
        },
        {
          'metaExperimentId': 2010,
          'experimentName': 'A的相互作用网络分析',
          'supportBallpark': 1,
          'workDays': 3,
          'version': 1
        },
        {
          'metaExperimentId': 2020,
          'experimentName': 'A的综合分析',
          'supportBallpark': 1,
          'workDays': 3,
          'version': 1
        },
        {
          'metaExperimentId': 2030,
          'experimentName': 'A的代谢调控通路分析',
          'supportBallpark': 1,
          'workDays': 3,
          'version': 1
        },
        {
          'metaExperimentId': 2910,
          'experimentName': 'A的多重网络比较分析',
          'supportBallpark': 1,
          'workDays': 4,
          'version': 1
        },
        {
          'metaExperimentId': 2920,
          'experimentName': 'A的个性化调控机制分析',
          'supportBallpark': 1,
          'workDays': 12,
          'version': 1
        },
        {
          'metaExperimentId': 1710,
          'experimentName': 'A的自定义网络分析',
          'supportBallpark': 1,
          'workDays': 3,
          'version': 1
        },
        {
          'metaExperimentId': 2040,
          'experimentName': '性分析',
          'supportBallpark': 1,
          'workDays': 6,
          'version': 1
        },
        {
          'metaExperimentId': 2062,
          'experimentName': '表达谱芯片A套',
          'supportBallpark': 1,
          'workDays': 5,
          'version': 1
        },
        {
          'metaExperimentId': 2063,
          'experimentName': '表达谱芯片B套',
          'supportBallpark': 1,
          'workDays': 5,
          'version': 1
        },
        {
          'metaExperimentId': 2050,
          'experimentName': '公共数据分析A套',
          'supportBallpark': 1,
          'workDays': 5,
          'version': 1
        },
        {
          'metaExperimentId': 2060,
          'experimentName': '公共数据分析B套',
          'supportBallpark': 1,
          'workDays': 6,
          'version': 1
        },
        {
          'metaExperimentId': 2064,
          'experimentName': 'A表达谱芯片A套',
          'supportBallpark': 1,
          'workDays': 5,
          'version': 1
        },
        {
          'metaExperimentId': 2930,
          'experimentName': 'A表达谱芯片',
          'supportBallpark': 1,
          'workDays': 3,
          'version': 1
        },
        {
          'metaExperimentId': 2066,
          'experimentName': 'A表达谱芯片B套',
          'supportBallpark': 1,
          'workDays': 5,
          'version': 1
        },
        {
          'metaExperimentId': 2067,
          'experimentName': 'iom D全转录组芯片',
          'supportBallpark': 1,
          'workDays': 5,
          'version': 1
        },
        {
          'metaExperimentId': 2940,
          'experimentName': 'GA的单基因临床病理相关性分析据下载及整理）',
          'supportBallpark': 1,
          'workDays': 5,
          'version': 1
        },
        {
          'metaExperimentId': 2950,
          'experimentName': 'GA的单基因统计分析',
          'supportBallpark': 1,
          'workDays': 5,
          'version': 1
        },
        {
          'metaExperimentId': 2960,
          'experimentName': '蛋白质组学A套',
          'supportBallpark': 1,
          'workDays': 6,
          'version': 1
        },
        {
          'metaExperimentId': 2970,
          'experimentName': '蛋白质组学B套',
          'supportBallpark': 1,
          'workDays': 6,
          'version': 1
        },
        {
          'metaExperimentId': 2980,
          'experimentName': '统计分析',
          'supportBallpark': 1,
          'workDays': 5,
          'version': 1
        },
        {
          'metaExperimentId': 2068,
          'experimentName': '数据来源统计分析报告',
          'supportBallpark': 1,
          'workDays': 5,
          'version': 1
        },
        {
          'metaExperimentId': 2065,
          'experimentName': 'oRNA vs mRNA表达谱联合分析',
          'supportBallpark': 1,
          'workDays': 5,
          'version': 1
        },
        {
          'metaExperimentId': 2069,
          'experimentName': '/蛋白质组学 vs 代谢组学联合分析',
          'supportBallpark': 1,
          'workDays': 15,
          'version': 1
        },
        {
          'metaExperimentId': 2150,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': 10,
          'version': 1
        },
        {
          'metaExperimentId': 2160,
          'experimentName': 'Plex® 多重免疫分析盒）',
          'supportBallpark': 1,
          'workDays': 15,
          'version': 1
        },
        {
          'metaExperimentId': 2170,
          'experimentName': 'Plex® 多重免疫分析供试剂）',
          'supportBallpark': 1,
          'workDays': 15,
          'version': 1
        },
        {
          'metaExperimentId': 2180,
          'experimentName': 'Plex® 多重循环miRNA分析盒）',
          'supportBallpark': 1,
          'workDays': 15,
          'version': 1
        },
        {
          'metaExperimentId': 2190,
          'experimentName': 'Plex® 多重循环miRNA分析供试剂）',
          'supportBallpark': 1,
          'workDays': 15,
          'version': 1
        },
        {
          'metaExperimentId': 2200,
          'experimentName': '过表达效果(FLAG抗体)',
          'supportBallpark': 1,
          'workDays': 15,
          'version': 1
        },
        {
          'metaExperimentId': 2210,
          'experimentName': '预实验供B基因目的抗体）',
          'supportBallpark': 1,
          'workDays': 10,
          'version': 1
        },
        {
          'metaExperimentId': 2220,
          'experimentName': 'ti-Flag抗体免疫沉淀(IP)富集与A蛋白相互作用复合物，Co-IP实验验证A蛋白与B蛋白相互作用',
          'supportBallpark': 1,
          'workDays': 15,
          'version': 1
        },
        {
          'metaExperimentId': 2230,
          'experimentName': 'RNAiHCS',
          'supportBallpark': 1,
          'workDays': 35,
          'version': 1
        },
        {
          'metaExperimentId': 2240,
          'experimentName': 'RNAiHCS',
          'supportBallpark': 1,
          'workDays': 35,
          'version': 1
        },
        {
          'metaExperimentId': 2250,
          'experimentName': 'CAS9HCS',
          'supportBallpark': 1,
          'workDays': 35,
          'version': 1
        },
        {
          'metaExperimentId': 2260,
          'experimentName': 'CAS9HCS',
          'supportBallpark': 1,
          'workDays': 35,
          'version': 1
        },
        {
          'metaExperimentId': 2270,
          'experimentName': '过表达HCS',
          'supportBallpark': 1,
          'workDays': 45,
          'version': 1
        },
        {
          'metaExperimentId': 2280,
          'experimentName': '过表达HCS',
          'supportBallpark': 1,
          'workDays': 45,
          'version': 1
        },
        {
          'metaExperimentId': 2300,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': -7601,
          'version': 1
        },
        {
          'metaExperimentId': 2310,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': -7601,
          'version': 1
        },
        {
          'metaExperimentId': 2320,
          'experimentName': '鼠鉴定',
          'supportBallpark': 1,
          'workDays': -7601,
          'version': 1
        },
        {
          'metaExperimentId': 2330,
          'experimentName': '得F1代大、小鼠',
          'supportBallpark': 1,
          'workDays': -7601,
          'version': 1
        },
        {
          'metaExperimentId': 2340,
          'experimentName': '鼠鉴定',
          'supportBallpark': 1,
          'workDays': -7601,
          'version': 1
        },
        {
          'metaExperimentId': 2350,
          'experimentName': '1代大、小鼠交付',
          'supportBallpark': 1,
          'workDays': -7602,
          'version': 1
        },
        {
          'metaExperimentId': 2360,
          'experimentName': '/移植',
          'supportBallpark': 1,
          'workDays': -7601,
          'version': 1
        },
        {
          'metaExperimentId': 2370,
          'experimentName': '鉴定',
          'supportBallpark': 1,
          'workDays': -7601,
          'version': 1
        },
        {
          'metaExperimentId': 2380,
          'experimentName': '、小鼠交付',
          'supportBallpark': 1,
          'workDays': -7602,
          'version': 1
        },
        {
          'metaExperimentId': 2390,
          'experimentName': '大、小鼠交付',
          'supportBallpark': 1,
          'workDays': -7602,
          'version': 1
        },
        {
          'metaExperimentId': 2400,
          'experimentName': 'card I',
          'supportBallpark': 1,
          'workDays': 30,
          'version': 1
        },
        {
          'metaExperimentId': 2410,
          'experimentName': 'card II',
          'supportBallpark': 1,
          'workDays': 60,
          'version': 1
        },
        {
          'metaExperimentId': 2420,
          'experimentName': 'card III',
          'supportBallpark': 1,
          'workDays': 70,
          'version': 1
        },
        {
          'metaExperimentId': 2430,
          'experimentName': 'card IV',
          'supportBallpark': 1,
          'workDays': 85,
          'version': 1
        },
        {
          'metaExperimentId': 2440,
          'experimentName': 'card V',
          'supportBallpark': 1,
          'workDays': 30,
          'version': 1
        },
        {
          'metaExperimentId': 2450,
          'experimentName': 'card VI',
          'supportBallpark': 1,
          'workDays': 75,
          'version': 1
        },
        {
          'metaExperimentId': 2460,
          'experimentName': 'card VII',
          'supportBallpark': 1,
          'workDays': 95,
          'version': 1
        },
        {
          'metaExperimentId': 2470,
          'experimentName': 'card_VIII',
          'supportBallpark': 1,
          'workDays': 8,
          'version': 1
        },
        {
          'metaExperimentId': 2500,
          'experimentName': '实验',
          'supportBallpark': 1,
          'workDays': 20,
          'version': 1
        },
        {
          'metaExperimentId': 2510,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': 20,
          'version': 1
        },
        {
          'metaExperimentId': 2520,
          'experimentName': '验',
          'supportBallpark': 1,
          'workDays': 20,
          'version': 1
        },
        {
          'metaExperimentId': 2530,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': 10,
          'version': 1
        },
        {
          'metaExperimentId': 2540,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': -7607,
          'version': 1
        },
        {
          'metaExperimentId': 2550,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': -7607,
          'version': 1
        },
        {
          'metaExperimentId': 2560,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': -7607,
          'version': 1
        },
        {
          'metaExperimentId': 2570,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': -7608,
          'version': 1
        },
        {
          'metaExperimentId': 2580,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': -7608,
          'version': 1
        },
        {
          'metaExperimentId': 2590,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': -7608,
          'version': 1
        },
        {
          'metaExperimentId': 2600,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': -7609,
          'version': 1
        },
        {
          'metaExperimentId': 2610,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': -7609,
          'version': 1
        },
        {
          'metaExperimentId': 2620,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': -7609,
          'version': 1
        },
        {
          'metaExperimentId': 2630,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': -7610,
          'version': 1
        },
        {
          'metaExperimentId': 2640,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': -7610,
          'version': 1
        },
        {
          'metaExperimentId': 2650,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': -7610,
          'version': 1
        },
        {
          'metaExperimentId': 2660,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': -7611,
          'version': 1
        },
        {
          'metaExperimentId': 2670,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': -7611,
          'version': 1
        },
        {
          'metaExperimentId': 2680,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': -7611,
          'version': 1
        },
        {
          'metaExperimentId': 2690,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': -7612,
          'version': 1
        },
        {
          'metaExperimentId': 2700,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': -7612,
          'version': 1
        },
        {
          'metaExperimentId': 2710,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': -7612,
          'version': 1
        },
        {
          'metaExperimentId': 2720,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': -7613,
          'version': 1
        },
        {
          'metaExperimentId': 2730,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': -7613,
          'version': 1
        },
        {
          'metaExperimentId': 2740,
          'experimentName': '',
          'supportBallpark': 1,
          'workDays': -7613,
          'version': 1
        },
        {
          'metaExperimentId': 2800,
          'experimentName': '清',
          'experimentCategoryId': 5,
          'supportBallpark': 1,
          'workDays': -7601,
          'version': 1
        },
        {
          'metaExperimentId': 2810,
          'experimentName': '',
          'experimentCategoryId': 5,
          'supportBallpark': 1,
          'workDays': -7601,
          'version': 1
        },
        {
          'metaExperimentId': 2820,
          'experimentName': '',
          'experimentCategoryId': 5,
          'supportBallpark': 1,
          'workDays': -7601,
          'version': 1
        },
        {
          'metaExperimentId': 10000,
          'experimentName': '',
          'supportBallpark': 0,
          'workDays': -7601,
          'version': 1
        }
      ],
      'metaExperimentCategories': [
        {
          'experimentCategoryId': 1,
          'experimentCategoryName': '预实验',
          'sortOrder': 10
        },
        {
          'experimentCategoryId': 2,
          'experimentCategoryName': '基因检测',
          'sortOrder': 20
        },
        {
          'experimentCategoryId': 3,
          'experimentCategoryName': '增殖相关',
          'sortOrder': 30
        },
        {
          'experimentCategoryId': 4,
          'experimentCategoryName': '转移相关',
          'sortOrder': 40
        },
        {
          'experimentCategoryId': 5,
          'experimentCategoryName': '其他',
          'sortOrder': 50
        }
      ],
      'metaExperimentSetItems': [
        {
          'experimentSetId': 1,
          'metaExperimentId': 5,
          'sortOrder': 50
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 8,
          'sortOrder': 80
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 14,
          'sortOrder': 140
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 20,
          'sortOrder': 200
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 30,
          'sortOrder': 300
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 40,
          'sortOrder': 400
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 50,
          'sortOrder': 500
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 60,
          'sortOrder': 600
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 70,
          'sortOrder': 700
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 80,
          'sortOrder': 800
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 90,
          'sortOrder': 900
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 100,
          'sortOrder': 1000
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 110,
          'sortOrder': 1100
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 120,
          'sortOrder': 1200
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 130,
          'sortOrder': 1300
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 140,
          'sortOrder': 1400
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 150,
          'sortOrder': 1500
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 160,
          'sortOrder': 1600
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 170,
          'sortOrder': 1700
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 180,
          'sortOrder': 1800
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 190,
          'sortOrder': 1900
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 200,
          'sortOrder': 2000
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 210,
          'sortOrder': 2100
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 220,
          'sortOrder': 2200
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 230,
          'sortOrder': 2300
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 240,
          'sortOrder': 2400
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 250,
          'sortOrder': 2500
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 260,
          'sortOrder': 2600
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 270,
          'sortOrder': 2700
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 280,
          'sortOrder': 2800
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 290,
          'sortOrder': 2900
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 300,
          'sortOrder': 3000
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 310,
          'sortOrder': 3100
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 320,
          'sortOrder': 3200
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 330,
          'sortOrder': 3300
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 340,
          'sortOrder': 3400
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 350,
          'sortOrder': 3500
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 360,
          'sortOrder': 3600
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 370,
          'sortOrder': 3700
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 380,
          'sortOrder': 3800
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 390,
          'sortOrder': 3900
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 400,
          'sortOrder': 4000
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 410,
          'sortOrder': 4100
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 420,
          'sortOrder': 4200
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 430,
          'sortOrder': 4300
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 440,
          'sortOrder': 4400
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 450,
          'sortOrder': 4500
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 460,
          'sortOrder': 4600
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 470,
          'sortOrder': 4700
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 480,
          'sortOrder': 4800
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 490,
          'sortOrder': 4900
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 500,
          'sortOrder': 5000
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 510,
          'sortOrder': 5100
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 511,
          'sortOrder': 5110
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 512,
          'sortOrder': 5120
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 514,
          'sortOrder': 5140
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 516,
          'sortOrder': 5160
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 518,
          'sortOrder': 5180
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 520,
          'sortOrder': 5200
        },
        {
          'experimentSetId': 1,
          'metaExperimentId': 550,
          'sortOrder': 5500
        },
        {
          'experimentSetId': 2,
          'metaExperimentId': 8,
          'sortOrder': 80
        },
        {
          'experimentSetId': 2,
          'metaExperimentId': 30,
          'sortOrder': 300
        },
        {
          'experimentSetId': 2,
          'metaExperimentId': 820,
          'sortOrder': 8200
        },
        {
          'experimentSetId': 2,
          'metaExperimentId': 830,
          'sortOrder': 8300
        },
        {
          'experimentSetId': 3,
          'metaExperimentId': 8,
          'sortOrder': 80
        },
        {
          'experimentSetId': 3,
          'metaExperimentId': 30,
          'sortOrder': 300
        },
        {
          'experimentSetId': 3,
          'metaExperimentId': 40,
          'sortOrder': 400
        },
        {
          'experimentSetId': 3,
          'metaExperimentId': 60,
          'sortOrder': 600
        },
        {
          'experimentSetId': 3,
          'metaExperimentId': 880,
          'sortOrder': 8800
        },
        {
          'experimentSetId': 3,
          'metaExperimentId': 882,
          'sortOrder': 8820
        },
        {
          'experimentSetId': 4,
          'metaExperimentId': 900,
          'sortOrder': 9000
        },
        {
          'experimentSetId': 4,
          'metaExperimentId': 910,
          'sortOrder': 9100
        },
        {
          'experimentSetId': 4,
          'metaExperimentId': 920,
          'sortOrder': 9200
        },
        {
          'experimentSetId': 4,
          'metaExperimentId': 930,
          'sortOrder': 9300
        },
        {
          'experimentSetId': 4,
          'metaExperimentId': 940,
          'sortOrder': 9400
        },
        {
          'experimentSetId': 5,
          'metaExperimentId': 1000,
          'sortOrder': 10000
        },
        {
          'experimentSetId': 5,
          'metaExperimentId': 1010,
          'sortOrder': 10100
        },
        {
          'experimentSetId': 5,
          'metaExperimentId': 1020,
          'sortOrder': 10200
        },
        {
          'experimentSetId': 5,
          'metaExperimentId': 1050,
          'sortOrder': 10500
        },
        {
          'experimentSetId': 6,
          'metaExperimentId': 1000,
          'sortOrder': 10000
        },
        {
          'experimentSetId': 6,
          'metaExperimentId': 1010,
          'sortOrder': 10100
        },
        {
          'experimentSetId': 6,
          'metaExperimentId': 1030,
          'sortOrder': 10300
        },
        {
          'experimentSetId': 6,
          'metaExperimentId': 1050,
          'sortOrder': 10500
        },
        {
          'experimentSetId': 7,
          'metaExperimentId': 1000,
          'sortOrder': 10000
        },
        {
          'experimentSetId': 7,
          'metaExperimentId': 1010,
          'sortOrder': 10100
        },
        {
          'experimentSetId': 7,
          'metaExperimentId': 1040,
          'sortOrder': 10400
        },
        {
          'experimentSetId': 8,
          'metaExperimentId': 1060,
          'sortOrder': 10600
        },
        {
          'experimentSetId': 8,
          'metaExperimentId': 1070,
          'sortOrder': 10700
        },
        {
          'experimentSetId': 8,
          'metaExperimentId': 1080,
          'sortOrder': 10800
        },
        {
          'experimentSetId': 8,
          'metaExperimentId': 1090,
          'sortOrder': 10900
        },
        {
          'experimentSetId': 8,
          'metaExperimentId': 1100,
          'sortOrder': 11000
        },
        {
          'experimentSetId': 8,
          'metaExperimentId': 1110,
          'sortOrder': 11100
        },
        {
          'experimentSetId': 9,
          'metaExperimentId': 1120,
          'sortOrder': 11200
        },
        {
          'experimentSetId': 9,
          'metaExperimentId': 1130,
          'sortOrder': 11300
        },
        {
          'experimentSetId': 9,
          'metaExperimentId': 1140,
          'sortOrder': 11400
        },
        {
          'experimentSetId': 9,
          'metaExperimentId': 1150,
          'sortOrder': 11500
        },
        {
          'experimentSetId': 9,
          'metaExperimentId': 1160,
          'sortOrder': 11600
        },
        {
          'experimentSetId': 10,
          'metaExperimentId': 1170,
          'sortOrder': 11700
        },
        {
          'experimentSetId': 10,
          'metaExperimentId': 1190,
          'sortOrder': 11900
        },
        {
          'experimentSetId': 10,
          'metaExperimentId': 1200,
          'sortOrder': 12000
        },
        {
          'experimentSetId': 11,
          'metaExperimentId': 1180,
          'sortOrder': 11800
        },
        {
          'experimentSetId': 11,
          'metaExperimentId': 1190,
          'sortOrder': 11900
        },
        {
          'experimentSetId': 11,
          'metaExperimentId': 1200,
          'sortOrder': 12000
        },
        {
          'experimentSetId': 12,
          'metaExperimentId': 1170,
          'sortOrder': 11700
        },
        {
          'experimentSetId': 12,
          'metaExperimentId': 1210,
          'sortOrder': 12100
        },
        {
          'experimentSetId': 12,
          'metaExperimentId': 1220,
          'sortOrder': 12200
        },
        {
          'experimentSetId': 13,
          'metaExperimentId': 1170,
          'sortOrder': 11700
        },
        {
          'experimentSetId': 13,
          'metaExperimentId': 1220,
          'sortOrder': 12200
        },
        {
          'experimentSetId': 13,
          'metaExperimentId': 1230,
          'sortOrder': 12300
        },
        {
          'experimentSetId': 14,
          'metaExperimentId': 1170,
          'sortOrder': 11700
        },
        {
          'experimentSetId': 14,
          'metaExperimentId': 1240,
          'sortOrder': 12400
        },
        {
          'experimentSetId': 14,
          'metaExperimentId': 1250,
          'sortOrder': 12500
        },
        {
          'experimentSetId': 14,
          'metaExperimentId': 1260,
          'sortOrder': 12600
        },
        {
          'experimentSetId': 15,
          'metaExperimentId': 8,
          'sortOrder': 80
        },
        {
          'experimentSetId': 15,
          'metaExperimentId': 1270,
          'sortOrder': 12700
        },
        {
          'experimentSetId': 15,
          'metaExperimentId': 1280,
          'sortOrder': 12800
        },
        {
          'experimentSetId': 15,
          'metaExperimentId': 1290,
          'sortOrder': 12900
        },
        {
          'experimentSetId': 15,
          'metaExperimentId': 1300,
          'sortOrder': 13000
        },
        {
          'experimentSetId': 15,
          'metaExperimentId': 1310,
          'sortOrder': 13100
        },
        {
          'experimentSetId': 15,
          'metaExperimentId': 1320,
          'sortOrder': 13200
        },
        {
          'experimentSetId': 16,
          'metaExperimentId': 1170,
          'sortOrder': 11700
        },
        {
          'experimentSetId': 16,
          'metaExperimentId': 1330,
          'sortOrder': 13300
        },
        {
          'experimentSetId': 16,
          'metaExperimentId': 1340,
          'sortOrder': 13400
        },
        {
          'experimentSetId': 17,
          'metaExperimentId': 1350,
          'sortOrder': 13500
        },
        {
          'experimentSetId': 17,
          'metaExperimentId': 1360,
          'sortOrder': 13600
        },
        {
          'experimentSetId': 17,
          'metaExperimentId': 1370,
          'sortOrder': 13700
        },
        {
          'experimentSetId': 17,
          'metaExperimentId': 1380,
          'sortOrder': 13800
        },
        {
          'experimentSetId': 17,
          'metaExperimentId': 1390,
          'sortOrder': 13900
        },
        {
          'experimentSetId': 18,
          'metaExperimentId': 50,
          'sortOrder': 500
        },
        {
          'experimentSetId': 18,
          'metaExperimentId': 1400,
          'sortOrder': 14000
        },
        {
          'experimentSetId': 18,
          'metaExperimentId': 1410,
          'sortOrder': 14100
        },
        {
          'experimentSetId': 19,
          'metaExperimentId': 1420,
          'sortOrder': 14200
        },
        {
          'experimentSetId': 19,
          'metaExperimentId': 1430,
          'sortOrder': 14300
        },
        {
          'experimentSetId': 19,
          'metaExperimentId': 1440,
          'sortOrder': 14400
        },
        {
          'experimentSetId': 19,
          'metaExperimentId': 1450,
          'sortOrder': 14500
        },
        {
          'experimentSetId': 19,
          'metaExperimentId': 1460,
          'sortOrder': 14600
        },
        {
          'experimentSetId': 19,
          'metaExperimentId': 1470,
          'sortOrder': 14700
        },
        {
          'experimentSetId': 19,
          'metaExperimentId': 1480,
          'sortOrder': 14800
        },
        {
          'experimentSetId': 19,
          'metaExperimentId': 1490,
          'sortOrder': 14900
        },
        {
          'experimentSetId': 19,
          'metaExperimentId': 1500,
          'sortOrder': 15000
        },
        {
          'experimentSetId': 19,
          'metaExperimentId': 1510,
          'sortOrder': 15100
        },
        {
          'experimentSetId': 19,
          'metaExperimentId': 1520,
          'sortOrder': 15200
        },
        {
          'experimentSetId': 20,
          'metaExperimentId': 8,
          'sortOrder': 80
        },
        {
          'experimentSetId': 20,
          'metaExperimentId': 1530,
          'sortOrder': 15300
        },
        {
          'experimentSetId': 20,
          'metaExperimentId': 1540,
          'sortOrder': 15400
        },
        {
          'experimentSetId': 20,
          'metaExperimentId': 1550,
          'sortOrder': 15500
        },
        {
          'experimentSetId': 20,
          'metaExperimentId': 1560,
          'sortOrder': 15600
        },
        {
          'experimentSetId': 20,
          'metaExperimentId': 1570,
          'sortOrder': 15700
        },
        {
          'experimentSetId': 20,
          'metaExperimentId': 1580,
          'sortOrder': 15800
        },
        {
          'experimentSetId': 20,
          'metaExperimentId': 1590,
          'sortOrder': 15900
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1600,
          'sortOrder': 16000
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1610,
          'sortOrder': 16100
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1620,
          'sortOrder': 16200
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1630,
          'sortOrder': 16300
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1640,
          'sortOrder': 16400
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1650,
          'sortOrder': 16500
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1660,
          'sortOrder': 16600
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1670,
          'sortOrder': 16700
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1680,
          'sortOrder': 16800
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1690,
          'sortOrder': 16900
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1700,
          'sortOrder': 17000
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1710,
          'sortOrder': 20330
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1720,
          'sortOrder': 17200
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1730,
          'sortOrder': 17300
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1740,
          'sortOrder': 17400
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1750,
          'sortOrder': 17500
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1760,
          'sortOrder': 17600
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1770,
          'sortOrder': 17700
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1780,
          'sortOrder': 17800
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1790,
          'sortOrder': 17900
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1800,
          'sortOrder': 18000
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1810,
          'sortOrder': 18100
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1820,
          'sortOrder': 18200
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1830,
          'sortOrder': 18300
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1831,
          'sortOrder': 18310
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1832,
          'sortOrder': 18320
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1833,
          'sortOrder': 18330
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1840,
          'sortOrder': 18400
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1850,
          'sortOrder': 18500
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1860,
          'sortOrder': 18600
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1870,
          'sortOrder': 18700
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1880,
          'sortOrder': 18800
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1890,
          'sortOrder': 18900,
          'serviceCategoryDisabled': '2400'
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1900,
          'sortOrder': 19000,
          'serviceCategoryDisabled': '2400'
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1910,
          'sortOrder': 19100
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1920,
          'sortOrder': 19200
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1930,
          'sortOrder': 19300
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1940,
          'sortOrder': 19400,
          'serviceCategoryDisabled': '2400'
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1950,
          'sortOrder': 19500,
          'serviceCategoryDisabled': '2400'
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1960,
          'sortOrder': 19600
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1970,
          'sortOrder': 19700
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1980,
          'sortOrder': 19800
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 1990,
          'sortOrder': 19900
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 2000,
          'sortOrder': 20000
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 2010,
          'sortOrder': 20100
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 2020,
          'sortOrder': 20200
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 2030,
          'sortOrder': 20300
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 2040,
          'sortOrder': 20400,
          'serviceCategoryDisabled': '2400'
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 2050,
          'sortOrder': 20620
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 2060,
          'sortOrder': 20630
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 2062,
          'sortOrder': 20500
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 2063,
          'sortOrder': 20600
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 2064,
          'sortOrder': 20640,
          'serviceCategoryDisabled': '2400'
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 2065,
          'sortOrder': 20685
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 2066,
          'sortOrder': 20660,
          'serviceCategoryDisabled': '2400'
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 2067,
          'sortOrder': 20670
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 2068,
          'sortOrder': 20680,
          'serviceCategoryDisabled': '2400'
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 2069,
          'sortOrder': 20690
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 2910,
          'sortOrder': 20310
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 2920,
          'sortOrder': 20320
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 2930,
          'sortOrder': 20645
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 2940,
          'sortOrder': 20671
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 2950,
          'sortOrder': 20672
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 2960,
          'sortOrder': 20673
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 2970,
          'sortOrder': 20674
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 2980,
          'sortOrder': 20675
        },
        {
          'experimentSetId': 21,
          'metaExperimentId': 10000,
          'sortOrder': 100000
        },
        {
          'experimentSetId': 22,
          'metaExperimentId': 1430,
          'sortOrder': 200
        },
        {
          'experimentSetId': 22,
          'metaExperimentId': 1440,
          'sortOrder': 300
        },
        {
          'experimentSetId': 22,
          'metaExperimentId': 1450,
          'sortOrder': 400
        },
        {
          'experimentSetId': 22,
          'metaExperimentId': 1460,
          'sortOrder': 500
        },
        {
          'experimentSetId': 22,
          'metaExperimentId': 1500,
          'sortOrder': 900
        },
        {
          'experimentSetId': 22,
          'metaExperimentId': 1520,
          'sortOrder': 1100
        },
        {
          'experimentSetId': 22,
          'metaExperimentId': 2100,
          'sortOrder': 100
        },
        {
          'experimentSetId': 22,
          'metaExperimentId': 2110,
          'sortOrder': 600
        },
        {
          'experimentSetId': 22,
          'metaExperimentId': 2120,
          'sortOrder': 700
        },
        {
          'experimentSetId': 22,
          'metaExperimentId': 2130,
          'sortOrder': 800
        },
        {
          'experimentSetId': 22,
          'metaExperimentId': 2140,
          'sortOrder': 1000
        },
        {
          'experimentSetId': 23,
          'metaExperimentId': 2150,
          'sortOrder': 21500
        },
        {
          'experimentSetId': 23,
          'metaExperimentId': 2160,
          'sortOrder': 21600
        },
        {
          'experimentSetId': 23,
          'metaExperimentId': 2170,
          'sortOrder': 21700
        },
        {
          'experimentSetId': 23,
          'metaExperimentId': 2180,
          'sortOrder': 21800
        },
        {
          'experimentSetId': 23,
          'metaExperimentId': 2190,
          'sortOrder': 21900
        },
        {
          'experimentSetId': 24,
          'metaExperimentId': 2150,
          'sortOrder': 21500
        },
        {
          'experimentSetId': 24,
          'metaExperimentId': 2200,
          'sortOrder': 22000
        },
        {
          'experimentSetId': 24,
          'metaExperimentId': 2210,
          'sortOrder': 22100
        },
        {
          'experimentSetId': 24,
          'metaExperimentId': 2220,
          'sortOrder': 22200
        },
        {
          'experimentSetId': 25,
          'metaExperimentId': 8,
          'sortOrder': 80
        },
        {
          'experimentSetId': 25,
          'metaExperimentId': 2230,
          'sortOrder': 22300
        },
        {
          'experimentSetId': 25,
          'metaExperimentId': 2240,
          'sortOrder': 22400
        },
        {
          'experimentSetId': 25,
          'metaExperimentId': 2250,
          'sortOrder': 22500
        },
        {
          'experimentSetId': 25,
          'metaExperimentId': 2260,
          'sortOrder': 22600
        },
        {
          'experimentSetId': 25,
          'metaExperimentId': 2270,
          'sortOrder': 22700
        },
        {
          'experimentSetId': 25,
          'metaExperimentId': 2280,
          'sortOrder': 22800
        },
        {
          'experimentSetId': 26,
          'metaExperimentId': 2300,
          'sortOrder': 23000
        },
        {
          'experimentSetId': 27,
          'metaExperimentId': 2310,
          'sortOrder': 23100
        },
        {
          'experimentSetId': 27,
          'metaExperimentId': 2320,
          'sortOrder': 23200
        },
        {
          'experimentSetId': 27,
          'metaExperimentId': 2330,
          'sortOrder': 23300
        },
        {
          'experimentSetId': 27,
          'metaExperimentId': 2340,
          'sortOrder': 23400
        },
        {
          'experimentSetId': 27,
          'metaExperimentId': 2350,
          'sortOrder': 23500
        },
        {
          'experimentSetId': 28,
          'metaExperimentId': 2360,
          'sortOrder': 23600
        },
        {
          'experimentSetId': 28,
          'metaExperimentId': 2370,
          'sortOrder': 23700
        },
        {
          'experimentSetId': 28,
          'metaExperimentId': 2380,
          'sortOrder': 23800
        },
        {
          'experimentSetId': 29,
          'metaExperimentId': 2390,
          'sortOrder': 23900
        },
        {
          'experimentSetId': 31,
          'metaExperimentId': 2470,
          'sortOrder': 24700
        },
        {
          'experimentSetId': 32,
          'metaExperimentId': 1000,
          'sortOrder': 10000
        },
        {
          'experimentSetId': 32,
          'metaExperimentId': 1010,
          'sortOrder': 10100
        },
        {
          'experimentSetId': 32,
          'metaExperimentId': 1022,
          'sortOrder': 10220
        },
        {
          'experimentSetId': 32,
          'metaExperimentId': 1050,
          'sortOrder': 10500
        },
        {
          'experimentSetId': 33,
          'metaExperimentId': 2400,
          'sortOrder': 24000
        },
        {
          'experimentSetId': 34,
          'metaExperimentId': 2410,
          'sortOrder': 24100
        },
        {
          'experimentSetId': 35,
          'metaExperimentId': 2420,
          'sortOrder': 24200
        },
        {
          'experimentSetId': 36,
          'metaExperimentId': 2430,
          'sortOrder': 24300
        },
        {
          'experimentSetId': 37,
          'metaExperimentId': 2440,
          'sortOrder': 24400
        },
        {
          'experimentSetId': 38,
          'metaExperimentId': 2450,
          'sortOrder': 24500
        },
        {
          'experimentSetId': 39,
          'metaExperimentId': 2460,
          'sortOrder': 24600
        },
        {
          'experimentSetId': 40,
          'metaExperimentId': 2500,
          'sortOrder': 25000,
          'serviceCategoryDisabled': 'ALL'
        },
        {
          'experimentSetId': 40,
          'metaExperimentId': 2501,
          'sortOrder': 2501
        },
        {
          'experimentSetId': 40,
          'metaExperimentId': 2502,
          'sortOrder': 2502
        },
        {
          'experimentSetId': 40,
          'metaExperimentId': 2510,
          'sortOrder': 25100
        },
        {
          'experimentSetId': 40,
          'metaExperimentId': 2520,
          'sortOrder': 25200
        },
        {
          'experimentSetId': 40,
          'metaExperimentId': 2530,
          'sortOrder': 25300
        },
        {
          'experimentSetId': 41,
          'metaExperimentId': 2540,
          'sortOrder': 25400
        },
        {
          'experimentSetId': 41,
          'metaExperimentId': 2550,
          'sortOrder': 25500
        },
        {
          'experimentSetId': 41,
          'metaExperimentId': 2560,
          'sortOrder': 25600
        },
        {
          'experimentSetId': 42,
          'metaExperimentId': 2570,
          'sortOrder': 25700
        },
        {
          'experimentSetId': 42,
          'metaExperimentId': 2580,
          'sortOrder': 25800
        },
        {
          'experimentSetId': 42,
          'metaExperimentId': 2590,
          'sortOrder': 25900
        },
        {
          'experimentSetId': 43,
          'metaExperimentId': 2600,
          'sortOrder': 26000
        },
        {
          'experimentSetId': 43,
          'metaExperimentId': 2610,
          'sortOrder': 26100
        },
        {
          'experimentSetId': 43,
          'metaExperimentId': 2620,
          'sortOrder': 26200
        },
        {
          'experimentSetId': 44,
          'metaExperimentId': 2630,
          'sortOrder': 26300
        },
        {
          'experimentSetId': 44,
          'metaExperimentId': 2640,
          'sortOrder': 26400
        },
        {
          'experimentSetId': 44,
          'metaExperimentId': 2650,
          'sortOrder': 26500
        },
        {
          'experimentSetId': 45,
          'metaExperimentId': 2660,
          'sortOrder': 26600
        },
        {
          'experimentSetId': 45,
          'metaExperimentId': 2670,
          'sortOrder': 26700
        },
        {
          'experimentSetId': 45,
          'metaExperimentId': 2680,
          'sortOrder': 26800
        },
        {
          'experimentSetId': 46,
          'metaExperimentId': 2690,
          'sortOrder': 26900
        },
        {
          'experimentSetId': 46,
          'metaExperimentId': 2700,
          'sortOrder': 27000
        },
        {
          'experimentSetId': 46,
          'metaExperimentId': 2710,
          'sortOrder': 27100
        },
        {
          'experimentSetId': 47,
          'metaExperimentId': 2720,
          'sortOrder': 27200
        },
        {
          'experimentSetId': 47,
          'metaExperimentId': 2730,
          'sortOrder': 27300
        },
        {
          'experimentSetId': 47,
          'metaExperimentId': 2740,
          'sortOrder': 27400
        },
        {
          'experimentSetId': 48,
          'metaExperimentId': 2800,
          'sortOrder': 28000
        },
        {
          'experimentSetId': 49,
          'metaExperimentId': 2810,
          'sortOrder': 28100
        },
        {
          'experimentSetId': 50,
          'metaExperimentId': 2820,
          'sortOrder': 28200
        }
      ],
      'serviceCategories': [
        {
          'serviceCategoryId': 1,
          'label': 'ceshi',
          'sortOrder': 1,
          'parentId': 0,
          'experimentSetId': 0,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'NoNeed',
          'available': 1
        },
        {
          'serviceCategoryId': 2,
          'label': 'ceshi',
          'sortOrder': 2,
          'parentId': 0,
          'experimentSetId': 0,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'NoNeed',
          'available': 1
        },
        {
          'serviceCategoryId': 3,
          'label': 'ceshi',
          'sortOrder': 3,
          'parentId': 0,
          'experimentSetId': 0,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'NoNeed',
          'available': 1
        },
        {
          'serviceCategoryId': 4,
          'label': 'ceshi',
          'sortOrder': 4,
          'parentId': 0,
          'experimentSetId': 0,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'NoNeed',
          'available': 1
        },
        {
          'serviceCategoryId': 5,
          'label': 'ceshi',
          'sortOrder': 5,
          'parentId': 0,
          'experimentSetId': 0,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'NoNeed',
          'available': 1
        },
        {
          'serviceCategoryId': 6,
          'label': 'ceshi',
          'sortOrder': 6,
          'parentId': 0,
          'experimentSetId': 0,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'NoNeed',
          'available': 1
        },
        {
          'serviceCategoryId': 7,
          'label': 'ceshi',
          'sortOrder': 7,
          'parentId': 0,
          'experimentSetId': 0,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'NoNeed',
          'available': 1
        },
        {
          'serviceCategoryId': 8,
          'label': 'ceshi',
          'sortOrder': 8,
          'parentId': 0,
          'experimentSetId': 0,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'NoNeed',
          'available': 1
        },
        {
          'serviceCategoryId': 9,
          'label': 'ceshi',
          'sortOrder': 9,
          'parentId': 0,
          'experimentSetId': 48,
          'supportBallpark': 0,
          'priceReminder': 1,
          'sfQuoteType': 1,
          'productGuid': '6A54D864-E268-47BD-9385-CE8E9C543022',
          'available': 1
        },
        {
          'serviceCategoryId': 10,
          'label': 'ceshi',
          'sortOrder': 10,
          'parentId': 0,
          'experimentSetId': 49,
          'supportBallpark': 0,
          'priceReminder': 1,
          'sfQuoteType': 1,
          'productGuid': 'F0AB15D2-3D97-4405-805F-21E17CA92515',
          'available': 1
        },
        {
          'serviceCategoryId': 11,
          'label': 'ceshi',
          'sortOrder': 11,
          'parentId': 0,
          'experimentSetId': 50,
          'supportBallpark': 0,
          'priceReminder': 1,
          'sfQuoteType': 2,
          'productGuid': 'BF4FEFBE-1A1C-4C77-97B8-4D3E05B13E2A',
          'available': 1
        },
        {
          'serviceCategoryId': 18,
          'label': 'ceshi',
          'sortOrder': 18,
          'parentId': 8,
          'experimentSetId': 0,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'NoNeed',
          'available': 1
        },
        {
          'serviceCategoryId': 20,
          'label': 'ceshi',
          'sortOrder': 20,
          'parentId': 8,
          'experimentSetId': 0,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'NoNeed',
          'available': 1
        },
        {
          'serviceCategoryId': 28,
          'label': 'ceshi',
          'sortOrder': 28,
          'parentId': 8,
          'experimentSetId': 0,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'NoNeed',
          'available': 1
        },
        {
          'serviceCategoryId': 30,
          'label': 'ceshi',
          'sortOrder': 30,
          'parentId': 8,
          'experimentSetId': 0,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'NoNeed',
          'available': 1
        },
        {
          'serviceCategoryId': 100,
          'label': 'ceshi',
          'sortOrder': 100,
          'parentId': 1,
          'experimentSetId': 4,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'A3E30364-58F7-47D8-A4C1-BFF193ADBEFB',
          'available': 1
        },
        {
          'serviceCategoryId': 200,
          'label': 'ceshi',
          'sortOrder': 200,
          'parentId': 1,
          'experimentSetId': 0,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'NoNeed',
          'available': 1
        },
        {
          'serviceCategoryId': 205,
          'label': 'ceshi',
          'sortOrder': 205,
          'parentId': 200,
          'experimentSetId': 10,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '05058B89-7CD1-43EC-B3EC-D32A3D2B6E5F',
          'available': 1
        },
        {
          'serviceCategoryId': 210,
          'label': 'ceshi',
          'sortOrder': 210,
          'parentId': 200,
          'experimentSetId': 10,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '33C0E8E2-681E-41F2-B488-D0308B2255C7',
          'available': 1
        },
        {
          'serviceCategoryId': 215,
          'label': 'ceshi',
          'sortOrder': 215,
          'parentId': 200,
          'experimentSetId': 11,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '1C1557BE-C6C5-4015-AEC9-33931432CC13',
          'available': 1
        },
        {
          'serviceCategoryId': 225,
          'label': 'ceshi',
          'sortOrder': 225,
          'parentId': 200,
          'experimentSetId': 11,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '77C7D4E3-4BF0-4F8A-AD58-F7373FBF9335',
          'available': 1
        },
        {
          'serviceCategoryId': 230,
          'label': 'ceshi',
          'sortOrder': 230,
          'parentId': 200,
          'experimentSetId': 11,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '65CD0C21-5EEA-4F22-A7C8-9B4A17CCDD26',
          'available': 1
        },
        {
          'serviceCategoryId': 300,
          'label': 'ceshi',
          'sortOrder': 300,
          'parentId': 1,
          'experimentSetId': 9,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '22065B7C-1063-4542-9753-50A55638EC87',
          'available': 1
        },
        {
          'serviceCategoryId': 400,
          'label': 'ceshi',
          'sortOrder': 400,
          'parentId': 1,
          'experimentSetId': 0,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'NoNeed',
          'available': 1
        },
        {
          'serviceCategoryId': 405,
          'label': 'ceshi',
          'sortOrder': 405,
          'parentId': 400,
          'experimentSetId': 5,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '45956FD8-BDC9-4A1C-9998-5DD8EC1A3E30',
          'available': 1
        },
        {
          'serviceCategoryId': 410,
          'label': 'ceshi',
          'sortOrder': 410,
          'parentId': 400,
          'experimentSetId': 32,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '45956FD8-BDC9-4A1C-9998-5DD8EC1A3E30',
          'available': 1
        },
        {
          'serviceCategoryId': 420,
          'label': 'ceshi',
          'sortOrder': 420,
          'parentId': 400,
          'experimentSetId': 5,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'BAC62FE8-5E53-4454-9FFA-1063EFFE004E',
          'available': 1
        },
        {
          'serviceCategoryId': 425,
          'label': 'ceshi',
          'sortOrder': 425,
          'parentId': 400,
          'experimentSetId': 32,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'BAC62FE8-5E53-4454-9FFA-1063EFFE004E',
          'available': 1
        },
        {
          'serviceCategoryId': 430,
          'label': 'ceshi',
          'sortOrder': 430,
          'parentId': 400,
          'experimentSetId': 7,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'CEFEC0B8-6E6A-4FED-8E37-D26953FF5D2F',
          'available': 1
        },
        {
          'serviceCategoryId': 435,
          'label': 'ceshi',
          'sortOrder': 435,
          'parentId': 400,
          'experimentSetId': 6,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'E74880D8-EA59-4B75-A1EB-49A71BF7362F',
          'available': 1
        },
        {
          'serviceCategoryId': 436,
          'label': 'ceshi',
          'sortOrder': 436,
          'parentId': 400,
          'experimentSetId': 6,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '51D36AB7-42C8-4A4B-8E4B-04379C97DFAE',
          'available': 1
        },
        {
          'serviceCategoryId': 437,
          'label': 'ceshi',
          'sortOrder': 437,
          'parentId': 400,
          'experimentSetId': 6,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '92CB355C-F403-4CF1-A518-4B754FDB2A28',
          'available': 1
        },
        {
          'serviceCategoryId': 439,
          'label': 'ceshi',
          'sortOrder': 439,
          'parentId': 400,
          'experimentSetId': 40,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '2A7746E5-420A-482F-8E43-BDC0A36B7109',
          'available': 1
        },
        {
          'serviceCategoryId': 460,
          'label': 'ceshi',
          'sortOrder': 460,
          'parentId': 1,
          'experimentSetId': 0,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'NoNeed',
          'available': 1
        },
        {
          'serviceCategoryId': 463,
          'label': 'ceshi',
          'sortOrder': 463,
          'parentId': 460,
          'experimentSetId': 41,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '09155DE5-77F7-4A75-A930-7A4DEE18A3B7',
          'available': 1
        },
        {
          'serviceCategoryId': 466,
          'label': 'ceshi',
          'sortOrder': 466,
          'parentId': 460,
          'experimentSetId': 42,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'E4CC3C80-FC17-4463-A1C4-52FB0DF8D1D0',
          'available': 1
        },
        {
          'serviceCategoryId': 469,
          'label': 'ceshi',
          'sortOrder': 469,
          'parentId': 460,
          'experimentSetId': 43,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '6F129E02-AC08-46DD-A45F-79A32403B078',
          'available': 1
        },
        {
          'serviceCategoryId': 472,
          'label': 'ceshi',
          'sortOrder': 472,
          'parentId': 460,
          'experimentSetId': 44,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'F8AC6556-61A8-4A62-9160-344C34548246',
          'available': 1
        },
        {
          'serviceCategoryId': 475,
          'label': 'ceshi',
          'sortOrder': 475,
          'parentId': 460,
          'experimentSetId': 45,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'E0266D33-1E17-4615-914F-7FA04DAB79F1',
          'available': 1
        },
        {
          'serviceCategoryId': 478,
          'label': 'ceshi',
          'sortOrder': 478,
          'parentId': 460,
          'experimentSetId': 46,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '82A2BF03-DFF8-4E31-804C-9CB3D2032DE2',
          'available': 1
        },
        {
          'serviceCategoryId': 481,
          'label': 'ceshi',
          'sortOrder': 481,
          'parentId': 460,
          'experimentSetId': 47,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'B649FB96-81C4-4623-B8E6-7EAD9B22B330',
          'available': 1
        },
        {
          'serviceCategoryId': 500,
          'label': 'ceshi',
          'sortOrder': 500,
          'parentId': 1,
          'experimentSetId': 8,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '49DD386D-9329-4E4B-9E66-B3E03FAE7C1D',
          'available': 1
        },
        {
          'serviceCategoryId': 600,
          'label': 'ceshi',
          'sortOrder': 600,
          'parentId': 1,
          'experimentSetId': 0,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'NoNeed',
          'available': 1
        },
        {
          'serviceCategoryId': 605,
          'label': 'ceshiBS',
          'sortOrder': 605,
          'parentId': 600,
          'experimentSetId': 12,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '95CFDE64-125F-4A9E-919F-6733BAC32442',
          'available': 1
        },
        {
          'serviceCategoryId': 610,
          'label': 'ceshiBS',
          'sortOrder': 610,
          'parentId': 600,
          'experimentSetId': 13,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '97291A0B-3797-4DFD-865A-104D62D7B921',
          'available': 1
        },
        {
          'serviceCategoryId': 700,
          'label': 'ceshincer panel',
          'sortOrder': 700,
          'parentId': 1,
          'experimentSetId': 16,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '8655C91B-A079-4E9A-B895-E67CFA8F6AD1',
          'available': 1
        },
        {
          'serviceCategoryId': 800,
          'label': 'ceshi化测序S）',
          'sortOrder': 800,
          'parentId': 2,
          'experimentSetId': 0,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'NoNeed',
          'available': 1
        },
        {
          'serviceCategoryId': 805,
          'label': 'ceshiAS',
          'sortOrder': 805,
          'parentId': 800,
          'experimentSetId': 14,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'D3AEE109-DAF3-40B4-92CC-86E62517F8B9',
          'available': 1
        },
        {
          'serviceCategoryId': 900,
          'label': 'ceshi',
          'sortOrder': 900,
          'parentId': 2,
          'experimentSetId': 17,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '205CE372-0E58-4D50-8086-EF8A90C0D920',
          'available': 1
        },
        {
          'serviceCategoryId': 1000,
          'label': 'ceshi芯片',
          'sortOrder': 1000,
          'parentId': 2,
          'experimentSetId': 18,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'E5085A57-01B5-453C-8E2E-630AAE4C3BEE',
          'available': 1
        },
        {
          'serviceCategoryId': 1100,
          'label': 'ceshi',
          'sortOrder': 1100,
          'parentId': 2,
          'experimentSetId': 23,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'BD40593D-7862-42E6-9121-150172D6983B',
          'available': 1
        },
        {
          'serviceCategoryId': 1200,
          'label': 'ceshi',
          'sortOrder': 1200,
          'parentId': 2,
          'experimentSetId': 1,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '7117e8a5-5dbc-4881-b8d1-89707d00c31d',
          'available': 1
        },
        {
          'serviceCategoryId': 1300,
          'label': 'ceshi',
          'sortOrder': 1300,
          'parentId': 2,
          'experimentSetId': 1,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '7117e8a5-5dbc-4881-b8d1-89707d00c31d',
          'available': 1
        },
        {
          'serviceCategoryId': 1400,
          'label': 'ceshi',
          'sortOrder': 1400,
          'parentId': 2,
          'experimentSetId': 1,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '7117e8a5-5dbc-4881-b8d1-89707d00c31d',
          'available': 1
        },
        {
          'serviceCategoryId': 1500,
          'label': 'ceshi',
          'sortOrder': 1500,
          'parentId': 3,
          'experimentSetId': 1,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '7117e8a5-5dbc-4881-b8d1-89707d00c31d',
          'available': 1
        },
        {
          'serviceCategoryId': 1600,
          'label': 'ceshis9 KI',
          'sortOrder': 1600,
          'parentId': 3,
          'experimentSetId': 22,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'BCE3BA83-706E-41C7-890D-E3B2033FA022',
          'available': 1
        },
        {
          'serviceCategoryId': 1650,
          'label': 'ceshis9 KO',
          'sortOrder': 1650,
          'parentId': 3,
          'experimentSetId': 19,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '1C47E0F9-6E44-41C5-9B70-B0A561B9BF8F',
          'available': 1
        },
        {
          'serviceCategoryId': 1700,
          'label': 'ceshi学-',
          'sortOrder': 1700,
          'parentId': 3,
          'experimentSetId': 3,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '7C4B5423-5BF3-4222-844B-7DB97828779E',
          'available': 1
        },
        {
          'serviceCategoryId': 1800,
          'label': 'ceshi-',
          'sortOrder': 1800,
          'parentId': 3,
          'experimentSetId': 24,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '2BD5C750-07F0-41BB-AB67-3D80EADB8C46',
          'available': 1
        },
        {
          'serviceCategoryId': 1900,
          'label': 'ceshi成瘤',
          'sortOrder': 1900,
          'parentId': 4,
          'experimentSetId': 15,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '33316ad6-d4c2-4b2e-9d0c-7047fab7ec8d',
          'available': 1
        },
        {
          'serviceCategoryId': 2000,
          'label': 'ceshi鼠',
          'sortOrder': 2000,
          'parentId': 4,
          'experimentSetId': 0,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'NoNeed',
          'available': 1
        },
        {
          'serviceCategoryId': 2005,
          'label': 'ceshi育',
          'sortOrder': 2005,
          'parentId': 2000,
          'experimentSetId': 26,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '2409C245-842F-4E68-ABBB-E189E5C03A43',
          'available': 1
        },
        {
          'serviceCategoryId': 2030,
          'label': 'ceshi建-',
          'sortOrder': 2030,
          'parentId': 2000,
          'experimentSetId': 27,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'F774D1E9-004C-447B-B7DA-EAAF7DB92103',
          'available': 1
        },
        {
          'serviceCategoryId': 2032,
          'label': 'ceshi建-',
          'sortOrder': 2032,
          'parentId': 2000,
          'experimentSetId': 27,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'DCDD090F-5013-4E15-843D-0881F1208251',
          'available': 1
        },
        {
          'serviceCategoryId': 2034,
          'label': 'ceshi建-条件型敲除',
          'sortOrder': 2034,
          'parentId': 2000,
          'experimentSetId': 27,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '3C127BD6-8E87-4B0E-814B-EB769F2A9793',
          'available': 1
        },
        {
          'serviceCategoryId': 2036,
          'label': 'ceshi建-组成型敲入',
          'sortOrder': 2036,
          'parentId': 2000,
          'experimentSetId': 27,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '6CFB9B99-A35C-4772-B720-B4DCFFF05861',
          'available': 1
        },
        {
          'serviceCategoryId': 2038,
          'label': 'ceshi建-条件型敲入',
          'sortOrder': 2038,
          'parentId': 2000,
          'experimentSetId': 27,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '26408726-DD0D-4347-BFD4-BE54B436AFC9',
          'available': 1
        },
        {
          'serviceCategoryId': 2050,
          'label': 'ceshi苏',
          'sortOrder': 2050,
          'parentId': 2000,
          'experimentSetId': 28,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'BDED6678-1126-4C77-B05F-EEA244987298',
          'available': 1
        },
        {
          'serviceCategoryId': 2060,
          'label': 'ceshi货',
          'sortOrder': 2060,
          'parentId': 2000,
          'experimentSetId': 29,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '1545A0E5-40E5-4B8F-A1F2-3A732D17E23C',
          'available': 1
        },
        {
          'serviceCategoryId': 2100,
          'label': 'ceshis9综合',
          'sortOrder': 2100,
          'parentId': 5,
          'experimentSetId': 20,
          'supportBallpark': 1,
          'priceReminder': 2,
          'sfQuoteType': 0,
          'productGuid': '960853DF-384F-4B1C-A8B9-856438210030',
          'available': 1
        },
        {
          'serviceCategoryId': 2200,
          'label': 'ceshi筛靶',
          'sortOrder': 2200,
          'parentId': 5,
          'experimentSetId': 2,
          'supportBallpark': 1,
          'priceReminder': 3,
          'sfQuoteType': 0,
          'productGuid': 'B0039A1D-9820-4DB4-97C3-7F9F60EC66EA',
          'available': 1
        },
        {
          'serviceCategoryId': 2400,
          'label': 'ceshi',
          'sortOrder': 2400,
          'parentId': 6,
          'experimentSetId': 21,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'FEF5988B-CC0E-4089-B077-BCC4FB33345B',
          'available': 1
        },
        {
          'serviceCategoryId': 2500,
          'label': 'ceshi',
          'sortOrder': 2500,
          'parentId': 7,
          'experimentSetId': 400,
          'supportBallpark': 1,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'A7ED1403-83FF-4854-8ACC-542CB275D896',
          'available': 1
        },
        {
          'serviceCategoryId': 2600,
          'label': 'ceshiS',
          'sortOrder': 2600,
          'parentId': 8,
          'experimentSetId': 25,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '3df171ef-afd7-4b37-89ff-fa4fa03302d8',
          'available': 1
        },
        {
          'serviceCategoryId': 2710,
          'label': 'ceshinecard I',
          'sortOrder': 2710,
          'parentId': 18,
          'experimentSetId': 33,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '8554CEF4-9B21-4BCB-A52F-29B325E307D8',
          'available': 1
        },
        {
          'serviceCategoryId': 2712,
          'label': 'ceshinecard II',
          'sortOrder': 2712,
          'parentId': 18,
          'experimentSetId': 34,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '755938AD-CC2A-4DE5-963E-E6F806ADD505',
          'available': 1
        },
        {
          'serviceCategoryId': 2714,
          'label': 'ceshinecard III',
          'sortOrder': 2714,
          'parentId': 18,
          'experimentSetId': 35,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'FFAFD191-7207-49A8-BBE2-93A53004347E',
          'available': 1
        },
        {
          'serviceCategoryId': 2716,
          'label': 'ceshinecard IV',
          'sortOrder': 2716,
          'parentId': 18,
          'experimentSetId': 36,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '3F452EFE-7300-4C3D-8EAD-53F1A141DDA3',
          'available': 1
        },
        {
          'serviceCategoryId': 2718,
          'label': 'ceshinecard V',
          'sortOrder': 2718,
          'parentId': 18,
          'experimentSetId': 37,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '7E89B85E-D2A0-4606-9D7C-D07D9B6659A6',
          'available': 1
        },
        {
          'serviceCategoryId': 2720,
          'label': 'ceshinecard VI',
          'sortOrder': 2720,
          'parentId': 18,
          'experimentSetId': 38,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '073B2BAB-7C86-44C9-A782-560E5BC0876C',
          'available': 1
        },
        {
          'serviceCategoryId': 2722,
          'label': 'ceshinecard VII',
          'sortOrder': 2722,
          'parentId': 18,
          'experimentSetId': 39,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'B9B18157-B5BD-434E-B92A-50CB5C2C92E4',
          'available': 1
        },
        {
          'serviceCategoryId': 2724,
          'label': 'ceshinecard VIII',
          'sortOrder': 2724,
          'parentId': 18,
          'experimentSetId': 31,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'AEF8D9A5-E6A0-4F5B-ADE6-92E110280DA3',
          'available': 1
        },
        {
          'serviceCategoryId': 2740,
          'label': 'ceshi方向 Genecard I',
          'sortOrder': 2740,
          'parentId': 20,
          'experimentSetId': 400,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '04D65969-78B2-41CE-945D-7C04C650A4F8',
          'available': 1
        },
        {
          'serviceCategoryId': 2742,
          'label': 'ceshi方向 Genecard V',
          'sortOrder': 2742,
          'parentId': 20,
          'experimentSetId': 400,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '12EEAB1C-7C35-4799-8B67-AE2FE1F981C4',
          'available': 1
        },
        {
          'serviceCategoryId': 2744,
          'label': 'ceshi&转移方向 Genecard I',
          'sortOrder': 2744,
          'parentId': 20,
          'experimentSetId': 400,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'F18AEF67-F190-4649-B312-0307A5AF584D',
          'available': 1
        },
        {
          'serviceCategoryId': 2746,
          'label': 'ceshi&转移方向 Genecard V',
          'sortOrder': 2746,
          'parentId': 20,
          'experimentSetId': 400,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '06BFF3F4-2D3D-4103-B9F5-0A9977C55521',
          'available': 1
        },
        {
          'serviceCategoryId': 2910,
          'label': 'ceshinecard Plus I',
          'sortOrder': 2910,
          'parentId': 28,
          'experimentSetId': 400,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'AB0EB044-D950-4809-97B7-41678FCBB442',
          'available': 1
        },
        {
          'serviceCategoryId': 2912,
          'label': 'ceshinecard Plus II',
          'sortOrder': 2912,
          'parentId': 28,
          'experimentSetId': 400,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '5E7EBFC6-4DFC-4687-B38A-EAE00B0ACC34',
          'available': 1
        },
        {
          'serviceCategoryId': 2914,
          'label': 'ceshinecard Plus III',
          'sortOrder': 2914,
          'parentId': 28,
          'experimentSetId': 400,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '9E32168E-97D3-484F-BAC7-FE524143B40B',
          'available': 1
        },
        {
          'serviceCategoryId': 2916,
          'label': 'ceshinecard Plus IV',
          'sortOrder': 2916,
          'parentId': 28,
          'experimentSetId': 400,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'C309B26F-514E-4141-A44F-12559D1846DD',
          'available': 1
        },
        {
          'serviceCategoryId': 2918,
          'label': 'ceshinecard Plus V',
          'sortOrder': 2918,
          'parentId': 28,
          'experimentSetId': 400,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '11B58F9E-550A-4C6F-85AD-7F2727D47E7E',
          'available': 1
        },
        {
          'serviceCategoryId': 2920,
          'label': 'ceshinecard Plus VI',
          'sortOrder': 2920,
          'parentId': 28,
          'experimentSetId': 400,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '66E8851B-DAA7-41B7-8AA5-DCF16482613A',
          'available': 1
        },
        {
          'serviceCategoryId': 2922,
          'label': 'ceshinecard Plus VII',
          'sortOrder': 2922,
          'parentId': 28,
          'experimentSetId': 400,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'EEBD62DD-E3D9-460B-B9F7-5F3A8EB01C9A',
          'available': 1
        },
        {
          'serviceCategoryId': 2940,
          'label': 'ceshi&增殖Genecard I Plus',
          'sortOrder': 2940,
          'parentId': 30,
          'experimentSetId': 400,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'AB0EB044-D950-4809-97B7-41678FCBB442',
          'available': 1
        },
        {
          'serviceCategoryId': 2942,
          'label': 'ceshi&增殖Genecard V Plus',
          'sortOrder': 2942,
          'parentId': 30,
          'experimentSetId': 400,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '11B58F9E-550A-4C6F-85AD-7F2727D47E7E',
          'available': 1
        },
        {
          'serviceCategoryId': 3000,
          'label': 'ceshital solution I',
          'sortOrder': 3000,
          'parentId': 8,
          'experimentSetId': 400,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '8A9AD8AA-AEEA-4192-899F-0FE4B81A3D4A',
          'available': 1
        },
        {
          'serviceCategoryId': 3100,
          'label': 'ceshital solution II',
          'sortOrder': 3100,
          'parentId': 8,
          'experimentSetId': 400,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'F8EA17B5-60CA-409C-8B89-379542ACA09F',
          'available': 1
        },
        {
          'serviceCategoryId': 3200,
          'label': 'ceshirsonal solution I或II',
          'sortOrder': 3200,
          'parentId': 8,
          'experimentSetId': 400,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '25C450FC-B78E-4010-8825-A10A5F07E5D7',
          'available': 1
        },
        {
          'serviceCategoryId': 3300,
          'label': 'ceshi大综合I或II',
          'sortOrder': 3300,
          'parentId': 8,
          'experimentSetId': 400,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '56C8313F-E5E4-4E27-9B8D-85A5407E3C5E',
          'available': 1
        },
        {
          'serviceCategoryId': 3400,
          'label': 'ceshi因组Cas9筛选',
          'sortOrder': 3400,
          'parentId': 8,
          'experimentSetId': 400,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': 'C3DF7D1A-DAF4-436B-9578-5E12D93034D2',
          'available': 1
        },
        {
          'serviceCategoryId': 3500,
          'label': 'ceshi实验',
          'sortOrder': 3500,
          'parentId': 8,
          'experimentSetId': 400,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '2BECF339-20D0-4D07-B3F0-A62B7BFAA6C8',
          'available': 1
        },
        {
          'serviceCategoryId': 3600,
          'label': 'ceshi基因分析',
          'sortOrder': 3600,
          'parentId': 8,
          'experimentSetId': 400,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '28AF708B-E0ED-4C2A-9335-4497801B13C9',
          'available': 1
        },
        {
          'serviceCategoryId': 3700,
          'label': 'ceshiRT综合服务',
          'sortOrder': 3700,
          'parentId': 8,
          'experimentSetId': 400,
          'supportBallpark': 0,
          'priceReminder': 0,
          'sfQuoteType': 0,
          'productGuid': '42B4A5B2-4DD3-438D-838B-5C9AF0CF8FEB',
          'available': 1
        }
      ],
      'metaParameters': [
        {
          'metaParameterTypeId': 1,
          'metaParameterName': 'test/样本',
          'sortOrder': 20
        },
        {
          'metaParameterTypeId': 2,
          'metaParameterName': 'test',
          'sortOrder': 60
        },
        {
          'metaParameterTypeId': 3,
          'metaParameterName': 'test）',
          'sortOrder': 90
        },
        {
          'metaParameterTypeId': 4,
          'metaParameterName': 'test',
          'sortOrder': 130
        },
        {
          'metaParameterTypeId': 5,
          'metaParameterName': 'test/质粒',
          'sortOrder': 120
        },
        {
          'metaParameterTypeId': 6,
          'metaParameterName': 'test时间点',
          'sortOrder': 160
        },
        {
          'metaParameterTypeId': 7,
          'metaParameterName': 'test',
          'sortOrder': 140
        },
        {
          'metaParameterTypeId': 8,
          'metaParameterName': 'test处理',
          'sortOrder': 50
        },
        {
          'metaParameterTypeId': 9,
          'metaParameterName': 'test',
          'sortOrder': 150
        },
        {
          'metaParameterTypeId': 10,
          'metaParameterName': 'test',
          'sortOrder': 170
        },
        {
          'metaParameterTypeId': 11,
          'metaParameterName': 'test',
          'sortOrder': 180
        },
        {
          'metaParameterTypeId': 12,
          'metaParameterName': 'test',
          'sortOrder': 5000
        },
        {
          'metaParameterTypeId': 13,
          'metaParameterName': 'test',
          'sortOrder': 200
        },
        {
          'metaParameterTypeId': 15,
          'metaParameterName': 'test',
          'sortOrder': 10
        },
        {
          'metaParameterTypeId': 16,
          'metaParameterName': 'test',
          'sortOrder': 210
        },
        {
          'metaParameterTypeId': 17,
          'metaParameterName': 'test信息序）',
          'sortOrder': 80
        },
        {
          'metaParameterTypeId': 18,
          'metaParameterName': 'test样本片断数',
          'sortOrder': 40
        },
        {
          'metaParameterTypeId': 19,
          'metaParameterName': 'test类型',
          'sortOrder': 220
        },
        {
          'metaParameterTypeId': 20,
          'metaParameterName': 'test模型',
          'sortOrder': 230
        },
        {
          'metaParameterTypeId': 21,
          'metaParameterName': 'test',
          'sortOrder': 240
        },
        {
          'metaParameterTypeId': 22,
          'metaParameterName': 'test',
          'sortOrder': 250
        },
        {
          'metaParameterTypeId': 23,
          'metaParameterName': 'test给药信息',
          'sortOrder': 260
        },
        {
          'metaParameterTypeId': 24,
          'metaParameterName': 'test成像信息',
          'sortOrder': 270
        },
        {
          'metaParameterTypeId': 25,
          'metaParameterName': 'test',
          'sortOrder': 280
        },
        {
          'metaParameterTypeId': 26,
          'metaParameterName': 'test）',
          'sortOrder': 100
        },
        {
          'metaParameterTypeId': 27,
          'metaParameterName': 'test',
          'sortOrder': 110
        },
        {
          'metaParameterTypeId': 28,
          'metaParameterName': 'test',
          'sortOrder': 68
        },
        {
          'metaParameterTypeId': 29,
          'metaParameterName': 'test',
          'sortOrder': 30
        },
        {
          'metaParameterTypeId': 30,
          'metaParameterName': 'test9 KI）',
          'sortOrder': 72
        },
        {
          'metaParameterTypeId': 31,
          'metaParameterName': 'test盒信息',
          'sortOrder': 290
        },
        {
          'metaParameterTypeId': 32,
          'metaParameterName': 'test提供试剂信息',
          'sortOrder': 300
        },
        {
          'metaParameterTypeId': 33,
          'metaParameterName': 'test盒信息NA）',
          'sortOrder': 310
        },
        {
          'metaParameterTypeId': 34,
          'metaParameterName': 'test提供试剂信息 (miRNA)',
          'sortOrder': 320
        },
        {
          'metaParameterTypeId': 35,
          'metaParameterName': 'test信息）',
          'sortOrder': 330
        },
        {
          'metaParameterTypeId': 36,
          'metaParameterName': 'test信息',
          'sortOrder': 340
        },
        {
          'metaParameterTypeId': 37,
          'metaParameterName': 'test信息',
          'sortOrder': 350
        },
        {
          'metaParameterTypeId': 38,
          'metaParameterName': 'test息',
          'sortOrder': 360
        },
        {
          'metaParameterTypeId': 39,
          'metaParameterName': 'test计划',
          'sortOrder': 370
        },
        {
          'metaParameterTypeId': 40,
          'metaParameterName': 'test信息）',
          'sortOrder': 380
        },
        {
          'metaParameterTypeId': 41,
          'metaParameterName': 'test信息',
          'sortOrder': 390
        },
        {
          'metaParameterTypeId': 42,
          'metaParameterName': 'test信息',
          'sortOrder': 400
        },
        {
          'metaParameterTypeId': 43,
          'metaParameterName': 'test信息',
          'sortOrder': 410
        },
        {
          'metaParameterTypeId': 44,
          'metaParameterName': 'testnecard流水号',
          'sortOrder': 420
        },
        {
          'metaParameterTypeId': 45,
          'metaParameterName': 'test领域',
          'sortOrder': 430
        },
        {
          'metaParameterTypeId': 46,
          'metaParameterName': 'test',
          'sortOrder': 440
        },
        {
          'metaParameterTypeId': 47,
          'metaParameterName': 'test列表）',
          'sortOrder': 331
        },
        {
          'metaParameterTypeId': 48,
          'metaParameterName': 'test）',
          'sortOrder': 152
        },
        {
          'metaParameterTypeId': 49,
          'metaParameterName': 'test株细胞发货',
          'sortOrder': 450
        },
        {
          'metaParameterTypeId': 50,
          'metaParameterName': 'test类型',
          'sortOrder': 460
        },
        {
          'metaParameterTypeId': 51,
          'metaParameterName': 'test分析套系',
          'sortOrder': 470
        },
        {
          'metaParameterTypeId': 52,
          'metaParameterName': 'test物种',
          'sortOrder': 480
        },
        {
          'metaParameterTypeId': 53,
          'metaParameterName': 'test验证基因数',
          'sortOrder': 490
        },
        {
          'metaParameterTypeId': 54,
          'metaParameterName': 'testS9',
          'sortOrder': 490
        },
        {
          'metaParameterTypeId': 55,
          'metaParameterName': 'test分组',
          'sortOrder': 175
        },
        {
          'metaParameterTypeId': 56,
          'metaParameterName': 'test级数',
          'sortOrder': 500
        },
        {
          'metaParameterTypeId': 57,
          'metaParameterName': 'test物质信息',
          'sortOrder': 510
        },
        {
          'metaParameterTypeId': 58,
          'metaParameterName': 'test上传',
          'sortOrder': 520
        },
        {
          'metaParameterTypeId': 59,
          'metaParameterName': 'test耗材',
          'sortOrder': 530
        }
      ]
    }
  } else if (method.indexOf('retrieveServiceOrders') > -1) {
    return {
      'amount': 6747,
      'serviceOrders': [
        {
          'orderNo': '201903181515540000038633',
          'customerName': '卢琛',
          'customerEnterpriseName': '南京市第一医院',
          'regionFatherName': '华东2区',
          'regionName': '华东2区-3',
          'employeeName': '刘海霞',
          'quotePrice': '0',
          'realPrice': '0',
          'status': 1,
          'statusName': '草稿',
          'createDT': '2019-03-18',
          'sfQuoteId': '0Q07F000000Q5CkSAK',
          'payType': -1,
          'merchandiseList': [],
          'id': '38633',
          'customerNo': '00289223'
        },
        {
          'orderNo': '201903181514570000038632',
          'customerName': '贺帅',
          'customerEnterpriseName': '包头医学院',
          'regionFatherName': '主动电销组',
          'employeeName': '李楠',
          'quotePrice': '0',
          'realPrice': '0',
          'status': 1,
          'statusName': '草稿',
          'createDT': '2019-03-18',
          'sfQuoteId': '0Q07F000000Q5MLSA0',
          'payType': -1,
          'merchandiseList': [
            {
              'quoteItemId': 'SV20190318065754',
              'status': 1,
              'ballparkPrice': '30810.00',
              'formalPrice': '',
              'settledPrice': '',
              'createTime': '2019-03-18 15:15:19',
              'updateTime': '2019-03-18 15:16:05',
              'contractNosInERP': '',
              'nextExperimentId': 101,
              'statusNameOfM': '输入',
              'serviceCategoryName': '芯片服务',
              'serviceMerchandiseGUID': '3c37304a-7859-4ba0-9939-a062a5b653d5',
              'orderId': '38632',
              'serviceCategoryId': 100,
              'version': 3
            }
          ],
          'id': '38632',
          'customerNo': '00218827'
        },
        {
          'orderNo': '201903181444460000038623',
          'customerName': '叶华',
          'customerEnterpriseName': '郑州大学',
          'regionFatherName': '华东2区',
          'regionName': '华东2区-2',
          'employeeName': '张东',
          'quotePrice': '0',
          'realPrice': '0',
          'status': 1,
          'statusName': '草稿',
          'createDT': '2019-03-18',
          'sfQuoteId': '0Q07F000000Q5LXSA0',
          'payType': -1,
          'merchandiseList': [
            {
              'quoteItemId': 'SV20190318065730',
              'status': 5,
              'ballparkPrice': '',
              'formalPrice': '7967.00',
              'duration': 20,
              'floorPriceFlag': 1,
              'settledPrice': '',
              'createTime': '2019-03-18 14:44:56',
              'updateTime': '2019-03-18 15:12:13',
              'contractNosInERP': '',
              'nextExperimentId': 101,
              'statusNameOfM': '报价完成',
              'serviceCategoryName': '其他试剂',
              'serviceMerchandiseGUID': '9e1d2bc9-47f8-4990-8244-0c38ad2b1f53',
              'orderId': '38623',
              'serviceCategoryId': 10,
              'version': 4
            }
          ],
          'id': '38623',
          'customerNo': '00183489'
        },
        {
          'orderNo': '201903181438140000038621',
          'customerName': '张莉',
          'customerEnterpriseName': '华中科技大学同济医学院附属同济医院',
          'regionFatherName': '华南区',
          'regionName': '华南区-1',
          'employeeName': '王进',
          'quotePrice': '0',
          'realPrice': '0',
          'status': 1,
          'statusName': '草稿',
          'createDT': '2019-03-18',
          'sfQuoteId': '0Q07F000000Q5LSSA0',
          'payType': -1,
          'merchandiseList': [
            {
              'quoteItemId': 'SV20190318065725',
              'status': 5,
              'ballparkPrice': '',
              'formalPrice': '778.00',
              'duration': 10,
              'floorPriceFlag': 1,
              'settledPrice': '',
              'createTime': '2019-03-18 14:39:38',
              'updateTime': '2019-03-18 15:03:02',
              'contractNosInERP': '',
              'nextExperimentId': 101,
              'statusNameOfM': '报价完成',
              'serviceCategoryName': '其他试剂',
              'serviceMerchandiseGUID': 'a08679c3-92f6-4dff-9280-3771cb999aa3',
              'orderId': '38621',
              'serviceCategoryId': 10,
              'version': 5
            }
          ],
          'id': '38621',
          'customerNo': '00047352'
        },
        {
          'orderNo': '201903181435430000038619',
          'customerName': '谭风波',
          'customerEnterpriseName': '中南大学湘雅医院',
          'regionFatherName': '华中南区',
          'regionName': '华中南区-5',
          'employeeName': '李冰',
          'quotePrice': '0',
          'realPrice': '0',
          'status': 1,
          'statusName': '草稿',
          'createDT': '2019-03-18',
          'sfQuoteId': '0Q07F000000Q5LNSA0',
          'payType': -1,
          'merchandiseList': [
            {
              'quoteItemId': 'SV20190318065734',
              'status': 3,
              'ballparkPrice': '',
              'formalPrice': '19780.00',
              'duration': 35,
              'floorPriceFlag': 0,
              'settledPrice': '',
              'createTime': '2019-03-18 14:49:06',
              'updateTime': '2019-03-18 15:23:36',
              'contractNosInERP': '',
              'nextExperimentId': 101,
              'statusNameOfM': '待技术审核',
              'serviceCategoryName': '细胞学服务（qPCR, WB, WES）',
              'serviceMerchandiseGUID': 'a9048d0b-2745-4904-b483-766aa3466e6f',
              'orderId': '38619',
              'serviceCategoryId': 1200,
              'version': 4
            },
            {
              'quoteItemId': 'SV20190318065729',
              'status': 3,
              'ballparkPrice': '',
              'formalPrice': '2250.00',
              'duration': 17,
              'floorPriceFlag': 0,
              'settledPrice': '',
              'createTime': '2019-03-18 14:44:51',
              'updateTime': '2019-03-18 15:22:15',
              'contractNosInERP': '',
              'nextExperimentId': 101,
              'statusNameOfM': '待技术审核',
              'serviceCategoryName': '细胞学服务（qPCR, WB, WES）',
              'serviceMerchandiseGUID': '839106f9-6977-4b3d-98a2-61482fc4a567',
              'orderId': '38619',
              'serviceCategoryId': 1200,
              'version': 4
            },
            {
              'quoteItemId': 'SV20190318065724',
              'status': 3,
              'ballparkPrice': '',
              'formalPrice': '21315.00',
              'duration': 50,
              'floorPriceFlag': 3,
              'settledPrice': '',
              'createTime': '2019-03-18 14:36:25',
              'updateTime': '2019-03-18 15:21:40',
              'contractNosInERP': '',
              'nextExperimentId': 101,
              'statusNameOfM': '待技术审核',
              'serviceCategoryName': '内源筛靶',
              'serviceMerchandiseGUID': 'e5ba1313-e588-4dd1-a788-374c51d8eb33',
              'orderId': '38619',
              'serviceCategoryId': 2200,
              'version': 5
            }
          ],
          'id': '38619',
          'customerNo': '00057321'
        },
        {
          'orderNo': '201903181434140000038618',
          'customerName': '张明生',
          'customerEnterpriseName': '华中科技大学同济医学院附属同济医院',
          'regionFatherName': '华中南区',
          'regionName': '华中南区-4',
          'employeeName': '邱磊',
          'quotePrice': '0',
          'realPrice': '0',
          'status': 1,
          'statusName': '草稿',
          'createDT': '2019-03-18',
          'sfQuoteId': '0Q07F000000Q5LISA0',
          'payType': -1,
          'merchandiseList': [
            {
              'quoteItemId': 'SV20190318065720',
              'status': 5,
              'ballparkPrice': '',
              'formalPrice': '6039.00',
              'duration': 10,
              'floorPriceFlag': 1,
              'settledPrice': '',
              'createTime': '2019-03-18 14:34:27',
              'updateTime': '2019-03-18 15:02:01',
              'contractNosInERP': '',
              'nextExperimentId': 101,
              'statusNameOfM': '报价完成',
              'serviceCategoryName': '其他试剂',
              'serviceMerchandiseGUID': 'ce336bdd-124d-4bf2-93d5-ba61b9ef53cc',
              'orderId': '38618',
              'serviceCategoryId': 10,
              'version': 4
            }
          ],
          'id': '38618',
          'customerNo': '00001676'
        },
        {
          'orderNo': '201903181423490000038610',
          'customerName': '曹田宇',
          'customerEnterpriseName': '西京消化病医院',
          'regionFatherName': '华东2区',
          'regionName': '华东2区-5',
          'employeeName': '郝艳飞',
          'quotePrice': '0',
          'realPrice': '0',
          'status': 1,
          'statusName': '草稿',
          'createDT': '2019-03-18',
          'sfQuoteId': '0Q07F000000Q5KjSAK',
          'payType': -1,
          'merchandiseList': [
            {
              'quoteItemId': 'SV20190318065711',
              'status': 3,
              'ballparkPrice': '',
              'formalPrice': '',
              'settledPrice': '',
              'createTime': '2019-03-18 14:26:23',
              'updateTime': '2019-03-18 14:57:30',
              'contractNosInERP': '',
              'nextExperimentId': 101,
              'statusNameOfM': '待技术审核',
              'serviceCategoryName': '生信',
              'serviceMerchandiseGUID': 'f72bdadf-33b4-4bfe-8eb9-155b248e30f8',
              'orderId': '38610',
              'serviceCategoryId': 2400,
              'version': 3
            }
          ],
          'id': '38610',
          'customerNo': '00284395'
        },
        {
          'orderNo': '201903181420380000038609',
          'customerName': '耿倩倩',
          'customerEnterpriseName': '西安交通大学',
          'regionFatherName': '华东2区',
          'regionName': '华东2区-5',
          'employeeName': '杨鹏',
          'quotePrice': '0',
          'realPrice': '0',
          'status': 1,
          'statusName': '草稿',
          'createDT': '2019-03-18',
          'sfQuoteId': '0Q07F000000Q5KeSAK',
          'payType': -1,
          'merchandiseList': [
            {
              'quoteItemId': 'SV20190318065706',
              'status': 1,
              'ballparkPrice': '',
              'formalPrice': '',
              'settledPrice': '',
              'createTime': '2019-03-18 14:21:22',
              'updateTime': '2019-03-18 14:21:22',
              'contractNosInERP': '',
              'nextExperimentId': 101,
              'statusNameOfM': '输入',
              'serviceCategoryName': '细胞学服务',
              'serviceMerchandiseGUID': '6e5c11cf-bf6c-44af-9c42-621f31b45cc6',
              'orderId': '38609',
              'serviceCategoryId': 1500,
              'version': 1
            }
          ],
          'id': '38609',
          'customerNo': '00264746'
        },
        {
          'orderNo': '201903181417240000038608',
          'customerName': '张明生',
          'customerEnterpriseName': '华中科技大学同济医学院附属同济医院',
          'regionFatherName': '华中南区',
          'regionName': '华中南区-4',
          'employeeName': '邱磊',
          'quotePrice': '0',
          'realPrice': '0',
          'status': 1,
          'statusName': '草稿',
          'createDT': '2019-03-18',
          'sfQuoteId': '0Q07F000000Q5KUSA0',
          'payType': -1,
          'merchandiseList': [
            {
              'quoteItemId': 'SV20190318065737',
              'status': 3,
              'ballparkPrice': '',
              'formalPrice': '10300.00',
              'duration': 25,
              'floorPriceFlag': 0,
              'settledPrice': '',
              'createTime': '2019-03-18 14:55:55',
              'updateTime': '2019-03-18 15:20:19',
              'contractNosInERP': '',
              'nextExperimentId': 101,
              'statusNameOfM': '待技术审核',
              'serviceCategoryName': '细胞学服务',
              'serviceMerchandiseGUID': 'b50de6ba-4bcf-4020-80b4-4a66143efa5f',
              'orderId': '38608',
              'serviceCategoryId': 1500,
              'version': 4
            }
          ],
          'id': '38608',
          'customerNo': '00001676'
        },
        {
          'orderNo': '201903181407360000038607',
          'customerName': '罗天航',
          'customerEnterpriseName': '上海长海医院',
          'regionFatherName': '华东1区',
          'regionName': '华东1区-2',
          'employeeName': '余章龙',
          'quotePrice': '0',
          'realPrice': '0',
          'status': 1,
          'statusName': '草稿',
          'createDT': '2019-03-18',
          'sfQuoteId': '0Q07F000000Q5KFSA0',
          'payType': -1,
          'merchandiseList': [
            {
              'quoteItemId': 'SV20190318065704',
              'status': 3,
              'ballparkPrice': '',
              'formalPrice': '1250.00',
              'duration': 12,
              'floorPriceFlag': 0,
              'settledPrice': '',
              'createTime': '2019-03-18 14:07:56',
              'updateTime': '2019-03-18 15:18:59',
              'contractNosInERP': '',
              'nextExperimentId': 101,
              'statusNameOfM': '待技术审核',
              'serviceCategoryName': '细胞学服务',
              'serviceMerchandiseGUID': '87421b29-9b78-481e-b830-be435e577861',
              'orderId': '38607',
              'serviceCategoryId': 1500,
              'version': 4
            }
          ],
          'id': '38607',
          'customerNo': '00068178'
        }
      ]
    }
  } else {
    return {}
  }
  // let paramEncoded = ['Method=' + encodeURIComponent(method), 'Json=' + encodeURIComponent(JSON.stringify(data))]
  // if (typeof error !== 'function') {
  //   error = message => alert(message, '错误')
  // }
  // let url = 'gcapi'
  // let param = paramEncoded.join('&')
  // if (method.indexOf('gcidifc') >= 0) {
  //   url = method
  //   param = data ? getParamString(data) : data
  // }
  // Vue.http.post(url, param, {
  //   headers: {
  //     'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
  //   }
  // }).then(response => {
  //   response.json().then(obj => {
  //     if (obj.result) {
  //       if (typeof success === 'function' && obj.json && obj.json !== '') {
  //         success(JSON.parse(obj.json))
  //       } else {
  //         success(obj)
  //       }
  //       if (obj.message) {
  //         window.$.msg('提示：' + obj.message)
  //       }
  //     } else if (!obj.result) {
  //       if (obj.message !== '超出查询范围，没有订单数据') {
  //         error(obj.message)
  //       }
  //       if (obj.message === '您的会话已过期') {
  //         if (window.router !== undefined) {
  //           window.router.push({name: MobileRouterName.login})
  //         }
  //       }
  //       window.$('.ui.inverted.dimmer').dimmer('hide')
  //     }
  //   }, err => {
  //     error('数据解析错误 ' + err)
  //   })
  // }, err => {
  //   error('网络连接错误 ' + err)
  // })
}

function orderUpdate(mer, order) {
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

function getBeforeDateOptions() {
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
  BeforeDateOptions.splice(0, 0, {
    label: label,
    value: label + '-01' + ',' + label + '-' + getLastDay(year, d.getMonth() + 1)
  })
}

getBeforeDateOptions()

function getLastDay(year, month) {
  let newYear = year
  let newMonth = month++ // 取下一个月的第一天，方便计算（最后一天不固定）
  if (month > 12) {
    newMonth -= 12 // 月份减
    newYear++ // 年份增
  }
  let newDate = new Date(newYear, newMonth, 1) // 取当年当月中的第一天
  return (new Date(newDate.getTime() - 1000 * 60 * 60 * 24)).getDate() // 获取当月最后一天日期
}

function getAfterDateOptions() {
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

function closeMsg() {
  window.$('.overlay.msg').closest('.overlay').transition('fade')
}

function setStorage(name, content) {
  if (!name) return
  if (typeof content !== 'string') {
    content = JSON.stringify(content)
  }
  window.localStorage.setItem(name, content)
}

function getStorage(name) {
  if (!name) return
  let item = window.localStorage.getItem(name)
  if (!item) return
  if (!isJsonString(item)) return item
  return JSON.parse(item)
}

function isJsonString(str) {
  try {
    if (typeof JSON.parse(str) === 'object') {
      return true
    }
  } catch (e) {
  }
  return false
}

function dictMapHandler(typeId) {
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

function scMetaDataHandler(response) {
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

function getUrlParamHref(val) {
  let uri = window.location.href
  let re = new RegExp('' + val + '=([^&?]*)', 'ig')
  return ((uri.match(re)) ? (uri.match(re)[0].substr(val.length + 1)) : null)
}

function removeRepeats(valueList, dataList, str) {
  if (valueList === null || valueList.length === 0) return dataList
  valueList.forEach(vl => {
    dataList.splice(dataList.indexOf(dataList.find(dl => vl.find(v => v.attrValue.value === dl[str]))), 1)
  })
  return dataList
}

function readonlyHandler(merchandiseStatus, sfQuoteId) {
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
