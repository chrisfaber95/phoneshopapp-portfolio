<script setup>
	import { ref, computed, reactive, onMounted, watch } from 'vue'
	//import $ from 'jquery'
	//import {HTTP} from '@/assets/services/http-common.js';
    import { useRoute, useRouter } from 'vue-router'
	import auth from '@/assets/services/auth'

	import Header from '@/components/Basics/Header.vue'
	import DeliverySettings from '@/components/Storesettings/DeliverySettings.vue'
	import BusinessHours from '@/components/Storesettings/Business_Hours.vue'
	import Assortiment from '@/components/Storesettings/Assortiment.vue'
	import Joboffer from '@/components/Storesettings/Joboffers.vue'
	import Customers from '@/components/Storesettings/Administratie/Customers.vue'
	import Acties from '@/components/Storesettings/Acties.vue'
	import Register from '@/views/AccountsScreen.vue'
	import Admin from '@/views/AdministratieScreen.vue'
	import tabletAlt from '@/assets/icons/kassascanner.svg'
//import qrscanner from '@/assets/icons/qr-scanner.svg'
import productin from '@/assets/icons/product-in.svg'
import gebruikers from '@/assets/icons/gebruikers.svg'
import administratie from '@/assets/icons/administratie.svg'
	//import { useStore } from 'vuex'
    const route = useRoute()
    const router = useRouter()
	//const store = useStore()

    const state = reactive({
			params: null
    })

	const navigationItems =  ref([
		{tag: "Openingstijden", slug: "business_hours", link: "/store/business_hours", svg:productin, authentication: true},
		{tag: "Bezorg Instellingen", slug: "bezorging_info", link: "/store/bezorging_info", svg:productin, authentication: true},
		{tag: "Assortiment", slug: "assortiment", link: "/store/assortiment", svg:productin, authentication: true},
		{tag: "Vacatures", slug: "job_offers", link: "/store/job_offers", svg:tabletAlt, authentication: true},
		{tag: "Gebruikers", slug: "register", link: "/store/register", svg: gebruikers, authentication: true},
		{tag: "Administratie", slug: "admin", link: "/store/admin", svg: administratie, authentication: true},
		{tag: "Scanner", slug: "admin", link: "/scanner", svg: administratie, authentication: true},
		{tag: "Klanten", slug: "customers", link: "/store/customers", svg: administratie, authentication: true},
		{tag: "Acties", slug: "acties", link: "/store/acties", svg: administratie, authentication: true},
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

    onMounted(() => {
    })

    watch(() => route.params['menu'], () => {
		console.log(route)
        state.params = route.params['menu']
        const found = navigationItems.value.some(obj => obj.slug === state.params);
        if(!found && route.path == '/store'){
            firstPage()
        }
    }, {immediate: true, deep: true})

    function firstPage(){
        state.params = null
        router.push('/store')
    }

</script>
<template>
	<div class="collecting-screen">
		<div class="screen">
            <div class="navigation" v-if="state.params === null">
				<p v-html="'V0.19.21'"></p>
                <nav>
                    <div v-bind:class="{ 'no-phone': item.phone }" class="nav-item" v-for="(item, index) in navigationAuthenticated" v-bind:key="index">
                        <router-link :to=item.link>
                            <img class="nav-img" :src=item.svg />
                            <div class="nav-item-tag">{{item.tag}}</div>
                        </router-link>
                    </div>
                </nav>
            </div>
            <div class="content" v-if="state.params !== null">
                <div class="back">
                    <button class="return" @click="firstPage()">Terug</button>
                </div>
                <DeliverySettings v-if="state.params=='bezorging_info'" />
                <BusinessHours v-if="state.params=='business_hours'" />
                <Assortiment v-if="state.params=='assortiment'" />
                <Register v-if="state.params=='register'" />
                <Joboffer v-if="state.params=='job_offers'" />
                <Admin v-if="state.params=='admin'" />
                <Customers v-if="state.params=='customers'" />
                <Acties v-if="state.params=='acties'" />
            </div>
		</div>
		<Header />
	</div>
</template>
<style scoped>
.collecting-screen{
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.screen{
	overflow-y:scroll;
	height: 94%;	
    width: 100%;
    overflow-x: hidden;
}
.navigation{
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
.content{
	height: 100%;
	position: relative;
}
.content .back{
	position: absolute;
    left: 10px;
	bottom: 0px;
}

.content .back button{
    font-size: 1.2rem;
    padding: 3px;
}

@media screen and (orientation: landscape) {
		.nav-item{
		max-height: 40%;
		max-width: 25%;
	}
}

</style>
