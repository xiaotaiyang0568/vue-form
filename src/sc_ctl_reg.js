import scMeta from './sc_meta.js'
import Vue from 'vue'
import attrDateBox from './attrctl/AttrDateBox.vue'
import attrTextBox from './attrctl/AttrTextBox.vue'
import attrRadioBox from './attrctl/AttrRadioBox.vue'
import attrInputBox from './attrctl/AttrInputBox.vue'
import attrGroupBox from './attrctl/AttrGroupBox.vue'
import attrCheckBox from './attrctl/AttrCheckBox.vue'
import attrCheckListBox from './attrctl/AttrCheckListBox.vue'
import attrListBox from './attrctl/AttrListBox.vue'
import attrGeneListBox from './attrctl/AttrGeneListBox.vue'
import attrResultBox from './attrctl/AttrResultBox.vue'
import attrSearchBox from './attrctl/AttrSearchBox.vue'
import attrDisplayBox from './attrctl/AttrDisplayBox.vue'
import attrNumberBox from './attrctl/AttrNumberBox.vue'
import attrSerialNoListBox from './attrctl/AttrSerialNoListBox.vue'
import attrCellListBox from './attrctl/AttrCellListBox.vue'
import attrVirusPlasmidListBox from './attrctl/AttrVirusPlasmidListBox.vue'

import paramCommon from './paramcomp/ParamCommon.vue'
import paramLucGrouping from './paramcomp/ParamLUCGrouping.vue'
import paramAntibody from './paramcomp/ParamAntibody.vue'
import paramMouseDelivery from './paramcomp/ParamMouseDelivery.vue'
import paramResearchDirection from './paramcomp/ParamResearchDirection.vue'

/**
 * 注册定制组件
 */
let attrType = scMeta.ParamAttrType
let ctlReg = {
  [attrType.Date]: {name: 'attr-date-box', component: attrDateBox},
  [attrType.Text]: {name: 'attr-text-box', component: attrTextBox},
  [attrType.Radio]: {name: 'attr-radio-box', component: attrRadioBox},
  [attrType.Input]: {name: 'attr-input-box', component: attrInputBox},
  [attrType.Check]: {name: 'attr-check-box', component: attrCheckBox},
  [attrType.CheckList]: {name: 'attr-check-list-box', component: attrCheckListBox},
  [attrType.Number]: {name: 'attr-number-box', component: attrNumberBox},
  [attrType.Enum]: {name: 'attr-radio-box', component: attrRadioBox},
  [attrType.List]: {name: 'attr-list-box', component: attrListBox},
  [attrType.Group]: {name: 'attr-group-box', component: attrGroupBox},
  [attrType.GeneList]: {name: 'attr-gene-list-box', component: attrGeneListBox},
  [attrType.Result]: {name: 'attr-result-box', component: attrResultBox},
  [attrType.Search]: {name: 'attr-search-box', component: attrSearchBox},
  [attrType.Display]: {name: 'attr-display-box', component: attrDisplayBox},
  [attrType.SerialNoList]: {name: 'attr-serial-no-list-box', component: attrSerialNoListBox},
  [attrType.CellList]: {name: 'attr-cell-list-box', component: attrCellListBox},
  [attrType.VirusPlasmidList]: {name: 'attr-virus-plasmid-list-box', component: attrVirusPlasmidListBox}
}

function initComponent () {
  for (let i in ctlReg) {
    let ctl = ctlReg[i]
    Vue.component(ctl.name, ctl.component)
  }
}
initComponent()

function getCtlByType (typeId) {
  let ctl = ctlReg[typeId]
  if (!ctl) return ''
  return ctl.name
}

/**
 * 注册参数类型组件
 */
let paramType = scMeta.ParamType
let paramCtlReg = {
  [-1]: {name: 'param-common', component: paramCommon},
  [paramType.LUCGrouping]: {name: 'param-luc-grouping', component: paramLucGrouping},
  [paramType.Antibody]: {name: 'param-antibody', component: paramAntibody},
  [paramType.MouseDelivery]: {name: 'param-mouse-delivery', component: paramMouseDelivery},
  [paramType.ResearchDirection]: {name: 'param-research-direction', component: paramResearchDirection}
}

function initParamComponent () {
  for (let i in paramCtlReg) {
    let ctl = paramCtlReg[i]
    Vue.component(ctl.name, ctl.component)
  }
}
initParamComponent()

function getCtlByParamType (paramType) {
  let ctl = paramCtlReg[paramType]
  if (!ctl) return 'param-common'
  return ctl.name
}

export default {
  getCtlByType,
  getCtlByParamType
}
