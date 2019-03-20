<template>
  <div class="ui form">
    <div class="grouped fields" v-if="attributes">
      <label>研究领域：</label>
      <div class="field tab" :class="{'disabled': attributes[0].attrValue.enable}">
        <label>{{attributes[0].attrValue.attributes[0].attrValue.meta.label}}</label>
        <input v-model="attributes[0].attrValue.attributes[0].attrValue.value" placeholder="说明：如糖尿病、肾炎、主动脉瘤等">
      </div>
      <div class="field tab">
        <label>{{attributes[1].attrValue.attributes[0].attrValue.meta.label}}</label>
        <div class="field checkbox-display">
          <div class="ui checkbox checkbox-tab" v-for="(item1,index1) in attributes[1].attrValue.options"
               v-if="onLeftColumn(index1)" :key="index1+'left'" :class="{'disabled': attributes[0].attrValue.enable}">
            <input type="checkbox" :value="item1.key" v-model="checkVal">
            <label>{{item1.value}}</label>
          </div>
          <div class="ui checkbox checkbox-tab" v-for="(item2,index2) in attributes[1].attrValue.options"
               v-if="!onLeftColumn(index2)" :key="index2+'right'" :class="{'disabled': attributes[0].attrValue.enable}">
            <input type="checkbox" :value="item2.key" v-model="checkVal">
            <label>{{item2.value}}</label>
          </div>
        </div>
      </div>
      <div class="ui divider"></div>
      <label>研究方向：</label>
      <div class="field rearch-direction" :class="{'disabled': attributes[0].attrValue.enable}">
        <input v-model="attributes[0].attrValue.attributes[1].attrValue.value" placeholder="说明：如转移、增殖、自嗜、其他等">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  created () {
    if (this.attributes && this.attributes[1].attrValue.attributes) {
      this.candidateTumors = this.attributes[1].attrValue.options
    }
  },
  watch: {
    /*
     'attributes': {
     handler: function (val) {
     this.params.isModify = true
     this.$emit('modifyUnit', true)
     },
     deep: true
     }
     */
  },
  props: ['attributes', 'params'],
  methods: {
    onLeftColumn (index) {
      return index % 2 === 0
    }
  },
  computed: {
    checkVal: {
      get () {
        let res = []
        let value = this.attributes[1].attrValue.value
        if (value[0] instanceof Array) {
          value.forEach(val => {
            res.push(val[0].attrValue.value)
          })
        } else {
          res = value
        }
        return res
      },
      set (value) {
        this.attributes[1].attrValue.value = value
      }
    }
  }
}
</script>

<style scoped>
  .ui.form .grouped.fields .field, .ui.form .grouped.inline.fields .field {
    margin-left: 1em;
  }

  .ui.form .grouped.fields .field.rearch-direction {
    margin-left: 0;
  }

  .field.checkbox-display {
    display: flex;
    flex-direction: row;
  }

  .ui.checkbox.checkbox-tab {
    width: 50%;
  }

</style>
