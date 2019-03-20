<template>
  <div class="ui form">
    <div class="field">
      <div class="ui fluid category search" style="display: flex;">
        <div class="ui icon input">
          <input class="prompt" type="text" v-model="entered" :placeholder="placeholder">
        </div>
        <!--loading-->
        <button class="mini right floated ui primary button" @click="searchGene"><i class="search icon"></i></button>
        <!--<div class="results"></div>-->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['attr', 'index', 'attributes', 'fromGene', 'fromSerialNo', 'fromCell'],
  data () {
    return {
      entered: ''
    }
  },
  watch: {
    'entered': function (val) {
      if (this.fromGene) {
        this.$emit('getEntered', val)
      } else if (this.fromSerialNo) {
        this.$emit('getEntered', val)
      } else if (this.fromCell) {
        this.$emit('getEntered', val)
      }
    }
  },
  methods: {
    searchGene () {
      if (this.fromGene) {
        this.$emit('loadGeneItems')
      } else if (this.fromSerialNo) {
        this.$emit('loadSerialNoItems')
      } else if (this.fromCell) {
        this.$emit('loadCellItems')
      }
    }
  },
  computed: {
    placeholder () {
      return this.fromGene ? '基因名称' : this.fromCell ? '细胞名称' : ''
    }
  }
}

</script>

<style scoped>
</style>
