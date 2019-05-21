<template>
  <div class="main">
    <div id="contract-find">
      <VueInput v-model="address" placeholder="Type the address of a smartcontract"/>
      <VueButton
        class="primary"
        icon-left="search"
        @click="load()"
        :loading-secondary="loading"
      >Show contract</VueButton>
    </div>
    <InteractSmartContract v-if="contract['abi']" :contract="contract"></InteractSmartContract>
    <template v-else>
      <div class="list-contract-title">Let's try some examples:</div>
      <div class="list-contract">
        <div class="contract" v-for="(contract, key) in currentNetExample" :key="key">
          <div class="contract-name">{{ contract.name }}</div>
          <a
            class="contract-address"
            target="_blank"
            :href="`#/interact/${contract.address}`"
          >{{ contract.address }}</a>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import InteractSmartContract from "./PageInteractComponents/InteractSmartContract.vue";

export default {
  name: "PageInteractSmartContract",
  data: () => {
    return {
      address: "",
      contract: {},
      loading: false,
      exampleContract: {
        mainnet: [
          {
            name: "ICEDIUM (ICD)",
            address: "TPRuU2GbXPwvvSuggE4xKMRtzsfwYfvBWq"
          },
          {
            name: "BlockchainCutiesCore",
            address: "TQuCYa3yi11s24VyR2Ye7XcWDG1MUJEbJq"
          },
          {
            name: "TempleOfTron",
            address: "TTxXvZLV9rJSmbKsUJC7XaG4L69TnmAWCs"
          },
          {
            name: "P3T",
            address: "TEEEQGmbZoeHA24EVG91b6u9zsbWUfefPF"
          },
          {
            name: "TronMarket",
            address: "TPmSRkEnJTSUj7pshdPqy26HdL6hj9YJiC"
          }
        ],
        testnet: [
          {
            name: "Greeter",
            address: "TWpamXALsge2ExYjKpN3X6Yg9yTFTVeNbx"
          },
          {
            name: "TRX20 Token",
            address: "TPfTpr3KkkUcPSkpcNN1QXCDuDPsjC19Ai"
          },
          {
            name: "Ballot",
            address: "TFejsqTFpuTLR5RAiaditTnQNLt3Jy8ywD"
          }
        ]
      }
    };
  },
  computed: {
    currentNetExample() {
      return this.$store.state.currentNet === "https://api.trongrid.io"
        ? this.exampleContract.mainnet
        : this.exampleContract.testnet;
    }
  },
  watch: {
    address(val) {
      this.$router.replace({
        name: "PageInteractSmartContractUrl",
        params: { Address: val }
      });
    }
  },
  components: { InteractSmartContract },
  mounted() {
    if (this.$route.params.Address) {
      setTimeout(async () => {
        this.address = this.$route.params.Address;

        try {
          await this.load();
        } catch (e) {
          this.$alert("Warning", e);
        }
      }, 2000);
    }
  },
  methods: {
    async load() {
      this.loading = true;
      try {
        this.abi = {};
        this.contract = {};
        if (!window.tronWeb)
          throw "You must install Tronlink to interact with contract";
        if (!(window.tronWeb && window.tronWeb.ready))
          throw "You must login Tronlink to interact with contract";
        let smartcontract = await window.tronWeb.trx.getContract(
          this.address.trim()
        );
        this.contract = smartcontract;
      } catch (e) {
        this.$alert("Warning", e);
      }
      this.loading = false;
    }
  }
};
</script>

<style type="text/css">
.main {
  display: block;
  margin: 0 auto;
}

#contract-find > * {
  display: block;
  margin: 10px auto;
  max-width: 310px;
}
.list-contract {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.contract {
  padding: 10px;
  width: 300px;
  font-size: small;
  text-align: center;
  border-radius: 5px;
  border: 1px solid #2c3e50;
  margin: 10px;
  height: 60px;
}
.contract-name {
  padding: 10px;
}
.contract-address {
  border: solid 1px #2f5054;
  background: #213b3f;
  padding: 5px;
  border-radius: 5px;
  color: #fff;
}
.list-contract-title {
  text-align: center;
  margin-top: 20px;
}
</style>
