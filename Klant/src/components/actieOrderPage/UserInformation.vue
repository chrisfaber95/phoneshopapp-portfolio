<script setup>
    import { reactive, defineProps, defineEmits, onMounted, watch} from 'vue';
    import {HTTP} from '@/assets/scripts/http-common.js';
    import auth from '@/assets/scripts/auth';

    defineProps({
		"delivery": Boolean,
        "business": Boolean
	});

	const state = reactive({     
        firstname: '',
        lastname: '',   
        user: {
            name: "",
            email: "",
            klantenkaart: "",
            phone: "",
            address: "",
            housenumber:"",
            houseaddition:"",
            zipcode: "",
            city: "",
            country: "",
            business: "",
            kvk: "",
            order_information_id: ''
        },
        reg: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
        regname: /^[A-Za-z\s]+$/,
        defaultInfoModal: false,
        defaultInformation: [],
        currentChosenInformation: ''
	})

    watch(() => state.firstname, () => {
        state.user.name = `${state.firstname} ${state.lastname}`
    })
    watch(() => state.lastname, () => {
        state.user.name = `${state.firstname} ${state.lastname}`
    })
    

    
    function isEmailValid() {
        return (state.user.email == "")? "" : (state.reg.test(state.user.email)) ? 'has-success' : 'has-error';
    }

    function validMail(){
            var mail = state.user.email
			if(mail == null || mail == '' || mail.replace(/\s+/g, '') == ''){
				return false
			}
			else if(!state.reg.test(mail)){
                alert("Voer een geldig Emailadres in")
			}
			else{
				updateDetails()
			}
		}
	function validName(){	
        var name = state.user.name	
        if(name == null || name == '' || name.replace(/\s+/g, '') == ''){
            return false
        }
        else if(!state.regname.test(name)){
            alert("Voer een geldig naam in")
        }
        else{
            updateDetails()
        }
    }

    function updateDetails(){
        emit('updateDetails', state.user)
    }

    const emit = defineEmits(['updateDetails'])

	function getLatestInfo(){
        var params = {
            customer_id: localStorage.getItem('user_id'), 
            //accessToken: localStorage.getItem('access_token')
        }
		HTTP.get(`order_information`, { params: params })
        .then((response) => {
            state.defaultInformation = response.data
        })
        .catch(() => {
        })
	}

    

    function updateInformation(info){
        state.user.name = info.customerName
        state.user.email = info.customerEmail
        state.user.klantenkaart = info.klantenkaart
        state.user.phone = info.customerPhone
        state.user.street = info.street
        state.user.housenumber = info.house_number
        state.user.houseaddition = info.house_addition
        state.user.city = info.city
        state.user.country = info.country
        state.user.business = info.business
        state.user.kvk = info.kvk
        state.order_information_id = info.order_information_id
        updateDetails()
    }
	onMounted(() => {
		getLatestInfo()
	})
