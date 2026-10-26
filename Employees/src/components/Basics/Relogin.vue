<script setup>
    import { onMounted, reactive } from 'vue'
    import auth from '@/assets/services/auth';
    //import NfcScanner from '@/components/LoginScreen/NfcScanner.vue';

    const state = reactive({
            formInfo: {
                username: '',
                password: ''
            },
        })

    
    function login(){
        auth.relogin(state.formInfo.username, state.formInfo.password)
    }

    onMounted(() => {
        state.formInfo.username = localStorage.getItem('cardnumber')
    })

</script>
<template>
    <div class="login-form">
        <p class="header">Voer uw inlog gegevens opnieuw in om verder te gaan.</p>
        <form @submit.prevent="login">
            <div class="input-bars">
                <input
                    type="text"
                    placeholder="Username"
                    v-model="state.formInfo.username"
                    required />
                <input
                    type="password"
                    placeholder="Password"
                    v-model="state.formInfo.password" 
                    required />
                <input type="submit" value="Login">
            </div>
            <!--<div class="input-buttons">          
                <NfcScanner />
            </div>-->
        </form>
    </div>	
</template>
<style scoped>
    .login-form .header{
        font-size: 1.8rem;
        font-weight: 600;
        padding-top: 25px;
        padding-bottom: 25px;
        max-width: 90%;
        margin-left: auto;
        margin-right: auto;
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