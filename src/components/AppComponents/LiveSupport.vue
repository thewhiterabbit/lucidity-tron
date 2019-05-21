<template>
  <div id="chat-panel">
    <div id="toggle-help" @click="showHelp = !showHelp">Live Support</div>

    <iframe
      v-show="showHelp"
      id="discord-panel"
      src="https://discordapp.com/widget?id=504117576964505621&theme=dark"
      width="350"
      height="500"
      allowtransparency="true"
      frameborder="0"
    ></iframe>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showHelp: false,
    };
  },
  mounted() {
    document.onclick = (e) => {
      if (e.target.id !== 'discord-panel' && e.target.id !== 'toggle-help') {
        self.showHelp = false;
      }
    };
  }
};
</script>

<style>
#chat-panel {
  display: block;
  position: fixed;
  bottom: 0;
  right: 5px;
  width: auto;
  height: auto;
  z-index: 998;
}
#toggle-help {
  cursor: help;
  position: absolute;
  top: -30px;
  background: #ea6e00;
  padding: 5px;
  border-radius: 5px 5px 0 0;
  right: 0;
  box-shadow: 0 0 20px black;
  height: 20px;
  width: 100px;
  text-align: center;
}
#toggle-help:hover {
  background: #e68c3d;
}
</style>
