<template>
  <div id="app">
	<!--<div class="overlay" ref="overlay" v-if="screenor != 0">
		<h2>Deze applicatie is niet beschikbaar in landschap modus {{screenorientation}}</h2>
	</div>-->
    <router-view class="view" id="view"/>
	<Header />
	<Opening v-if="opening == 1"/>
	<!--<PwaDownload class="pwa"/>-->
	<div class="modal-overlay cook" v-if="state.cookieStatus != 'accept'">
	
		<vue-cookie-accept-decline
			:debug="false"
			:disableDecline="true"
			:showPostponeButton="false"
			@clicked-accept="cookieDB"
			@status="cookieStatus"
			elementId="myPanel1"
			position="bottom-left"
			ref="myPanel1"
			transitionName="slideFromBottom"
			type="floating"
			>
			<!-- Optional -->
			<template #postponeContent>&times;</template>

			<!-- Optional -->
			<template #message>
				<div class="title" style="width:100%;">
					<img :src="state.storeInfo?.information?.logo_url"  style="max-width:50%;"/>
					<img src="/img/cookies.jpg" style="max-width:50%;" />
				</div>
				<p style="text-align: left;"><b>Deze website maakt gebruik van functionele cookies en vergelijkbare technologieën.</b><br /><br/>

				Cooplubbers.nl maakt gebruik van functionele cookies en vergelijkbare technologieën om je beter en persoonlijker van dienst te kunnen zijn. <br /><br/>
				Deze cookies en technologieën zijn noodzakelijk om de diensten en functionaliteiten te kunnen leveren waar je om hebt gevraagd.<br /><br/>

				Functionele cookies zorgen er bijvoorbeeld voor dat je na het inloggen op de website of native web app niet op elke pagina opnieuw hoeft in te loggen. <br /><br/>
				Daarnaast onthouden functionele cookies de producten die je in het digitale winkelmandje plaatst en de informatie die je in bestelformulieren invult.<br /><br/>

				Met functionele cookies en vergelijkbare technologieën kunnen we ook anoniem het gebruik van onze website monitoren.<br /><br/>
				Het is niet mogelijk om jezelf voor functionele cookies af te melden, omdat deze cookies noodzakelijk zijn voor de functionaliteit van de website.<br /><br/>

				Wil je meer informatie over ons privacybeleid, bekijk dan onze <i @click="state.modalOpened = true"><a>Algemene Voorwaarden</a></i>.<br /><br/>

				P.S. Wij verkopen geen persoonlijke gegevens met betrekking tot koopgedrag aan derden.</p>
			</template>

			<!-- Optional -->
			<!--<template #declineContent>Opt Out</template>-->

			<!-- Optional -->
			<template #acceptContent >Akkoord en doorgaan</template>
		</vue-cookie-accept-decline>
	</div>
	
	
	<footer>
	</footer>
		<div class="modal-overlay" v-if="state.modalOpened">
			<div class="cookies">		
				<Privacy />
				<button class="return" @click="state.modalOpened = false" >Sluiten</button>
			</div>	
		</div>
	<Turnoverlay/>	
  </div>
</template>
<script setup>
	import { reactive, defineProps, onMounted, computed, watch } from 'vue';
	import {HTTP, HTTP_Store} from '@/assets/scripts/http-common.js';
	import auth from '@/assets/scripts/auth'
	import Header from '@/components/Header.vue'
	import Privacy from '@/views/Privacy.vue'
	import Opening from '@/components/Basics/Opening.vue'
	import Turnoverlay from '@/components/Basics/Turnoverlay.vue'
	
	import VueCookieAcceptDecline from 'vue-cookie-accept-decline';
	import 'vue-cookie-accept-decline/dist/vue-cookie-accept-decline.css';

