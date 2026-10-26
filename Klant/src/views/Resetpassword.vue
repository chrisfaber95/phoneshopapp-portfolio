
<script setup>
    import { onMounted, reactive } from 'vue'
    import auth from '@/assets/scripts/auth';
	import { useRoute } from 'vue-router'
	import { useStore } from 'vuex'
	const store = useStore()
    const route = useRoute()
	const state = reactive({
		user: {
			email: "",
			password: "",
			passwordConfirm: "",
            resettoken: ""
		},
		error: [],
		showPassword: false,
		showPasswordConfirm: false
	})


    async function forgotPassword(){
        if(!checkPassword()){
			state.error = "Wachtwoord niet gelijk"
		}
		else{
            const e = await auth.forgotPassword(state.user)
            state.error = e.data.message
        }
    }
	
	function checkPassword(){
		if(state.user.password != state.user.passwordConfirm){
			return false
		}
		return true
	}
    onMounted(() => {
        state.user.resettoken = route.query.resetcode
		store.commit('shopsettings/updateOpened', 2)
	})

</script>
<template>
  <div class="login">
	<h2 v-html="`Wachtwoord wijzigen`"></h2>
        <div class="new-user">
			<form class="register-user">
				<div>
					<label for="email" v-html="`E-mailadres*`"></label>
					<input name="email" type="text" :placeholder="`E-mailadres`" v-model="state.user.email"/>
				</div>
				<div class="password">
					<label for="password" v-html="`Nieuw wachtwoord*`"></label>
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
			</form>
			
            <div class="warning" v-html="state.error" v-if="state.error"></div>
			<div class="bottom">			
				<router-link :to="`/feedback`">
					<button class="return">Problemen met wijzigen?</button>
				</router-link>
				<button @click="forgotPassword()">Wachtwoord wijzigen</button>
			</div>
		</div>
  </div>
</template>
<style lang="scss" scoped>
.login{
	overflow-y: scroll;
}

.register-user{
	font-size: 1.3rem;
	font-weight: 00;
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
	.updates{
		display: flex;
		margin: 10px;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		align-content: center;
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

	.bottom{
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-evenly;
		width: 100%;
		padding-top: 20px;
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