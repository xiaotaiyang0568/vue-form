const FilterOptionsValue = {
  orderNo: 'orderNo',
  employeeName: 'employeeName',
  customerName: 'customerName',
  regionName: 'regionName',
  regionFatherName: 'regionFatherName',
  merchanStatus: 'merchanStatus',
  merchanCreateDT: 'merchanCreateDT',
  merchanUpdateDT: 'merchanUpdateDT'
}

const FilterOptionsLabel = {
  orderNo: '订单号',
  employeeName: '业务员姓名',
  customerName: '客户姓名',
  regionName: '所属片区',
  regionFatherName: '所属大区',
  merchanStatus: '商品状态',
  merchanCreateDT: '商品创建时间',
  merchanUpdateDT: '商品修改时间'
}

const DictionaryTypeID = {
  MerchandiseStatusType: 52001, // 52001 ---》 字典中服务类商品的状态
  OperationType: 52002,
  PriceReminder: 52050
}

const DataType = {
  NonZeroInteger: 1,
  ZeroableInteger: 2,
  Enum: 3
}

const MaxLength = {
  Textarea: 4096 // 文本域 ，单位：字节
}

const MerchandiseStatus = {
  input: 1,
  waitBuAudit: 2,
  waitTeAudit: 3,
  buDraft: 4,
  quoteComplete: 5,
  Invalid: 6,
  WaitEntryContract: 7,
  ContractCompleted: 8
}

const Boolean = {
  Yes: 1,
  No: 0
}

const ParamMsgType = { // 保存参数信息时，后台返回的信息类型
  Error: 1, // 错误信息
  Empty: 2, // 逻辑空信息
  Success: 3 // 保存成功
}

const userRoles = {
  employee: 'employee', // 业务员
  business: 'buss_audit', // 商务人员
  technology: 'tech_audit', // 技术人员
  technologySupport: 'tech_sup', // 技术支持
  districtManager: 'dis_man', // 片区经理
  divisionManager: 'div_man', // 大区经理
  salesManager: 'sales_man', // 销售经理
  administrator: 'admin' // 管理员
}

const OperationType = {
  CreateMerchandise: 1, // 创建商品
  ModifyMerchandise: 2, // 修改商品
  BallparkPrice: 3, // 预报价
  SubmitBuAudit: 4, // 提交商务审核
  SubmitTeAudit: 5, // 提交技术审核
  BuAuditPass: 6, // 商务审核通过
  BuAuditNoPass: 7, // 商务审核不通过
  ExperimentDesignPass: 8, // 实验方案通过
  ExperimentDesignNoPass: 9, // 实验方案不通过
  ContractPass: 10, // 合同文本通过
  ContractNoPass: 11, // 合同文本不通过
  QuoteComplete: 12, // 报价完成
  OptimizeExperimentDesign: 13 // 完善实验方案
}

const FromSalesForce = false

// 大区，片区元数据需要处理
function enumMetaDataHandler (metaData) {
  if (!metaData) return
  let returnRes = []
  for (let i = 0; i < metaData.length; i++) {
    let obj = {}
    obj.label = metaData[i]
    obj.value = metaData[i]
    returnRes.push(obj)
  }
  return returnRes
}

// 商品状态对应字典中dictKey的处理
function dictionariesHandler (dict) {
  let res = []
  if (dict) {
    dict.forEach(dt => {
      if (dt.typeID === DictionaryTypeID.MerchandiseStatusType && dt.dictKey !== 0) {
        let obj = {}
        obj.label = dt.dictValue
        obj.value = dt.dictKey
        res.push(obj)
      }
    })
  }
  return res
}

function sortForUnits (arr) { // 从小到大
  return arr.sort((x, y) => x.sortCode - y.sortCode)
}

function sortBySortOrder (arr) { //  从小到大
  return arr.sort((x, y) => x.sortOrder - y.sortOrder)
}

function getTextBasedParamList (bTextBasedParameters, experiments, SCMetaData) {
  let arr = []
  if (experiments === null) {
    experiments = SCMetaData.metaExperiments
  }
  for (let textBasedParameter of bTextBasedParameters) {
    let parameter = SCMetaData.metaParameters.find(p => p.metaParameterTypeId === textBasedParameter.metaParameterTypeId)
    let neededExperiments = textBasedParameter.neededExperimentIds.map((id) => experiments.find(e => e.metaExperimentId === id)).sort((x, y) => x.sortOrder - y.sortOrder)
    let neededExperimentNames = neededExperiments.map(e => e.experimentName)
    let neededExperimentNamesString = neededExperimentNames.toString().replace(/,/g, '，')
    arr.push({
      textId: textBasedParameter.metaParameterTypeId,
      sortOrder: parameter.sortOrder,
      parameterName: parameter.metaParameterName,
      neededExperiments: neededExperimentNamesString,
      helpText: textBasedParameter.helpText,
      textContent: textBasedParameter.parameterText
    })
  }
  return sortBySortOrder(arr)
}

function getBusinessParams (businessParams, textList, serviceMerchandiseGUID) {
  let arr = []
  for (let item of businessParams) {
    let parameter = textList.find(t => t.textId === item.metaParameterTypeId)
    item['sortOrder'] = parameter.sortOrder
    item['serviceMerchandiseGUID'] = serviceMerchandiseGUID
    item['parameterName'] = parameter.parameterName
    arr.push(item)
  }
  return sortBySortOrder(arr)
}

export default {
  FilterOptionsValue,
  FilterOptionsLabel,
  DataType,
  MaxLength,
  MerchandiseStatus,
  DictionaryTypeID,
  userRoles,
  OperationType,
  Boolean,
  ParamMsgType,
  FromSalesForce,
  enumMetaDataHandler,
  dictionariesHandler,
  sortForUnits,
  sortBySortOrder,
  getTextBasedParamList,
  getBusinessParams
}
