<script setup>
    import { reactive } from 'vue'
    import auth from '@/assets/scripts/auth';

    const state = reactive({
            user: {
                email: ''
            },
            error: null
        })

    
    async function forgotPassword(){
        const e = await auth.forgotPassword(state.user)
        state.error = e.data.message
    }
</script>
<template>
    <div class="password-rest-form">
        <form @submit.prevent="resetPassword">
            <input
                type="text"
                placeholder="E-mailadres"
                v-model="state.user.email"
                required />
            <button @click="forgotPassword()">Nieuw wachtwoord aanvragen</button>
            <div class="warning" v-html="state.error" v-if="state.error"></div>
        </form>
        <router-link :to="`/feedback`">
            <button class="problem">Ervaar je problemen bij het aanvragen van een nieuw wachtwoord?</button>
        </router-link>
    </div>	
</template>
<style scoped>
.problem{
    font-size: 1.1rem;
    background-color: #ffffff;
    color: #000000;
    border-color: #000000;
}
</style>