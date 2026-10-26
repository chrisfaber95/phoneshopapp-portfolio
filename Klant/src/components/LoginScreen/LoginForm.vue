<script setup>
    import { reactive } from 'vue'
    import auth from '@/assets/scripts/auth';

    const state = reactive({
            formInfo: {
                username: '',
                password: ''
            },
            error: null
        })

    
    async function login(){
        const e = await auth.login(state.formInfo.username, state.formInfo.password)
        state.error = e
    }

</script>
<template>
    <div class="login-form">
        <form @submit.prevent="login">
            <div class="input-bars">
                <input
                    type="text"
                    placeholder="E-mailadres"
                    v-model="state.formInfo.username"
                    required />
                <input
                    type="password"
                    placeholder="Wachtwoord"
                    v-model="state.formInfo.password" 
                    required />
                <div class="warning" v-html="state.error" v-if="state.error"></div>
                <input class="login" type="submit" value="Inloggen">
            </div>
        </form>
    </div>	
</template>
<style scoped>
input[type="submit"]{
  color: #ffffff;
  background-color: #0b8600;
  border-color: #0b8600;
}

@media (orientation: landscape){
    .login-form form{
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-content: flex-start;
        justify-content: space-around;
    }
     .input-bars,
     .input-buttons{
        width: 100%;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: flex-start;
        align-content: flex-start;
        justify-content: space-around;
    }
    .input-bars input{
        width: 40%;
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