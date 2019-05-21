<template>
  <span>
    <VueButton
      :disable="disabled"
      :loading-secondary="statusDeploying"
      class="accent"
      icon-left="cloud_done"
      @click="showDeployBox"
    >Deploy it!</VueButton>
    <VueModal v-if="showDeploy" title="Deploy" locked class="small" id="deployBox">
      <div>
        <p>
          <small>Input contract name</small>
        </p>
        <VueInput
          v-model="currentContractDeployName"
          placeholder="Your contract name (That will save on blockchain)"
        ></VueInput>
      </div>
      <div class="default-body">
        <p>
          <small>Params for constructor</small>
        </p>
        <VueInput
          v-for="(input,key) in currentContractDeployInputs"
          :key="key"
          v-model="currentContractDeployInputValues[key]"
          :placeholder="input.name +' - ' + input.type"
        />
      </div>
      <div class="advanced-params" v-show="showAdvanced">
        <p>
          <small>Advanced params</small>
        </p>
        <div class="advanced-params-body">
          <VueSelect v-model="tokenId" placeholder="Select TRX or token to send" class="label">
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
          <VueInput
            id="call-value"
            class="value"
            :placeholder="`Amount ${tokenId==0?'sun':'token'} to Send`"
            v-model="totalValue"
          />
          <small class="label">FeeLimit:</small>
          <VueInput class="value" v-model="advanceDeployParam.feeLimit"/>
          <small class="label">User fee percentage:</small>
          <VueInput class="value" v-model="advanceDeployParam.userFeePercentage"/>
          <small class="label">Origin Energy Limit:</small>
          <VueInput class="value" v-model="advanceDeployParam.originEnergyLimit"/>
        </div>
      </div>
      <div slot="footer" class="actions">
        <VueButton
          class="warning"
          @click="showAdvanced=!showAdvanced"
        >{{showAdvanced?"Hide":"Show"}} advanced param</VueButton>
        <VueButton class="primary" @click="deploy()">Deploy</VueButton>
        <VueButton class="danger" @click="showDeploy=false">Close</VueButton>
      </div>
    </VueModal>
  </span>
</template>

<script>
import { FormatNumber } from "@/utils/FormatNumber";
import { formatInput } from "@/utils/Tron";

