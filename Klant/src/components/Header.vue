<template>
	<div class="header">	
		<div class="logo header-col">
			<router-link :to="'/login'" v-if="!klantenkaart">
				<div class="header-button">
					Inloggen
				</div>
			</router-link>
			<router-link :to="'/loyalty_card'" v-if="klantenkaart">
				<div class="header-button">
					QR Code
				</div>
			</router-link>
		</div>
		<div class="header-shops header-col">
			<router-link :to="'/spaaracties'">
				<div class="header-button">
					Sparen
				</div>
			</router-link>
		</div>
		<div id="menu-btn" class="header-button header-col" @click="fade()">
			Menu
		</div>
		<div class="modal-overlay" v-if="state.modalOpened" @click="fade()"></div>						
		<transition name="fade" v-on:close="enter">	
			<Navigation v-if="state.modalOpened" @fading="fade()"/>
		</transition>
	</div> 
</template>

<script setup>
import { reactive, computed} from 'vue'
import { useStore } from 'vuex'
import Navigation from '@/components/Navigation.vue'


const store = useStore()
	const state = reactive({  
		modalOpened: false,
		publicPath: process.env.BASE_URL,
		title: ""
	})
	
	function fade() {
		state.modalOpened = !state.modalOpened
	}
	
	function enter() {
		setTimeout(() => {
			state.modalOpened = false;
			}, 1500);
	}


	
    const klantenkaart = computed(() => {
		return store.getters['shopsettings/getLoggedIn']
    }, {immediate: true, deep: true})

</script>
<style scoped>
.modal-overlay{
	background: #aaaaaa55;
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
.header{
	height: 6%;	
	width: 100%;
	background-color: var(--header-color);
	border-bottom: 2px solid rgba(0,0,0,0.6);
    grid-template-columns: 25% 25% 25%;
    grid-gap: 5%;
	grid-auto-flow: column;
    display: grid;
    padding-left: 8%;
    position: fixed;
    z-index: 12;
}

.header-col{
	max-height: 100%;
	align-self: center;
}

.header-col a{
	text-decoration: none;
}

.logo{
}
.logo img{
	max-width: 100%;
	max-height: 100%;
	height: auto;
}
.title{
	display: flex;
	justify-content: center;
}
.ad-reserve{
	display: flex;
    align-items: center;
    justify-content: center;
	margin-left: auto;
	margin-right: auto;
    color: var(--header-text-color);
}
.header-button{
	display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px;	
	border-radius: 5px;
	background: #ffffff;
	-webkit-box-shadow: 6px 10px 5px 0px rgba(0,0,0,0.75);
    -moz-box-shadow: 6px 10px 5px 0px rgba(0,0,0,0.75);
    box-shadow: 3px 3px 3px 0px rgba(0,0,0,0.6);
	color:#3e3e3e;
	font-weight: 700;
}

@media only screen and (min-height: 500.98px) and (orientation: landscape) {
	.header{
		height: 8%;
	}
}
</style>
