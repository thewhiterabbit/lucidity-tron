<template>
  <div id="compose-smartcontract" :style="{height: composeHeight+'px'}">
    <div id="side-bar">
      <VueDropdown
        :label="`Project: ${currentProjectName.substr(0,10)} ...`"
        icon-left="folder"
        icon-right="keyboard_arrow_down"
        id="project-name"
        button-class="flat primary"
      >
        <VueInput v-model="currentProjectName" placeholder="Type project name"/>
        <VueButton
          class="flat primary"
          @click="createNewProject()"
          icon-left="create_new_folder"
          v-close-popover.all
        >New project ...</VueButton>
        <VueButton
          class="flat primary"
          @click="selectProjectPanel.show=true"
          icon-left="folder_open"
          v-close-popover.all
        >Open project ...</VueButton>

        <VueDropdown
          label="Import project"
          icon-left="input"
          icon-right="keyboard_arrow_down"
          button-class="flat primary"
        >
        <VueButton
          class="flat primary"
          @click="importPanel.gitsUrl = '', importPanel.status = '', importPanel.show = true"
          icon-left=""
          v-close-popover.all
        >From gists ...</VueButton>
         </VueDropdown>
        <VueButton
          class="flat danger"
          @click="deleteProject()"
          icon-left="delete"
          v-close-popover.all
        >Delete Project</VueButton>
        <div class="line-divident">_____________________________</div>
        <VueButton
          class="flat warning"
          @click="createNewFile()"
          icon-left="add_box"
          v-close-popover.all
        >Add file ...</VueButton>
      </VueDropdown>

      <div
        v-for="(file, key) in files"
        :key="key"
        @click="fileNameClick(key)"
        :class="{ active: currentFileId === key }"
      >
        <div
          class="file-name"
          onclick="this.contentEditable = true"
          onblur="this.contentEditable = false"
          @blur="e => file.name = e.target.innerText.replace(/(\r\n\t|\n|\r\t)/gm, '')"
          @keydown="e => { if(e.which === 13) e.target.blur() }"
        >{{ file.name }}</div>
        <div class="file-control" @click.stop="closeFile(key)">x</div>
      </div>
    </div>
    <div id="main-content">
      <ComposeContent v-model="smartContractCode"></ComposeContent>
    </div>
    <ComposeCompileControl :source="smartContractCode"></ComposeCompileControl>
    <VueModal
      v-if="selectProjectPanel.show"
      title="List projects in storage in local"
      locked
      @close="selectProjectPanel.show = false"
      id="open-project"
    >
      <div class="default-body">
        <div class="row-project row-header">
          <div>
            <b>No.</b>
          </div>
          <div>
            <b>Project Name</b>
          </div>
          <div>
            <b>Created date</b>
          </div>
        </div>
        <div
          class="row-project"
          v-for="(project, key) in projects"
          :key="key"
          @click="() => { currentProjectId = key; selectProjectPanel.show = false }"
        >
          <div>{{ key + 1 }}</div>
          <div
            class="no-center"
          >{{ project.name.length > 100 ? `${project.name.substr(0, 50)}  ...` : project.name }}</div>
          <div>{{ (new Date(Number(project.createDate))).toLocaleString('vi-vn') }}</div>
        </div>
      </div>
      <div slot="footer" class="actions">
        <VueButton class="primary" @click="selectProjectPanel.show = false">Close</VueButton>
      </div>
    </VueModal>
    <VueModal
      v-if="importPanel.show"
      title="Import project from"
      locked
      @close="selectProjectPanel.show = false"
      id="open-project"
    >
      <div class="default-body">
        <VueInput
          v-model="importPanel.gitsUrl"
          style="width:500px;"
          placeholder="Type gits url: https://gist.github.com/<user_name>/<gists id>"
          :loading-secondary="importPanel.loading"
        />
        <div class="status">{{ importPanel.status }}</div>
      </div>
      <div slot="footer" class="actions">
        <VueButton
          class="primary"
          @click="importGits()"
          :loading-secondary="importPanel.loading"
        >Import now</VueButton>
        <VueButton class="danger" @click="importPanel.show = false">Close</VueButton>
      </div>
    </VueModal>
  </div>
</template>

<script>
import ComposeContent from './PageComposeComponents/ComposeContent.vue';
import ComposeCompileControl from './PageComposeComponents/ComposeCompileControl.vue';
import axios from 'axios';

