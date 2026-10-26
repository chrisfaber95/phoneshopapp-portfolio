<script setup>
    import { reactive, defineProps, defineEmits, onMounted, watch} from 'vue';
    
const props = defineProps({
		"delivery": Boolean,
        "business": Boolean,
        "info": Object,
        "standard": String,
        "workstandard": String,
        "invoicestandard": String
	})

	const state = reactive({        
        user: {
            first_name: '',
            surname: '',
            customerPhone: '',
            business: '',
            btw: '',
            kvk: '',
            street: "",
            house_number:"",
            house_addition:"",
            zipcode: "",
            city: "",
            title: 'Prive',
            contactperson: '',
            businessphone: '',
            custom_label: ''
        },
        standard: '',
        business: false,
        reg: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
        regname: /^[A-Za-z\s]+$/,
        zipcodeList: false
	})

    

    


    

    
	

    

    

    function updateDetails(){
        emit('updateDetails', state.user)
    }

    function closeModal(){
        emit('close')
    }

    const emit = defineEmits(['updateDetails', 'setAsStandard', 'setAsWorkStandard', 'setAsInvoiceStandard', 'close'])

    watch(() => state.user, () => {
        //updateDetails()
    }, {immediate: true, deep: true})

	onMounted(() => {
        for (const key in props.info) {
            if (Object.prototype.hasOwnProperty.call(props.info, key)) {                
                state.user[key] = props.info[key];
            }
        }
        if(props.info?.business != ''){
            state.business = true
        }
        state.standard = props.standard
	})
    
    
    
    function isNew(){
        if(state.user.customer_information_id) return false
        return true
    }
    
    
    
    
