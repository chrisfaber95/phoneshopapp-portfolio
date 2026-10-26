
<script setup>
    import { reactive, onMounted } from 'vue'
    import auth from '@/assets/scripts/auth';
	import Privacy from '@/views/Privacy.vue'
	import '@vuepic/vue-datepicker/dist/main.css';
    import { useStore } from 'vuex'
	const store = useStore()

	const state = reactive({
		user: {
			first_name: "",
			surname: "",
			email: "",
			password: "",
			passwordConfirm: "",
			updates: true,
			dob: '',
			gender: '',
			klantenkaart: '',
			termsandconditions: false,
			waitinglist: false
		},
		error: [],
		showPassword: false,
		showPasswordConfirm: false,
		existingCard: false
	})

    
    function addAccount(){
		if(!checkPassword() || !checkTermsandconditions() || !checkKlantenkaart(state.user.klantenkaart) || !validateEmail()){
			state.error = []
		}
		else{
			auth.register(state.user)
		}
    }
	function checkKlantenkaart(val1){
		if((/^\d+$/.test(val1) && val1.length > 10) || val1 == '') {
			return true
		}
		else {
			alert("Een klantenkaart bestaat uit 13 cijfers");
			return false;
		}
	}
	function checkPassword(){
		if(state.user.password != state.user.passwordConfirm){
			alert("wachtwoord niet gelijk");
			return false
		}
		return true
	}
	
	function checkTermsandconditions(){
		if(!state.user.termsandconditions){
			alert("U moet eerst akkoord gaan met de algemene voorwaarden om een account te kunnen registeren");
			return false
		}
		return true
	}

	function validateEmail() {
        let res = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        return res.test(state.user.email);
      }

	onMounted(() => {
		store.commit('shopsettings/updateOpened', 2)
	})

</script>
<template>
  <div class="register">
	<h2 v-html="`Registreren`"></h2>
        <div class="new-user">
			<form class="register-user">
				<!--<div>
					<label for="gender" v-html="`Hoe wilt u aangesproken worden?`"></label>
					<input name="gender" type="text" :placeholder="`Dhr., Mevr., X, etc.`" v-model="state.user.gender"/>
				</div>-->
				<div>
					<label for="firstname" v-html="`Voornaam*`"></label>
					<input name="firstname" type="text" :placeholder="`Voornaam`" v-model="state.user.first_name"/>
				</div>
				<div>
					<label for="surname" v-html="`Achternaam*`"></label>
					<input name="surname" type="text" :placeholder="`Achternaam`" v-model="state.user.surname"/>
				</div>
				<!--<div class="date">
					<label id="input-group-5" v-html="`Geboortedatum:`"/>
					<Datepicker 
						v-model="state.user.dob" 
						:format="'dd/MM/yyyy'" 
						:enable-time-picker="false"						
					
					<input type="date" placeholder="dd-mm-yyyy" v-model="state.user.dob" />
				</div>/>-->
				<div>
					<label for="email" v-html="`E-mailadres*`"></label>
					<input name="email" type="text" :placeholder="`E-mailadres`" v-model="state.user.email"/>
				</div>
				<div class="password">
					<label for="password" v-html="`Wachtwoord*`"></label>
					<input name="password" :type="state.showPassword ? 'text' : 'password'" :placeholder="`Wachtwoord`" v-model="state.user.password"/>
					<svg 
						xmlns="http://www.w3.org/2000/svg" 
						fill="currentColor" 
						class="bi bi-eye" 
						viewBox="0 0 16 16" 
						@click="state.showPassword = !state.showPassword"
						:style="state.showPassword ? 'color: #000000' : 'color: #ececec'"> 
						<path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/> 
						<path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/> 
					</svg>
				</div>
				<div class="password">
					<label for="confirmpassword" v-html="`Bevestig wachtwoord*`"></label>
					<input name="confirmpassword" :type="state.showPasswordConfirm ? 'text' : 'password'" :placeholder="`Bevestig wachtwoord`" @blur="checkPassword" v-model="state.user.passwordConfirm"/>
					<svg 
						xmlns="http://www.w3.org/2000/svg" 
						fill="currentColor" 
						class="bi bi-eye" 
						viewBox="0 0 16 16" 
						@click="state.showPasswordConfirm = !state.showPasswordConfirm"
						:style="state.showPasswordConfirm ? 'color: #000000' : 'color: #ececec'"> 
						<path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/> 
						<path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/> 
					</svg>
				</div>
				
				<div>
					<div class="updates">
						<label class="checkbox path">
							<input type="checkbox" v-model="state.existingCard" />
							<svg viewBox="0 0 21 21">
								<path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"></path>
							</svg>
						</label>
						<div class="updates grid-item second"  v-html="`Ik heb al een COOP klantenkaart:**`"></div>
					</div>
					<input 
						v-if="state.existingCard"
						name="klantenkaart" 
						type="text" 
						:placeholder="`Klantenkaart nr.`" 
						v-model="state.user.klantenkaart"
						onkeypress='return event.charCode >= 48 && event.charCode <= 57'
						pattern="\d*"
						maxlength="13"/>
				</div>
				<i class="small">* Verplicht
					<br/>
					** 
					Als je geen klantenkaart invult, wordt er automatisch één voor je aangemaakt die alleen geldig is bij Coop Lubbers.
				</i>
				<div class="updates">
					<label class="checkbox path">
						<input type="checkbox" v-model="state.user.updates" />
						<svg viewBox="0 0 21 21">
							<path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"></path>
						</svg>
					</label>
					<div class="updates grid-item second left" v-html="`Schrijf je in om kortingen, persoonlijke aanbiedingen en andere updates te ontvangen.`"></div>
				</div>
				<div class="updates">
					<label class="checkbox path">
						<input type="checkbox" v-model="state.user.waitinglist" />
						<svg viewBox="0 0 21 21">
							<path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"></path>
						</svg>
					</label>
					<div class="updates grid-item second left" v-html="`Meld je aan voor de wachtlijst van de nieuwe bezorgservice en krijg een melding zodra deze beschikbaar is.`"></div>
				</div>
				<div class="updates">
					<label class="checkbox path">
						<input type="checkbox" v-model="state.user.termsandconditions" />
						<svg viewBox="0 0 21 21">
							<path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"></path>
						</svg>
					</label>
					<div class="updates grid-item second left">
						<i >Door je te registreren ga je automatisch akkoord met de <a @click="state.modalOpened = true" style="text-decoration: underline;">Algemene Voorwaarden</a>.</i>
						<div class="modal-overlay" v-if="state.modalOpened">
							<div class="cookies">				
								<Privacy />
								<button class="return" @click="state.modalOpened = false" >Sluiten</button>
							</div>	
						</div>
					</div>
				</div>
			</form>
			
			<button @click="addAccount()">Account aanmaken</button>
		</div>
		<router-link :to="'/login'" class="login">Ik heb al een account</router-link>
  </div>
