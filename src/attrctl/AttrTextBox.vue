<template>
  <div class="ui form">
    <div class="field" :class="{'disabled': attr.attrValue.enable}">
      <textarea rows="4" v-model="attr.attrValue.value" :placeholder="attr.attrValue.meta.placeholder"></textarea>
    </div>
  </div>
</template>

<script>
export default {
  props: ['attr', 'index', 'attributes'],
  methods: {
  }
}

</script>

<style scoped>
</style>
