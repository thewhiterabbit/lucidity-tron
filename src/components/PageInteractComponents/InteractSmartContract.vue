<template>
  <div class="interact-smartcontract">
    <div class="contract-overview">
      <div class="logo-container">
        <img :src="info.logo">
      </div>
      <p>
        <small>Contract name:</small>
        {{ contractName }}
      </p>
      <p>
        <small>Creator:</small>
        <a
          target="_blank"
          :href="tronExplorerLink"
        >{{isMobile? creator.substr(0, 5) + "..."+ creator.substr(29, 34):creator}}</a>
      </p>
      <p>
        <small>Dapp website:</small>
        <a
          target="_blank"
          :href="info.dapp==undefined?'':AddUrlProtocol(info.dapp)"
        >{{info.dapp==undefined?"This contract have not verifed yet":info.dapp}}</a>
      </p>
      <p>
        <small>Contract balance:</small>
        {{formatNum(currentBalance)}}
        <small class="unit">trx</small>
        <span>|</span>
        <small>Show TRC10 balance</small>
        <VueSwitch v-model="showTRC10"></VueSwitch>
      </p>

      <p v-if="showTRC10" v-for="token in currentTokens" :key="token.id">
        <small>> Token ({{token.id}}):</small>
        <small>{{formatNum(token.balance)}}</small>
        <small class="unit">{{token.name}}</small>
      </p>

      <p>
        <VueButton
          class="warning"
          style="height:15px; font-size:small"
          icon-left="code"
          @click="showSource=!showSource"
        >{{showSource?"Hide":"Show"}} source</VueButton>
        <monaco-editor
          v-show="showSource"
          id="source-contract"
          v-model="source"
          language="sol"
          theme="vs-dark"
          :options="options"
        ></monaco-editor>
      </p>
    </div>
    <VueTabs :tab-id.sync="tabId" group-class="primary" animate class="contract-tabs">
      <VueTab id="ReadTab" label="Read" icon="visibility">
        <div class="contract-content">
          <p class="contract-content-header">List function you can call without pay anything</p>
          <div v-for="(entry,key) in this.viewFuntions" :key="key">
            <EntryContract :entry="entry" :address="address"/>
          </div>
          <p class="contract-content-warning" v-if="this.viewFuntions.length==0">
            <small>No function found</small>
          </p>
        </div>
      </VueTab>
      <VueTab id="WriteTab" label="Write" icon="assignment">
        <div class="contract-content">
          <p class="contract-content-header">Run these functions with Trx or Token</p>
          <div v-for="(entry,key) in this.payableFuntions" :key="key">
            <EntryContract :entry="entry" :address="address"/>
          </div>
          <p class="contract-content-warning" v-if="this.payableFuntions.length==0">
            <small>No function found</small>
          </p>
        </div>
        <div class="contract-content">
          <p class="contract-content-header">Run these functions will consume Trx or Energy</p>
          <div v-for="(entry,key) in this.nonePayableFuntions" :key="key">
            <EntryContract :entry="entry" :address="address"/>
          </div>
          <p class="contract-content-warning" v-if="this.nonePayableFuntions.length>0">
            <small>No function found</small>
          </p>
        </div>
      </VueTab>
      <VueTab id="EventTab" label="Events" icon="flash_on">
        <div class="contract-content">
          <div v-for="(entry,key) in this.events" :key="key">
            <EntryContract :entry="entry" :address="address"/>
          </div>
          <p class="contract-content-warning" v-if="this.events.length==0">
            <small>No event found</small>
          </p>
        </div>
      </VueTab>
    </VueTabs>
  </div>
</template>

<script>
import EntryContract from "./EntryContract.vue";
import { getTronExplorer, getCurrentNet } from "@/utils/Tron";
import { AddUrlProtocol } from "@/utils/AddUrlProtocol";
import axios from "axios";
import MonacoEditor from "vue-monaco";
import { isMobile } from "mobile-device-detect";

