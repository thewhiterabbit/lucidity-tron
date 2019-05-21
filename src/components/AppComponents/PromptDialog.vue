<template>
  <VueModal v-if="alertbox.show" :title="alertbox.title" locked class="small" id="alert-box">
    <div class="default-body">{{ this.alertbox.content }}</div>
    <div slot="footer" class="actions">
      <VueButton class="danger" @click="closeAlert()">Close</VueButton>
    </div>
  </VueModal>
</template>

<script>
import Vue from 'vue';

export default {
  computed: {
    alertbox() {
      return this.$store.state.alertbox;
    }
  },
  methods: {
    closeAlert() {
      this.$store.commit('closeAlert');
    }
  },
  mounted() {
    Vue.prototype.$alert = (title, content) => {
      this.$store.commit('showAlert', { title, content });
    };
  }
};
</script>

<style>
</style>
