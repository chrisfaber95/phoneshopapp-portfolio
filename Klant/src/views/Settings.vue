<template>
	<div class="settings">
		<h1>Instellingen</h1>
		<div class="profile" id="profile" v-if="state.userinfo">
			<div class="title">

				<h2>Profiel</h2>
				<button 
					class="edit"
					@click="state.edit='profile'"
					v-if="state.edit!='profile'">
					<img :src="require('@/assets/icons/pencil.svg')" />
				</button>
			</div>
			<div class="group">
				<label>Voornaam:</label>
				<p v-if="state.edit!='profile'" v-html="state.userinfo.first_name"></p>
				<input v-if="state.edit=='profile'" type="text" name="name" v-model="state.userinfo.first_name" @change="updateCreds" /><br>
			</div>

			<div class="group">
				<label>Achternaam:</label>	
				<p v-if="state.edit!='profile'" v-html="state.userinfo.surname"></p>
				<input v-if="state.edit=='profile'" type="text" name="name" v-model="state.userinfo.surname" @change="updateCreds" /><br>	
				</div>
			<div class="group">
				<label>Klantenkaart:</label>				
				<p v-html="state.userinfo.klantenkaart"></p>			
			</div>
			<div class="group">
				<label>Telefoon:</label>				
				<p v-if="state.edit!='profile'" v-html="state.userinfo.phone"></p>
				<input v-if="state.edit=='profile'" type="text" name="telefoon" v-model="state.userinfo.phone" @change="updateCreds" /><br>	
			</div>

			
            <div class="option" v-if="state.userinfo.customer_settings">	
                <label class="checkbox path buss">
                    <input type="checkbox" v-model="state.userinfo.customer_settings.standard_promotions"  :value="true"  @change="updateCreds"/>
                    <svg viewBox="0 0 21 21">
                        <path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"></path>
                    </svg>
                </label>			
                <label class="container">Standaard sparen voor spaaracties
                </label>
            </div>
			
            <div class="option" v-if="state.userinfo.customer_settings">	
                <label class="checkbox path buss">
                    <input type="checkbox" v-model="state.userinfo.customer_settings.standard_storestamps"  :value="true"  @change="updateCreds"/>
                    <svg viewBox="0 0 21 21">
                        <path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"></path>
                    </svg>
                </label>			
                <label class="container">Standaard sparen voor koopzegels
                </label>
            </div>
			
            <div class="option" v-if="state.userinfo.customer_settings">	
                <label class="checkbox path buss">
                    <input type="checkbox" v-model="state.userinfo.customer_settings.easy_order"  :value="true"  @change="updateCreds"/>
                    <svg viewBox="0 0 21 21">
                        <path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"></path>
                    </svg>
                </label>			
                <label class="container">Verkorte bestelscherm
                </label>
            </div>

			<div class="save" v-if="state.edit == 'profile'">
				<button v-html="'Opslaan'" @click="state.edit = ''"></button>
			</div>
		</div>
		<div class="addresses" v-if="state.userinfo">
			<div class="title">
				<h2>Bestelinformatie</h2>
			</div>
			<div class="address-list">
				<div class="address-block"
					v-for=" (item, index) in frontAddress" 
					:key="item?.customer_information_id || index">
					<div class="block"
						v-if="item !== undefined">
						<Address 
						class="standard"
						:info="item"
						:standard="index"
						@click="state.allAddresses = true; state.standardEdit = index; setToBusiness(index)"
						/>
					</div>
					
					<div class="no_address address"
						v-if="item === undefined"
						@click="state.allAddresses = true; state.standardEdit = index; setToBusiness(index)">
						<div class="title">
							<b v-html="`${getTextForIndex(index)}`"></b>
						</div>
						<div class="text" v-html="`Nog geen standaard ingesteld`"></div>
						<b class="text" v-html="`Stel een standaard adres in`"></b>
					</div>
				</div>
				<div class="modal-overlay" v-if="state.allAddresses == true">
					<div class="all-address-list">
						<div class="title" style="order:-1" v-html="`Mijn afleveradressen`"></div>
						<div class="no_address" v-if="filteredAddress.length == 0" v-html="`U heeft geen ${state.business ? 'zakelijke' : 'persoonlijke' } adressen opslagen.`"></div>
						<Address 
							v-for="item in filteredAddress" 
							:key="item.customer_information_id"
							:info="item"
							:standard="state.standardEdit"
							@updateAddress="(callback) => updateAddress(callback)"
							:style="[isStandardInfo(item.customer_information_id)]"
							/>	
						<div class="business_button" v-html="`Ga naar mijn ${state.business ? 'persoonlijke' : 'zakelijke'} adressen`" @click="state.business = !state.business"></div>
						<div class="new_address" @click="state.addInfoModal = {}">
							Nieuw adres toevoegen

						</div>
						<div class="bottom">
							<button class="return left-shadow" @click="state.allAddresses = false">Sluiten</button>
							<!--<button class="" @click="updateCreds('n')">Opslaan</button>-->
						</div>
					</div>
				</div>

			</div>
			
			
			<div class="modal-overlay" v-if="state.addInfoModal">
				<NewDeliveryInfo
					:info="state.addInfoModal"
					:standard="state.userinfo.default_information"
					:workstandard="state.userinfo.default_work_information"
					:invoicestandard="state.userinfo.default_invoice_information"
					@updateDetails="(callback) => {updateDetails(callback); state.addInfoModal = null}"
					@setAsStandard="(callback) => {state.userinfo.default_information = callback}"
					@setAsInvoiceStandard="(callback) => {state.userinfo.default_invoice_information = callback}"
					@setAsWorkStandard="(callback) => {state.userinfo.default_work_information = callback}"
					@close="(callback) => {state.addInfoModal = null}"
				/>
			</div>
			<!--<button class="return" @click="updateCreds('n')">Opslaan</button>-->
		</div>
		<div id="shopstyle" v-if="state.userinfo">
			<div class="title">
				<h2>Winkelschap voorkeur</h2>
			</div>
			<div class="style">
				<div class="form">
					<div class="radio-group"
					:class="state.userinfo?.customer_settings?.shoptype == 0 ? 'selected' : ''">
						<label 
							for="option1" 
							class="radio-label"
							@click="state.userinfo.customer_settings.shoptype = 0; changePreferedShelfType() ">
							<img :src="'img/v1h4.png'" alt="">
						</label>
					</div>
					<div class="radio-group"
					:class="state.userinfo?.customer_settings?.shoptype == 1 ? 'selected' : ''">
						<label 
							for="option1" 
							class="radio-label"
							@click="state.userinfo.customer_settings.shoptype = 1; changePreferedShelfType()">
							<img :src="'img/v2h1.png'" alt="">
						</label>
					</div>
					<div class="radio-group"
					:class="state.userinfo?.customer_settings?.shoptype == 2 ? 'selected' : ''">
						<label 
							for="option1" 
							class="radio-label" 
							@click="state.userinfo.customer_settings.shoptype = 2; changePreferedShelfType()">
							<img :src="'img/v3h1.png'" alt="">
						</label>
					</div>
				</div>
			</div>
			<div class="title size" v-if="state.userinfo?.customer_settings?.shoptype == 0">
				<h2>Winkelschap hoogte</h2>
			</div>
			<div class="sizing" v-if="state.userinfo?.customer_settings?.shoptype == 0">
				<button @click="changesize()" v-html="`H ${state.userinfo.customer_settings.shopheight}`"></button>
			</div>
		</div>
		<div class="passwordChange" id="passwordChange" v-if="state.userinfo">
			<h2>Wachtwoord Wijzigen</h2>
				<div class="group">
					<label>Oud Wachtwoord</label>
					<input type="password" name="name" v-model="state.pass.old"/></div>
				<!--<div class="group">
					<label>Oud wachtwoord bevestiging</label>
					<input type="password" name="name" v-model="state.pass.oldConf"/></div>-->
				<div class="group">
					<label>Nieuw wachtwoord</label>
					<input type="password" name="name" v-model="state.pass.new" /></div>
				<div class="group">
					<label>Nieuw wachtwoord bevestig</label>
					<input type="password" name="name" v-model="state.pass.newConf" />
				</div>
			<div class="warning" v-html="state.error" v-if="state.error"></div>
			<button class="pass_change" @click="changePassword()" v-html="`Wachtwoord wijzigen`"></button>
		</div>
		<i v-html="`v0.18.19`"></i>
	</div>
