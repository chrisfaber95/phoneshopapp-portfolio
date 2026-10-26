<script setup>
import {ref, computed, defineEmits} from 'vue'
import auth from '@/assets/services/auth'
//import tv from '@/assets/icons/bestellingscherm.svg'
import tabletAlt from '@/assets/icons/kassascanner.svg'
import qrscanner from '@/assets/icons/qr-scanner.svg'
import productin from '@/assets/icons/product-in.svg'
import gebruikers from '@/assets/icons/gebruikers.svg'
//import administratie from '@/assets/icons/administratie.svg'

	const navigationItems =  ref([
		{tag: "Verzamelen", slug: "/", svg:productin, authentication: false},
		{tag: "Actie Bestellingen", slug: "/actie_orders", svg:productin, authentication: false},
		{tag: "Kassascanner", slug: "/kassascanner", svg:tabletAlt, authentication: false},
		{tag: "Afhaalscanner", slug: "/afhaalscanner", svg: qrscanner, authentication: false},
		{tag: "Actiescanner", slug: "/actiescanner", svg: qrscanner, authentication: false},
		//{tag: "Bestellingen Scherm", slug: "/bestellingen", svg: tv, phone: true, authentication: false},
		//{tag: "Administratie", slug: "/admin", svg: administratie, authentication: true},
		//{tag: "Gebruikers", slug: "/register", svg: gebruikers, authentication: true},
		{tag: "Winkel Instellingen", slug: "/store", svg: gebruikers, authentication: true},
		//{tag: "Bezorg Instellingen", slug: "/bezorging_info", svg: administratie, authentication: true}
	])

	const navigationAuthenticated = computed(() => {
		let nav = []
		navigationItems.value.forEach(element => {
			if (!element.authentication) {
				nav.push(element)
			}
			else if(element.authentication && auth.isAdmin()){
				nav.push(element)
			}
		});
		return nav
	})

	function logoutUser(){
		auth.logout()
	}
	function fade(){
		emit('fading')
	}
    const emit = defineEmits(['fading'])
</script>

<template>
	<div class="navigation">
		<nav>
			<div v-bind:class="{ 'no-phone': item.phone }" class="nav-item" v-for="(item, index) in navigationAuthenticated" v-bind:key="index" @click="fade()">
				<router-link :to=item.slug>
					<img class="nav-img" :src=item.svg />
					<div class="nav-item-tag">{{item.tag}}</div>
				</router-link>
			</div>
			<div class="nav-item" v-if="auth.isAuthenticated()">
				<button @click="logoutUser()" >Uitloggen</button>
			</div>
		</nav>
	</div>
</template>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.navigation{
    background-color: #ffffff;
}

nav{   
	padding: 10px;
    width: 95%;
    height: 95%;
    display: flex;
	flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;
    align-items: flex-start;
    align-content: space-around;
}
.nav-item{
	width: 50%;
}
.nav-item-tag{
	color: black;
    font-weight: 600;
    font-size: 1.3rem;
	margin-top: -5px;
}
.nav-img{
	max-width: 50%;
	height: calc(100% - 2rem);
}
@media screen and (orientation: landscape) {
		.nav-item{
		max-height: 40%;
		max-width: 25%;
	}
}
</style>