</script>
<template>
    <div class="edit_address">
        <h2 v-html="isNew() ? 'Nieuwe adresgegevens' : 'Adresgegevens wijzigen'"></h2>
       <!-- <b class="standard" v-if="state.user.customer_information_id" @click="setAsStandard()" v-html="isStandard() ? 'Standaard adres' : 'Instellen als standaard adres'"></b>
        <b class="standard" v-if="state.user.customer_information_id" @click="setAsWorkStandard()" v-html="isWorkStandard() ? 'Standaard werkadres' : 'Instellen als standaard werkadres'"></b>
        <b class="standard" v-if="state.user.customer_information_id" @click="setAsInvoiceStandard()" v-html="isInvoiceStandard() ? 'Standaard factuuradres' : 'Instellen als standaard factuuradres'"></b>
    --> <br />
        <form>
            <div class="option">   
                <label class="checkbox path buss">
                    <input type="radio" v-model="state.business"  :value="false" />
                    <svg viewBox="0 0 21 21">
                        <path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"></path>
                    </svg>
                </label>	             			
                <label class="container">Particulier
                </label>
            </div>
            <div class="option">	
                <label class="checkbox path buss">
                    <input type="radio" v-model="state.business"  :value="true" />
                    <svg viewBox="0 0 21 21">
                        <path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"></path>
                    </svg>
                </label>			
                <label class="container">Zakelijk
                </label>
            </div>
            <div class="form">			
                <label>
                    Type:
                </label>    
                  
                <select class="subs" v-model="state.user.title">
                    <option 
                        class="departments" 
                        :value="`Prive`">Prive
                    </option>
                    <option 
                        class="departments" 
                        :value="`Werk`">Werk
                    </option>
                    <option 
                        class="departments" 
                        :value="`Zakelijk`">Zakelijk
                    </option>
                    <option 
                        class="departments" 
                        :value="`Factuur`">
                        Factuur
                    </option>
                    <option 
                        class="departments" 
                        :value="`Anders`"
                        >Anders
                    </option>
                </select>        
            </div>
            <div class="form">
                <label id="input-group-1" v-html="`Aangepaste titel:`" label-for="input-1"/>
                <input
                    type="text" 
                    name="name"
                    placeholder="Aangepaste titel"
                    id="input-1"
                    tabindex="1"
                    v-model="state.user.custom_label"
                />
            </div>
            <div class="form">
                <label id="input-group-1" v-html="`Voornaam:`" label-for="input-1"/>
                <input
                    type="text" 
                    name="name"
                    placeholder="Naam"
                    id="input-1"
                    tabindex="1"
                    v-model="state.user.first_name"
                />
            </div>
            <div class="form">
                <label id="input-group-1" v-html="`Achternaam:`" label-for="input-1"/>
                <input
                    type="text" 
                    name="name"
                    placeholder="Naam"
                    id="input-1"
                    tabindex="1"
                    v-model="state.user.surname"
                />
            </div>
        
            <div class="form">
                <label id="input-group-3" v-html="`Telefoon:`" label-for="input-3"/>
                <input
                    type="text" 
                    name="telefoon" 
                    placeholder="Telefoon"
                    id="input-7"
                    class="form-control"
                    pattern="\d*"
                    tabindex="7"
                    v-model="state.user.phone"
                />
            </div>
            <div class="delivery" v-if="state.business">
                <div class="form">
                    <label id="input-group-1" v-html="`Bedrijfsnaam:`" label-for="input-1"/>
                    <input
                        type="text" 
                        name="name"
                        placeholder="Bedrijfsnaam"
                        id="input-2"
                        tabindex="2"
                        v-model="state.user.business"
                    />
                </div>
                <div class="form">
                    <label id="input-group-1" v-html="`KvK:`" label-for="input-1"/>
                    <input
                        type="text" 
                        name="name"
                        placeholder="KvK"
                        id="input-3"
                        tabindex="3"
                        v-model="state.user.kvk"
                    />
                </div>
                <div class="form">
                    <label id="input-group-1" v-html="`BTW-nummer:`" label-for="input-1"/>
                    <input
                        type="text" 
                        name="name"
                        placeholder="BTW-nummer"
                        id="input-4"
                        tabindex="4"
                        v-model="state.user.btw"
                    />
                </div>
                <div class="form">
                    <label id="input-group-1" v-html="`Contactpersoon:`" label-for="input-1"/>
                    <input
                        type="text" 
                        name="name"
                        placeholder="Contactpersoon"
                        id="input-4"
                        tabindex="4"
                        v-model="state.user.contactperson"
                    />
                </div>
                <div class="form">
                    <label id="input-group-1" v-html="`Zakelijk telefoonnummer:`" label-for="input-1"/>
                    <input
                        type="text" 
                        name="name"
                        placeholder="Zakelijk telefoonnummer"
                        id="input-4"
                        tabindex="4"
                        v-model="state.user.businessphone"
                    />
                </div>
            </div>			
            <div class="form">
                <label id="input-group-3" v-html="`Straat:`" label-for="input-3"/>
                <input
                    type="text" 
                    name="telefoon" 
                    placeholder="Straat"
                    id="input-8"
                    class="form-control"
                    tabindex="8"
                    v-model="state.user.street"
                />
            </div>
            <div class="form">
                <label id="input-group-3" v-html="`Huisnummer:`" label-for="input-3"/>
                <div class="address">
                    <input
                        type="text" 
                        name="telefoon" 
                        placeholder="Huisnr."
                        id="input-9"
                        class="form-control"
                        tabindex="9"
                        v-model="state.user.house_number"
                    />
                    <input
                        type="text" 
                        name="telefoon" 
                        placeholder="Toev."
                        id="input-10"
                        class="form-control toev"
                        tabindex="10"
                        v-model="state.user.house_addition"
                    />
                </div>
            </div>
            <div class="form">
                <label id="input-group-3" v-html="`Postcode:`" label-for="input-3"/>
                <input
                    type="text" 
                    name="zipcode" 
                    placeholder="Postcode"
                    id="input-11"
                    class="form-control"
                    tabindex="11"
                    v-model="state.user.zipcode"
                />
            </div>
           <!-- <i class="zipcode-list" @click="state.openZipcodes = !state.openZipcodes" v-html="`Klik hier voor de lijst met postcodes waar wij momenteel bezorgen.`"></i>
                <p class="zipcodes" v-if="state.openZipcodes" v-html="zipcodeList"></p>-->
            <div class="form">
                <label id="input-group-3" v-html="`Woonplaats:`" label-for="input-3"/>
                <input
                    type="text" 
                    name="city" 
                    placeholder="Woonplaats"
                    id="input-12"
                    class="form-control"
                    tabindex="12"
                    v-model="state.user.city"
                />
            </div>
        </form>
        <div class="bottom">
            <button class="return" @click="closeModal()">Sluiten</button>
            <button class="close-button" @click="updateDetails()">Opslaan</button>
        </div>
        
    </div>
</template>
<style lang="scss" scoped>
.edit_address{
    overflow-y: scroll;
    padding-left: 10px;
}
.edit_address .standard{
    width: calc(100% - 10px);
    text-align: right;
    display: block;
    font-size: 1.2rem;
    padding-top: 5px;
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
form .option{
	width: 100%;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    flex-wrap: nowrap;
    justify-content: flex-start;
	font-size: 1.2rem;
	font-weight: 600;
	margin-bottom: 10px;
}

form .option .container{
    padding-left: 15px;
    padding-right: 15px;    
    margin-bottom: auto;
}
form .option.type .container{
    padding-left: 0;
    padding-right: 15px;    
    margin-bottom: auto;
}

form .option option{
    font-size: 1.2rem;
}

form .option select{
    font-size: 1.2rem;
}
.bottom{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
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
.subs{
    margin-top: 5px;
    font-size: 1.4rem;
}
</style>