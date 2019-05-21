<template>
  <div class="verify-contract">
    <div class="verify-content">
      <div id="contract-find">
        <VueInput
          class="input-address"
          v-model="address"
          placeholder="Smart contract's address on Main Net"
        />
      </div>
    </div>
    <div class="verify-content">
      <p>
        <small>Source code</small>
      </p>
      <monaco-editor
        id="source-field"
        v-model="sourceCode"
        language="sol"
        theme="vs-dark"
        :options="options"
      ></monaco-editor>
    </div>
    <div class="verify-content">
      <p>
        <small>Solidity compile info</small>
      </p>
      <VueInput class="compile-info" v-model="contractName" placeholder="Contract's name deployed"/>
      <VueSelect
        style="width:400px"
        class="compile-info"
        v-model="currentSolcVer"
        id="sol-ver-select"
        placeholder="Solidity version"
      >
        <VueSelectButton v-for="(item, key) in solcVers" :key="key" :value="item" :label="key"/>
      </VueSelect>
      <VueSwitch class="compile-info" v-model="opmize">
        <small>Optimization</small>
      </VueSwitch>
      <span class="slot">
        <small>| Runs(Optimizer):</small>
      </span>
      <VueInput
        class="compile-info"
        v-model="optimizerRuns"
        placeholder="Runs (Optimizer)"
        style="min-width:80px"
      />
    </div>
    <div class="verify-content">
      <VueInput class="input-info" style="width:50%" v-model="info.logo" placeholder="Url of logo"/>
      <VueInput class="input-info" style="width:50%" v-model="info.dapp" placeholder="Url of DApp"/>
    </div>

    <VueButton
      id="verified-btn"
      class="warning"
      icon-left="verified_user"
      @click="verify()"
      :loading-secondary="verifing"
    >Sign and Verify!</VueButton>
    <small>Have trouble when verified? Feel free to contact me on Discord Channel</small>
  </div>
</template>

<script>
import MonacoEditor from "vue-monaco";
import { getAllVersions } from "@/utils/TronSCSSolc";
import axios from "axios";

export default {
  data() {
    return {
      address: "",
      loading: false,
      sourceCode: "Put your single file of smartcontract here.",
      options: { automaticLayout: true, fontSize: 12 },
      solcVers: [],
      currentSolcVer: "",
      opmize: true,
      verifing: false,
      contractName: "",
      optimizerRuns: 0,
      info: {
        logo: "",
        dapp: ""
      }
    };
  },
  components: { MonacoEditor },
  async mounted() {
    this.solcVers = await getAllVersions();
    this.$alert(
      "Warning",
      "Contract verify function temporary shutdown! Sorry about this inconvenience "
    );
  },
  methods: {
    async verify() {
      const isMainNet =
        window.tronWeb.eventServer.host === "https://api.trongrid.io";
      this.verifing = true;

      try {
        let signature = await window.tronWeb.trx.sign(
          window.tronWeb.sha3("I'm creator")
        );
        let result = await axios.post(
          "https://tronscs.herokuapp.com/verify",
          // "http://localhost/verify",
          {
            mainNet: isMainNet,
            source: this.sourceCode,
            address: this.address,
            contractName: this.contractName,
            sol: this.currentSolcVer,
            opmize: this.opmize,
            optimizerRuns: this.optimizerRuns,
            info: this.info,
            signature: signature
          }
        );

        if (result.data.result === "SUCCESS") {
          this.$alert("Success", "Contract verified!");
        } else {
          this.$alert(
            "Contract verify failed",
            `${JSON.stringify(result.data.error)}`
          );
        }
      } catch (e) {
        this.$alert(
          "Contract verify failed",
          `Can't not connect to verify server`
        );
      }

      this.verifing = false;
    }
  }
};
</script>

<style type="text/css">
.verify-contract {
  display: block;
  margin: 10px 100px;
  /*width: fit-content;*/
  text-align: center;
}

.vv-msg {
  font-size: 10px;
  color: red;
}

#source-field {
  width: 100%;
  margin: 10px auto;
  height: 200px;
  text-align: left;
}

.verify-content {
  background: #0003;
  padding: 5px 0;
  margin: 5px 0;
  border-radius: 5px;
}

.input-address {
  text-align: center;
}

.input-info,
.compile-info {
  padding: 5px;
}

#verified-btn {
  width: 100%;
}
</style>
