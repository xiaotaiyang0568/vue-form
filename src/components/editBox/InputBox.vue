<template>
  <div v-if="!forOrderNo" class="column" style="width: 50% !important;">
    <div class="ui form" style="margin-bottom: 1rem;">
      <div class="field">
        <label>{{label}}</label>
        <div class="ui mini icon input" :class="{'disabled': isEmployee}">
          <input v-if="forCustomerName" class="right floated" v-model="params.customerName" type="text" :placeholder="label">
          <input v-else-if="forEmployeeName" class="right floated" v-model="params.employeeName" type="text" :placeholder="label">
        </div>
      </div>
    </div>
  </div>
  <div v-else class="column">
    <div class="ui form" style="margin-bottom: 1rem;">
      <div class="field">
        <label>{{label}}</label>
        <div class="ui mini icon input" :class="{'disabled': isEmployee}">
          <input class="right floated" v-model="params.orderId" type="text" :placeholder="label">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['params', 'label', 'isEmployee', 'forCustomerName', 'forEmployeeName', 'forOrderNo']
}
</script>
