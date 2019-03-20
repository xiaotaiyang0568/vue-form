<template>
  <div class="ui form" v-if="attr && attr.attrValue" :class="{'radio-display': attr.attrValue.meta.row}">
    <div class="field" v-if="attr" v-for="(item,index) in attr.attrValue.options" :class="{'radio-width': attr.attrValue.meta.row}" :key="index">
      <div class="ui checkbox" :class="{'disabled': attr.attrValue.enable}">
        <input type="checkbox" :value="item.key" v-model="attr.attrValue.value">
        <label>{{item.value}}</label>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['attr', 'index', 'attributes', 'fromGene', 'attrPartA'],
  mounted () {
    window.$('.ui.checkbox').checkbox()
  },
  data () {
    return {
      input: ''
    }
  },
  watch: {
    'attr.attrValue.value': function (val) {
    }
  },
  methods: {
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
