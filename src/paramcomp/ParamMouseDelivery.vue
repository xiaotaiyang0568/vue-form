<template>
  <div class="ui form">
    <div class="filed" v-if="attributes">
      <div class="grouped fields">
        <label>{{attributes[0].attrValue.meta.label}}</label>
        <div class="ui form radio-display">
          <div class="field radio-width" v-for="(item,index) in attributes[0].attrValue.options" :key="index">
            <div class="ui radio checkbox" @click="cleanBloodCollections()" :class="{'disabled': attributes[0].attrValue.enable}">
              <input type="radio" :value="item.key" v-model="attributes[0].attrValue.value">
              <label>{{item.value}}</label>
            </div>
          </div>
        </div>
      </div>
      <div class="grouped fields blood" v-if="attributes[0].attrValue.value">
        <label>处死：</label>
        <div class="field" v-for="(item1,index1) in candidateBloodExecuted" :key="index1+'Executed'">
          <div class="ui checkbox checkbox-tab" :class="{'disabled': attributes[0].attrValue.enable}">
            <input type="checkbox" :value="item1.key" v-model="attributes[1].attrValue.attributes[0].attrValue.value">
            <label>{{item1.value}}</label>
          </div>
        </div>
        <label>活体：</label>
        <div class="field" v-for="(item2,index2) in candidateBloodLive" :key="index2+'Live'">
          <div class="ui checkbox checkbox-tab" :class="{'disabled': attributes[0].attrValue.enable}">
            <input type="checkbox" :value="item2.key" v-model="attributes[1].attrValue.attributes[0].attrValue.value">
            <label>{{item2.value}}</label>
          </div>
        </div>
        <div class="field" v-for="(item3,index3) in candidateBloodExtra" :key="index3+'Extra'">
          <div class="ui checkbox" :class="{'disabled': attributes[0].attrValue.enable}">
            <input type="checkbox" :value="item3.key" v-model="attributes[1].attrValue.attributes[0].attrValue.value">
            <label>{{item3.value}}</label>
          </div>
        </div>
      </div>
      <div class="ui divider"></div>
      <div class="field">
        <label>{{attributes[2].attrValue.meta.label}}</label>
        <div class="ui form radio-display">
          <div class="field radio-width" v-for="(item,index) in attributes[2].attrValue.options" :key="index">
            <div class="ui radio checkbox" @click="cleanBloodCollections()" :class="{'disabled': attributes[0].attrValue.enable}">
              <input type="radio" :value="item.key" v-model="attributes[2].attrValue.value">
              <label>{{item.value}}</label>
            </div>
          </div>
        </div>
        <div class="field" v-if="attributes[2].attrValue.value" :class="{'disabled': attributes[0].attrValue.enable}">
          <input v-model="attributes[3].attrValue.attributes[0].attrValue.value">
        </div>
      </div>
      <div class="ui divider"></div>
      <div class="grouped fields">
        <label>{{attributes[4].attrValue.meta.label}}</label>
        <div class="field" v-for="(item4,index4) in attributes[4].attrValue.options"
             :key="index4+attributes[4].attrValue.meta.label">
          <div class="ui radio checkbox" :class="{'disabled': attributes[0].attrValue.enable}">
            <input type="radio" :value="item4.key" v-model="attributes[4].attrValue.value">
            <label>{{item4.value}}</label>
          </div>
        </div>
      </div>
      <div class="ui divider"></div>
      <div class="grouped fields">
        <label>{{attributes[5].attrValue.meta.label}}</label>
        <div class="field" v-for="(item5,index5) in attributes[5].attrValue.options"
             :key="index5+attributes[5].attrValue.meta.label">
          <div class="ui radio checkbox" @click="cleanExtraStorage()" :class="{'disabled': attributes[0].attrValue.enable}">
            <input type="radio" :value="item5.key" v-model="attributes[5].attrValue.value">
            <label>{{item5.value}}</label>
          </div>
        </div>
        <div class="field">
          <div class="field" v-if="attributes[5].attrValue.value===ExtraStorage" :class="{'disabled': attributes[0].attrValue.enable}">
            <input v-model="attributes[6].attrValue.attributes[0].attrValue.value">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import scMeta from '../sc_meta.js'
export default {
  created () {
    this.Executed = 'executed'
    this.Live = 'live'
    this.Extra = 'extra'
    this.ExtraStorage = scMeta.ExtraInfo.ExtraStorage
    if (this.attributes && this.attributes[1].attrValue.attributes) {
      this.candidateBloodCollections = this.attributes[1].attrValue.attributes[0].attrValue.options
      this.candidateBloodExecuted = this.candidateBloodCollections.filter(b => b.extraValue === this.Executed)
      this.candidateBloodLive = this.candidateBloodCollections.filter(b => b.extraValue === this.Live)
      this.candidateBloodExtra = this.candidateBloodCollections.filter(b => b.extraValue === this.Extra)
    }
  },
  props: ['attributes', 'params'],
  mounted () {
  },
  data () {
    return {}
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
  computed: {},
  methods: {
    cleanBloodCollections () {
      this.attributes[1].attrValue.attributes[0].attrValue.value = []
    },
    cleanExtraStorage () {
      this.attributes[6].attrValue.attributes[0].attrValue.value = null
    }
  }
}
</script>

<style scoped>
  .radio-display {
    display: flex;
  }

  .radio-width {
    width: 50%;
  }

  .ui.form .grouped.fields.blood {
    margin-left: 1.5em;
  }

  div.ui.checkbox.checkbox-tab {
    margin-left: 1.5em;
  }

</style>
