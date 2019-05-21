<template>
  <span>
    <VueButton
      :loading-secondary="statusCompiling"
      class="primary"
      icon-left="check_circle"
      @click="compileBoxShow=true"
    >Compile</VueButton>
    <VueModal v-if="compileBoxShow" title="Compile Params" locked class="small" id="compileBox">
      <div class="default-body">
        <div class="advanced-params-body">
          <div>
            <VueSwitch class="compile-info" v-model="compileParam.opmize">
              <small>Optimization</small>
            </VueSwitch>
          </div>
          <div>
            <span class="slot">
              <small>Runs (Optimizer):</small>
            </span>
            <VueInput
              class="compile-info"
              v-model="compileParam.optimizerRuns"
              placeholder="Runs (Optimizer)"
              style="min-width:80px"
            />
          </div>
        </div>
      </div>
      <div slot="footer" class="actions">
        <VueButton class="primary" @click="compile()">Compile now</VueButton>
        <VueButton class="danger" @click="compileBoxShow=false">Close</VueButton>
      </div>
    </VueModal>
  </span>
</template>

<script>
import { loadVersion } from "@/utils/TronSCSSolc";

export default {
  data() {
    return {
      statusCompiling: false,
      compileBoxShow: false,
      compileParam: {
        opmize: true,
        optimizerRuns: 0
      },
      contracts: [],
      compileSuccess: false
    };
  },
  props: {
    solidityVersion: String,
    source: String
  },
  methods: {
    compile: async function() {
      this.$emit("compile-start");
      this.compileBoxShow = false;
      this.statusCompiling = true;
      this.contracts = [];
      try {
        this.compiler = await loadVersion(this.solidityVersion);
        let currentProject = this.$store.state.projects[
          this.$store.state.currentProjectId
        ];
        if (currentProject == null) throw "No Project Selected";
        let currentFile = currentProject.files[this.$store.state.currentFileId];
        if (currentFile == null) throw "No File Selected";

        let listSourceFile = {};
        currentProject.files.map(file => {
          listSourceFile[file.name] = file.source;
        });
        let findImport = function(path) {
          return listSourceFile[path] != undefined
            ? {
                contents: listSourceFile[path]
              }
            : { error: "File '" + path + "' not found" };
        };
        let entrySource = {};
        entrySource[currentFile.name] = { content: this.source };
        let input = {
          language: "Solidity",
          sources: entrySource,
          settings: {
            optimizer: {
              enabled: this.compileParam.opmize,
              runs: this.compileParam.optimizerRuns
            },
            outputSelection: {
              "*": {
                "*": ["*"]
              }
            }
          }
        };
        let result = this.compiler.compile(JSON.stringify(input), findImport);
        result = JSON.parse(result);
        if (result.errors) {
          this.compileSuccess = true;
          result.errors.forEach(error => {
            if (error.severity == "error") {
              this.compileSuccess = false;
            }
            this.updateCompileStatus({
              type: error.severity,
              content: error.formattedMessage
            });
          });
        }
        if (result.contracts && result) {
          let listCurrentFileContracts = result.contracts[currentFile.name];
          for (let contractName in listCurrentFileContracts) {
            let contract = listCurrentFileContracts[contractName];
            this.currentContractName = contractName;
            this.compileSuccess = true;
            this.updateCompileStatus({
              type: "success",
              content: `Compiled success: Contract '${contractName}' <obj title="Show ABI" json='${JSON.stringify(
                contract.abi
              )}'/> <obj title="Show Bytecode" json='${JSON.stringify(
                contract.evm.bytecode.object
              )}'/>`
            });
          }
          this.contracts = listCurrentFileContracts;
        }

        this.statusCompiling = false;
        this.compileBoxShow = false;
        this.$emit("compile-done", {
          compileSuccess: this.compileSuccess,
          contracts: this.contracts
        });
      } catch (e) {
        this.updateCompileStatus({
          type: "error",
          content: `Compiled error: ${e.toString()}`
        });
        this.statusCompiling = false;
      }
    },
    updateCompileStatus: function(status) {
      this.$emit("compile-status", status);
    }
  }
};
</script>

<style>
</style>
