import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersist from 'vuex-persist';

Vue.use(Vuex);

const vuexPersist = new VuexPersist({
  key: 'omofomo.io',
  storage: localStorage,
});

export default new Vuex.Store({
  state: {
    alertbox: {
      show: false,
      content: 'Default',
      title: '',
    },
    consoleComposeLogs:[],
    currentProjectId: 0,
    currentFileId: 0,
    projects: [],
    //KhanhND: Sample [{name: 'Your Great project', files: [{name:'sample.sol',source:'source here',createDate:''}], createDate:''}],
    composeHeight: 0,
    currentNet:'',
    currentNetName:'',
    currentTokens:[],
    currentBalance:0
  },
  mutations: {
    setCurrentTokens(state, payload) {
      state.currentTokens = payload
    },
    setCurrentBalance(state, payload) {
      state.currentBalance = payload
    },
    showAlert(state, payload) {
      state.alertbox.show = true;
      state.alertbox.content = payload.content;
      state.alertbox.title = payload.title;
    },
    closeAlert(state) {
      state.alertbox.show = false;
    },
    setConsoleComposeLogs(state, result) {
      state.consoleComposeLogs = result
    },
    setCurrentNet(state, currentNet) {
      state.currentNet = currentNet;

      switch (true){
        case currentNet === '':
          state.currentNetName = 'Can\'t detect net';
          break;
        case currentNet.indexOf('localhost') !== -1:
          state.currentNetName = 'PrivateNet';
          break;
        case currentNet === 'https://api.trongrid.io':
          state.currentNetName = 'MainNet';
          break;
        case currentNet === 'https://api.shasta.trongrid.io':
          state.currentNetName = 'ShastaTestNet';
          break;
        default:
          state.currentNetName = 'CustomNet';
      }
    },
    setCurrentFileId(state, currentFileId) {
      state.currentFileId = currentFileId;
    },
    setCurrentProjectId(state, currentProjectId) {
      state.currentProjectId = currentProjectId;
    },
    setProjects(state, projects) {
      state.projects = projects;
    },
    setProjectName(state, name) {
      state.projects[state.currentProjectId].name = name;
    },
    addNewProject(state, project) {
      project.createDate = Date.now();
      state.projects.push(project);
    },
    removeProjectId(state, projectId) {
      state.projects.splice(projectId, 1);
    },
    setSource(state, sourceCode) {
      state.projects[state.currentProjectId].files[state.currentFileId].source = sourceCode;
    },
    removeFileId(state, fileId) {
      state.projects[state.currentProjectId].files.splice(fileId, 1);
    },
    addNewFile(state, file) {
      file.createDate = Date.now();
      state.projects[state.currentProjectId].files.push(file);
    },
    setComposeHeight(state, height) {
      state.composeHeight = height;
    },
    createExample(state) {
      const sampleProject = [{
        name: 'SampleProject',
        createDate: 1546244868234,
        files: [{
          name: 'Greeter.sol',
          source: `//KhanhND: Your entry file here! When you run compiled this file, files declare with import keyword is loaded automatically.
//File Mortal.sol must exist in this Project. 

pragma solidity ^0.4.25;
import 'Mortal.sol';

contract Greeter is Mortal  {
    /* Define variable greeting of the type string */
    string greeting;

    /* This runs when the contract is executed */
    constructor(string memory _greeting) public {
        greeting = _greeting;
    }

    /* Main function */
    function greet() public view returns (string memory) {
        return greeting;
    }
}`,
          createDate: 1546244868235
        },
        {
          name: 'Mortal.sol',
          source: `//KhanhND: This file is auto load when compile Greeter.sol
pragma solidity ^0.4.25;

contract Mortal {
    /* Define variable owner of the type address */
    address owner;

    /* This constructor is executed at initialization and sets the owner of the contract */
    constructor() public { owner = msg.sender; }

    /* Function to recover the funds on the contract */
    function kill() public { if (msg.sender == owner) selfdestruct(msg.sender); }
}`,
          createDate: 1546247111563,
        }]
      }];

      if (!state.projects.length) {
        state.projects = sampleProject;
      }
    }
  },
  actions: {},
  plugins: [vuexPersist.plugin],
})
