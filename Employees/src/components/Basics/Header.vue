<script setup>
	import { reactive, onMounted } from 'vue'
	import Navigation from '@/components/Basics/Navigation.vue'
	import {useRoute} from 'vue-router'
	import {computed} from 'vue'
	//import Orderalarm from '@/components/Orderalarm.vue';

	//const publicPath = ref(process.env.BASE_URL)
	const route=useRoute();

	const path = computed(() =>route.path)
	const state = reactive({ modalOpened: true})

	function fade(){
		state.modalOpened = !state.modalOpened
	}

	onMounted(() => {
		if(path.value != '/'){
			state.modalOpened = false
		}
	})

	//const activeStore = computed(() => {
	//	return localStorage.getItem('store') || ''
	//})

</script>
<template>
	<div class="header">	
		<div class="header-col">
			<router-link :to="'/bezorging'">
				<div class="header-button">
					Bezorgen
				</div>
			</router-link>
		</div>
		
		<div class="header-col">
			<router-link :to="'/actiescanner'">
				<div class="header-button">
					Scanner
				</div>
			</router-link>
		</div>
		<div class="header-col">
		<!--	<div class="logo-alarm">
				<Orderalarm/>
			</div>-->
			<div class="header-button" @click="fade()">
				Menu
			</div>
		</div>
		<div class="nav-overlay" v-if="state.modalOpened === true">						
			<transition name="fade">	
				<Navigation v-if="state.modalOpened" @fading="fade()"/>
			</transition>
		</div>
	</div>
</template>
<style scoped>
.header{
    height: 6%;
    width: 100%;
    background-color: var(--base-color);
    border-bottom: 2px solid rgba(0,0,0,.6);
    grid-template-columns: 25% 25% 25%;
    grid-gap: 5%;
    grid-auto-flow: column;
    display: grid;
    padding-left: 8%;
    position: fixed;
    z-index: 12;
}

.nav-overlay{
	position: fixed;
	height: 94%;
	width: 100%;
	top:0;
	left: 0;
	z-index: 200;
}
.header-col{
	max-height: 100%;
	align-self: center;
}
.header-col a{
	text-decoration: none;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s
}

.fade-enter,
.fade-leave-to
{
  opacity: 0
}
.logo{
	height: 100%;
	position: relative;
}
.logo img{
    max-height: 100%;
    position: absolute;
    left: 0;
    width: auto;
    max-width: 100%;
}
.logo-alarm{
	height: 100%;
	display: block;
    width: fit-content;
}

.menu{
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-end;
    align-content: center;
    height: 100%;
    align-items: center;
}
#menu-btn{
	border-radius: 5px;
    padding: 5px;	
	background: #ffffff;
	-webkit-box-shadow: 6px 10px 5px 0px rgba(0,0,0,0.75);
    -moz-box-shadow: 6px 10px 5px 0px rgba(0,0,0,0.75);
    box-shadow: 3px 3px 3px 0px rgba(0,0,0,0.6);
	color:#3e3e3e;
	font-weight: 700;
	display: flex;
    align-items: center;
    justify-content: center;
	font-size: 1.5rem;
}
.header-button{
	display: inline-block;
	
    padding: 5px;	
	border-radius: 5px;
	background: #ffffff;
	-webkit-box-shadow: 6px 10px 5px 0px rgba(0,0,0,0.75);
    -moz-box-shadow: 6px 10px 5px 0px rgba(0,0,0,0.75);
    box-shadow: 3px 3px 3px 0px rgba(0,0,0,0.6);
	color:#3e3e3e;
	font-weight: 700;
}
.navigation{
    display: block;
	height: 100%;
	width: 100%;
}
@media screen and (orientation: landscape) {
	.header{
		height: 15vh;
	}
	#menu-btn{
		font-size: 1.5rem;
	}
}

@media screen and (orientation: landscape) and (min-height:768px){
	.header{
		height: 10vh;
	}
	#menu-btn{
		font-size: 1.8rem;
	}
}

@media screen and (orientation: portrait) and (min-width:768px){
	.header{
		height: 8vh;
	}
	#menu-btn{
		font-size: 1.8rem;
	}
}

@media screen and (orientation: portrait) and (min-width:1050px) and (min-height: 1800px){
	#menu-btn{
		font-size: 2.5rem;
	}
}
</style>
