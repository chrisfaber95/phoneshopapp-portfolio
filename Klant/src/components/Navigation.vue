<template>
	<div class="navigation">
		<div class="top">
			<div class="welcome" v-if="loggedIn" v-html="`Welkom, ${name}`">
			</div>
			<div class="user-icon" v-if="loggedIn && (klantenkaart == '6207038699858' || klantenkaart == '1000000000001')" @click="openSetting(); $emit('fading')">
				<img :src="require('@/assets/icons/user-icon.svg')"/>
			</div>
		</div>		
		<div class="nav">
			<ul>
				<router-link :to=item.slug v-for="item in state.nav_public" v-bind:key="item.id" @click="$emit('fading')">
					<div class="sidebar-item">
						{{item.tag}}
					</div>
				</router-link>
			</ul>
			<ul v-if="!auth.isAuthenticated() && !loggedIn">
				<router-link :to=item.slug v-for="item in state.nav_no_user" v-bind:key="item.id" @click="$emit('fading')">
					<div class="sidebar-item">
						{{item.tag}}
					</div>
				</router-link>
			</ul>
			<ul v-if="auth.isAuthenticated() && loggedIn">
				<router-link :to=item.slug v-for="item in state.nav_user" v-bind:key="item.id" @click="$emit('fading')">
					<div class="sidebar-item">
						{{item.tag}}
					</div>
				</router-link>
				<div class="sidebar-item" @click="logout(); $emit('fading')" v-html="`Uitloggen`">
				</div>
			</ul>
		</div>
		<div class="bottom">
			<button class="return" @click="$emit('fading')" v-html="`Sluiten`"></button>
		</div>
	</div>
</template>

<script setup>
    import { reactive, computed, defineEmits} from 'vue'
	import auth from '@/assets/scripts/auth'
	import { useStore } from 'vuex'
	import router from '@/router'

	const store = useStore()



	const state = reactive({        
        rowSize: 5,
		shelfStyle: false,
		nav_public: [
			{ id: 0, tag: "Producten", slug: "/"},
			{ id: 0, tag: "Mijn Lijstje", slug: "/grocerylist"},
			{ id: 1, tag: "Aanbiedingen", slug: "/discounts"},
			{ id: 2, tag: "Folder", slug: "/folder"},
			{ id: 16, tag: "Spaaracties", slug: "/spaaracties"},
			{ id: 16, tag: "Retourneren", slug: "/returns"},
			//{ id: 3, tag: "Zelfscanner", slug: "/zelfscanner"},
			//{ id: 4, tag: "Privacybeleid", slug: "/privacy"},
			//{ id: 6, tag: "Informatie", slug: "/information"},
			//{ id: 7, tag: "Spelregels", slug: "/spelregels"},
			//{ id: 8, tag: "Klantenkaart", slug: "/loyalty_card"},
			//{ id: 9, tag: "Winkel", slug: "/store"},
			//{ id: 10 tag: "Recepten", slug: "/recept"}
			{ id: 5, tag: "Algemene Voorwaarden", slug: "/algemenevoorwaarden"},
			{ id: 6, tag: "Contact", slug: "/contact"},
			{ id: 6, tag: "Klachten", slug: "/feedback"},
		],
		nav_no_user:[
			//{ id: 11, tag: "Vacatures", slug: "/vacatures"},
			{ id: 11, tag: "Registreren", slug: "/signup"},
			{ id: 12, tag: "Inloggen", slug: "/login"},
		],
		nav_user: [	
			{ id: 13, tag: "Favorieten", slug: "/favorites"},
			//{ id: 14, tag: "Instellingen", slug: "/settings"},
			{ id: 15, tag: "Facturen", slug: "/accountOrders"},
			{ id: 8, tag: "Klantenkaart", slug: "/loyalty_card"},
			//{ id: 11, tag: "Vacatures", slug: "/vacatures"}
		],
		user: auth.user,
		auth: auth
	})

		function logout(){
			auth.logout()
		}

	const name = computed(() => { return localStorage.getItem('name') || ''})
	
	const loggedIn = computed(() => {
		return store.getters['shopsettings/getLoggedIn']
	})

	function openSetting(){
		router.push('/settings')
	}

    defineEmits(['fading']);

	const klantenkaart = computed(() => {
      return store.getters['shopsettings/getUserinfo'].klantenkaart
      //return localStorage.getItem('klantenkaart')
    })
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.navigation{
    -webkit-box-shadow: 4px 5px 4px 0px rgb(0 0 0 / 30%);
    box-shadow: 4px 5px 4px 0px rgb(0 0 0 / 30%);	
    border-bottom: 1px solid #000000;
    border-left: 2px solid #000000;
    border-top: 1px solid #000000;	
    border-bottom-left-radius: 30px;
    background-color: #ffffff;
    min-height: 50vh;
    height: 88%;
    display: block;
    overflow-y: scroll;
    z-index: 100000;
    position: fixed;
    top: 0;
    max-width: 98vw;
    right: 0;
	display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
	justify-content: flex-start;
	font-size: 1.2rem;
	padding: 5px;
}
.navigation .top{
	width: 100%;
	display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: reverse;
    -ms-flex-direction: row-reverse;
    flex-direction: row-reverse;
    -ms-flex-wrap: nowrap;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-end;
}
.navigation .bottom{
	position: absolute;
    right: 5px;
    bottom: 5px;
}
.navigation a{
	text-decoration: none;
}
.navigation ul{
	padding: 0;
	display: flex;
    flex-direction: column;
    justify-content: flex-start;
    margin: unset;
}
.return{	
    margin-left: auto;
	margin-right: 10px;
}
.sidebar-item{
	padding: 5px;
	margin: 5px;
	color: #000000;
	font-weight: 600;
	border: 1px solid black;
	border-radius: 5px;
    -webkit-box-shadow: 2px 3px 2px 0px rgb(0 0 0 / 30%);
    box-shadow: 2px 3px 2px 0px rgb(0 0 0 / 30%);
}
.sidebar-item.empty{
	padding: unset;
	margin: unset;
	border: unset;
	border-radius: unset;
    box-shadow: unset;
}
.navigation a.router-link-exact-active .sidebar-item{
    color: var(--base-color);
}

.welcome{
	width: 50%;
    padding: 5px;
}

.nav{
	display: grid;
    grid-template-columns: repeat(2, 50%);
	width: 100%;
}

.user-icon{
	width: 45px;
    padding: 5px;
    border: 1px solid #000000;
    border-radius: 50%;
    height: 45px;
}
</style>