</template>

<script setup>
import auth from '@/assets/scripts/auth';
import { reactive, onMounted, computed, watch } from 'vue';	
import Address from '@/components/AccountSettings/AddressBlock.vue'
import NewDeliveryInfo from '@/components/AccountSettings/NewDeliveryInfo.vue'
import { useStore } from 'vuex'
import {VueSimpleAlert as vAlert} from 'vue3-simple-alert'
const store = useStore()

const state = reactive({
	userinfo: null,
	edit: '',
	preferedShelfType: 0,
	amountOfShelf: 4,
	addInfoModal: null,
	allAddresses: false,
	business: false,
	pass:{
		old: '',
		oldConf: '',
		new: '',
		newConf: ''
	},
	error: [],
	standardEdit: null
})
function setToBusiness(index){
	if(index == 2){
		state.business = true
	}
	else{
		state.business = false
	}
}

async function changePassword(){
	state.pass.oldConf = state.pass.old

	vAlert.confirm(
		`Weet u zeker dat u uw wachtwoord wilt wijzigen?`,
		`Wachtwoord wijzigen`,
		'info',
		{
			confirmButtonText: 'Ja',
			cancelButtonText: 'Nee',
			confirmButtonColor: '#F58320',
			cancelButtonColor: '#e4e4e4',
			timer: 5000
		}
	).then((e)=>{
		if(e === true){
			checkPassword()
			.then(async (e)=>{
				console.log(e)
				if(e === true){
					var user = store.getters['shopsettings/getUserinfo']
					user.password = state.pass.new
					user.old_password = state.pass.old
					const e = await auth.updateWithPassword(user)
					console.log(e)
					if(e.password_change === true){
						state.pass = {
							old: '',
							oldConf: '',
							new: '',
							newConf: ''
						}
						vAlert.alert(
							`Wachtwoord succesvol gewijzigd`,
							``,
							'info',
							{
								confirmButtonText: 'OK',
								confirmButtonColor: '#F58320',
								cancelButtonColor: '#e4e4e4',
								timer: 5000
							}
						)
					}
					else{
						console.log(e)
						vAlert.alert(
							`${e}`,
							``,
							'warning',
							{
								confirmButtonText: 'OK',
								confirmButtonColor: '#F58320',
								cancelButtonColor: '#e4e4e4',
								timer: 5000
							}
						)
						.catch((e)=>{
							console.log(e)
						})
					}
				}
				else{
					vAlert.alert(
						`${e.err}`,
						``,
						'warning',
						{
							confirmButtonText: 'OK',
							confirmButtonColor: '#F58320',
							cancelButtonColor: '#e4e4e4',
							timer: 5000
						}
					)
				}
			})
			.catch(()=>{
			})
		}
	})
	.catch(()=>{
	})
/*
	if(confirm('')){
		if(!checkPassword()){
			state.error = "Wachtwoord niet gelijk"
		}
		else{
			var user = store.getters['shopsettings/getUserinfo']
			user.password = state.pass.new
			user.old_password = state.pass.old
			const e = await auth.updateWithPassword(user)
			if(e.password_change === true){
				state.error = 'Wachtwoord succesvol gewijzigd'
				state.pass = {
					old: '',
					oldConf: '',
					new: '',
					newConf: ''
				}
			}
			//state.error = e.data.message
		}
	}*/
}
	
	async function checkPassword(){
		return new Promise((resolve) => {
			if(state.pass.old != state.pass.oldConf || state.pass.new != state.pass.newConf){
				resolve({err: 'Nieuw wachtwoord is niet gelijk'})
			}
			else{
				resolve(true)
			}
		})
	}

