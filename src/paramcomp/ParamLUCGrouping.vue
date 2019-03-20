<template>
  <div class="ui form">
    <div class="field" v-if="attributes" v-for="(item,index) in attributes[0].attrValue.options" :key="index">
      <div class="ui radio checkbox" @click="clean(attributes[0].attrValue.value)" :class="{'_disabled': attributes[0].attrValue.enable}">
        <input type="radio" :value="item.key" v-model="attributes[0].attrValue.value">
        <label>{{item.value}}<a class="right floated" v-if="attributes[0].attrValue.value === GroupingTypes.UserDefined && item.key === attributes[0].attrValue.value" @click="addList()"><i class="add icon"></i></a></label>
      </div>
      <div v-if="attributes[0].attrValue.value === GroupingTypes.WildMutation && item.key === attributes[0].attrValue.value">
        <span>
          1：3’UTR-NC （<input class="prompt" type="text" v-model="wildMutation.text1" :class="{'_disabled': attributes[0].attrValue.enable}"> ）+miRNA-NC （<input class="prompt" type="text" v-model="wildMutation.text2" :class="{'_disabled': attributes[0].attrValue.enable}"> ）；
        </span><br>
        <span>
        2：3’UTR-NC+miRNA （<input class="prompt" type="text" v-model="wildMutation.text3" :class="{'_disabled': attributes[0].attrValue.enable}"> ）；
      </span><br>
        <span>
        3：3’UTR （<input class="prompt" type="text" v-model="wildMutation.text4" :class="{'_disabled': attributes[0].attrValue.enable}"> ）+miRNA-NC;
      </span><br>
        <span>
        4：3’UTR+miRNA ；
      </span><br>
        <span>
        5：3’UTR-M （<input class="prompt" type="text" v-model="wildMutation.text5" :class="{'_disabled': attributes[0].attrValue.enable}"> ）+miRNA-NC；
      </span><br>
        <span>
        6：3’UTR-M+miRNA；
      </span>
      </div>
      <div v-if="attributes[0].attrValue.value === GroupingTypes.Promoter && item.key === attributes[0].attrValue.value">
        <span>
          1：Promoter-NC （<input class="prompt" type="text" v-model="promoter.text1" :class="{'_disabled': attributes[0].attrValue.enable}"> ）+TFs-NC （<input class="prompt" type="text" v-model="promoter.text2" :class="{'_disabled': attributes[0].attrValue.enable}"> ）；
        </span><br>
        <span>
        2：Promoter-NC+TFs （<input class="prompt" type="text" v-model="promoter.text3" :class="{'_disabled': attributes[0].attrValue.enable}"> ）；
      </span><br>
        <span>
        3：Promoter （<input class="prompt" type="text" v-model="promoter.text4" :class="{'_disabled': attributes[0].attrValue.enable}"> ）+TFs-NC；
      </span><br>
        <span>
        4：Promoter+TFs；
      </span><br>
      </div>
      <div v-if="attributes[0].attrValue.value === GroupingTypes.UserDefined && item.key === attributes[0].attrValue.value">
        <div v-for="(item,index) in  groupingTexts" :key="index">
        <span>
          <div style="width: 10px;display: inline-block">{{index + 1}}：</div>
          <input v-model="item.value" :class="{'_disabled': attributes[0].attrValue.enable}">
        </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import scMeta from '../sc_meta.js'
export default {
  created () {
    this.GroupingTypes = scMeta.GroupingTypes
  },
  props: ['attributes', 'params'],
  mounted () {
    window.$('.ui.radio.checkbox').checkbox()
    this.initGroupingTexts()
    this.initPromoterOrWildMutation()
  },
  data () {
    return {
      input: '',
      wildMutation: {
        text1: '',
        text2: '',
        text3: '',
        text4: '',
        text5: ''
      },
      promoter: {
        text1: '',
        text2: '',
        text3: '',
        text4: ''
      },
      groupingTexts: []
    }
  },
  watch: {
    'wildMutation': {
      handler: function (val) {
        this.attributes[1].attrValue.attributes.forEach(attr => {
          if (val[attr.attrName]) {
            attr.attrValue.value = val[attr.attrName]
          }
        })
        this.attributes[1].attrValue.value = this.attributes[1].attrValue.attributes
      },
      deep: true
    },
    'promoter': {
      handler: function (val) {
        this.attributes[1].attrValue.attributes.forEach(attr => {
          if (val[attr.attrName]) {
            attr.attrValue.value = val[attr.attrName]
          }
        })
        this.attributes[1].attrValue.value = this.attributes[1].attrValue.attributes
      },
      deep: true
    },
    'groupingTexts': {
      handler: function () {
        this.attributes[2].attrValue.value = this.groupingTexts.map(t => {
          return t.value
        })
      },
      deep: true
    }
    /*,
    'attributes': {
      handler: function (val) {
        this.params.isModify = true
        this.$emit('modifyUnit', true)
      },
      deep: true
    }
    */
  },
  methods: {
    addList () {
      this.groupingTexts.push({value: ''})
    },
    clean (val) {
      if (val === scMeta.GroupingTypes.WildMutation) {
        this.promoter = {}
        this.groupingTexts = []
        this.attributes[1].attrValue.value = []
      } else if (val === scMeta.GroupingTypes.Promoter) {
        this.wildMutation = {}
        this.groupingTexts = []
        this.attributes[1].attrValue.value = []
      } else {
        this.promoter = {}
        this.wildMutation = {}
      }
    },
    initGroupingTexts () {
      let texts = this.attributes[2].attrValue.value
      if (texts.length > 0) {
        texts.forEach(t => {
          let obj = {}
          obj.value = t
          this.groupingTexts.push(obj)
        })
      }
    },
    initPromoterOrWildMutation () {
      let content = this.attributes[1].attrValue.attributes
      let value = this.attributes[0].attrValue.value
      content.forEach(con => {
        if (value === this.GroupingTypes.Promoter) {
          this.promoter[con.attrName] = con.attrValue.value
        } else if (value === this.GroupingTypes.WildMutation) {
          this.wildMutation[con.attrName] = con.attrValue.value
        }
      })
    }
  },
  computed: {
  }
}

</script>

<style scoped>
  .radio-display {
    display: flex;
  }

  .radio-width {
    width:50%;
  }

</style>
