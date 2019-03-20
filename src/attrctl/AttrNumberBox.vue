<template>
  <div class="el-input-number">
    <span role="button" class="el-input-number__decrease is-disabled" :class="{'_disabled': isDisabled || attr.attrValue.enable}"
          disabled="disabled" @click="decrease">
      <i class="minus icon"></i>
    </span>
    <span role="button" class="el-input-number__increase" @click="increase" :class="{'_disabled': attr.attrValue.enable}">
      <i class="plus icon"></i>
    </span>
    <div class="el-input">
      <input class="el-input__inner" v-model="value" type="number" :class="{'_disabled': attr.attrValue.enable}">
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      isDisabled: false,
      disabled: false
    }
  },
  props: ['attr', 'index', 'attributes'],
  computed: {
    value: {
      get () {
        if (this.attr.attrValue.value !== null) {
          return this.attr.attrValue.value.toString()
        }
      },
      set (val) {
        this.attr.attrValue.value = Number(val)
      }
    }
  },
  methods: {
    decrease () {
      if (this.attr.attrValue.value <= 1) {
        this.disabled = true
        return
      }
      this.attr.attrValue.value--
    },
    increase () {
      this.attr.attrValue.value++
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
    transition: border-color .2s cubic-bezier(.645, .045, .355, 1);
    width: 100%;
  }

</style>