function updateCreds(e){
	//localStorage.setItem('userinfo', JSON.stringify(state.userinfo))
	//onsole.log(state.userinfo)
	auth.updateInfo()
	.then(() => {
//		auth.getInfo()
	})
}



	function changesize(){
		if(state.userinfo.customer_settings.shopheight == 5){	
			store.commit('shopsettings/changeShelfSize', 3)
			store.commit('location/changeDepartment', 0)			
			if(state.userinfo.customer_settings.shoptype == 0){
				store.commit('location/changeDepartment', null)
			}
			state.userinfo.customer_settings.shopheight = 3
		}
		else{
			let size = state.userinfo.customer_settings.shopheight + 1
			store.commit('shopsettings/changeShelfSize',size)
			store.commit('location/changeDepartment', 0)
			if(state.userinfo.customer_settings.shoptype == 0){
				store.commit('location/changeDepartment', null)
			}
			state.userinfo.customer_settings.shopheight = size
		}
		state.userinfo.customer_settings.shopheight = store.getters['shopsettings/getAmountOfShelf']
		store.commit('shopsettings/updateUserinfo', state.userinfo)
		auth.updateInfo()
		
	}

	function changePreferedShelfType(){
		store.commit('shopsettings/changeShelfStyle', state.userinfo.customer_settings.shoptype)
		store.commit('location/changeDepartment', 0)
		if(state.userinfo.customer_settings.shoptype == 0){
			store.commit('location/changeDepartment', null)
		}
		store.commit('shopsettings/updateUserinfo', state.userinfo)
		auth.updateInfo()
		
	}

	function updateAddress(address){
		const index = state.userinfo.customer_information.findIndex(addr => addr.customer_information_id === address.customer_information_id);

		// Update the object at that index
		state.userinfo.customer_information[index] = address;
		//updateCreds('n')
	}

	

	watch(() => state.preferedShelfType, (newVal, oldVal) => {
	})

	

	

	

	onMounted(() => {
	//	auth.getInfo()
	//	.then(() => {
	//		console.log(store.getters['shopsettings/getUserinfo'])
	//		state.preferedShelfType = localStorage.getItem('shoptype')

			//state.userinfo = JSON.parse(localStorage.getItem('userinfo'))
			//console.log(store)
	//	})
	})

	watch(() => store.getters['shopsettings/getUserinfo'], (newVal, oldVal) => {
		state.userinfo = store.getters['shopsettings/getUserinfo']
	}, {immediate: true, deep: true})

	const filteredAddress = computed(() => {
		var allAddresses = state.userinfo.customer_information
		if(state.business === true) return allAddresses.filter(address => address.kvk.length > 0 || address.business.length > 0);
		return allAddresses.filter(address => address.kvk.length == 0 && address.business.length == 0);
	})

	const frontAddress = computed(() => {
		var fronts = Array.apply(null, Array(3)).map(function () {})
		var allAddresses = state.userinfo.customer_information || []
		if(state.userinfo?.default_information && allAddresses.length > 0){
			const index = allAddresses.findIndex(
					obj => Object.entries(obj).some(
						([key, value]) => key === 'customer_information_id' && value === state.userinfo?.default_information));
			fronts[0] = allAddresses[index]
		}
		if(state.userinfo?.default_invoice_information && allAddresses.length > 0){
			const index = allAddresses.findIndex(
					obj => Object.entries(obj).some(
						([key, value]) => key === 'customer_information_id' && value === state.userinfo?.default_invoice_information));
			fronts[1] = allAddresses[index]
		}
		if(state.userinfo?.default_work_information && allAddresses.length > 0){
		const index = allAddresses.findIndex(
				obj => Object.entries(obj).some(
					([key, value]) => key === 'customer_information_id' && value === state.userinfo?.default_work_information));
			fronts[2] = allAddresses[index]
		}
		return fronts
	})

	const isStandardInfo = computed(() => {
    return (index) => {
		if(index == state.userinfo.default_information ||
		index == state.userinfo.default_invoice_information ||
		index == state.userinfo.default_work_information){
			return {order: '-1'}
		}
			return ''
		}

	})

	function getTextForIndex(index) {
      switch (index) {
        case 0:
          return 'Prive'
        case 1:
          return 'Factuur'
        case 2:
          return 'Zakelijk'
        default:
          return ''
      }
    }

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.settings{
	overflow-y: scroll;
    overflow-x: hidden;
}
#profile{
	width:100%;
	text-align: left;
}
#profile .title{    
	display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
	padding-left: 10px;
}
#profile .title .edit{
	border: unset;
	background-color: white;
	box-shadow: unset;
	padding: unset;
	margin: unset;
}
#profile .title img{
	height: 1.5rem;
	width: 2.5rem;

}
#profile .group{
	width: 100%;
	display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
	border-bottom: 2px solid #ececec;
	padding-top: 10px;
	padding-left: 10px;

}
#profile .group label{
	font-weight: 600;
	width: 100%;
}

