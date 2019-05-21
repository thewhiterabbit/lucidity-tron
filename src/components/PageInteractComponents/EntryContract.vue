<template>
  <div class="contract-entry">
    <p>
      <small>{{entry.type}}</small>
      {{entry.name}}
    </p>
    <template v-if="entry.type!='Event'">
      <VueInput
        v-for="(input,index) in entry.inputs"
        :key="index"
        :placeholder="input.name +' - ' + input.type"
        v-model="submitValues[index]"
      />
      <template v-if="entry.stateMutability=='Payable'">
        <div class="payable">
          <VueSelect v-model="tokenId" placeholder="Select TRX or token to send">
            <VueSelectButton value="0" :label="`TRX: ${formatNum(currentBalance)} sun`"/>
            <small id="divider">- Or TRC10 token-</small>
            <VueInput v-model="tokenSearch" placeholder="Search" icon-left="search"/>

            <VueSelectButton
              v-for="(token,key) in currentTokensFilter"
              :key="key"
              :value="token.id"
              :label="`${token.id}: ${formatNum(token.balance)} ${token.name}`"
            />
          </VueSelect>
          <VueInput v-show="tokenId" :placeholder="`Amount ${tokenId==0?'sun':'token'} to Send`" v-model="totalValue"/>

          <VueButton
            :loading-secondary="loading"
            class="success"
            icon-left="send"
            @click="Send"
          >Send</VueButton>
        </div>
      </template>
      <template v-else-if="entry.stateMutability=='Nonpayable'">
        <VueButton :loading-secondary="loading" class="success" icon-left="send" @click="Send">Send</VueButton>
      </template>
      <template v-else>
        <VueButton :loading-secondary="loading" class="success" icon-left="send" @click="Call">Call</VueButton>
      </template>
      <div class="contract-result" :class="{event:(entry.type=='Event')}" v-html="result"></div>
    </template>
    <template v-if="entry.type=='Event'">
      <VueButton
        :loading-secondary="loading"
        class="success"
        icon-left="send"
        @click="ToggleEvent(entry.name)"
      >{{isLiveUpdate?"Stop":"Show"}} Live Event</VueButton>
      <VueButton
        class="success"
        icon-left="search"
        @click="showFilterControl=!showFilterControl"
      >{{showFilterControl?"Hide":"Show"}} filter</VueButton>
      <VueButton class="flat primary" icon-left="delete" @click="eventResults=[]">Clear</VueButton>
      <div class="filter-group" v-if="showFilterControl">
        <VueInput
          v-for="(input,index) in entry.inputs"
          :key="index"
          :placeholder="input.name +' - ' + input.type"
          v-model="filterValues[input.name]"
        />
        <VueButton
          class="success"
          icon-left="search"
          @click="eventFilter()"
          :loading-secondary="loadingFilter"
        >Filter</VueButton>
      </div>
      <div class="contract-result" :class="{event:(entry.type=='Event')}">
        <div class="event-grid" v-for="(event,index) in eventResults" :key="index">
          <div>⚡{{convertDate(event.timestamp)}}</div>
          <div>
            <a
              target="_blank"
              :href="getTronExplorer() +'/transaction/' + event.transaction"
            >{{event.transaction.substr(0, 15)}}...</a>
          </div>
          <div>{{JSON.stringify(event.result)}}</div>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
import { getTronExplorer, formatOutput, formatInput } from "@/utils/Tron";
import axios from "axios";

