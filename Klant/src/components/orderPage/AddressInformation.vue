<script setup>
    import { reactive, defineProps, computed, defineEmits, onMounted, watch} from 'vue';
    import {HTTP, HTTP_Store} from '@/assets/scripts/http-common.js';
    import auth from '@/assets/scripts/auth';

    const props = defineProps({
		"delivery": Boolean,
        "business": Boolean,
        "user": Object
	})

	const state = reactive({        
        user: {
            street: "",
            house_number:"",
            house_addition:"",
            zipcode: "",
            city: "",
            country: ""
        },
        reg: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
        regname: /^[A-Za-z\s]+$/,
        defaultInfoModal: false,
        defaultInformation: [],
        currentChosenInformation: '',
        locations: []
	})

    

    const zipcodeList = computed(() => {       
        return  state.locations.toString().replaceAll(',', ', ')
    })


    

    
	

    function validZipcode(){	
        var zipcode = state.user.zipcode	
        if(state.locations.includes(zipcode.substring(0, 4)) || props.delivery == false){
            updateDetails()
        }
        else{
            alert("Postcode niet gevonden:( \n\rDit betekent dat de postcode niet correct is ingevoerd of wij bezorgen nog niet in dit postcode gebied.")
        }
    }

    function removeInfo(item){

        if(confirm('Weet je zeker dat je deze informatie uit de lijst wilt verwijderen?')){

            const results = state.defaultInformation.filter(info => 
                item.btw == info.btw &&
                item.customerName == info.customerName &&
                item.business == info.business &&
                item.city == info.city &&
                item.customerEmail == info.customerEmail &&
                item.customerName == info.customerName &&
                item.customerPhone == info.customerPhone &&
                item.house_addition == info.house_addition &&
                item.house_number == info.house_number &&    
                item.klantenkaart == info.klantenkaart && 
                item.kvk == info.kvk && 
                item.street == info.street &&     
                item.zipcode == info.zipcode   
            )
            var idlist = results.map((f)=> {
                return f.order_information_id
            })
            var params = {
                order_information_id: idlist
            }
            HTTP.delete('order_information', {data: params})
            .then((response) => {
                if(!response.error){
                    idlist.forEach(element => {                        
                        state.defaultInformation = state.defaultInformation.filter(( obj ) => {
                            return obj.order_information_id !== element;
                        });
                    });
                }
            })
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



    const filteredInformation = computed(() => {
        var info = state.defaultInformation
        let unique = []
        for(var i in info){
            if(unique.filter(item =>
                item.btw == info[i].btw &&
                item.customerName == info[i].customerName &&
                item.business == info[i].business &&
                item.city == info[i].city &&
                item.customerEmail == info[i].customerEmail &&
                item.customerName == info[i].customerName &&
                item.customerPhone == info[i].customerPhone &&
                item.house_addition == info[i].house_addition &&
                item.house_number == info[i].house_number &&    
                item.klantenkaart == info[i].klantenkaart && 
                item.kvk == info[i].kvk && 
                item.street == info[i].street &&     
                item.zipcode == info[i].zipcode      
                ).length == 0){
                unique.push(info[i])
            }
        }
        return unique
    })

    function updateInformation(info){
        state.user.street = info.street
        state.user.housenumber = info.house_number
        state.user.houseaddition = info.house_addition
        state.user.city = info.city
        state.user.country = info.country
        updateDetails()
    }

    function getLocations(){
        var params = {
           //customer_id: localStorage.getItem('user_id'), 
            //accessToken: localStorage.getItem('access_token')
        }
		HTTP_Store.get(`delivery_location`, { params: params })
        .then((response) => {
            var dataArray = [];
            for(var o in response.data) {
                dataArray.push(response.data[o].zipcode);
            }
            state.locations = dataArray
        })
        .catch(() => {
        })
	}

    watch(() => props.user, () => {
        state.user = props.user
    }, {immediate: true, deep: true})

	onMounted(() => {
		getLatestInfo()
        getLocations()
	})
</script>
<template>
    <div class="user-information">
        <div class="default-info">
            <button @click="state.defaultInfoModal = !state.defaultInfoModal" v-html="`Kies opgeslagen informatie`" class="btn btn--stripe" v-if="auth.isAuthenticated()"></button>
            <div class="modal-overlay" v-if="state.defaultInfoModal && auth.isAuthenticated()">
                <div class="default-info-overlay">
                    <div class="information" v-for="info in filteredInformation" :key="info.order_information_id" :class="{'active' : info.order_information_id == state.currentChosenInformation}">
                        <div class="info"  @click="updateInformation(info); state.defaultInfoModal = false">
                            <p v-html="`<b>Naam:</b> ${info.customerName || ''}`"></p>
                            <p v-html="`<b>Email:</b> ${info.customerEmail || ''}`"></p>
                            <p v-html="`<b>Telefoon:</b> ${info.customerPhone || ''}`"></p>
                            <p v-html="`<b>Klantenkaart:</b> ${info.klantenkaart || ''}`"></p>
                            <p v-if="delivery" v-html="`<b>Adres:</b> ${info.street || ''} ${info.house_number || ''} ${info.house_addition || ''}`"></p>
                            <p v-if="delivery" v-html="`<b>Plaats:</b> ${info.city || ''}`"></p>
                            <p v-if="business" v-html="`<b>Bedrijfsnaam:</b> ${info.business || ''}`"></p>
                            <p v-if="business" v-html="`<b>KvK:</b> ${info.kvk || ''}`"></p>
                            <p v-if="business" v-html="`<b>BTW-nummer:</b> ${info.btw || ''}`"></p>
                        </div>
                        <button class="remove" @click="removeInfo(info)" v-html="`x`"></button>
                    </div>
                    <button @click="state.defaultInfoModal = !state.defaultInfoModal" v-html="`Sluiten`"></button>
                </div>
            </div>
        </div>
        
  <form>
        <div class="delivery" v-if="delivery">
            <div class="form">
            <label id="input-group-3" v-html="`Straat:`" label-for="input-3"/>
            <input
                type="text" 
                name="telefoon" 
                placeholder="Straat"
                v-model="state.user.street"
                id="input-8"
                class="form-control"
                @blur="updateDetails()"
                tabindex="8"
            /></div>
            <div class="form">
            <label id="input-group-3" v-html="`Huisnummer:`" label-for="input-3"/>
                <div class="address">
                    <input
                    type="text" 
                    name="telefoon" 
                    placeholder="Huisnr."
                    v-model="state.user.house_number"
                    id="input-9"
                    class="form-control"
                    @blur="updateDetails()"
                    tabindex="9"
                />
                <input
                    type="text" 
                    name="telefoon" 
                    placeholder="Toev."
                    v-model="state.user.house_addition"
                    id="input-10"
                    class="form-control toev"
                    @blur="updateDetails()"
                    tabindex="10"
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
                id="input-11"
                class="form-control"
                @blur="validZipcode()"
                tabindex="11"
            /></div>
            <i class="zipcode-list" @click="state.openZipcodes = !state.openZipcodes" v-html="`Klik hier voor de lijst met postcodes waar wij momenteel bezorgen.`"></i>
                <p class="zipcodes" v-if="state.openZipcodes" v-html="zipcodeList"></p>
            <div class="form">
            <label id="input-group-3" v-html="`Woonplaats:`" label-for="input-3"/>
            <input
                type="text" 
                name="city" 
                placeholder="Woonplaats"
                v-model="state.user.city"
                id="input-12"
                class="form-control"
                @blur="updateDetails()"
                tabindex="12"
            /></div>
        </div>
        </form>
    </div>
</template>
<style lang="scss" scoped>
.user-information{
    width: 100%;
    margin-left: auto;
    margin-right: auto;
}
.form{
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: flex-start;
    justify-content: flex-end;
    align-content: center;
    padding-top: 5px;
    padding-bottom: 15px;
    max-width: 80%;
}
.form label{
    margin-right: 15px;
    font-size: 1.3rem;
    font-weight: 600;
}
.form input{
    max-width: 100%;
    margin: 5px 0px;
}
.form .address{
    display: flex;
    max-width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    flex-wrap: nowrap;
}
.form .address input{
    max-width: 50%;
}
.form .address .toev{
    max-width: 30%;
}

.default-info-overlay{
    background-color: #ffffff;
    overflow-y: scroll
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
    position: relative;
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
.information .info{
    width: 95%;
}
.information .remove{
    position: absolute;
    right: 10px;
    top: 5px;
}
.default-info{
	display: none;
}

.zipcode-list{
    font-size: 1.3rem;
    color: #0073eb;
}

.zipcodes{
    font-size: 1.1rem;
    width: 90%;
    margin-left: auto;
    margin-right: auto;
}
</style>