export default {
  data() {
    return {
      showDeploy: false,
      statusDeploying: false,
      showAdvanced: false,
      advanceDeployParam: {
        feeLimit: 1e9,
        userFeePercentage: 0,
        originEnergyLimit: 1e7
      },
      currentContractDeployInputs: [],
      currentContractDeployInputValues: [],
      currentContractDeployName: "",
      currentTokensFilter: [],
      tokenSearch: "",
      totalValue: "",
      tokenId: ""
    };
  },
  computed: {
    currentContractDeployParameters: function() {
      let params = [];
      for (let i in this.currentContractDeployInputValues) {
        let inputValue = this.currentContractDeployInputValues[i];
        let inputType = this.currentContractDeployInputs[i].type;
        params.push(formatInput(inputValue, inputType));
      }
      return params;
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
  props: {
    contract: Object,
    contractName: String,
    disabled: Boolean
  },
  mounted() {
    this.currentTokensFilter = this.currentTokens;
  },
  methods: {
    formatNum: input => {
      return Number(input).toLocaleString();
    },
    showDeployBox: function() {
      let constructorFunction = this.contract.abi.find(
        e => e.type == "constructor"
      );
      if (typeof constructorFunction == "object")
        this.currentContractDeployInputs = constructorFunction.inputs;
      else this.currentContractDeployInputs = [];
      this.currentContractDeployName = this.contractName;
      this.showDeploy = true;
    },
    deploy: async function() {
      if (!window.tronWeb) {
        this.$alert("You must install Tronlink to deploy contract");
        return;
      }
      if (!(window.tronWeb && window.tronWeb.ready)) {
        this.$alert("Error", "You must login Tronlink to deploy with contract");
        return;
      }
      this.statusDeploying = true;
      this.showDeploy = false;
      try {
        this.updateDeployStatus({
          type: "info",
          content: "Deploy " + this.currentContractDeployName + "\n"
        });
        let optionsPayable = {};
        if (!this.tokenId || this.tokenId == 0) {
          optionsPayable = { callValue: this.totalValue };
        } else {
          optionsPayable = {
            tokenId: this.tokenId,
            tokenValue: this.totalValue
          };
        }
        let options = {
          abi: this.contract.abi,
          bytecode: this.contract.evm.bytecode.object,
          parameters: this.currentContractDeployParameters,
          name: this.currentContractDeployName,
          feeLimit: this.advanceDeployParam.feeLimit,
          userFeePercentage: this.advanceDeployParam.userFeePercentage,
          originEnergyLimit: this.advanceDeployParam.originEnergyLimit,
          ...optionsPayable
        };
        console.log(options);
        const unsigned = await window.tronWeb.transactionBuilder.createSmartContract(
          options
        );
        this.updateDeployStatus({
          type: "info",
          content: `Transaction unsigned. <obj title='View Unsigned Transaction' json='${JSON.stringify(
            unsigned
          )}'/>\n`
        });
        this.updateDeployStatus({
          type: "info",
          content: "Waiting user sign \n"
        });

        const signed = await window.tronWeb.trx.sign(unsigned);
        this.updateDeployStatus({
          type: "info",
          content: `Transaction signed! <obj title='View Signed Transaction' json='${JSON.stringify(
            signed
          )}'/>\nBroadcast transaction\n`
        });

        const broadcastResult = await window.tronWeb.trx.sendRawTransaction(
          signed
        );
        if (broadcastResult.result === true) {
          this.updateDeployStatus({
            type: "info",
            content: `Broadcast transaction success! <obj title="View Broadcast Result" json='${JSON.stringify(
              broadcastResult
            )}'/> \nWaiting for confirm from Tron blockchain\n`
          });

          let transactionInfo = {};
          do {
            transactionInfo = await window.tronWeb.trx.getTransactionInfo(
              signed.txID
            );
            if (transactionInfo.id) {
              if (transactionInfo.receipt.result == "SUCCESS") {
                this.updateDeployStatus({
                  type: "success",
                  content: `Successful deployed contract '${
                    this.currentContractDeployName
                  }'. Cost: ${
                    transactionInfo.receipt.energy_fee
                      ? FormatNumber(
                          transactionInfo.receipt.energy_fee / 1000000
                        )
                      : 0
                  } TRX, ${
                    transactionInfo.receipt.energy_usage
                      ? FormatNumber(transactionInfo.receipt.energy_usage)
                      : 0
                  } energy. Transaction confirm here <tx id='${
                    transactionInfo.id
                  }'/>\n`
                });
                let base58Adress = window.tronWeb.address.fromHex(
                  signed.contract_address
                );

                window.gtag("event", "deployed", {
                  event_category: "Deploy on " + window.tronWeb.fullNode.host,
                  event_label: base58Adress
                });

                this.updateDeployStatus({
                  type: "success",
                  content: `Contract address: <a target='_blank' href='#/interact/${base58Adress}'>${base58Adress}</a>\n`
                });
              } else if (transactionInfo.receipt.result == "OUT_OF_ENERGY") {
                this.updateDeployStatus({
                  type: "error",
                  content: `FAILED deploying ${
                    this.currentContractDeployName
                  }. You lost: ${
                    transactionInfo.receipt.energy_fee
                      ? FormatNumber(
                          transactionInfo.receipt.energy_fee / 1000000
                        )
                      : 0
                  } TRX\nReason: ${window.tronWeb.toUtf8(
                    transactionInfo.resMessage
                  )}. Transaction here <tx id='${transactionInfo.id}'/>`
                });
              } else {
                this.updateDeployStatus({
                  type: "error",
                  content: `FAILED deploying ${
                    this.currentContractDeployName
                  }.\nView transaction here <tx id='${transactionInfo.id}'/>`
                });
              }
            }
          } while (!transactionInfo.id);
        } else {
          this.updateDeployStatus({
            type: "error",
            content: `FAILED to broadcast ${
              this.currentContractName
            } deploy transaction \n${
              broadcastResult.code
            }\n${window.tronWeb.toUtf8(
              broadcastResult.message
            )}.\n<obj title="View Broadcast Result" json='${JSON.stringify(
              broadcastResult
            )}'/>`
          });
        }
      } catch (e) {
        this.updateDeployStatus({
          type: "error",
          content: `Deploy fail! Error: ${e.toString()}`
        });
      }
      this.statusDeploying = false;
    },
    updateDeployStatus: function(status) {
      this.$emit("deploy-status", status);
    }
  }
};
</script>

<style>
.advanced-params {
  padding: 10px;
  box-shadow: rgb(0, 0, 0) 0px 0px 5px inset;
  margin: 5px;
  background: rgb(25, 36, 46);
}
.advanced-params-body {
  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
}
.advanced-params-body .label {
  margin: auto 5px auto auto;
}
.advanced-params-body .value {
  margin: auto 5px auto 5px;
}
.advanced-params-body .input {
  text-align: right;
}
#deployBox .shell {
  text-align: center;
}
#call-value {
  border: 1pt solid #2e7052;
  border-radius: 2px;
  background: #255740;
  margin-left: -10px;
  width: 106%;
  padding-right: 10px;
}
</style>
