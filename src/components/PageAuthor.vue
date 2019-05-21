<template>
  <div class="main-content">
    <p>Author</p>
    <p>KhanhND</p>
    <h4>Join our Discord</h4>
    <a href="https://discord.gg/A7UEhQE">https://discord.gg/A7UEhQE</a>
    <h4>Buy me a coffee ☕</h4>
    <div>TTX5N2wxLeyWBSNE6UeaBjCFZbpa2FH6jr</div>
    <div class="list-cup">
      <div @click="buyMeCoffee(100)">1 cup <br/><small>100trx</small></div>
      <div @click="buyMeCoffee(500)">5 cups <br/><small>500trx</small></div>
      <div @click="buyMeCoffee(1000)">10 cups <br/><small>1000trx</small></div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    async buyMeCoffee(trx) {
      if (!window.tronWeb.eventServer.host.includes("shasta")) {
        try {
          const result = await window.tronWeb.trx.sendTrx(
            "TTX5N2wxLeyWBSNE6UeaBjCFZbpa2FH6jr",
            trx * 1000000
          );

          if (result) {
            this.$alert("Love", "Thank your cup, very sweet");
          } else {
            this.$alert("Oops", "Have trouble with shipper TRX :(");
          }
        } catch (e) {
          this.$alert("Oops", "Have trouble with your wallet TRX :(" + e);
        }
      } else {
        this.$alert("Oops", "You can't buy coffe using test TRX ;)");
      }
    }
  }
};
</script>

<style type="text/css">
.main-content {
  display: block;
  margin: 100px auto;
  text-align: center;
}
.list-cup {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.list-cup > div {
  margin: 10px;
  border: 1px solid;
  background: #0d1a26;
  height: auto;
  width: 100px;
  align-content: center;
  text-align: center;
  padding: 10px;
  border-radius: 10px;
  cursor:pointer;
}
.list-cup > div:hover{
      background: #1a334b;

}
</style>
