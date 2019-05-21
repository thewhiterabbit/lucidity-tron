import Vue from 'vue';
import Router from 'vue-router';
import PageInteractSmartContract from './components/PageInteractSmartContract.vue';
import PageComposeSmartContract from './components/PageComposeSmartContract.vue';
import PageVerifySmartContract from './components/PageVerifySmartContract.vue';
import PageAuthor from './components/PageAuthor.vue';
import PageDontSupportMobile from './components/PageDontSupportMobile.vue';
import { isMobile } from "mobile-device-detect";


Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'PageInteractSmartContract',
      component: PageInteractSmartContract,
    },
    {
      path: '/interact/:Address',
      name: 'PageInteractSmartContractUrl',
      component: PageInteractSmartContract,
    },
    {
      path: '/compose/:Source?',
      name: 'PageComposeSmartContract',
      component: isMobile?PageDontSupportMobile:PageComposeSmartContract,
    },
    {
      path: '/verify',
      component: isMobile?PageDontSupportMobile:PageVerifySmartContract,
      name: 'PageVerifySmartContract',
    },
    {
      path: '/author',
      component: PageAuthor,
      name: 'PageAuthor',
    },
  ],
})