#profile .group p{
	width: 80%;
}
#profile .group i{
	width: 10%;
	padding: 5px;
}
#profile .group input{
	width: 70%;
	margin: unset;
	margin-left: 5px;
	margin-top: 5px;
	margin-bottom: 5px;
}

#profile .option{
	margin-top: 15px;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
	width: 90%;
	margin-left: 10px;
}
#profile .option .container{
	padding-left: 15px;
}
.addresses{
	display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: flex-start;
    justify-content: flex-start;
	padding-left: 10px;
}

.addresses .bottom{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
	width: 100%;
	padding-top: 20px;
}
.address-list{
	display: flex;
	flex-wrap: nowrap;
	flex-direction: column;
	justify-content: flex-start;
    overflow-x: scroll;
    width: 100%;
    align-items: stretch;
}
.address-block{    
	margin-bottom: 10px;
    border: 2px solid var(--base-color);
    border-radius: 10px;
	width: 96%;
}

.no_address.address{
	width: calc(100% - 40px);
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	align-items: flex-start;
	justify-content: flex-start;
	text-align: left;
	padding-left: 20px;
	padding-right: 20px;
	padding-top: 10px;
	padding-bottom: 10px;
}
.no_address.address .title{
	width: 100%;
	font-size: 1.6rem;
	padding-bottom: 10px;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: flex-start;
	flex-wrap: wrap;
}
.no_address.address .title .standard{
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	flex-wrap: wrap;
	justify-content: flex-start;
}
.no_address.address .title i{
	font-size: 1rem;
	font-weight: 600;
}