export default {
  data() {
    return {
      composeHeight: document.documentElement.clientHeight - 32 - 42,
      selectProjectPanel: {
        show: false
      },
      importPanel: {
        loading: false,
        show: false,
        status: '',
        gitsUrl: ''
      }
    };
  },
  components: { ComposeContent, ComposeCompileControl },
  computed: {
    smartContractCode: {
      get() {
        if (this.projects[this.currentProjectId] == undefined) {
          return 'Select Project to show code';
        }
        if (
          this.projects[this.currentProjectId].files[this.currentFileId] ==
          undefined
        ) {
          return 'Select file to show code';
        }
        return this.projects[this.currentProjectId].files[this.currentFileId]
          .source;
      },
      set(val) {
        this.$store.commit('setSource', val);
      }
    },
    currentFileId: {
      get() {
        return this.$store.state.currentFileId;
      },
      set(val) {
        this.$store.commit('setCurrentFileId', val);
        this.smartContractCode = this.projects[this.currentProjectId].files[
          val
        ].source;
      }
    },
    currentProjectId: {
      get() {
        return this.$store.state.currentProjectId;
      },
      set(val) {
        this.$store.commit('setCurrentProjectId', val);
      }
    },
    currentProjectName: {
      get() {
        return this.currentProject.name;
      },
      set(val) {
        this.$store.commit('setProjectName', val);
      }
    },
    currentProject: {
      get() {
        return this.projects[this.currentProjectId];
      }
    },
    projects: {
      get() {
        return this.$store.state.projects;
      }
    },
    files: {
      get() {
        return this.currentProject.files;
      }
    }
  },
  async created() {
    if (this.$route.params.Source) {
      let val = (await axios.get(
        `https://raw.githubusercontent.com/TronSCS/lucidity-ide.shareit/master/${
          this.$route.params.Source
        }.sol`
      )).data;
      this.createNewProject(this.$route.params.Source);
      this.smartContractCode = val;
    }
    if (this.projects.length == 0) {
      // this.createNewProject();
      this.$store.commit('createExample');
    }
    if (this.files.length == 0) {
      this.createNewFile();
    }
  },
  async mounted() {
    let self = this;
    window.addEventListener('resize', function() {
      self.composeHeight =
        document.documentElement.clientHeight -
        32 -
        document.getElementById('complie-command').clientHeight;
    });
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  },
  methods: {
    closeFile: function(key) {
      this.$store.commit('removeFileId', key);
      if (this.files.length == 0) {
        this.createNewFile();
      }
      if (this.currentFileId > this.files.length - 1) {
        this.currentFileId = this.files.length - 1;
      }
    },
    fileNameClick: function(key) {
      this.currentFileId = key;
    },
    createNewFile: function(
      name = 'NewFile.sol',
      source = 'Your great idea here!'
    ) {
      let newFile = { name: name, source: source };
      this.$store.commit('addNewFile', newFile);
      this.currentFileId = this.files.length - 1;
    },
    createNewProject: function(name = 'NewProject') {
      let newProject = { name: name, files: [] };
      this.$store.commit('addNewProject', newProject);
      this.currentProjectId = this.projects.length - 1;
      this.createNewFile();
    },
    deleteProject: function() {
      this.$store.commit('removeProjectId', this.currentProjectId);
      if (this.projects.length == 0) {
        this.createNewProject();
      }
      if (this.currentProjectId > this.projects.length - 1) {
        this.currentProjectId = this.projects.length - 1;
      }
      this.$alert('Info', 'You deleted it! Let\'s create something new');
    },
    importGits: async function() {
      this.importPanel.loading = true;
      try {
        let gistsUrl = this.importPanel.gitsUrl.split('/').pop();
        let gistsData = (await axios.get(
          `https://api.github.com/gists/${gistsUrl}`
        )).data;
        this.importPanel.status = `Fetching files...`;
        let newProject = { name: gistsUrl, files: [] };
        for (let i in gistsData.files) {
          this.importPanel.status +=
            '\nLoad file: ' + gistsData.files[i].raw_url;
          let fileContent = (await axios.get(gistsData.files[i].raw_url)).data;
          let fileName = i;
          let newFile = { name: fileName, source: fileContent };
          newProject.files.push(newFile);
        }
        this.importPanel.status += '\n Import success.';
        this.$store.commit('addNewProject', newProject);
        this.currentProjectId = this.projects.length - 1;
        this.importPanel.loading = false;
      } catch (e) {
        this.importPanel.status =
          'Can\'t not get gists content. Please check your url or connection';
        this.importPanel.loading = false;
      }
    }
  }
};
</script>
<style>
#compose-smartcontract {
  display: flex;
}
#side-bar {
  flex: auto 0 0;
  background: #0c161b;
  overflow: auto;
  width: 200px;
  box-shadow: 0px 0px 10px #000 inset;
}
#side-bar .file-name {
  cursor: pointer;
  color: #42b9838f;
  height: 20px;
  padding: 5px 0px 0px 20px;
  border-radius: 1px;
  overflow: hidden;
  background: #00000042;
  font-size: small;
  width: 100%;
  display: table-cell;
  vertical-align: middle;
}
#side-bar .active .file-name {
  color: #76ffc1;
  background: #1e1e1e;
  box-shadow: 0px 0px 10px #000;
}

#side-bar > div {
  position: relative;
  padding: 5px 0px 0px 5px;
  display: flex;
}
#side-bar > div#project-name {
  padding: 0px;
}
#side-bar .file-control {
  color: #ff5722a1;
  position: absolute;
  top: 5px;
  left: 0px;
  cursor: pointer;
  text-align: center;
  background: #1e1e1e;
  width: 20px;
  height: 23px;
  padding: 2px 0px 0px 0px;
  font-size: 15px;
  font-weight: bold;
}
#side-bar .active .file-control {
  color: #ff5722;
}
#main-content {
  flex: 100% 1 1;
}
.line-divident {
  color: #479270;
}
#open-project .row-project {
  display: grid;
  grid-template-columns: 30px 400px 200px;
  padding: 5px;
  width: 100%;
  border: dashed 0.5px #42b98373;
  margin: 5px;
  cursor: pointer;
  color: #42b983;
}
#open-project .row-project:hover {
  color: #fff;
}
#open-project .row-header {
  background: #13202c91;
}
#open-project .row-project div {
  text-align: center;
  border-right: 1px dashed #42b983;
}
#open-project .row-project div.no-center {
  text-align: left;
  padding-left: 10px;
}
#open-project .shell {
  text-align: center;
}
div.status {
  margin: 5px;
  padding: 10px;
  overflow-y: scroll;
  width: 480px;
  height: 200px;
  text-align: left;
  background: #0002;
  white-space: pre-wrap;
  font-family: SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono,
    Courier New, monospace;
  color: #9e9e9e;
  font-size: small;
}
</style>
