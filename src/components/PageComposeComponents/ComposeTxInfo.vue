<template>
  <span class="tx-info">
    <span @click="showInfoBox">{{id}}</span>
    <VueModal v-if="showInfo" title="Transaction info" locked class="info-box">
      <Tree :data="txInfo"/>
      <div slot="footer" class="actions">
        <VueButton class="danger" @click="showInfo=false">Close</VueButton>
      </div>
    </VueModal>
  </span>
</template>

<script>
import Tree from "vue-json-tree";

export default {
  data() {
    return {
      showInfo: false,
      txInfo: {}
    };
  },
  components: { Tree },
  props: {
    id: String
  },
  mounted() {},
  methods: {
    showInfoBox: async function() {
      this.showInfo = true;
      let result = await window.tronWeb.trx.getTransactionInfo(this.id);
      this.txInfo = result;
    }
  }
};
</script>

<style>
.tx-info {
     color: #42b983;
    border-radius: 5px;
    background: #ffffff17;
    cursor: pointer;
    padding: 0px 10px 0px 10px;
}
.tx-info:hover{
  color: #8fdfbb;
}
.tx-info .info-box {
  color: #fff;
  font-family: Roboto, Avenir, Helvetica, Arial, sans-serif;
  white-space: nowrap;
}
.json-tree-root {
    background-color: #1d2935;
}
.json-tree-paired, .json-tree-row:hover {
    background-color: #172026;
}
.json-tree {
    color: #ffffff;
}
</style>
