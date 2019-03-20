import Vue from 'vue'
import Vuex from 'vuex'
import _ from 'underscore'
import global from '../sc_global.js'
import scClient from '../sc_client.js'

Vue.use(Vuex)
const state = {
  metaExperimentData: {},
  currentClickRow: null,
  SCMetaData: {},
  hasModifications: false,
  serviceOrders: [],
  candidateExperiments: [],
  selectedCopyMerchandise: {},
  goalOrderForPaste: {},
  selectCopyMerchandiseFlag: false
}

let employee = global.userRoles.employee
let business = global.userRoles.business
let technology = global.userRoles.technology
let technologySupport = global.userRoles.technologySupport
let districtManager = global.userRoles.districtManager
let divisionManager = global.userRoles.divisionManager
let salesManager = global.userRoles.salesManager
let administrator = global.userRoles.administrator

// 大区，片区元数据需要处理
let enumMetaDataHandler = global.enumMetaDataHandler

function dictionariesHandler (dict) {
  let res = []
  if (dict) {
    dict.forEach(dt => {
      if (dt.typeID === global.DictionaryTypeID.MerchandiseStatusType && dt.dictKey !== 0) {
        let obj = {}
        obj.label = dt.dictValue
        obj.value = dt.dictKey
        res.push(obj)
      }
    })
  }
  return res
}

let getTextBasedParamList = global.getTextBasedParamList

function getServiceCategory (id, categories) {
  return categories.find(c => c.serviceCategoryId === id)
}

