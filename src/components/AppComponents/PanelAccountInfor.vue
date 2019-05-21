<template>
  <div>
    <div
      id="account-toggle"
      class="round primary"
      icon-left="account_circle"
      @click="showAccountPanel=true"
    >
      <VueIcon icon="account_circle" class="medium"/>
      Hi!
      {{ defaultAddress.base58 && `${defaultAddress.base58.substr(0, 5)}...${defaultAddress.base58.substr(29, 34)}` || "Tronics" }}
    </div>
    <transition name="slide-fade">
      <div id="account-info" class="main-content" v-show="showAccountPanel">
        <h3
          class="current-net"
          :style="{background: currentNetName === 'MainNet' ? '#42b983' : '#f44336'}"
        >{{ currentNetName }}</h3>
        <h4>
          Account Address
          <VueButton class="warning flat small" @click="updateAccount()">Refresh</VueButton>
        </h4>
        <p>
          <small class="field">In hex</small>
          <a
            target="_blank"
            :href="`${getTronExplorer()}/address/${defaultAddress.base58}`"
          >{{ isMobile? defaultAddress.hex.substr(0, 10) + "..." + defaultAddress.hex.substr(32, 42): defaultAddress.hex }}</a>
        </p>
        <p>
          <small class="field">In base58</small>
          <a
            target="_blank"
            :href="`${getTronExplorer()}/address/${defaultAddress.base58}`"
          >{{ isMobile? defaultAddress.base58.substr(0, 10) + "..."+ defaultAddress.base58.substr(24, 34): defaultAddress.base58 }}</a>
        </p>
        <div class="balance">
          <p class="field">Tron balance:</p>
          <p class="number">{{ formatNum(balance) }}</p>
          <p class="unit">trx</p>
          <p style="grid-column:1/4">
            <VueButton
              style="width:100%"
              class="warning"
              v-if="currentNetName === 'ShastaTestNet'"
              @click="faucet()"
              :loading-secondary="faucetloading"
            >Faucet 100k Shasta Test TRX</VueButton>
          </p>
          <p class="field">Total Energy:</p>
          <p class="number">{{ formatNum(totalEnergy) }}</p>
          <p class="unit"></p>
          <p class="field">Energy used:</p>
          <p class="number">{{ formatNum(energyUsed) }}</p>
          <p class="unit"></p>
          <p class="field">Remain Energy:</p>
          <p class="number">{{ formatNum(totalEnergy-energyUsed) }}</p>
          <p class="unit"></p>
          <VueInput
            v-model="amountFreeze"
            placeholder="Type amount TRX to Freeze"
            style="grid-column: 1 / 4;"
          />
          <VueButton
            style="grid-column: 1 / 4;"
            class="primary"
            @click="freeze()"
            :loading-secondary="loading"
          >❄️ Freeze to get Energy</VueButton>
          <p style="text-align:center;grid-column:1/4">
            <small class="field">(1 TRX = {{ currentEnergyPrice }} Energy)</small>
          </p>
          <p
            style="text-align:center;grid-column:1/4;border-bottom: 1px solid darkgray;f"
          >TRC10 balances</p>
          <div class="balance" style="grid-column: 1 / 4;    height: 80px;    overflow: scroll;">
            <template v-for="(token,index) in currentTokens">
              <p class="field" :key="`id${index}`">TRC10 {{token.id}}:</p>
              <p class="number" :key="`balance${index}`">{{ formatNum(token.balance) }}</p>
              <p class="unit" :key="`name${index}`">{{token.name}}</p>
            </template>
          </div>
        </div>
        <div class="close-button" @click="showAccountPanel = false">x</div>
      </div>
    </transition>
  </div>
</template>

<script>
import { getTronExplorer } from "@/utils/Tron";
import { isMobile } from "mobile-device-detect";

