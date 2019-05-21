module.exports = {
  productionSourceMap: false,
  devServer: {
    disableHostCheck: true
  },
  configureWebpack:{
    node: {
      process: true,
      // fs:"empty",
      module:"empty"
    },
    resolve: {
      alias: {
        vue$: "vue/dist/vue.common",
      },
    },
  }

}