export default new Vuex.Store({
  state,
  mutations: {
    setCurrentClickRow (state, data) {
      state.currentClickRow = data
    },
    setMetaExperimentData (state, data) {
      state.metaExperimentData = data
    },
    setSCMetaData (state, data) {
      state.SCMetaData = data
    },
    setModifiedFlag (state, data) {
      state.hasModifications = data
    },
    setServiceOrders (state, data) {
      state.serviceOrders = data
    },
    setCandidateExperiments (state, data) {
      state.candidateExperiments = data
    },
    setSelectedCopyMerchandise (state, data) {
      state.selectedCopyMerchandise = data
    },
    setGoalOrderForPaste (state, data) {
      state.goalOrderForPaste = data
    },
    setSelectCopyMerchandiseFlag (state, data) {
      state.selectCopyMerchandiseFlag = data
    },
    initSCMetaData (state) {
      let scData = scClient.getStorage('SCMetaData')
      if (scData) {
        state.SCMetaData = scData
      }
    }
  },
  getters: {
    hasOrderManagePrivilege: (state) => { // 订单管理 --》针对业务员，各区经理，销售经理，管理员
      if (!state.SCMetaData.scUserInfo) return
      let roles = state.SCMetaData.scUserInfo.roles.split(';')
      return _.contains(roles, employee) || _.contains(roles, districtManager) || _.contains(roles, divisionManager) || _.contains(roles, salesManager) || _.contains(roles, administrator)
    },
    hasMerchandiseManagePrivilege: (state) => { // 商品管理 --》针对业务员，各区经理，销售经理，管理员
      if (!state.SCMetaData.scUserInfo) return
      let roles = state.SCMetaData.scUserInfo.roles.split(';')
      return _.contains(roles, employee) || _.contains(roles, districtManager) || _.contains(roles, divisionManager) || _.contains(roles, salesManager) || _.contains(roles, administrator)
    },
    hasBusinessAuditPrivilege: (state) => { // 商务审核，商务起草 --》针对商务人员，管理员
      if (!state.SCMetaData.scUserInfo) return
      let roles = state.SCMetaData.scUserInfo.roles.split(';')
      return _.contains(roles, business) || _.contains(roles, administrator)
    },
    hasTechnologyAuditPrivilege: (state) => { // 技术审核 --》针对技术人员，管理员
      if (!state.SCMetaData.scUserInfo) return
      let roles = state.SCMetaData.scUserInfo.roles.split(';')
      return _.contains(roles, technology) || _.contains(roles, administrator)
    },
    hasCheckLogPrivilege: (state) => { // 查看操作日志 --》针对商务人员，技术人员，管理员
      if (!state.SCMetaData.scUserInfo) return
      let roles = state.SCMetaData.scUserInfo.roles.split(';')
      return _.contains(roles, business) || _.contains(roles, technology) || _.contains(roles, administrator)
    },
    isEmployee: (state) => {
      if (!state.SCMetaData.scUserInfo) return
      return _.contains(state.SCMetaData.scUserInfo.roles.split(';'), employee)
    },
    isDivisionManager: (state) => {
      if (!state.SCMetaData.scUserInfo) return
      return _.contains(state.SCMetaData.scUserInfo.roles.split(';'), divisionManager)
    },
    isDistrictManager: (state) => {
      if (!state.SCMetaData.scUserInfo) return
      return _.contains(state.SCMetaData.scUserInfo.roles.split(';'), districtManager)
    },
    isBusiness: (state) => {
      if (!state.SCMetaData.scUserInfo) return
      return _.contains(state.SCMetaData.scUserInfo.roles.split(';'), business)
    },
    isTechnology: (state) => {
      if (!state.SCMetaData.scUserInfo) return
      return _.contains(state.SCMetaData.scUserInfo.roles.split(';'), technology)
    },
    isTechnologySupport: (state) => {
      if (!state.SCMetaData.scUserInfo) return
      return _.contains(state.SCMetaData.scUserInfo.roles.split(';'), technologySupport)
    },
    isSalesManager: (state) => {
      if (!state.SCMetaData.scUserInfo) return
      return _.contains(state.SCMetaData.scUserInfo.roles.split(';'), salesManager)
    },
    isAdministrator: (state) => {
      if (!state.SCMetaData.scUserInfo) return
      return _.contains(state.SCMetaData.scUserInfo.roles.split(';'), administrator)
    },
    getMetaExperimentData: (state) => (id) => {
      return state.SCMetaData.metaExperiments.find(e => e.metaExperimentId === id)
    },
    districts: (state) => {
      return enumMetaDataHandler(state.SCMetaData.districts)
    },
    divisions: (state) => {
      return enumMetaDataHandler(state.SCMetaData.divisions)
    },
    smStatus: (state) => {
      let dict = state.SCMetaData.dictionaries
      return dictionariesHandler(dict)
    },
    quoteUnits: (state) => {
      return state.SCMetaData.quoteUnits
    },
    metaExperimentCategories: (state) => {
      return state.SCMetaData.metaExperimentCategories
    },
    metaExperimentSetItems: (state) => {
      return state.SCMetaData.metaExperimentSetItems
    },
    serviceCategories: (state) => {
      return state.SCMetaData.serviceCategories
    },
    dictionaries: (state) => {
      return state.SCMetaData.dictionaries
    },
    metaParameters: (state) => {
      return state.SCMetaData.metaParameters
    },
    getCustomerNameFromServiceOrders: (state) => (id) => {
      return state.serviceOrders.find(s => s.id === id).customerName
    },
    getCandidateExperimentsByCategoryId: (state) => (serviceCategoryId) => {
      let setId = getServiceCategory(serviceCategoryId, state.SCMetaData.serviceCategories).experimentSetId
      let experimentSetItems = state.SCMetaData.metaExperimentSetItems.filter(item => {
        if (item.experimentSetId !== setId) {
          return false
        }
        if (!item.serviceCategoryDisabled) {
          return true
        } else if (item.serviceCategoryDisabled === 'ALL') {
          return false
        } else {
          return !item.serviceCategoryDisabled.split(',').some(categoryIdString => parseInt(categoryIdString) === serviceCategoryId)
        }
      })
      let arr = []
      for (let setItem of experimentSetItems) {
        let experiment = state.SCMetaData.metaExperiments.find(e => e.metaExperimentId === setItem.metaExperimentId)
        experiment['sortOrder'] = setItem.sortOrder
        arr.push(experiment)
      }
      return arr.sort((x, y) => x.sortOrder - y.sortOrder)
    },
    getServiceCategoryById: (state) => (id) => {
      return state.SCMetaData.serviceCategories.find(c => c.serviceCategoryId === id)
    },
    getTextBasedParamList: (state) => (bTextBasedParameters, experiments) => {
      return getTextBasedParamList(bTextBasedParameters, experiments, state.SCMetaData)
    }
  }
})