</template>
<style lang="scss" scoped>
	
	.login{
		font-size: 1.2rem;
		font-weight: 600;
		padding-bottom: 10px;
	}

	.new-user{
		margin-bottom: 10px;
	}
	.new-user > button{
		color: #ffffff;
	}
	.register{
	overflow-y: scroll;
}
.register h2{    
	text-align: left;
    padding-left: 10px;
    border-bottom: 1px solid;
    padding-bottom: 3px;
    margin-top: 0;
}

.register-user{
	font-size: 1.3rem;
	font-weight: 600;
}

.register-user input::placeholder{
	color: #222222;
	opacity: 0.9;
}
.register-user input::-webkit-input-placeholder{
	color: #222222;
	opacity: 0.9;
}

.register-user input::-ms-input-placeholder{
	color: #222222;
	opacity: 0.9;
}
.register-user input::-moz-placeholder{
	color: #222222;
	opacity: 0.9;
}

.password{
	position: relative;
}

.password .bi-eye{
	position: absolute;
    right: 0;
    height: 50%;
    bottom: 0;
    transform: translateY(-25%) translateX(-30%);
}
i.small{
	font-size: 0.9rem;
	font-weight: 400;
	width: 90%;
    display: inline-block;
	text-align: left;
	padding-left: 8px;
	padding-right: 8px;
}
	.updates{
		display: flex;
		margin: 10px;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		align-content: center;
		font-weight: 400;
	}

	.updates .left{
		text-align: left;
	}

	.cookies{
		display: block;
		position: fixed;
		height: 90vh;
		width: 90vw;
		top: 0vh;
		margin: 10px;
		margin-left: auto;
		margin-right: auto;
		background-color: #ffffff;
		color: black;
		border: 1px solid black;
		-webkit-box-shadow: 0 5px 5px 0 #00000099, 0 1px 10px 0 #00000099;
		box-shadow: 0 5px 5px 0 #00000099, 0 1px 10px 0 #00000099;
		justify-content: space-between;
		z-index: 101;
		overflow-y: scroll;
	}
	.closebutton{
		position: absolute;
		right: 5px;
		z-index: 120;
	}
	input{
		height: 2rem;
	}

	@media only screen and (min-height: 500.98px) and (orientation: landscape) {
		.updates{
			justify-content: flex-start
		}

		.password .bi-eye {
			right: 5%;
		}
	}

	@media only screen and (min-width: 500.98px) and (orientation: portrait) {
		.updates{
			justify-content: flex-start
		}

		.password .bi-eye {
			right: 5%;
		}
	}
</style>
<style lang="scss">
.date .dp__input{
	padding: 0.375rem 2.75rem;
}
.dp__theme_light {
  --dp-primary-color: var(--base-color);
  --dp-success-color: var(--base-color);
  --dp-success-color-disabled: var(--base-color-disabled);
}

.dp__menu{
    min-width: 90%;
    font-size: 1.2rem;	
    top: 30% !important;
	left: 5% !important;
    .dp__arrow_top {
        display: none;
    }
}
.dp__input_icon {
    left: 5%;
	font-size: 1.5rem;
}
.dp__clear_icon {
    right: 5%;
}
.dp__calendar {
    width: 100%;
}

.dp__calendar_header {
    width: 100%;
}

.dp__calendar_wrap {
    width: 100%;
}
//.dp__button[aria-label="Open time picker"]{
//    display: none;
//}
@media screen and (orientation: landscape) and (max-height: 539px){
    .dp__menu{
		top: 40px !important;
	}
    .dp__arrow_top {
        display: none;
    }
}
</style>