export default {
  name: "InteractSmartContract",
  props: {
    contract: Object
  },
  data() {
    return {
      showTRC10: false,
      source: `This contract have not verifed yet. Contact contract's owner verified for trusted,
If you owned this contract, go to: https://omofomo.io/#/verify to verify it`,
      info: {},
      options: { automaticLayout: true, fontSize: 10 },
      showSource: false,
      tabId: "ReadTab",
      currentTokens: [],
      currentBalance: 0
    };
  },
  async mounted() {
    let currentNet = getCurrentNet();
    let self = this;
    const liveUpdateAccount = () => {
      if (window.tronWeb && window.tronWeb.ready) {
        self.updateAccount();
      } else {
        setTimeout(liveUpdateAccount, 2000);
      }
    };

    liveUpdateAccount();
    try {
      this.source = (await axios.get(
        `https://raw.githubusercontent.com/omofomo/lucidity-ide.verify/master/${currentNet}/${window.tronWeb.address.fromHex(
          this.contract.contract_address
        )}/source.sol`
      )).data;
      this.info = (await axios.get(
        `https://raw.githubusercontent.com/omofomo/lucidity-ide.verify/master/${currentNet}/${window.tronWeb.address.fromHex(
          this.contract.contract_address
        )}/info.json`
      )).data;
      this.$alert("Warning!", "This contract source isn't ensure match bytecode on blockchain. This source code is for reference purpose!");
    } catch (e) {
      this.$alert("Notice!", "Contract not verifed, no source code available");
    }
  },
  computed: {
    isMobile() {
      return isMobile;
    },
    abi: function() {
      return this.contract.abi;
    },
    address: function() {
      return this.contract.contract_address;
    },
    contractName: function() {
      return this.contract.name;
    },
    creator: function() {
      return window.tronWeb.address.fromHex(this.contract.origin_address);
    },
    tronExplorerLink: function() {
      return getTronExplorer() + "/address/" + this.creator;
    },
    viewFuntions: function() {
      return this.abi.entrys.filter(
        entry =>
          entry.type == "Function" &&
          (entry.stateMutability == "View" || entry.stateMutability == "Pure")
      );
    },
    payableFuntions: function() {
      return this.abi.entrys.filter(
        entry => entry.type == "Function" && entry.stateMutability == "Payable"
      );
    },
    nonePayableFuntions: function() {
      return this.abi.entrys.filter(
        entry =>
          entry.type == "Function" && entry.stateMutability == "Nonpayable"
      );
    },
    events: function() {
      return this.abi.entrys.filter(entry => entry.type == "Event");
    }
  },
  methods: {
    formatNum: input => {
      return Number(input).toLocaleString();
    },
    AddUrlProtocol: function(url) {
      return AddUrlProtocol(url);
    },
    async updateAccount() {
      let contractAccount = await window.tronWeb.trx.getAccount(
        this.contract.contract_address
      );
      this.currentBalance =
        contractAccount.balance != undefined
          ? contractAccount.balance / 1e6
          : 0;
      let listTokens = await window.tronWeb.trx.listTokens();
      this.currentTokens = [];
      if (contractAccount.assetV2 != undefined) {
        contractAccount.assetV2.forEach(item => {
          let token = {};
          token.id = item.key;
          token.name = listTokens.find(i => i.id == token.id).abbr;
          token.balance = item.value;
          this.currentTokens.push(token);
        });
      }
    }
  },
  components: { EntryContract, MonacoEditor }
};
</script>
<style type="text/css">
.interact-smartcontract {
  display: block;
  margin: 0 auto;
  width: 90%;
}

.contract-overview {
  background: #1005;
  padding: 20px;
  margin: 20px 0px;
  border-radius: 5px;
}

.contract-overview small {
  color: grey;
  padding-right: 5px;
}
.contract-tabs {
  width: 100%;
  background: #0003;
  border-radius: 5px;
}
.contract-tabs span {
  font-size: small;
}
.contract-content {
  padding: 5px 20px 5px 20px;
}
.contract-content-header {
  text-align: center;
  padding: 5px;
  margin: 0px;
  border: dashed 0.1px rgb(48, 55, 72);
  background-color: #1d2935;
  color: grey;
}
.contract-content-warning {
  text-align: center;
  color: grey;
}
.logo-container {
  width: 70px;
  height: 70px;
  float: right;
  position: relative;
  top: 0px;
  right: -10px;
  border: solid 0.5px grey;
  border-radius: 3px;
  padding: 5px;
  background: #282a31;
}
.logo-container > img {
  object-fit: scale-down;
  height: 70px;
  width: 100%;
}
#source-contract {
  width: 100%;
  margin: 10px auto;
  height: 300px;
}
</style>
