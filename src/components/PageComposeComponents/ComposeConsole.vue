<template>
  <div id="compile-logs">
    <VRuntimeTemplate 
      class="log"
      v-for="(log,key) in consoleComposeLogs"
      :key="key"
      :style="{color: color[log.type]}"
      :template="'<div>'+log.content+'</div>'"
    />
  </div>
</template>

<script>
import VRuntimeTemplate from "v-runtime-template";
import tx from "@/components/PageComposeComponents/ComposeTxInfo.vue";
import obj from "@/components/PageComposeComponents/ComposeJsonInfo.vue";

export default {
  data() {
    return {
      color: {
        error: "orangered",
        success: "limegreen",
        warning: "yellowgreen",
        info: "blueviolet"
      }
    };
  },
   components: {VRuntimeTemplate,tx,obj},
  computed: {
    consoleComposeLogs: function() {
      let consoleComposeLogs = this.$store.state.consoleComposeLogs;
      if (typeof consoleComposeLogs == "object") {
        return consoleComposeLogs;
      } else {
        return [];
      }
    }
  },
  watch: {
    consoleComposeLogs: function() {
      setTimeout(() => {
        var objDiv = document.getElementById("compile-logs");
        objDiv.scrollTop = objDiv.scrollHeight - objDiv.clientHeight;
      }, 100);
    }
  }
};
</script>

<style>
#compile-logs {
  overflow-y: scroll;
  height: 100px;
  background: #000;
}
#compile-logs .log {
  border-left: 2px solid;
  padding: 0px 0px 0px 5px;
  white-space: pre-wrap;
  font-family: SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono,
    Courier New, monospace;
  font-size: x-small;
}
</style>
