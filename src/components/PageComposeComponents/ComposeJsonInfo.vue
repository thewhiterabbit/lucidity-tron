<template>
  <span class="json-info">
    <span @click="showInfoBox">{{title}}</span>
    <VueModal v-if="showInfo" :title="title+ ' Info'" locked class="info-box">
      <Tree :data="object"/>
      <div slot="footer" class="actions">
        <VueButton
          class="success"
          v-copy="json"
          v-copy:callback="updateStatusCopy"
        >{{statusCopy}}</VueButton>
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
      object:{},
      statusCopy:"Copy"
    };
  },
  components: { Tree },
  props: {
    title: String,
    json: String
  },
  mounted() {},
  methods: {
    showInfoBox: async function() {
      this.object = JSON.parse(this.json);
      this.statusCopy= "Copy";
      this.showInfo = true;
    },
    updateStatusCopy: function() {
      this.statusCopy = "Copied!";
    }
  }
};
</script>

<style>
.json-info {
    color: #42b983;
    /* border: 0.1px solid white; */
    border-radius: 5px;
    background: #ffffff17;
    cursor: pointer;
    padding: 0px 10px 0px 10px;
}
.json-info:hover{
  color: #8fdfbb;
}
.json-info .info-box {
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