export default {
  name: "EntryContract",
  props: {
    entry: Object,
    address: String
  },
  data: () => {
    return {
      totalValue: "",
      tokenId: "",
      submitValues: {},
      contract: {},
      result: "",
      filterValues: {},
      eventResults: [],
      contractWatch: {},
      isLiveUpdate: false,
      loading: false,
      loadingFilter: false,
      showFilterControl: false,
      currentTokensFilter: [],
      tokenSearch: ""
    };
  },
  computed: {
    submitValueFormat: function() {
      let submitValueFormat = [];
      for (let i in this.submitValues) {
        let inputType = this.entry.inputs[i].type;
        let inputValue = this.submitValues[i];
        //bytes input
        submitValueFormat.push(formatInput(inputValue, inputType));
      }
      return submitValueFormat;
    },
    filterValuesFormat: function() {
      let filterValuesFormat = {};
      for (let key in this.filterValues) {
        if (this.filterValues[key] != "") {
          filterValuesFormat[key] = this.filterValues[key];
        }
      }
      return filterValuesFormat;
    },
    currentTokens: function() {
      return this.$store.state.currentTokens;
    },
    currentBalance: function() {
      return this.$store.state.currentBalance;
    }
  },
  watch: {
    tokenSearch: function(value) {
      this.currentTokensFilter = this.currentTokens.filter(item => {
        console.log(
          value == "" ||
            item.name.indexOf(value) > -1 ||
            item.id.indexOf(value) > -1
        );

        return (
          value == "" ||
          item.name.indexOf(value) > -1 ||
          item.id.indexOf(value) > -1
        );
      });
    }
  },
  mounted: function() {
    this.contract = window.tronWeb.contract([this.entry], this.address);
    this.currentTokensFilter = this.currentTokens;
  },
  methods: {
    formatNum: input => {
      return Number(input).toLocaleString();
    },
    getTronExplorer: function() {
      return getTronExplorer();
    },
    convertDate: function(timestamp) {
      let date = new Date(timestamp);
      return date.toLocaleString("vi-vn");
    },
    Call: async function() {
      this.loading = true;
      try {
        let retValue = await this.contract[this.entry.name](
          ...this.submitValueFormat
        ).call();
        this.result = this.formatOutputs(retValue);
      } catch (e) {
        this.$alert("Error", e);
      }
      this.loading = false;
    },
    Send: async function() {
      this.loading = true;
      try {
        let options = {};
        if (!(this.tokenId) || this.tokenId == 0 ) {
          options = { callValue: this.totalValue };
        } else {
          options = { tokenId: this.tokenId, tokenValue: this.totalValue };
        }
        let signedTransaction = await this.contract[this.entry.name](
          ...this.submitValueFormat
        ).send(options);
        let retValue = await this.getTxResult(signedTransaction);
        this.result = this.formatOutputs(retValue);
      } catch (e) {
        if (e.error == "REVERT opcode executed") {
          var res = e.output["contractResult"][0];
          this.result =
            "REVERT opcode executed. " +
            (res == ""
              ? ""
              : "Message: " +
                window.tronWeb
                  .toUtf8(res.substring(res.length - 64, res.length))
                  .trim());
        } else {
          this.result = JSON.stringify(e);
        }
      }
      this.loading = false;
    },
    ToggleEvent: async function(eventName) {
      this.loading = true;
      try {
        if (this.isLiveUpdate) {
          this.contractWatch.stop();
          this.isLiveUpdate = false;
        } else {
          let result = await window.tronWeb.getEventResult(
            this.address,
            0,
            eventName
          );
          this.eventResults = result;

          if (
            this.contractWatch != undefined &&
            typeof this.contractWatch.stop == "function"
          ) {
            this.contractWatch.stop();
          }
          this.contractWatch = await this.contract[eventName]().watch(
            (err, result) => {
              if (err)
                throw console.error("Failed to bind event listener:", err);
              this.eventResults.push(result);
              if (this.eventResults.length > 15) {
                this.eventResults.shift();
              }
            }
          );
          this.isLiveUpdate = true;
        }
        this.loading = false;
      } catch (e) {
        this.loading = false;
        this.$alert(
          "Error",
          "Something went wrong. Details: " + JSON.stringify(e)
        );
      }
    },
    eventFilter: async function() {
      this.loadingFilter = true;
      let result = (await axios.get(
        `${
          window.tronWeb.eventServer.host
        }/event/filter/contract/${window.tronWeb.address.fromHex(
          this.contract.address
        )}/${this.entry.name}?result=${JSON.stringify(this.filterValuesFormat)}`
      )).data;
      this.eventResults = result.map(event => {
        if (event.transaction == undefined) {
          event.transaction = event.transaction_id;
        }
        if (event.timestamp == undefined) {
          event.timestamp = event.block_timestamp;
        }
        return event;
      });
      if (
        this.contractWatch != undefined &&
        typeof this.contractWatch.stop == "function"
      ) {
        this.contractWatch.stop();
      }
      this.loadingFilter = false;
    },
    formatOutputs: function(retValue) {
      if (this.entry.outputs != undefined && this.entry.outputs.length > 1) {
        return this.entry.outputs.map((output, key) => {
          if (output.name != undefined) {
            return (
              output.name +
              ": " +
              formatOutput(retValue[output.name], output.type)
            );
          }
          return formatOutput(retValue[key], output.type);
        });
      } else if (
        this.entry.outputs != undefined &&
        this.entry.outputs.length == 1
      ) {
        if (this.entry.outputs[0].name != undefined) {
          return formatOutput(
            retValue[this.entry.outputs[0].name],
            this.entry.outputs[0].type
          );
        }
        return formatOutput(retValue, this.entry.outputs[0].type);
      } else {
        return "No value return";
      }
    },
    getTxResult: function(txID) {
      let self = this;
      return new Promise((reslove, reject) => {
        let checkResult = async function(txID) {
          const output = await window.tronWeb.trx.getTransactionInfo(txID);
          if (!Object.keys(output).length) {
            return setTimeout(() => {
              checkResult(txID);
            }, 3000);
          }

          if (output.result && output.result == "FAILED") {
            return reject({
              error: window.tronWeb.toUtf8(output.resMessage),
              transaction: txID,
              output
            });
          }

          if (!window.tronWeb.utils.hasProperty(output, "contractResult")) {
            return reject({
              error: "Failed to execute: " + JSON.stringify(output, null, 2),
              transaction: txID,
              output
            });
          }
          if (self.entry.outputs == undefined) {
            return reslove(0);
          }
          const names = self.entry.outputs
            .map(({ name }) => name)
            .filter(name => !!name);
          const types = self.entry.outputs.map(({ type }) => type);
          let decoded = window.tronWeb.utils.abi.decodeParams(
            names,
            types,
            "0x" + output.contractResult[0]
          );
          if (decoded.length === 1) decoded = decoded[0];
          return reslove(decoded);
        };
        checkResult(txID);
      });
    }
  }
};
</script>
<style type="text/css">
.contract-entry {
  padding: 5px 0px;
  border-bottom: 0.5px grey dashed;
}

.contract-result {
  padding: 10px;
  background: #6969693b;
  color: gray;
  white-space: pre-wrap;
  overflow-y: scroll;
  box-shadow: inset 0px 0px 5px black;
  border-radius: 1px;
}

.contract-entry small {
  color: gray;
}

.contract-entry .vue-ui-button {
  margin: 10px;
}
.event-grid {
  font-size: 11px;
  display: grid;
  grid-template-columns: 150px 120px auto;
}
.filter-group {
  padding: 5px 5px 0px 5px;
  border-radius: 5px;
  margin-bottom: 5px;
  box-shadow: 0px 0px 50px #00000080;
  text-align: center;
}
.payable {
  width: fit-content;
  border: solid 1px #3e3e3e;
  padding: 0px 10px 0px 10px;
  /* margin: 10px; */
  background: #172037;
  border-radius: 5px;
  margin: 5px 0px 5px 0px;
}
#divider {
  color: #aaa;
  text-align: center;
  border-top: solid 1px #aaa5;
  margin-top: 3px;
  padding-top: 3px;
}
</style>
