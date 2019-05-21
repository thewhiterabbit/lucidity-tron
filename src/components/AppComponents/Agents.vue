<template>
  <div style="display:none"></div>
</template>

<script>
import clippy from "clippyjs";

export default {
  data() {
    return {
      agentName: "F1",
      agentInstance: {},
      action: {
        error: "Sad",
        success: "Suggest",
        warning: "Surprised",
        info: "Reading",
      },
    };
  },
  computed: {
    consoleComposeLogs() {
      const consoleComposeLogs = this.$store.state.consoleComposeLogs;
      if (typeof consoleComposeLogs !== "object") return [];

      return consoleComposeLogs;
    }
  },
  watch: {
    consoleComposeLogs: (val) => {
      const currentLog = val.slice(-1);

      this.agentInstance.speak(
        currentLog.content.replace(/<\/?[^>]+(>|$)/g, "")
      );

      if (currentLog.type === "success" || currentLog.type === "error") {
        this.agentInstance.play(this.action[currentLog.type]);
      }
    }
  },
  mounted() {
    const self = this;

    clippy.load(this.agentName, agent => {
      // do anything with the loaded agent
      self.agentInstance = agent;
      window.MELIN = self.agentInstance;
      agent.show();
      //   agent.moveTo(300, 300);
      agent.speak('Welcome to omofomo.io! My name is Merlin');
      agent.play('Greet');
      //hock
    });
  },
};
</script>

<style>
.clippy,
.clippy-balloon {
  position: fixed;
  z-index: 1000;
  cursor: pointer;
}

.clippy-balloon {
  background: #ffc;
  color: black;
  padding: 8px;
  border: 1px solid black;
  border-radius: 5px;
}

.clippy-content {
  max-width: 400px;
  min-width: 120px;
  font-family: 'Microsoft Sans', sans-serif;
  font-size: small;
}

.clippy-tip {
  width: 10px;
  height: 16px;
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAgCAMAAAAlvKiEAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAlQTFRF///MAAAA////52QwgAAAAAN0Uk5T//8A18oNQQAAAGxJREFUeNqs0kEOwCAIRFHn3//QTUU6xMyyxii+jQosrTPkyPEM6IN3FtzIRk1U4dFeKWQiH6pRRowMVKEmvronEynkwj0uZJgR22+YLopPSo9P34wJSamLSU7lSIWLJU7NkNomNlhqxUeAAQC+TQLZyEuJBwAAAABJRU5ErkJggg==)
    no-repeat;
  position: absolute;
}

.clippy-top-left .clippy-tip {
  top: 100%;
  margin-top: 0;
  left: 100%;
  margin-left: -50px;
}

.clippy-top-right .clippy-tip {
  top: 100%;
  margin-top: 0;
  left: 0;
  margin-left: 50px;
  background-position: -10px 0;
}

.clippy-bottom-right .clippy-tip {
  top: 0;
  margin-top: -16px;
  left: 0;
  margin-left: 50px;
  background-position: -10px -16px;
}

.clippy-bottom-left .clippy-tip {
  top: 0;
  margin-top: -16px;
  left: 100%;
  margin-left: -50px;
  background-position: 0 -16px;
}
</style>