</script>
<template>
    <div class="user-information">
        <div class="default-info">
            <!--<button @click="state.defaultInfoModal = !state.defaultInfoModal" v-html="`Kies opgeslagen informatie`" class="btn btn--stripe" v-if="auth.isAuthenticated()"></button>-->
            <div class="modal-overlay" v-if="state.defaultInfoModal && auth.isAuthenticated()">
                <div class="default-info-overlay">
                    <div class="information" v-for="info in state.filteredInformation" :key="info.order_information_id" @click="updateInformation(info)" :class="{'active' : info.order_information_id == state.currentChosenInformation}">
                        <p v-html="`<b>Naam:</b> ${info.customerName}`"></p>
                        <p v-html="`<b>Email:</b> ${info.customerEmail}`"></p>
                        <p v-html="`<b>Telefoon:</b> ${info.customerPhone}`"></p>
                        <!--<p v-html="`<b>Klantenkaart:</b> ${info.klantenkaart}`"></p>-->
                        <p v-if="delivery" v-html="`<b>Adres:</b> ${info.street} ${info.house_number} ${info.house_addition}`"></p>
                        <p v-if="delivery" v-html="`<b>Plaats:</b> ${info.city}`"></p>
                        <p v-if="business" v-html="`<b>Bedrijfsnaam:</b> ${info.business}`"></p>
                        <p v-if="business" v-html="`<b>KvK:</b> ${info.kvk}`"></p>
                    </div>
                    <button @click="state.defaultInfoModal = !state.defaultInfoModal" v-html="`Sluiten`"></button>
                </div>
            </div>
        </div>
        <div class="form">
            <label id="input-group-1" v-html="`Naam:`" label-for="input-1"/>
            <input
                type="text" 
                name="name"
                placeholder="Voornaam"
                v-model="state.user.name"
                id= "input-1"
                @blur="validName()"
            />
        </div>
        <!--<div class="form">
            <label id="input-group-1" v-html="`Achternaam:`" label-for="input-1"/>
            <input
                type="text" 
                name="name"
                placeholder="Achternaam"
                v-model="state.user.name"
                id= "input-1"
                @blur="validName()"
            />
        </div>-->
        <div class="delivery" v-if="business">
            <div class="form">
                <label id="input-group-1" v-html="`Bedrijfsnaam:`" label-for="input-1"/>
                <input
                    type="text" 
                    name="name"
                    placeholder="Bedrijfsnaam"
                    v-model="state.user.companyName"
                    id= "input-1"
                />
            </div>
            <div class="form">
                <label id="input-group-1" v-html="`KvK:`" label-for="input-1"/>
                <input
                    type="text" 
                    name="name"
                    placeholder="KvK"
                    v-model="state.user.kvk"
                    id= "input-1"
                />
            </div>
        </div>
        <div class="form">
        <label id="input-group-2" v-html="`Email:`" label-for="input-2" :class="['input-group', isEmailValid()]"/>
            <input
                type="email" 
                name="email" 
                placeholder="Email"
                v-model="state.user.email"
                id= "input-2"
                class="form-control"
                @blur="validMail()"
            /></div>
        <!--<div class="form">
        <label id="input-group-4" v-html="`Klantenkaart:`" label-for="input-4"/>
            <input
                type="text" 
                name="pasnummer" 
                placeholder="Klantenkaart"
                v-model="state.user.klantenkaart"
                id= "input-4"
                class="form-control"
                onkeypress='return event.charCode >= 48 && event.charCode <= 57'
                pattern="\d*"
                @blur="updateDetails()"
            /></div>-->
        <div class="form">
        <label id="input-group-3" v-html="`Telefoon:`" label-for="input-3"/>
            <input
                type="text" 
                name="telefoon" 
                placeholder="Telefoon"
                v-model="state.user.phone"
                id= "input-3"
                class="form-control"
                pattern="\d*"
                @blur="updateDetails()"
            /></div>
        <div class="delivery" v-if="delivery">
            <div class="form">
            <label id="input-group-3" v-html="`Straat:`" label-for="input-3"/>
            <input
                type="text" 
                name="telefoon" 
                placeholder="Straat"
                v-model="state.user.street"
                id= "input-3"
                class="form-control"
                @blur="updateDetails()"
            /></div>
            <div class="form">
            <label id="input-group-3" v-html="`Huisnummer:`" label-for="input-3"/>
                <div class="address">
                    <input
                    type="text" 
                    name="telefoon" 
                    placeholder="Huisnr."
                    v-model="state.user.housenumber"
                    id= "input-3"
                    class="form-control"
                    @blur="updateDetails()"
                />
                <input
                    type="text" 
                    name="telefoon" 
                    placeholder="Toev."
                    v-model="state.user.houseaddition"
                    id= "input-3"
                    class="form-control"
                    @blur="updateDetails()"
                />
                </div>
           </div>
            <div class="form">
            <label id="input-group-3" v-html="`Postcode:`" label-for="input-3"/>
            <input
                type="text" 
                name="zipcode" 
                placeholder="Postcode"
                v-model="state.user.zipcode"
                id= "input-3"
                class="form-control"
                @blur="updateDetails()"
            /></div>
            <div class="form">
            <label id="input-group-3" v-html="`Woonplaats:`" label-for="input-3"/>
            <input
                type="text" 
                name="city" 
                placeholder="Woonplaats"
                v-model="state.user.city"
                id= "input-3"
                class="form-control"
                @blur="updateDetails()"
            /></div>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.form{
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: flex-start;
    justify-content: flex-end;
    align-content: center;
    padding-top: 5px;
    padding-bottom: 15px
}
.form label{
    margin-right: 15px;
    font-size: 1.3rem;
    font-weight: 600;
}
.form input{
    max-width: 80%;
    margin: 5px 0px;
}
.form .address{
    display: flex;
    max-width: 90%;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    flex-wrap: nowrap;
}
.form .address input{
    
    max-width: 50%;
}

.default-info-overlay{
    background-color: #ffffff;
    
    overflow-y: scroll;
}
.information{
    border: 1px solid #cfcfcf;
    padding: 5px;
    margin: 10px;
    border-radius: 0.25rem;
    box-shadow: 2px 2px 1.5px 0px #00000066;
    -webkit-box-shadow: 2px 2px 1.5px 0px #00000066;
    display: inline-block;
    width: 90%;
    margin-left:auto;
    margin-right:auto;
}
.information.active{
    border: 1px solid var(--base-color);
}
.information p{
    margin: 0;
    text-align: left;
}
.information:hover, .information:focus, .information:active{
    border: 1px solid var(--base-color);
    padding: 5px;
    margin: 10px;
    border-radius: 0.25rem;
    box-shadow: 4px 4px 3x 0px #00000066;
    -webkit-box-shadow: 4px 4px 3px 0px #00000066;
    cursor: pointer;
}

</style>