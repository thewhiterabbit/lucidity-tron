<template>
  <div id="complie-command">
    <small>Solidity verison:</small>
    <VueSelect v-model="currentSolcVer">
      <VueSelectButton v-for="(item,key) in solcVers" :key="key" :value="item" :label="key"/>
    </VueSelect>
    <ComposeCompiler
      :solidity-version="currentSolcVer"
      :source="source"
      @compile-start="handleCompileStart"
      @compile-done="handleCompileResut"
      @compile-status="handleStatus"
    />
    <small>and select contract</small>
    <VueSelect :disabled="!allowDeploy" v-model="currentContractName" style="width: 200px;">
      <VueSelectButton v-for="(item,key) in contracts" :key="key" :value="key" :label="key"/>
    </VueSelect>
    <ComposeDeploy
      :disabled="!allowDeploy"
      :contract="contracts[currentContractName]"
      :contractName="currentContractName"
      @deploy-status="handleStatus"
    />
    <VueButton class="primary" @click="saveAs()">Save to File</VueButton>
    <ComposeShareIt :source="source"/>
    <ComposeUtilsBox/>
    <VueButton
      class="success"
      :icon-left="showResult?'expand_more':'expand_less'"
      @click="toggleResult()"
    >{{showResult?'Hide':'Show'}} Result</VueButton>
    <ComposeConsole v-show="showResult"/>
  </div>
</template>
<script>
import { getVersions } from "@/utils/TronSCSSolc";
import { SaveToFile } from "@/utils/SaveToFile";
import ComposeCompiler from "@/components/PageComposeComponents/ComposeCompiler.vue";
import ComposeDeploy from "@/components/PageComposeComponents/ComposeDeploy.vue";
import ComposeShareIt from "@/components/PageComposeComponents/ComposeShareIt.vue";
import ComposeConsole from "@/components/PageComposeComponents/ComposeConsole.vue";
import ComposeUtilsBox from "@/components/PageComposeComponents/ComposeUtilsBox.vue";

export default {
  components: {
    ComposeCompiler,
    ComposeDeploy,
    ComposeShareIt,
    ComposeConsole,
    ComposeUtilsBox
  },
  data() {
    return {
      allowDeploy: false,
      currentContractName: "",
      showResult: true,
      contracts: [],
      solcVers: [],
      currentSolcVer: ""
    };
  },
  computed: {
    consoleComposeLogs: {
      get() {
        return this.$store.state.consoleComposeLogs;
      },
      set(val) {
        this.$store.commit("setConsoleComposeLogs", val);
      }
    },
    solcVersFormat: function() {
      let retValue = [];
      for (let key in this.solcVers) {
        let item = { ver: key, src: this.solcVers[key] };
        retValue.push(item);
      }
      return retValue;
    }
  },
  props: {
    source: String
  },
  async mounted() {
    this.solcVers = await getVersions();
    this.currentSolcVer = this.solcVers[Object.keys(this.solcVers)[0]];
  },
  methods: {
    handleCompileStart: function() {
      this.consoleComposeLogs = [];
    },
    handleCompileResut: function(data) {
      let { compileSuccess, contracts } = data;
      this.allowDeploy = compileSuccess;
      if (contracts != undefined) {
        this.currentContractName = Object.keys(contracts)[0];
        this.contracts = contracts;
      }
    },
    handleStatus: function(data) {
      this.consoleComposeLogs.push(data);
    },
    saveAs: function() {
      SaveToFile(
        this.source,
        this.currentContractName.substring(1) + window.Date.now() + ".solc"
      );
    },
    toggleResult: function() {
      this.showResult = !this.showResult;
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 100);
    },
    detectSolVer: function(val) {
      let result = val.match(/\^(.*?);/g);
      if (result != null) {
        let sourceVersion = result[0].substr(1).slice(0, -1);
        let findVersion = this.solcVers[sourceVersion];
        if (findVersion != undefined) this.currentSolcVer = findVersion;
      }
    }
  }
};
</script>
<style>
#complie-command > * {
  margin: 5px;
}

#complie-command {
  display: block;
  position: fixed;
  bottom: 0px;
  width: 100%;
  background: rgb(12, 22, 27);
  box-shadow: 0px 0px 10px #000;
}
</style>
