
<script setup>
/* TODO email toevoegen voor afbeeldingen */
    import { reactive, onMounted } from 'vue'
import {HTTP} from '@/assets/scripts/http-common.js';
    const state = reactive({
      publicPath: process.env.BASE_URL,
      message: ''
    })
    const details = reactive({
      name: '',
      email: '',
      problem: ''
    })
        
    

  

  onMounted(() => {
    getCustomerInfo()
	})

   function getCustomerInfo(){
            const id = localStorage.getItem("user_id");
            const token = localStorage.getItem("access_token");

            const params = {
                customer_id: id,
                accessToken: token
            }
            HTTP.get("customer", {params})

            .then(response => {
                state.customer_info = response.data[0]
            })
            .catch(() => {
            })
        }

    function sendEmail(){
        if(details.name == '' || details.email == '' || details.problem == '') alert("Alle velden moeten ingevoerd worden om uw feedback te verwerken.")
        else{
            const params = {
                details: details
            }
            HTTP.post("feedback", params)
            .then(response => {
                state.message = response.data.message
            })
            .catch(() => {
                alert("Iets ging verkeerd.")
            })
        }
       
    }
</script>
<template>
  <div class="contact" >
    <div class="contactinfo">
    <div class="adres">
        <h2>Feedback formulier</h2>
        <p>
            Heb je een suggestie voor verbetering of een probleem dat we moeten oplossen? Laat het ons weten via dit formulier.</p> 
    </div>
    <form @submit.prevent="sendEmail" class="form">
        <div class="information">
            <label for="name" v-html="`Uw naam*`"></label>
            <input name="name" id="name" v-model="details.name" placeholder="Uw naam" required/>        
            <label for="email" v-html="`E-mailadres*`"></label>
            <input name="email" id="email" v-model="details.email" placeholder="E-mailadres" required/>    
        </div>
        <div class="feedback-form">
            <label for="feedback" v-html="`Feedback geven*`"></label>
            <textarea 
                name="feedback"
                id="feedback"
                v-model="details.problem" 
                placeholder="Laat het ons weten."
                cols="30" 
                rows="7"
                required>
            </textarea>
        </div>
        <input type="submit" value="Verstuur" class="submit"/>
    </form>
    <p class="error" v-html="state.message"></p>
    </div>
  </div>
</template>
<style scoped>
  .contact{
    width: 100%;
    color: #000000;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: center;
    align-content: center;
    justify-content: space-around;
    overflow-y: scroll;
}
.contactinfo{
    width: 90%;
    height: 100%;
    margin-left: auto;
    margin-right: auto;
}
.contactinfo p{
    width: 100%;
}
.contactinfo b{
    width: 100%;
}

textarea{
    font-size: 1.1rem;
    max-width: 100%;
}

.form{
    font-size: 1.2rem;
}

.form label{
    font-weight: 600;
}

.submit{
    width: min-content;
}

@media only screen and (min-height: 500.98px) and (orientation: landscape) {
    .form{
        display: grid;
        grid-template-columns: repeat(4, 25%);
    }
    
    .form .information{
        grid-column: 1/3;
    }
    .form .information *{
        width: 100%;
    }
    
    .form .feedback-form{
        grid-column: 3/5;
    }
    textarea{
        font-size: 1.2rem;
    }
}

@media only screen and (min-width: 500.98px) and (orientation: portrait) {
    .form{
        display: grid;
        grid-template-columns: repeat(4, 25%);
    }
    
    .form .information{
        grid-column: 1/5;
    }
    .form .information *{
        width: 100%;
    }
    .form .feedback-form{
        grid-column: 1/5;
        grid-row: 2;
        display: inline-flex;
        flex-direction: column;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-start;
    }
    .form .feedback-form label{
        width: 100%;
    }

    .feedback-form textarea{
        margin-top: 10px;
        width: 70%;
    }
    
    textarea{
        font-size: 1.2rem;
    }
}

</style>