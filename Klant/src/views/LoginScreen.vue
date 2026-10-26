<script setup>
// @ is an alias to /src
import { reactive, ref, computed } from 'vue'
import LoginForm from '@/components/LoginScreen/LoginForm.vue';
import PasswordResetForm from '@/components/LoginScreen/PasswordResetForm.vue';

	const state = reactive({
      passwordReset: false
  })

	const register = ref({ id: 0, tag: "Registreren", slug: "/signup"})

	const passwordResetButton = computed(() => {
		return state.passwordReset ? 'Terug' : 'Wachtwoord vergeten?<br />Klik hier'
	})

	const loginBlockTitle = computed(() => {
		return state.passwordReset ? 'Wachtwoord vergeten' : 'Inloggen'
	})
</script>
<template>
  <div class="login-screen">	
	<section id="middle">
		<div class="form-block">
			<div class="head">
				<h2 v-html="loginBlockTitle"></h2>
			</div>			
			<LoginForm v-if="!state.passwordReset" />
			<PasswordResetForm v-if="state.passwordReset" />
			<button class="return" @click="state.passwordReset = !state.passwordReset" v-html="passwordResetButton"></button>

			<div class="register">
				<h2> 
          Ben je een nieuwe klant? </h2>
          <i>Maak dan hier een account aan om veilig en gemakkelijk je bestelling te kunnen plaatsen.</i>
				<router-link :to="register.slug"><button class="register">Account aanmaken </button></router-link>
			</div>
		</div>
	</section>
  </div>
</template>

<style scoped lang="scss">
.login-screen{
	width: inherit;
	background: var(--base-color);
	overflow-y: hidden;
}
#header{
    height: 15vh;
    width: 100%;	
	display: inline-flex;
    justify-content: center;
    flex-direction: row;
    align-items: stretch;
    flex-wrap: wrap;
    align-content: center;
    background-color: #ffffff;
    padding: 5px 5px 0px 5px;
    border-bottom: 2px solid #00000099;
}
.logo{
	height: 100%;
	width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
    flex-direction: row;
    font-size: 2rem;
    font-weight: 600;
    font-family: cursive;
}
.logo img{
	width: auto;
	max-height: 100%;
	height: unset;
}

#middle{
	height:100%;
    width: 100%;
	display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-content: center;
    justify-content: center;
    align-items: center;
}
#bottom{
	height: 10vh;
	background-color: rgb(131, 131, 131); 
    width: 100vw;
}
.form-block{
	max-width: 90%;
	max-height: 96%;
    margin-left: auto;
    margin-right: auto;
	padding: 10px;
    background:rgb(250, 250, 250);
	border: 3px solid rgb(168, 168, 168);
    border-radius: 0.25rem;
    box-shadow: 4px 4px 3px 0px #00000066;
    -webkit-box-shadow: 4px 4px 3px 0px #00000066;
}

.register button{
  background-color: var(--base-color);
  border-color: var(--base-color);
  color: #ffffff;
}
/* 
  ##Device = Low Resolution Tablets, Mobiles (Landscape)
  ##Screen = B/w 481px to 767px
*/

@media only screen and (min-height: 500.98px) and (orientation: landscape) {	
    .register{
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
    }
	.register a{
		padding-left: 10px;
	}
}

@media (min-width: 481px){
  
  /* CSS */
  
}

/* 
  ##Device = Tablets, Ipads (portrait)
  ##Screen = B/w 768px to 1024px
*/

@media (min-width: 768px){
  
  /* CSS */
  
}

/* 
  ##Device = Tablets, Ipads (landscape)
  ##Screen = B/w 768px to 1024px
*/

@media (min-width: 768px) and (orientation: landscape) {
  
  /* CSS */
  
}


/* 
  ##Device = Laptops, Desktops
  ##Screen = B/w 1025px to 1280px
*/

@media (min-width: 1025px) {
  
  /* CSS */
  
}


@media (min-width: 1281px) {
  
  /* CSS */
  
}




</style>