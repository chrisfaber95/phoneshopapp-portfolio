<template>
	<div id="views"><!-- CSS only -->
    <router-view/>
    <div class="modal-overlay" v-if="state.unauth">
      <Relogin />
    </div>
	</div>
</template>
<script setup>
  import {onMounted, watch, reactive} from 'vue'
  import store from './store';
  import Relogin from '@/components/Basics/Relogin.vue'
 // metaInfo: {
 //   meta: [
 //     { charset: 'utf-8' },
 //     { name: 'viewport', content: 'width=device-width, initial-scale=1,user-scalable=no' }
 //   ]
//  },
  const state = reactive({
      unauth: false
  })
  onMounted(() => {
    document.querySelector('html').dataset.theme = `theme-${(localStorage.getItem('store') || 'base').toLowerCase()}`;
  }) 

  watch(() => store.getters['settings/getUnAuth'], () => {
		state.unauth = store.getters['settings/getUnAuth']
	},{immediate: true, deep: true})
</script>

<style lang="scss">
html, body{
  overflow-x: hidden;
  margin: 0;
  width: 100%;
  height: 100%;
  overflow-y: hidden;
}
#app{
  overflow-y: hidden;
  overflow-x: hidden;
  height: inherit;
  width: inherit;
}
#views {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  height: 100%;
  overflow-y: hidden;
  overflow-x: hidden;
}
</style>