export default {
  data() {
    return {
      showAccountPanel: false,
      defaultAddress: {
        hex: "41000000",
        base58: "Tronics"
      },
      balance: 0,
      totalEnergy: 0,
      energyUsed: 0,
      amountFreeze: null,
      loading: false,
      faucetloading: false,
      currentEnergyPrice: 0
    };
  },
  computed: {
    isMobile() {
      return isMobile;
    },
    currentNetName() {
      return this.$store.state.currentNetName;
    },
    currentTokens: {
      get: function() {
        return this.$store.state.currentTokens;
      },
      set: function(newValue) {
        this.$store.commit("setCurrentTokens", newValue);
      }
    }
  },
  mounted() {
    const getAccountInfo = () => {
      if (window.tronWeb && window.tronWeb.ready) {
        this.updateAccount();
      } else {
        setTimeout(getAccountInfo, 10000);
      }
    };

    getAccountInfo();
  },
  methods: {
    getTronExplorer: () => {
      return getTronExplorer();
    },
    async updateAccount() {
      this.defaultAddress = window.tronWeb.defaultAddress;
      window.gtag("set", { user_id: window.tronWeb.defaultAddress.base58 });
      const balance = await window.tronWeb.trx.getBalance(
        this.defaultAddress.hex
      );
      this.balance = balance / 1000000;
      this.$store.commit("setCurrentBalance", balance);

      let myAccount = await window.tronWeb.trx.getAccount(
        this.defaultAddress.hex
      );
      let listTokens = await window.tronWeb.trx.listTokens();
      let currentTokens = [];
      if (myAccount.assetV2 != undefined) {
        myAccount.assetV2.forEach(item => {
          let token = {};
          token.id = item.key;
          token.name = listTokens.find(i => i.id == token.id).abbr;
          token.balance = item.value;
          currentTokens.push(token);
        });
      }
      this.currentTokens = currentTokens;
      const account = await window.tronWeb.trx.getAccount(
        this.defaultAddress.hex
      );
      const accountResource = await window.tronWeb.trx.getAccountResources(
        this.defaultAddress.hex
      );

      this.currentEnergyPrice =
        Math.round(
          (accountResource.TotalEnergyLimit * 100) /
            accountResource.TotalEnergyWeight
        ) / 100;
      this.totalEnergy = accountResource.EnergyLimit || 0;
      this.energyUsed =
        (account.account_resource && account.account_resource.energy_usage) ||
        0;
    },
    formatNum: input => {
      return Number(input).toLocaleString();
    },
    async freeze() {
      this.loading = true;

      try {
        const tx = await window.tronWeb.transactionBuilder.freezeBalance(
          this.amountFreeze * 1000000,
          3,
          "ENERGY"
        );

        const usign = await window.tronWeb.trx.sign(tx);
        const broadcast = await window.tronWeb.trx.broadcast(usign);

        if (broadcast.result) {
          this.$alert(
            "Success",
            `Successfully froze ${this.amountFreeze} TRX!`
          );
        } else {
          this.$alert("Error", "Freezing failed...");
        }
      } catch (e) {
        this.$alert("Error", `Freezing failed: ${e}`);
      }

      this.loading = false;
    },
    async faucet() {
      this.faucetloading = true;

      const tx = await window.tronWeb.fullNode.request(
        "/wallet/easytransferbyprivate",
        {
          privateKey:
            "4E49E081F09C5A9F0A6A9D381FCEDEF130A4CC872AC9592062EA16314381E6A3",
          toAddress: window.tronWeb.defaultAddress.hex,
          amount: 100000 * 1000000
        },
        "post"
      );

      if (tx.result.result) {
        this.$alert("Success", "Faucet success. Enjoy it!");
      } else {
        this.$alert("Error", "Faucet failed!");
      }

      this.faucetloading = false;
    }
  }
};
</script>

<style type="text/css">
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}
#account-toggle {
  z-index: 998;
  position: fixed;
  top: 5px;
  right: 0;
  height: 20px;
  border-radius: 20px 0 0 20px;
  width: 150px;
  transition: all 0.2s ease;
  background: #42b983;
  font-size: small;
  text-align: center;
  padding: 2px 0 0 0;
}
#account-toggle:hover {
  background: #2c3e50;
  padding: 5px 0 0 0;
  top: 0;
  right: 0;
  height: 25px;
  border-radius: 20px 0 0 20px;
  width: 200px;
}
#account-info.main-content {
  z-index: 999;
  /* display: none; */
  margin: 0;
  box-sizing: border-box;
  margin: 0;
  width: 100%;
  max-width: 500px;
  text-align: center;
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  padding: 60px 10px 0 10px;
  box-shadow: 0 0 10px #000;
  background: #1d2935;
}
#account-info .close-button {
  position: fixed;
  top: 0;
  right: 20px;
  cursor: pointer;
  font-size: 50px;
  font-family: monospace;
  color: #42b983;
}
#account-info .close-button:hover {
  color: #4d9e79;
}
.current-net {
  color: #1d2935;
  padding: 20px;
  border-radius: 10px;
}
.balance {
  display: grid;
  grid-template-columns: 120px auto 50px;
  border: dashed 1px;
  border-radius: 10px;
  padding: 10px;
}

.number {
  text-align: right;
  border-left: solid 1px gray;
}

.field {
  color: grey;
}

.unit {
  text-align: left;
  color: grey;
  padding-left: 5px;
}
</style>