.all_address_button{
	font-size: 1.3rem;
	color: #4754ff;
	font-weight: 600;
	padding-top: 10px;
	padding-bottom: 10px;
}
.all-address-list .address{    
    margin-bottom: 10px;
    border: unset;
    border-radius: unset;
    border-bottom: 2px solid #999999;
}

.all-address-list{
	display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
	flex-wrap: nowrap;
	overflow-y: scroll;
}

.all-address-list .title{
	padding-top: 10px;
	padding-bottom: 10px;
	font-size: 1.8rem;
	font-weight: 600;
}
.new_address{
	font-size: 1.3rem;
	font-weight: 600;
	padding: 1rem;
	border-radius: 10px;
	border: 2px solid #000000;
	max-width: 80%;
    box-shadow: 4px 4px 3px 0px #00000066;
    -webkit-box-shadow: 4px 4px 3px 0px #00000066;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 10px;
}

.all-address-list .business_button{
	font-size: 1.3rem;
	color: #4754ff;
	font-weight: 600;
	padding-top: 10px;
	padding-bottom: 10px;
    text-align: center;
    width: 100%;
}

.all-address-list .no_address{
	font-size: 1.4rem;
	font-weight: 600;
	padding-top: 15px;
	padding-bottom: 15px;
}

#shopstyle{
	text-align: left;
}

#shopstyle .title{
	padding-left: 10px;
}

#shopstyle .form{
	display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
	justify-content: space-around;
    align-content: flex-start;
	width: 90%;
	height: 100%;
}

#shopstyle .form .radio-group{
	width: 25%;
	position: relative;
}

  
  /* Style the custom radio button */
  #shopstyle .form .radio-group .radio-label {
	display: inline-block;
	width: 100%;
	height: 100%;
	margin-right: 10px;
	cursor: pointer;
	position: relative;
  }
  
  /* Position the image on top of the input */
  #shopstyle .form .radio-group  .radio-label img {
    width: calc(100% - 14px);
	height: auto;
	object-fit: contain;
	height: 100%;
  }
  
  /* Style the label when the radio button is checked */
  #shopstyle .form .radio-group.selected .radio-label img {
	display: block;
	padding: 5px;
	border: 2px solid var(--base-color);
  }

  #shopstyle .form .radio-group.selected{
	width: 30%;
  }

  .sizing{
	padding-left: 10px;
  }
  .size.title h2{
	margin-bottom: 3px;
  }

#passwordChange{
	width:100%;
	text-align: left;
	margin: 10px;
}
#passwordChange .group{
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    flex-wrap: nowrap;
}
#passwordChange label{
	width: 100%;
	font-weight: 600;
}

#passwordChange input{
	width: 50%;
	margin: 10px;
}

#passwordChange .pass_change{
	background-color: #009c00;
	border-color: #009c00;
	color: #ffffff;
}
</style>
