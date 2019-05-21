import Vue from 'vue'
import App from './App.vue'
import VueUi from '@vue/ui'
import router from './router'
import store from './store'
import VueTypedJs from 'vue-typed-js'
import '@vue/ui/dist/vue-ui.css'
import Copy from 'v-copy'
import LoadScript from 'vue-plugin-load-script';
import VeeValidate from 'vee-validate';

Vue.use(VeeValidate);
Vue.use(LoadScript);
Vue.use(Copy);
Vue.use(VueUi);
Vue.use(VueTypedJs);

Vue.config.productionTip = false;

console.clear();
console.log(`%c omofomo%c.io %c is running`,"background:#0066ff ; padding: 1px; border-radius: 3px 0 0 3px;  color: #f2f2f2","background:#00ccff ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff","background:transparent");

router.afterEach((to) => {
  window.gtag('config', window.GA_TRACKING_ID, {
    page_path: to.fullPath,
    app_name: '',
    send_page_view: true,
  });
});

new Vue({
  router,
  store,
  ...App,
}).$mount('#app');

