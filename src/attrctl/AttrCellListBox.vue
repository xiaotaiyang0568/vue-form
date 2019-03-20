<template>
  <div class="ui form">
    <div class="ui fluid card">
      <div class="content" v-if="attr">
        <div class="color" style="font-size: 1em;">{{headerContent}}</div>
        <div class="ui items" v-for="(item,index) in attr.attrValue.value" :key="index" style="margin-top: 0.5rem;margin-bottom: 0;display: flex;">
          <div style="width: 80%;">
            <attr-display-box :displayItems="item" :showPopup="true"></attr-display-box>
          </div>
          <div style="width: 20%;text-align: right">
            <a class="right floated color" @click="deleteItems(item)" v-if="item[1].attrValue.value || item[2].attrValue.value" :class="{'disabled': attr.attrValue.enable}"><i class="minus icon"></i>删除</a>
          </div>
        </div>
      </div>
      <div class="extra content" style="text-align: center;">
        <a class="right floated" @click="addItems" :class="{'_disabled': attr.attrValue.enable}"><i class="add icon"></i>添加</a>
      </div>
    </div>
    <div v-if="attr" :id="attr.attrName" class="ui longer modal">
      <i class="close icon" @click="confirmAddItems(false)"></i>
      <div class="image content" style="margin-top: 2.5rem;">
        <div class="ui form">
          <attr-search-box :attr="createdItem" :fromCell="true" :index="index" :attributes="attributes" @getEntered="getEntered" @loadCellItems="loadCellItems"></attr-search-box>
          <div class="scrolling content" style="margin-top: 0.5rem;height: 400px;">
            <div class="color" v-if="resultFlag" style="text-align: center">暂无结果</div>
            <attr-result-box v-else :index="index" :resultList="cellList" :resultListChecked="cellListChecked" :fromCell="true" @onCheckItem="onCheckItem" @onCheckAll="onCheckAll"></attr-result-box>
          </div>
        </div>
      </div>
      <div class="actions">
        <div class="ui positive right labeled icon button" :class="{'_disabled': disabledConfirm}">确定<i class="checkmark icon"></i></div>
      </div>
    </div>
  </div>
</template>

<script>
import scClient from '../sc_client.js'
export default {
  props: ['attr', 'index', 'attributes'],
  mounted () {
  },
  data () {
    return {
      cellList: [],
      cellListChecked: [],
      cellEntered: '', // cellName
      disabledConfirm: true,
      resultFlag: false,
      createdItem: '' // 新增时构造
    }
  },
  watch: {
    'cellListChecked': function (val) {
      if (this.cellListChecked.length > 0) {
        this.disabledConfirm = false
      } else {
        this.disabledConfirm = true
      }
    }
  },
  methods: {
    getEntered (val) {
      this.cellEntered = val
    },
    loadCellItems () {
      window.$.dimmerShow('查询中')
      scClient.callRemoteMethod('loadCellPartBProvideInfo', this.cellEntered, false, response => {
        // console.log('loadCellPartBProvideInfo', response)
        window.$.dimmerHide()
        this.cellList = scClient.removeRepeats(this.attr.attrValue.value, response, 'cellNamePub')
        this.resultFlag = this.cellList.length === 0
      })
    },
    onCheckItem (tar, cell) { // 单选，反选
      let checked = tar.target.checked
      let checkedList = this.cellListChecked
      if (checked) {
        checkedList.push(cell)
      } else {
        checkedList.forEach(item => {
          if (item.cellGuid === cell.cellGuid) {
            checkedList.splice(checkedList.indexOf(item), 1)
          }
        })
      }
    },
    onCheckAll (tar) { // 全选，反选
      let checked = tar.target.checked
      let cellElement = window.$('.check_gene_item')
      if (checked) {
        let list = this.cellList
        this.cellListChecked = []
        list.forEach(li => {
          this.cellListChecked.push(li)
        })
        for (let i = 0; i < cellElement.length; i++) {
          cellElement[i].checked = true
        }
      } else {
        this.cellListChecked = []
        for (let i = 0; i < cellElement.length; i++) {
          cellElement[i].checked = false
        }
      }
    },
    deleteItems (item) {
      this.createdItem = ''
      let attrs = this.attr.attrValue.value
      attrs.splice(attrs.indexOf(item), 1)
    },
    addItems () {
      let _this = this
      window.$('#' + this.attr.attrName + '').modal({
        closable: false,
        onApprove: function () {
          _this.confirmAddItems(true) // 处理没填写内容的情况
        }
      }).modal('show')
    },
    createdItems () {
      let list = this.attr.attrValue.attributes
      let res = []
      list.forEach(li => {
        let obj = scClient.attrMetaHandler(li, null, null)
        res.push(obj)
      })
      this.createdItem = res
      return res
    },
    confirmAddItems (confirm) {
      if (confirm) {
        let value = this.attr.attrValue.value
        let checkList = this.cellListChecked
        checkList.forEach(checked => {
          let item = this.createdItems()
          for (let it of item) {
            if (checked.cellNamePub && it.attrName === 'cellName') {
              it.attrValue.value = checked.cellNamePub
            }
            if (checked.cellSourceSpeciesName && it.attrName === 'sourceSpeciesName') {
              it.attrValue.value = checked.cellSourceSpeciesName
            }
            if (it.attrName === 'cellType') {
              it.attrValue.value = it.attrValue.meta.cell.key
            }
            if (checked.cellGUID && it.attrName === 'cellGuid') {
              it.attrValue.value = checked.cellGUID
            }
          }
          value.push(item)
        })
      }
      this.cellList = [] // 清空
      this.cellListChecked = []
    }
  },
  computed: {
    headerContent () {
      let res = ''
      let content = this.attr.attrValue.meta.list
      Object.keys(content).forEach(con => {
        let label = content[con].label
        if (label && label !== '') {
          res = res === '' ? label : res + ',' + label
        }
      })
      return res
    },
    createdItemWithTax () {
      let items = this.createdItems()
      if (items === '') return
      return items.find(it => it.attrName === 'taxId')
    }
  }
}
</script>

<style scoped>
  .color {
    color: rgba(0, 0, 0, 0.4);
  }

</style>
