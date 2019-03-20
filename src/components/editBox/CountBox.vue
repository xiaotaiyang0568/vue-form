<template>
  <div class="el-input-number">
    <span role="button" class="el-input-number__decrease is-disabled" :class="{'is-disabled': isDisabled, '_disabled': readonly}" @click="decrease">
      <i class="minus icon"></i>
    </span>
    <span role="button" class="el-input-number__increase" :class="{'_disabled': readonly}" @click="increase">
      <i class="plus icon"></i>
    </span>
    <div class="el-input">
      <input v-model="unit.realValue" class="el-input__inner" :readonly="readonly">
    </div>
  </div>
</template>

<script>
import global from '../../sc_global.js'
export default {
  created () {},
  mounted () {},
  data () {
    return {
      isDisabled: false
    }
  },
  props: ['readonly', 'unit', 'experiment'],
  watch: {
    'unit.realValue': function (val) {
      this.unit.realValue = val
      this.experiment.isModify = true
      this.$emit('modifyUnit', this.experiment.isModify)
    }
  },
  methods: {
    decrease () {
      let unit = this.unit
      if (unit.dataType === global.DataType.ZeroableInteger && unit.realValue <= 0) {
        this.isDisabled = true
        return
      }
      if (unit.dataType === global.DataType.NonZeroInteger && unit.realValue <= 1) {
        this.isDisabled = true
        return
      }
      unit.realValue--
    },
    increase () {
      this.unit.realValue++
    }
  }
}
</script>

<style>
  .el-input-number {
    position: relative;
    display: inline-block;
    width: 110px;
    line-height: 26px;
  }

  .el-input-number__decrease {
    left: 1px;
    border-radius: 4px 0 0 4px;
    border-right: 1px solid #dcdfe6;
  }

  .is-disabled {
    color: #c0c4cc;
    cursor: not-allowed;
  }

  .el-input-number__increase {
    right: 1px;
    border-radius: 0 4px 4px 0;
    border-left: 1px solid #dcdfe6;
  }

  .el-input {
    position: relative;
    font-size: 12px;
    display: block;
    width: 100%;
  }

  .el-input-number__decrease, .el-input-number__increase {
    position: absolute;
    z-index: 1;
    top: 1px;
    width: 28px;
    height: auto;
    text-align: center;
    background: #f5f7fa;
    color: #606266;
    cursor: pointer;
    font-size: 12px;
  }

  .el-input-number .el-input__inner {
    -webkit-appearance: none;
    padding-left: 40px;
    padding-right: 40px;
    text-align: center;
  }

  .el-input__inner {
    -webkit-appearance: none;
    background-color: #fff;
    background-image: none;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    box-sizing: border-box;
    color: #606266;
    display: inline-block;
    font-size: inherit;
    height: 28px;
    line-height: 1;
    outline: none;
    padding: 0 15px;
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
    width: 100%;
  }

</style>
