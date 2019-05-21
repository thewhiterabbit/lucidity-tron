<template>
  <span>
    <VueButton class="danger" @click="showUtilsBox=!showUtilsBox" icon-left="extension">Swiss Knife</VueButton>
    <transition name="slide-fade">
      <div id="utils-box" class="main-content" v-if="showUtilsBox">
        <div class="header">Swiss Knife</div>
        <div class="util-box">
          <h4>Address Convert Tools</h4>
          <VueFormField title="Address in Base58">
            <VueInput v-model="addressBase58" placeholder="Address in Base58"/>
          </VueFormField>
          <VueFormField title="Address in Hex">
            <VueInput v-model="addressHex" placeholder="Address in Hex"/>
          </VueFormField>
          <VueFormField title="Address in 0xCheckSum">
            <VueInput v-model="address0xCheckSum" placeholder="Address in 0xCheckSum"/>
          </VueFormField>
          <div class="close-button" @click="showUtilsBox=false">x</div>
        </div>
        <div class="util-box">
          <h4>String Hex to Utf8</h4>
          <VueFormField title="Address in Hex">
            <VueInput v-model="stringHex" placeholder="Hex String"/>
          </VueFormField>
          <VueFormField title="Address in Utf8">
            <VueInput v-model="stringUtf8" placeholder="Utf8 String "/>
          </VueFormField>
        </div>
        <small>Need more? Please request in Discord Channel</small>
      </div>
    </transition>
  </span>
</template>

<script>
import { toChecksumAddress } from "@/utils/ToCheckSumAddress";

export default {
  data() {
    return {
      showUtilsBox: false,
      addressBase58: "",
      addressHex: "",
      address0xCheckSum: "",
      stringUtf8: "",
      stringHex: ""
    };
  },
  watch: {
    addressBase58: function(newVal, oldVal) {
      if (newVal != oldVal) {
        this.addressHex = window.tronWeb.address.toHex(newVal);
        this.address0xCheckSum = toChecksumAddress(this.addressHex);
      }
    },
    addressHex: function(newVal, oldVal) {
      if (newVal != oldVal) {
        this.address0xCheckSum = toChecksumAddress(newVal.replace(/^41/, "0x"));
        this.addressBase58 = window.tronWeb.address.fromHex(newVal);
      }
    },
    address0xCheckSum: function(newVal, oldVal) {
      if (newVal != oldVal) {
        this.addressHex = newVal.replace(/^0x/, "41");
        this.addressBase58 = window.tronWeb.address.fromHex(this.addressHex);
      }
    },
    stringHex: function(newVal, oldVal) {
      if (newVal != oldVal) {
        try {
          this.stringUtf8 = window.tronWeb.toUtf8(newVal);
        } catch (e) {
          this.stringUtf8 = e.toString();
        }
      }
    }
  }
};
</script>

<style>
#utils-box {
  display: block;
  position: fixed;
  right: 0px;
  top: 0px;
  background: #ffffff;
}
#utils-box .close-button {
  position: fixed;
  top: 0px;
  right: 20px;
  cursor: pointer;
  font-size: 50px;
  font-family: monospace;
  color: #42b983;
}
#utils-box .close-button:hover {
  color: #4d9e79;
}
#utils-box .header {
  padding: 20px;
  font-size: x-large;
  background: #16212a;
  margin-bottom: 10px;
  color: #3faf7d;
}
#utils-box.main-content {
  z-index: 999;
  /* display: none; */
  margin: 0px;
  width: 500px;
  text-align: center;
  position: fixed;
  top: 0px;
  right: 0px;
  height: 100%;
  box-shadow: 0px 0px 10px #000;
  background: #1d2935;
  font-size: small;
}
#utils-box .util-box {
  background: #0c161b69;
  padding: 10px;
  margin: 5px;
  border-radius: 5px;
  transition: all 0.8s ease;
}
#utils-box .util-box:hover {
  background: #0c161b;
}
#utils-box .util-box h4 {
  font-size: medium;
  border-bottom: solid 1px #444;
  padding-bottom: 10px;
}
</style>
