<template>
  <div id="app">
    <vue-typed-js
      :loop="true"
      :strings="['TRON is one of the largest blockchain-based operating systems in the world','High throughput is achieved by improving the TPS in TRON', 'TRX consistently handles 2,000 transactions per second, 24x7','Tron Virtual Machine is scalability and highly effective smart contract']"
      v-if="currentPage=='PageInteractSmartContract'||currentPage=='PageInteractSmartContractUrl'"
    >
      <div id="main-title">
        <img src="@/assets/logo.png" :style="{height:isMobile?'40px':'55px'}">
        <p>
          <span class="typing"></span>
        </p>
      </div>
    </vue-typed-js>
    <div id="main-title-corner" v-else>
      <img v-if="!isMobile" src="@/assets/logo-solid.png">
    </div>
    <VueGroup
      id="navigator"
      v-model="currentPage"
      class="primary top-indicator inline small-indicator"
      :style="{marginTop:isMobile?'50px':'0px'}"
      indicator
    >
      <VueGroupButton
        class="round"
        value="PageInteractSmartContract"
        icon-left="visibility"
      >Interact</VueGroupButton>
      <VueGroupButton class="round"  v-show="!isMobile" value="PageComposeSmartContract" icon-left="code">Compose</VueGroupButton>
      <VueGroupButton class="round" v-show="!isMobile" value="PageVerifySmartContract" icon-left="verified_user">Verify</VueGroupButton>
      <VueGroupButton class="round" value="PageAuthor" icon-left="help">About us</VueGroupButton>
    </VueGroup>
    <PanelAccountInfor/>
    <LiveSupport/>
    <PromptDialog/>
    <div class="content">
      <router-view/>
    </div>
    <div id="footer" v-show="currentPage!='PageComposeSmartContract'">
      Made with
      <span style="color: #e25555;">&#9829;</span> by
      <a href="#/author">KhanhND69</a>
    </div>
    <div
      id="net-name"
      :style="{background: currentNetName=='MainNet'?'#42b983':'#f44336', left:isMobile?'40px':'220px'}"
    >{{currentNetName}}</div>
  </div>
</template>

<script>
import { mapMutations } from "vuex";
import PanelAccountInfor from "./components/AppComponents/PanelAccountInfor.vue";
import LiveSupport from "./components/AppComponents/LiveSupport.vue";
import PromptDialog from "./components/AppComponents/PromptDialog.vue";
import { isMobile } from "mobile-device-detect";

export default {
  data() {
    return {
      currentPage: ""
    };
  },
  components: { PanelAccountInfor, LiveSupport, PromptDialog },

  mounted() {
    this.currentPage = this.$router.currentRoute.name;
    this.setCurrentNet(
      window.tronWeb != undefined ? window.tronWeb.fullNode.host : ""
    );
    let self = this;
    let liveCheckNet = function() {
      if (window.tronWeb && window.tronWeb.ready) {
        if (self.$store.state.currentNet != window.tronWeb.fullNode.host) {
          self.setCurrentNet(window.tronWeb.fullNode.host);
        }
      }
      setTimeout(liveCheckNet, 1000);
    };
    liveCheckNet();
  },
  computed: {
    isMobile() {
      return isMobile;
    },
    currentNetName() {
      return this.$store.state.currentNetName;
    }
  },
  watch: {
    currentPage: function(val) {
      if (val != null && val != this.$router.currentRoute.name) {
        this.$router.push({ name: val });
      }
    }
  },
  methods: {
    ...mapMutations(["setCurrentNet"])
  }
};
</script>
<style type="text/css">
#app {
  height: 100%;
}

#navigator {
  display: block;
  margin: 0 10px auto;
}

#main-title {
  margin: 0 auto;
  text-align: center;
}
#main-title p {
  color: #3fffa5;
  font-size: small;
  font-family: monospace;
}
#main-title img {
  height: 55px;
  transition: all 0.2s ease;
  box-shadow: 0px 0px 100px #46b581;
  margin: 50px auto;
  border-radius: 10px;
  padding: 0px 0px 0px 10px;
  background: #46b581;
}
#main-title img:hover {
  box-shadow: 0px 0px 200px #46b581;
  filter: brightness(130%);
}
#main-title-corner img {
  z-index: 999;
  position: fixed;
  top: 0px;
  left: 0px;
  height: 30px;
  border-radius: 0px 20px 20px 0px;
}
#alert-box .shell {
  text-align: center;
}

#footer {
  text-align: center;
}
#net-name {
  text-align: left;
  position: fixed;
  top: 0px;
  left: 220px;
  color: white;
  height: 25px;
  padding: 5px 15px 0px 15px;
  z-index: 998;
  box-shadow: 0px 0px 20px 0px #000;
}
</style>