import { useStore } from 'vuex'


   

	const store = useStore()

	defineProps({

	});
	function cookieStatus(i){
		state.cookieStatus = i
	}
	function updateCookieStatus(i){
		state.cookieStatus = i
	}
	const state = reactive({
		opened: 1,
		modalOpened: false,
		cookieStatus: null,
        publicPath: process.env.BASE_URL,
		storeInfo: []
	})

	onMounted(() => {
		if(localStorage.getItem('cart')){
			store.commit('shoppingcart/reloadCart')
		}
		if(localStorage.getItem('actiecart')){
			store.commit('actiecart/reloadActieCart')
		}
		if(localStorage.getItem('groceryList')){
			store.commit('grocerylist/reloadGroceryList')
		}
		if(auth.isAuthenticated()){
			store.commit('shopsettings/updateLoggedIn', true)
			store.commit('shopsettings/updateOpened', 2)
			auth.getInfo()
		}
		if(localStorage.getItem('opened')){
			store.commit('shopsettings/updateOpened', localStorage.getItem('opened'))
			if(localStorage.getItem('opened') != 2) store.commit('shopsettings/updateOpened', 1)
		}
		else{
			store.commit('shopsettings/updateOpened', 1)
		}
	})
	
	

	const opening = computed(() => {
		return store.getters['shopsettings/getOpened']
	},{immediate: true, deep: true})

	watch(() => store.getters['shopsettings/getOpened'], (newVal) => {
		state.opened = newVal
	},{immediate: true, deep: true})


	onMounted(() => {
		getStoreInformation()
		document.querySelector('html').dataset.theme = `theme-coop`.toLowerCase();
		//VueSimpleAlert.alert("test")
		if(!userinfo.value?.customer_id && localStorage.getItem('user_id')){
			auth.getInfo()
		}
	})

	function getStoreInformation(){
        var params = {
            "domain": 'cooplubbers.nl'
        }
        HTTP_Store.get(`shops`, {params})
        .then((response) => {
            state.storeInfo = response.data[0]
        })
        .catch((err) => {
            console.log(err)
        })
    }


	const userinfo = computed(() => {	
		return store.getters['shopsettings/getUserinfo']
	}, {immediate: true, deep: true})
	function cookieDB(){
		updateCookieStatus('accept')
		HTTP.get('https://api.ipify.org?format=json')
		.then((response) => {	
			var data = {
				ip: response.data.ip || "not available",
				customer_id: null
			}
			HTTP.post('site/cookies', data)
			.then(() => {
			})
			.catch(() => {
			})
		})
		.catch(() => {
			var data = {
				ip: "not available",
				customer_id: null
			}
			HTTP.post('site/cookies', data)
			.then(() => {
			})
			.catch(() => {
			})
		})
	}
	
</script>
<style lang="scss">
@import "./assets/styles/styles.scss";
:root {
   --app-height: 100%;
   --app-width: 100%;
}
html {
	height: 100%;
    width: 100%;
	height: -webkit-fill-available;
    
}
html, body{
    height: 100%;
    width: 100%;
	overflow-y: hidden;
	margin: 0;
    position: fixed;
	-webkit-text-size-adjust: 100%;
	-ms-text-size-adjust: 100%;
	background-color: #ffffff;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #000000;
  height: inherit;
  overflow-y: hidden;
}

.view{
	height: 100%;
	max-height: 94%;
	transition: max-height ease-in 1s;
}

.view.full-height{
	max-height: 100%;
}

.modal-overlay{
	z-index: 10000;
}

.modal-overlay.cook{
	background-color: #f9f9f959;
}

.cook .cookie{
    height: fit-content;
	min-height: 25%;
}

.cookie i a{
	color: #0077e7;
	font-weight: 500;
}

.cookie .cookie__floating__buttons__button--accept{
	color: #000000;
	font-size: 1.4rem;
	background-color: var(--base-color);
}

.modal-overlay .cookies{
    position: fixed;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    width: 94%;
    height: 94%;
    border: 1px solid black;
    background-color: #ffffff;
    -webkit-box-shadow: 0 5px 5px 0 #00000099, 0 1px 10px 0 #00000099;
    box-shadow: 0 5px 5px 0 #00000099, 0 1px 10px 0 #00000099;
    z-index: 101;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
    top: 10px;
    left: 3%;
    flex-direction: column;
    align-items: center;
    flex-wrap: nowrap;
	padding-top: 10px;
}

.cookies .privacy{
	width: 100%;
    height: fit-content;
}

.cookie-block{	
    z-index: 11;
    position: relative;
}

.cookiechoices{
	display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    width: 80%;
    align-content: center;
    margin-left: auto;
    margin-right: auto;
}

.cookiechoices .choice{    
	display: flex;
    flex-direction: row;
    justify-content: space-around;
    width: 100%;
    flex-wrap: wrap;
}

.opening{	
    position: absolute;
    left: 0;
    top: 0;
    z-index: 10;
}



@media only screen and (min-height: 500.98px) and (orientation: landscape) {
	.view{
		height: 92%;
	}
}

</style>
<style >
img {
	pointer-events: none;
}

.cookie{
	border: 2px solid #bbb;
}
.cook .cookie{
	height: 75vh;
    width: 96vw;
    max-width: unset;
}

.cookie__floating__wrap{
	height: 100%;
}

.cookie__floating__content{
	max-height: 80%;
}
.cookie__floating__content img{
	max-height: 25%;
}

.cookie__floating__buttons {
	height: 20%;
}

.cookie .cookie__floating__buttons__button--accept {
	font-size: 1.3rem;
    width: fit-content;
    margin-left: auto;
    margin-right: auto;
	height: fit-content
}


.cookie__floating__buttons__button{
	color: #ffffff !important;
}

</style>
