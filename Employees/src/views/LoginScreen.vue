<script setup>
// @ is an alias to /src
import { ref, computed } from 'vue'
import LoginForm from '@/components/LoginScreen/LoginForm.vue';
import PasswordResetForm from '@/components/LoginScreen/PasswordResetForm.vue';
import winkeltoolLogo from '@/assets/winkeltool-logo.jpeg';

	//const publicPath = process.env.BASE_URL
	const passwordReset = ref(false)
    
	const passwordResetButton = computed(() => {
		return passwordReset.value ? 'Back' : 'Wachtwoord vergeten? Klik hier'
	})

	const loginBlockTitle = computed(() => {
		return passwordReset.value ? 'Wachtwoord vergeten' : 'Inloggen'
	})
</script>
<template>
  <div class="login-screen">	  
	<section id="header">	
		<div class="logo">
			<img class="img-fluid" :src="winkeltoolLogo"/>
			<div class="title-text" v-html="`Winkeltool`"></div>
		</div>
	</section>
	<section id="middle">
		<div class="form-block">
			<div class="head">
				<h2 v-html="loginBlockTitle"></h2>
			</div>			
			<LoginForm v-if="!passwordReset" />
			<PasswordResetForm v-if="passwordReset" />
			<button class="reset-button" @click="passwordReset = !passwordReset" v-html="passwordResetButton"></button>
		</div>
	</section>
	<section id="bottom">
	</section>
  </div>
</template>

<style scoped lang="scss">
.login-screen{
	width: inherit;
	height: inherit;
	background: #d6d6d6;
	overflow-y: hidden;
}
#header{
    height: 15vh;
    width: calc(100% - 10px);
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
	height:75vh;
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
.reset-button{
	white-space: pre-line;
    width: 75%;
	width: fit-content;
    font-size: 1rem;
}
/* 
  ##Device = Low Resolution Tablets, Mobiles (Landscape)
  ##Screen = B/w 481px to 767px
*/

@media (orientation: landscape){

	#header{
		max-height: 50px;
	}

	#middle{
		height: calc(100vh - 100px);
	}
	#middle .form-block{
		padding: 0;    
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: stretch;
		align-content: center;
		justify-content: space-around; 
	}
	.form-block > div{
		width: 90%;
	}
	.form-block .login-form{
		display: flex;
		flex-direction: column;
		flex-wrap: wrap;
		align-content: center;
		align-items: center;
	}

	#bottom{
		max-height: 50px;
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