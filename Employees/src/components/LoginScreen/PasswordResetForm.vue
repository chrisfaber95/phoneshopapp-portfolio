<script setup>
    import { reactive } from 'vue'
    import auth from '@/assets/services/auth';

    const state = reactive({
            formInfo: {
                email: ''
            },
        })

    
    function resetPassword(){
        auth.forgotPassword(state.formInfo.email)
    }

</script>
<template>
    <div class="password-rest-form">
        <form @submit.prevent="resetPassword">
            <input
                type="text"
                placeholder="Username"
                v-model="state.formInfo.email"
                required />
            <button @click="forgotPassword()">Request new password.</button>
        </form>
    </div>	
</template>
<style scoped>

</style>