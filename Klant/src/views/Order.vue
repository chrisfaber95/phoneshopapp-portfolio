<template>
	<div class="order container-fluid">
		<router-link to="/" custom v-slot="{ navigate }">
			<button @click="navigate" @keypress.enter="navigate" role="link" class="return shop goto left-shadow">Verder Winkelen</button>
		</router-link>
		<div class="first-block">
			<h1 v-html="`Winkelmand`"></h1>
			<ShoppingCart />
		</div>
		<div class="row" id="information">
			<div class="acties" v-if="loggedIn">
				<h1 v-html="`Onze spaaracties`"></h1>
				<div class="grid-container zegels" v-for="actie in state.acties" :key="actie.spaaractie_id">
					<div class="grid-item first">
						<img v-if="actie.stamp_imgurl" :src=" `${actie.stamp_imgurl}`"  />				
					</div>				
					<div class="spaarzegels grid-item second" v-html="`${actie.title}:`"></div>
					<label class="checkbox path grid-item third">
						<input type="checkbox" v-model="checkedActies" :value="actie.spaaractie_id" />
						<svg viewBox="0 0 21 21">
							<path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"></path>
						</svg>
					</label>
					<div class="grid-item fourth" v-html="`${calculateAmountOfStamps(actie) || 0}`"></div>
				</div>
				<div class="grid-container zegels">
					<div class="grid-item first">
						<img :src=" `${state.publicPath}img/coin_exchange.png`" />
					</div>				
					<div class="spaarzegels grid-item second" v-html="`Munten:`"></div>
					<label class="checkbox path grid-item third">
						<input type="checkbox" v-model="state.munten" />
						<svg viewBox="0 0 21 21">
							<path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"></path>
						</svg>
					</label>
					<div class="grid-item fourth" v-html="`${details.munten || 0}`"></div>
				</div>
			</div>
			<h1 v-html="`Beschikbare service`"></h1>
			<div class="service">				
				<div class="switch business">
					<div class="option">
						<label class="checkbox path">
							<input type="radio" v-model="details.business"  :value="false" />
							<svg viewBox="0 0 21 21">
								<path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"></path>
							</svg>
						</label>
						<label class="container">Particulier
						</label>
					</div>
					<div class="option">
						<label class="container">Zakelijk
						</label>
						<label class="checkbox path buss">
							<input type="radio" v-model="details.business"  :value="true" />
							<svg viewBox="0 0 21 21">
								<path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"></path>
							</svg>
						</label>	
					</div>
				</div>
				
				<div class="option invoice" v-if="store.getters['shopsettings/getLoggedIn']">
					<div class="type-info" @click="state.modalInvoice = true; setToBusiness()">
						<div class="edit">
							<b v-html="`Factuur wijzigen?`"></b>
						</div>
						<div class="user-info" v-if="details.sameInfoInvoice">
							<p v-html="`${details.user.first_name || ''} ${details.user.surname || ''}`" v-if="!details.user.contactperson"></p>
							<p v-html="`${details.user.contactperson || ''}`" v-if="details.user.contactperson"></p>
							<p v-if="details.business" v-html="`${details.user.business || ''}`"></p>	
							<p v-html="`${details.user.street || ''} ${details.user.house_number || ''} ${details.user.house_addition || ''}`"></p>
							<p v-html="`${details.user.zipcode || ''} ${details.user.city || ''}`"></p>
						</div>
						<div class="user-info" v-if="!details.sameInfoInvoice">
							<p v-html="`${details.user.first_name || ''} ${details.user.surname || ''}`" v-if="!details.user.contactperson"></p>
							<p v-html="`${details.user.contactperson || ''}`" v-if="details.user.contactperson"></p>
							<p v-if="details.business" v-html="`${details.user.business || ''}`"></p>
							<p v-html="`${details.invoice.street || ''} ${details.invoice.house_number || ''} ${details.invoice.house_addition || ''}`"></p>
							<p v-html="`${details.invoice.zipcode || ''} ${details.invoice.city || ''}`"></p>
						</div>
					</div>
					<div class="modal-overlay" v-if="state.modalInvoice">
						<div class="info-edit">
							<div class="top-edit" 
								@click="state.editInfo = !state.editInfo"
								v-html="state.editInfo ? `Terug naar addressen` : ``"></div>
							<div class="title" v-html="state.editInfo ? `Adres wijzigen` : `Mijn adressen`"></div>
							<div class="all-address-list" v-if="!state.editInfo">
								<div class="no_address" v-if="filteredAddress?.length == 0" v-html="`U heeft geen ${state.business_address ? 'zakelijke' : 'persoonlijke' } adressen opslagen.`"></div>
								<Addressblock 
									v-for="item in filteredAddress" 
									:key="item.customer_information_id"
									:info="item"
									:invoice="true"
									@click="state.chosenInvoiceInfo= item.customer_information_id; updateInvoiceInfoDetails(item)"
									:style="[isStandardInfo(item.customer_information_id), isChosenInvoiceInfo(item.customer_information_id)]"						
									@changeEditInfo="(callback) => {state.editInfo = !state.editInfo}"
									/>	
								<div class="business_button" v-html="`Ga naar mijn ${state.business_address ? 'persoonlijke' : 'zakelijke'} adressen`" @click="state.business_address = !state.business_address"></div>
							</div>
							<UserInformation 
								:delivery="true"
								:business="details.business"
								:user="details.user"
								@updateDetails="(callback) => {updateInvoiceDetails(callback)}"
								v-if="state.editInfo"
							/>	
							<AddressInformation 
								:delivery="true"
								:business="details.business"
								:user="details.user"
								@updateDetails="(callback) => {updateInvoiceDetails(callback)}"
								v-if="state.editInfo"
							/>
							<div class="bottom">
								<button class="return" @click="state.modalInvoice = false; state.editInfo = false" >Sluiten</button>
								<button class="" @click="state.modalInvoice = false; details.sameInfoInvoice = false; state.editInfo = false" >Opslaan</button>
							</div>					
						</div>	
					</div>
				</div>
		
			</div>

			<div class="switch delivery">				
				<div class="option" @click="details.delivery = true; !state.userinfo.customer_id ? state.editInfo = true : ''" :class="details.delivery === true ? 'active' : 'nonactive'">
					<div class="left">
						<div class="type">				
							<label class="container">Bezorging
							</label>				
							<label class="checkbox path buss">
								<input type="radio" v-model="details.delivery"  :value="true" />
								<svg viewBox="0 0 21 21">
									<path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"></path>
								</svg>
							</label>		
						</div>
						<div class="type-info"  v-if="store.getters['shopsettings/getLoggedIn']">
							<i v-if="details.business" v-html="`${details.user.business || ''}`"></i>		
							<i v-html="`${details.user.phone || ''}`"></i>					
						</div>
					</div>
					<div class="right" @click="state.modalAddress = true; setToBusiness()">										
						<label class="container">Afleveradres</label>
						<div class="type-info">
							<i v-html="`${details.user.first_name || ''} ${details.user.surname || ''}`"></i>	
							<i v-html="`${details.user.street || ''} ${details.user.house_number || ''}${details.user.house_addition || ''}`"></i>
							<i v-html="`${details.user.zipcode || ''} ${details.user.city || ''}`"></i>
						</div>
						<div class="edit"  v-if="store.getters['shopsettings/getLoggedIn'] && details.delivery === true">
							<b v-html="`Informatie wijzigen`"></b>
						</div>
					</div>
				</div>
				<div class="option" @click="details.delivery = false; !state.userinfo.customer_id ? state.editInfo = true : ''" :class="details.delivery === false ? 'active' : 'nonactive'">
					<div class="left">
						<div class="type">					
							<label class="container">Afhalen
							</label>				
							<label class="checkbox path buss">
								<input type="radio" v-model="details.delivery"  :value="false" />
								<svg viewBox="0 0 21 21">
									<path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"></path>
								</svg>
							</label>	
						</div>
						<div class="type-info">
							<b class="store">Mijn winkel</b>
							<i v-html="state.info?.shopname"></i>
							<i v-html="`${state.info?.information.address.street || ''} ${state.info?.information.address.house_number || ''}${state.info?.information.address.house_addition || ''}`"></i>
							<i v-html="`${state.info?.information.address.zipcode || '' } ${state.info?.information.address.city || ''}`"></i>
						</div>
					</div>
					<div class="right" @click="state.modalAddress = true; setToBusiness()">								
						<label class="container">Mijn gegevens</label>	
						<div class="type-info">
							<i v-html="`${details.user.first_name || ''} ${details.user.surname || ''}`" v-if="!details.user.contactperson"></i>
							<i v-html="`${details.user.contactperson || ''}`" v-if="details.user.contactperson"></i>
							<i v-if="details.business" v-html="`${details.user.business || ''}`"></i>	
							<i v-html="`${details.user.phone || ''}`"></i>					
						</div>
						<div class="edit"  v-if="store.getters['shopsettings/getLoggedIn'] && details.delivery === false">
							<b v-html="`Factuur wijzigen`"></b>
						</div>
					</div>
				</div>
				<div class="modal-overlay" v-if="state.modalAddress && state.userinfo.customer_id">
					<div class="info-edit">	
						<div class="top-edit" 
							@click="state.editInfo = !state.editInfo"
							v-html="state.editInfo ? `Terug naar addressen` : ``"></div>
						<div class="title" v-html="state.editInfo ? `Adres wijzigen` : `Mijn adressen`"></div>
						<div class="all-address-list" v-if="!state.editInfo">
							<div class="no_address" v-if="filteredAddress?.length == 0" v-html="`U heeft geen ${state.business_address ? 'zakelijke' : 'persoonlijke' } adressen opslagen.`"></div>
							<Addressblock 
								v-for="item in filteredAddress" 
								:key="item.customer_information_id"
								:info="item"
								@click="state.chosenInfo = item.customer_information_id; updateInfoDetails(item)"								
								@changeEditInfo="(callback) => {state.editInfo = !state.editInfo}"
								:style="[isStandardInfo(item.customer_information_id), isChosenInfo(item.customer_information_id)]"
								/>	
							<div class="business_button" v-html="`Ga naar mijn ${state.business_address ? 'persoonlijke' : 'zakelijke'} adressen`" @click="state.business_address = !state.business_address"></div>
						</div>	
						<UserInformation 
							:delivery="details.delivery"
							:business="details.business"
							:user="details.user"
							@updateDetails="(callback) => {updateDetails(callback)}"
							v-if="state.editInfo"
						/>	
						<AddressInformation 
							:delivery="details.delivery"
							:business="details.business"
							:user="details.user"
							@updateDetails="(callback) => {updateDetails(callback)}"
							v-if="state.editInfo"
						/>
						<div class="new_address" @click="state.addInfoModal = {}">
							Nieuw adres toevoegen

						</div>
						<div class="bottom">
							<button class="return" @click="state.modalAddress = false; state.editInfo = false" >Sluiten</button>
							<button class="reurn" @click="state.modalAddress = false; state.editInfo = false"  >Opslaan</button>
						</div>
					</div>	
				</div>
			</div>

			
		<div class="modal-overlay" v-if=" details.delivery !== null && !state.userinfo.customer_id && state.editInfo === true">
			<div class="info-edit">	
				<UserInformation 
					:delivery="details.delivery"
					:business="details.business"
					:user="details.user"
					@updateDetails="(callback) => {updateDetails(callback)}"
				/>		
				<AddressInformation 
					:delivery="details.delivery"
					:business="details.business"
					:user="details.user"
					@updateDetails="(callback) => {updateDetails(callback)}"
					v-if="details.delivery == true"
				/>
				<div class="bottom">
					<button class="return" @click="state.editInfo = false" >Sluiten</button>
					<button class="reurn" @click="state.editInfo = false"  >Opslaan</button>
				</div>
			</div>
		</div>
		
		<div class="modal-overlay" v-if="state.addInfoModal">
			<NewDeliveryInfo
				:info="state.addInfoModal"
				:standard="state.userinfo.default_information"
				:workstandard="state.userinfo.default_work_information"
				:invoicestandard="state.userinfo.default_invoice_information"
				@updateDetails="(callback) => {state.addInfoModal = null}"
				@close="(callback) => {state.addInfoModal = null}"
			/>
		</div>
		
			<h2 v-if="details.delivery !== null" v-html="`Beschikbare ${details.delivery ? 'bezorgmomenten' : 'afhaalmomenten'}`"></h2>
			
			<div v-if="details.delivery !== null" class="slotpicker">
				<div class="datepicker">
					<div class="dates">
						<div class="date" v-for="i in (4)" :key="i" @click="details.pickupDate = state.currentDate.plus({days : i - 1}).toFormat('yyyy-MM-dd')">
							<div class="text">
								<b v-if="i < 3">{{ state.currentDate.plus({days : i - 1}).setLocale('nl').toRelativeCalendar({unit: "days" }) }}</b>
								<b v-if="i >= 3">{{ state.currentDate.plus({days : i - 1}).setLocale('nl').toFormat('cccc') }}</b>
								<p>{{ state.currentDate.plus({days : i - 1}).setLocale('nl').toFormat('dd - LLL') }}</p>
							</div>
							<div class="check">
								<label class="checkbox path">
									<input type="radio" v-model="details.pickupDate"  :value="state.currentDate.plus({days : i - 1}).toFormat('yyyy-MM-dd')" />
									<svg viewBox="0 0 21 21">
										<path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"></path>
									</svg>
								</label>
							</div>
						</div>
					</div>
					<div class="popup-picker">
						<div class="input-overlay" v-html="`Ander ${details.delivery ? 'bezorgdatum' : 'bezorgdatum'} kiezen`">
						</div>
						<Datepicker 
							v-model="state.tempPickedDate" 
							:enable-time-picker="false"
							:min-date="minPickupDate"
							:delivery="details.delivery"
						/>
					</div>
				</div>
				<div class="timepicker">

					<Timepicker
						:date="details.pickupDate"
						:startPickupHour= state.startPickupHour
						:endPickupHour= state.endPickupHour
						:minuteGap="15"
						:delivery="details.delivery"
						@chooseTimeslot="(callback) => {details.pickupTime = callback; state.timepicker = false}"
						@closeTimeslot="(callback) => {state.timepicker = false}"
						v-if="details.pickupDate"
					/>
				</div>
			</div>
			<div class="timeslot"  v-if="details.pickupTime">
				<p v-html="`Tijd: ${String(details.pickupTime.hours).padStart(2, '0')}:${String(details.pickupTime.minutes).padStart(2, '0')}*`"> </p>
				<p v-html="`Datum: ${details.pickupDate}`"> </p>
				<i>*Plus kwartier uitloop</i>
			</div>
			
			<div class="bottom-part">
				<div class="order-information">
					
				<div class="prijsopbouw">
						<b class="warn">
							*Let op: Bestelling met 2 verplichte betalingen. 
						</b>
					<span>Betaalmoment 1* <br></span>					
					<b v-if="!details.delivery">Verzamelen</b>
					<b v-if="details.delivery">Verzamelen en bezorgen</b>
					<div class="price-part"><div class="text">Personal shopper</div><div class="price-text">€ 2.00</div></div>
					<div v-if="details.delivery" class="price-part"><div class="text">Bezorging</div><div class="price-text">€ 1.00</div></div>
					<div v-if="details.delivery" class="price-part"><div class="text">Btw 21%</div><div class="price-text">€ 0.42</div></div>
					<div v-if="!details.delivery" class="price-part"><div class="text">Btw 21%</div><div class="price-text">€ 0.35</div></div>
					<b v-html="`Totaal:`"></b>
						<FancyPrice 
							:price="`${details.firstPayment.toFixed(2)}`"
						/>
					<br/>
					<span>Betaalmoment 2**<br/> <b>Na het verzamelen, verwachte prijsindicatie</b><br />
						<FancyPrice 
								:price="`${totalFinalPrice}`"
							/>
					</span>
				</div>

				<i class="voorwaarden" v-if="userinfo?.customer_settings?.easy_order !== true ">
					<br/>
					**Let op: de prijzen die op de website van Coop Lubbers vermeld staan, zijn de geldende adviesprijzen. 
					<i class="zipcode-list" @click="state.leesmeer = !state.leesmeer" v-html="`Lees meer.....`"></i></i>
				<i  class="voorwaarden2" v-if="state.leesmeer">Het kan voorkomen dat de prijs van een artikel afwijkt van de prijs die uiteindelijk op uw bon berekend wordt, 
					bijvoorbeeld vanwege lokale prijsafwijkingen, tussentijdse prijswijzigingen of typfouten. Bij versartikelen wordt de prijs bepaald op basis van het gewicht, wat kan leiden tot afwijkingen in de berekende prijs.
					Houd er rekening mee dat de geldende prijs de prijs is die van toepassing is op de dag van bezorging, en niet op de dag van bestelling. Als er sprake is van typfouten, gelden de werkelijke prijzen en kunt u geen aanspraak maken op levering op basis van foutief weergegeven prijzen.
					Voor alle aanbiedingen op de website geldt dat er maximaal 5 dezelfde aanbiedingen per klant gelden, tenzij anders vermeld.
					
					<br />
					Om eventuele fouten in de prijsberekening te voorkomen, vinden er bij Coop Lubbers twee betaalmomenten plaats. Bij de eerste betaling, van €3,00 inclusief btw, wordt uw bestelling verzameld en bezorgd op het door u gekozen tijdstip. Als alternatief kunt u er ook voor kiezen om uw bestelling te laten verzamelen en afhalen voor €2,00 inclusief btw.
					Na de eerste betaling gaat een verzamelaar voor u aan de slag om de bestelde artikelen te verzamelen en klaar te zetten voor levering of afhalen. Op het moment van verzamelen krijgt u de keuze om eventuele missende artikelen te vervangen of te wijzigen. Mocht het onverhoopt niet lukken om uw bestelling compleet te maken, dan wordt u hierover geïnformeerd en kunt u de order annuleren of wijzigen.
					De daadwerkelijke betaling met de correcte prijs vindt plaats na het complete verzamelen van uw bestelling door de verzamelaar. Dit is de prijs waarvoor u uiteindelijk betaalt.
				</i>
				

					<div class="voorwaarden voorwaarden3" v-if="userinfo?.customer_settings?.easy_order !== true">
						<p>
								Na bevestiging van je bestelling word je doorverwezen naar de betaalpagina. <br/>
								Door op de knop "Afrekenen" te klikken, ga ik uitdrukkelijk akkoord met de <i @click="state.modalOpened = true"><a>Algemene Voorwaarden</a></i> 
								en verklaar ik dat ik ouder ben dan 18 jaar. *** 
								<br/><br />
								*** Deze voorwaarde is van toepassing op leeftijdsbeperkte diensten en waren.
						
						</p>
						<div class="modal-overlay" v-if="state.modalOpened">
							<div class="cookies">		
								<Privacy />							
								<button class="return" @click="state.modalOpened = false" >Sluiten</button>
							</div>	
						</div>
					</div>
					<div class="accepttype">					
						<label class="checkbox path buss">
							<input type="checkbox" v-model="state.orderAccepted" />
							<svg viewBox="0 0 21 21">
								<path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"></path>
							</svg>
						</label>					
						<label class="accepting" @click="state.orderAccepted = !state.orderAccepted">Ik heb mijn gegevens gecontroleerd. Door op afrekenen te klikken ga ik akkoord dat mijn gegevens kloppen.
						</label>
					</div>
					<button id="order-button" type='button' v-on:click="placeOrder" :disabled="totalFinalPrice == 0.00 || state.orderAccepted === false">Afrekenen</button >
					
				</div>
			</div>
		</div>
		
        <NoAccess />
	</div>	
</template>
<script setup>
import NoAccess from '@/components/Basics/NoAccess.vue'
	import { VueDatePicker as Datepicker } from '@vuepic/vue-datepicker';
	import '@vuepic/vue-datepicker/dist/main.css';
	import 'vue3-timepicker/dist/VueTimepicker.css'
	import '@vueform/toggle/themes/default.css'
	import { reactive, ref, defineProps, onMounted, computed, watch } from 'vue';
	import ShoppingCart from '@/components/orderPage/ShoppingCart.vue'
	import Timepicker from '@/components/orderPage/Timepicker.vue'
	import UserInformation from '@/components/orderPage/UserInformation.vue'
	import AddressInformation from '@/components/orderPage/AddressInformation.vue'
	import Addressblock from '@/components/orderPage/Addressblock.vue'
import NewDeliveryInfo from '@/components/AccountSettings/NewDeliveryInfo.vue'
	import Privacy from '@/views/Privacy.vue'
	import FancyPrice from '@/components/Basics/Product/FancyPrice.vue';
	import cart from '@/assets/cart'
	import auth from '@/assets/scripts/auth'
    import { DateTime } from "luxon";
	import {HTTP, HTTP_Store} from '@/assets/scripts/http-common.js';
	import { useStore } from 'vuex'
	import {VueSimpleAlert as vAlert} from 'vue3-simple-alert';
	import validator from 'validator'
	const store = useStore()

	defineProps({
		'product': Object
	});


	const state = reactive({
		publicPath: process.env.BASE_URL,
		productModalOpened: false,
		paymentMethod: 'ideal',
		pickupPrice: 2.00,
		deliveryPrice: 3.00,
		spaarzegels: false,
		munten: false,
		stampgap: 10,
        koopzegelsPrice: 0.05,
		modalOpened: false,
		modalUser: false,
		modalAddress: false,
		modalInvoice: false,
		differentAddress: false,
		timepicker: false,
		startPickupHour: 8,
		endPickupHour: 20,
		tempPickedDate: null,
        acties: [],
        currentActie: null,
		
		reg: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
		regname: /^[A-Za-z\s]+$/,
		currentDate: DateTime.local(),
		leesmeer: false,
		chosenInfo: '',
		chosenInvoiceInfo: '',
		business_address: false,
		userinfo: null,
		firstLoad: false,
		editInfo: false,
		orderAccepted: false,
		addInfoModal: null
	})

	const checkedActies = ref([])



    
	const details = reactive({
		user: {
            first_name: "",
            surname: "",
            email: "",
            klantenkaart: "",
            phone: "",
            street: "",
			house_number:"",
			house_addition:"",
            zipcode: "",
            city: "",
            country: "",
			business: "",
			kvk: "",
			btw: ''
		},
		invoice: {
            first_name: "",
            surname: "",
            email: "",
            klantenkaart: "",
            phone: "",
            street: "",
			house_number:"",
			house_addition:"",
            zipcode: "",
            city: "",
            country: "",
			business: "",
			kvk: "",
			btw: ''
		},
		sameInfoInvoice: true,
		munten: 0,
		delivery: null,
		business: false,
		pickupDate: DateTime.local().toFormat('yyyy-MM-dd'),
		pickupTime: null,
		spaarzegelsAmount: 0,
		koopzegelsAmount: 0,
		firstPayment: 2.00,
		secondPayment: 0.00,
		locations: [],
		info: []
	})

	function customFormatter(date) {
		return DateTime.fromJSDate(date).toFormat('yyyy-MM-dd')
    }

	

	const totalFinalPrice = computed(() => {
		return cart.calculateTotalPriceWithExtra([details.koopzegelsAmount * state.koopzegelsPrice])
	})

	const minPickupDate = computed(() => {
		var currentDate = DateTime.local()
		if (currentDate.hour > state.endPickupHour - 2){
			return currentDate.plus({ days: 1 }).toJSDate()
		}
		return currentDate.toJSDate()
	})

	const shoppingCart = computed(() => store.getters['shoppingcart/getShoppingCart'])
	
	watch(() => state.tempPickedDate, () => {
		if(details.pickupDate != customFormatter(state.tempPickedDate)){
			details.pickupDate = customFormatter(state.tempPickedDate)
		}
	}, {deep: true})
	

	watch(() => details.pickupDate, () => {
		details.pickupTime = null
	}, {deep: true})


	watch(() => store.getters['shoppingcart/getKoopzegels'], (newVal) => {
		details.koopzegelsAmount = newVal
	})

	watch(() => state.spaarzegels, () => {
		details.spaarzegels = cart.calculateZegels(state.currentActie?.stamp_price || state.stampgap, state.spaarzegels)
		if(state.spaarzegels) details.spaarzegelsAmount = 1
		else{ details.spaarzegelsAmount = 0}
	}, {immediate: true})

	watch(() => details.delivery, () => {
		details.firstPayment = (details.delivery ? state.deliveryPrice : state.pickupPrice)
	}, {immediate: true})

	watch(() => state.munten, () => {
		details.munten = (state.munten ? cart.calculateMunten(2.5, true, checkedActies.value, state.acties) : 0)
	}, {immediate: true})

	watch(() => checkedActies.value, () => {

		details.munten = (state.munten ? cart.calculateMunten(2.5, true, checkedActies.value, state.acties) : 0)
	}, {immediate: true, deep: true})

	watch(() => totalFinalPrice.value, (newVal) => {
		details.spaarzegels = cart.calculateZegels(state.currentActie?.stamp_price || state.stampgap, state.spaarzegels)
	})
	function calculateAmountOfStamps(actie){
		return cart.calculateZegels(actie.stamp_price, checkedActies.value.includes(actie.spaaractie_id))
	}
	const validMail = (email) =>{
		if (!email) {
			return {valid: 0, res: `E-mailadres vergeten`}; // empty string or null value
		}
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if(emailRegex.test(email) == false){
			return {valid: 0, res: `Ongeldig e-mailadres`}
		}
  		return {valid: 1};
	}
	const validName = (name) => {	
		if (!name){			
			return {valid: 0, res: `Naam vergeten in te voeren.`}
		}	
		if (name.length > 100) {
			return {valid: 0, res: `Te lange naam ingevoerd.`}
		}
		// Allow only letters, spaces, and certain special characters
		if (!validator.matches(name, /^[a-zA-Z\s-]+$/)) {
			return {valid: 0, res: `Ongeldig naam ingevoerd, gebruik geen speciale tekens in uw naam.`}
		}
		// Input is safe
  		return {valid: 1};
	}

	const validPhone = (phone) =>{
		if (!phone) {
			return {valid: 0, res: `Telefoonnummer vergeten`}; // empty string or null value
		}
		const phoneRegex  = /^\+?\d+$/;
		if(phoneRegex .test(phone) == false){
			return {valid: 0, res: `Ongeldig telefoonnummer`}
		}
  		return {valid: 1};
	}
	const validTime = (time) =>{
		if (!time) {
			return {valid: 0, res: `Tijdstip vergeten te kiezen`}; // empty string or null value
		}
  		return {valid: 1};
	}

	const validDate = (dateString) => {
		if (!dateString) { // if dateString is null or empty
			return {valid: 0, res: `U heeft geen datum gekozen.`}; // not valid
		}
		const inputDate = new Date(dateString);
		if (isNaN(inputDate.getTime())) { // if date is not valid
			return {valid: 0, res: `Onbekende datum`} // not valid
		}
		inputDate.setHours(0, 0, 0, 0);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		if(inputDate < today){
			return {valid: 0, res: `Uw gekozen datum is in het verleden.`}
		}
		return {valid: 1}
	}

	
	const validZipcode = (zipcode) => {			
		if(!zipcode) return {valid: 0, res: `U heeft geen geldig adres ingevoerd.`}
        if(state.locations.includes(zipcode.substring(0, 4)) || details.delivery == false){
			return {valid: 1}
        }
        else{
			return {valid: 0, res: `Uw gekozen postcode valt niet in ons bezorggebied.`}
        }
    }

	function validate(){
		if(	!shoppingCart.value || Object.keys(shoppingCart.value).length < 1) {return {valid: 0, res: `U heeft geen producten in uw winkelwagentje.`}}
		if(	details.delivery === null) {return {valid: 0, res: `U heeft geen service gekozen.`}}
		if(	validName(details.user.first_name).valid == 0) return validName(details.user.first_name)
		if(	validName(details.user.surname).valid == 0) return validName(details.user.surname)
		if(	validPhone(details.user.phone).valid == 0) return validPhone(details.user.phone)
		if(	validMail(details.user.email).valid == 0) return validMail(details.user.email)
		if(	details.delivery == true && validZipcode(details.user.zipcode).valid == 0) return validZipcode(details.user.zipcode)
		if(	validDate(details.pickupDate).valid == 0) return validDate(details.pickupDate)
		if(	validTime(details.pickupTime).valid == 0) return validTime(details.pickupTime)
		if(	details.koopzegelsAmount < 0) {return {valid: 0, res: `U kunt geen negatief aantal koopzegels hebben.`}}
		return {valid: 1}
	}



	function placeOrder(){
		var inf = store.getters['shopsettings/getUserinfo']
		
		details.user.klantenkaart =  `${inf.klantenkaart || localStorage.getItem('klantenkaart') || ''}`
		details.invoice.klantenkaart =  `${inf.klantenkaart || localStorage.getItem('klantenkaart') || ''}`

		if(store.getters['shopsettings/getLoggedIn']){
			details.user.email = inf.email
			details.invoice.email = inf.email
		}
		const validated = validate()
		if(validated.valid === 0){
			vAlert.alert(
            `${validated.res}`,
            `Er ging iets mis.`,
            'warning',
            {
                confirmButtonText: 'OK',
                confirmButtonColor: '#F58320',
                cancelButtonColor: '#e4e4e4',
                timer: 5000
            }
			).then(()=>{
			})
		}
		else{
			if(details.sameInfoInvoice){
				Object.assign(details.invoice, details.user)
			}
		let params = {
			userDetails:{
				first_name: details.user.first_name,
				surname: details.user.surname,
				customerName: `${details.user.first_name} ${details.user.surname}`,
				customerPhone: details.user.phone,
				klantenkaart: details.user.klantenkaart,
				customerEmail: details.user.email,				
				address:{
					street: details.user.street,
					house_number: details.user.house_number,
					house_addition: details.user.house_addition
				},
				zipcode: details.user.zipcode,
				city: details.user.city,
				country: details.user.country,
				customer_id: localStorage.getItem('user_id'),
			},
			invoiceDetails:{
				first_name: details.invoice.first_name,
				surname: details.invoice.surname,
				customerName: `${details.invoice.first_name} ${details.invoice.surname}`,
				customerPhone: details.invoice.phone,
				klantenkaart: details.invoice.klantenkaart,
				customerEmail: details.invoice.email,				
				address:{
					street: details.invoice.street,
					house_number: details.invoice.house_number,
					house_addition: details.invoice.house_addition
				},
				zipcode: details.invoice.zipcode,
				city: details.invoice.city,
				country: details.invoice.country,
				customer_id: localStorage.getItem('user_id'),
			},
			orderDetails:{
				delivery: details.delivery,
				pickupDate:  details.pickupDate,
				pickupTime: `${String(details.pickupTime.hours).padStart(2, '0')}:${String(details.pickupTime.minutes).padStart(2, '0')}:00`,
				totalPrice: totalFinalPrice.value,
				koopzegels: details.koopzegelsAmount,
				spaarzegels: checkedActies.value,				
				picking_price: details.firstPayment,
				paymentMethod: state.paymentMethod,
				storepoints: details.munten,
				sameInfoInvoice: details.sameInfoInvoice
			},
			orderProducts: shoppingCart.value

		}
			state.orderAccepted = false
		HTTP.post(`order`, params)
		.then((response) => {
			if(response.data.success){
				cart.clearItemsNoMessage()
				window.location.href = response.data.payment
			}
			else{
				alert("Something went wrong, try again.")
			}
		})
		.catch((err) => {
			console.log(err)
		})
	}
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

	onMounted(() => {
        getActies()
		getLocations()
        getStoreInformation()
		if(userinfo.value?.customer_settings?.standard_promotions === true){
			state.munten = true
		}
		if(!userinfo.value){
			auth.getInfo()
		}
		//
		//.then(() => {
		//})
	})
    function getStoreInformation(){
        var params = {
            "domain": 'cooplubbers.nl'
        }
        HTTP_Store.get(`shops`, {params})
        .then((response) => {
            state.info = response.data[0]
        })
        .catch((err) => {
            console.log(err)
        })
    }

	function getActies(){
        HTTP.get(`spaaractie`)
        .then((response) => {
            state.acties = response.data.filter((item) => {
				return DateTime.fromFormat(item.start_date, 'yyyy-MM-dd') < DateTime.now() && DateTime.now() < DateTime.fromFormat(item.end_date, 'yyyy-MM-dd')
			})
			if(userinfo.value?.customer_settings?.standard_promotions === true){
				checkedActies.value = state.acties.map(obj => obj.spaaractie_id);
			}
			state.currentActie = state.acties[0]
        })
        .catch(() => {
        })
    }

	function updateDetails(userDetails){
		Object.assign(details.user, userDetails)
	}

	function updateInvoiceDetails(userDetails){
		Object.assign(details.invoice, userDetails)
	}

	function updateInfoDetails(item){
		details.user = item
		if(details.user.kvk != ''){
			details.business = true
		}
		state.chosenInfo = item.customer_information_id
		if(details.delivery === false){
			details.invoice = item
			if(details.invoice.kvk != ''){
				details.business = true
			}
			state.chosenInvoiceInfo = item.customer_information_id
			details.sameInfoInvoice = false
		}
	}
	
	function updateInvoiceInfoDetails(item){
		details.invoice = item
		if(details.invoice.kvk != ''){
			details.business = true
		}
		state.chosenInvoiceInfo = item.customer_information_id
		details.sameInfoInvoice = false
	}

	function updateFirstDetails(inf){
		if(inf.default_information){
			const index = inf.customer_information.findIndex(
				obj => Object.entries(obj).some(([key, value]) => key === 'customer_information_id' && value === inf.default_information)
			);
			if(index !== -1){
				details.user = inf.customer_information[index]
				if(details.user.kvk != ''){
					details.business = true
				}
				state.chosenInfo = inf.default_information
			}
			else{
				if(inf.customer_information.length > 0){
					details.user = inf.customer_information[0]
					if(details.user.kvk != ''){
						details.business = true
					}
				}
				else{
					details.user.first_name = `${inf.first_name || ''}`
					details.user.surname = `${inf.surname || ''}`
					details.user.email =  `${inf.email || ''}`
					details.user.phone =  `${inf.phone || ''}`
				}
			}
		}
		if(inf.default_invoice_information){
			const index = inf.customer_information.findIndex(obj => Object.entries(obj).some(([key, value]) => key === 'customer_information_id' && value === inf.default_invoice_information));
			if(index !== -1){
				details.invoice = inf.customer_information[index]
				if(details.invoice.kvk != ''){
					details.business = true
				}
				state.chosenInvoiceInfo = inf.default_invoice_information
			}
			else{
				if(inf.customer_information.length > 0){
					details.invoice = inf.customer_information[0]
					if(details.invoice.kvk != ''){
						details.business = true
					}
				}
				else{
					details.invoice.first_name = `${inf.first_name || ''}`
					details.invoice.surname = `${inf.surname || ''}`
					details.invoice.email =  `${inf.email || ''}`
					details.invoice.phone =  `${inf.phone || ''}`
				}
			}
		}
		details.user.klantenkaart =  `${inf.klantenkaart || ''}`
		if(inf.default_invoice_information != inf.default_information){
			details.sameInfoInvoice = false
		}
		state.firstLoad = true
	}

	

	const userinfo = computed(() => {	
		return store.getters['shopsettings/getUserinfo']
	}, {immediate: true, deep: true})

	const loggedIn = computed(() => {
		return store.getters['shopsettings/getLoggedIn']
	}, {immediate: true, deep: true})

	
	watch(() => store.getters['shopsettings/getUserinfo'], (newVal, oldVal) => {
		state.userinfo = store.getters['shopsettings/getUserinfo']
		if(state.firstLoad === false){
			updateFirstDetails(state.userinfo)
		}
	}, {immediate: true, deep: true})

	watch(() => details.business, (newVal, oldVal) => {
		state.userinfo
		if(details.business === true){
			if(state.userinfo.default_work_information){
				const index = state.userinfo.customer_information.findIndex(
					obj => Object.entries(obj).some(([key, value]) => key === 'customer_information_id' && value === state.userinfo.default_work_information)
				);
				if(index !== -1){
					details.user = state.userinfo.customer_information[index]
					state.chosenInfo = state.userinfo.default_work_information
				}
			}
		}
		else{
			if(state.userinfo.default_information){
				const index = state.userinfo.customer_information.findIndex(
					obj => Object.entries(obj).some(([key, value]) => key === 'customer_information_id' && value === state.userinfo.default_information)
				);
				if(index !== -1){
					details.user = state.userinfo.customer_information[index]
					state.chosenInfo = state.userinfo.default_information
				}
			}
		}
	}, {immediate: true, deep: true})

	const filteredAddress = computed(() => {
		var allAddresses = state.userinfo.customer_information
		if(state.business_address === true) return allAddresses.filter(address => address.kvk.length > 0 || address.business.length > 0);
		return allAddresses.filter(address => address.kvk.length == 0 && address.business.length == 0);
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
	const	isChosenInvoiceInfo = computed(() => {
		return (index) => {
			if(index == state.chosenInvoiceInfo){
				return {'border-color': '#00c711'}
			}
				return ''
			}
	})

	const	isChosenInfo = computed(() => {
		return (index) => {
			if(index == state.chosenInfo){
				return {'border-color': '#00c711'}
			}
				return ''
			}
	})

	function setToBusiness(){
	if(details.business === true){
		state.business_address = true
	}
	else{
		state.business_address = false
	}
}
</script>
<style lang="scss" scoped>   
.order.view{
    display: block;
} 

.big-screen{
	display: none;		
}

.goto{
	border-color: #ececec;
	background-color: #ffffff;
}

.goto.shop{
	background-color: #FED201;
	border-color: #FED201;
	color: #000000;
}
.goto:hover, .goto:focus{
	color: #000000;
}
.switch.business{
    padding-left: 12px;
}

.switch.business,
	.switch.delivery{
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: flex-start;
}
.service{
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
}

.business .option{
	width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: nowrap;
    justify-content: flex-start;
	font-size: 1.2rem;
	font-weight: 600;
	margin-bottom: 10px;
}
.business .option .buss{
	margin-left: 5px;
}

.business .option .container{
	font-size: 1.2rem;
	padding-left: 5px;
}
.delivery .option{
	width: calc(100% - 15px);
	border: 2px solid var(--base-color);
	margin-top: 20px;
	padding: 5px;
	border-radius: 10px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    padding-top: 10px;
}

.delivery .option.active{
	border: 2px solid #00c711;
}
.delivery .option.nonactive{
	border: 2px solid #b1b1b1;
}
.delivery .option .left,
.delivery .option .right{
	width: 50%;
	text-align: left;
}
.delivery .option .left{	
    width: calc(50% - 10px);
    text-align: left;
    padding-left: 10px;
}
.delivery .option .right .container{
    padding-left: 0px;
	font-size: 1.2rem;
	font-weight: 600;
}

.delivery .option .type{
	display: column;
    flex-direction: row;
    align-items: flex-start;
    flex-wrap: wrap;
    justify-content: flex-start;
    width: 100%;
	font-weight: 600;
}

.delivery .option .type .container{
    padding-left: 0px;
    padding-top: 3px;
}

.delivery .option i{
	font-size: 1rem;
	font-weight: 400;
	width: 100%;
	text-align: start;
	display: block;
}
.delivery .option .type-info{
	width: 100%;
    padding-top: 10px;
}
.type-info .store{
	font-size: 1.2rem;
}
.delivery .option .type .checkbox input{
	width: 50px;
    height: 50px;
}

.delivery .option .type .checkbox svg{
	width: 51px;
    height: 51px;
}

.option.invoice{
	width: 50%;
    border: 2px solid var(--base-color);
    border-radius: 10px;
	padding-top: 8px;
}
.option.invoice .user-info{
	font-size: 0.9rem;
	padding-bottom: 10px;
	text-align: left;
	padding-top: 10px;
}
.option.invoice .user-info p{
	font-size: 0.9rem;
	padding-left: 10px;
	margin: unset;
}

.option.invoice .edit{
	font-size: 0.9rem;
	text-align: left;
    padding-left: 10px;
}

.option .edit{
	font-size: 0.9rem;
	text-align: left;
	padding-top: 10px;
    padding-bottom: 10px;
}

.info-edit{
	height:100%;
	width: 100%;
	overflow-y: scroll;
	font-size: 1.1rem;
}
.info-edit .top-edit{
	font-size: 1rem;
	font-weight: 600;
	padding-top: 10px;
    text-align: end;
    padding-right: 10px;
}
.info-edit .addresses{
	display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: flex-start;
    justify-content: flex-start;
	padding-left: 10px;
}
.info-edit .address-list{
	display: flex;
	flex-wrap: nowrap;
	flex-direction: row;
	justify-content: flex-start;
    overflow-x: scroll;    
	width: 94%;
    -webkit-box-align: stretch;
    -ms-flex-align: stretch;
    align-items: stretch;
    padding-left: 10px;
    padding-top: 10px;
}

.info-edit .user-information{
    width: 96%;
}

.info-edit .bottom{
	display: flex;
	flex-direction: row;
	justify-content: space-evenly
}


.info-edit .all_address_button{
	font-size: 1.3rem;
	color: #4754ff;
	font-weight: 600;
	padding-top: 10px;
	padding-bottom: 10px;
}
.info-edit .all-address-list .address{    
	margin-bottom: 10px;
    border: 2px solid #b1b1b1;
    border-radius: 10px;
    width: calc(100% - 60px);
}
.info-edit .all-address-list{
	display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-start;
}

.info-edit .title{
	padding-top: 10px;
	padding-bottom: 10px;
	font-size: 1.8rem;
	font-weight: 600;
}
.info-edit .new_address{
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

.info-edit .all-address-list .business_button{
	font-size: 1.3rem;
	color: #4754ff;
	font-weight: 600;
	padding-top: 10px;
	padding-bottom: 10px;
    text-align: center;
    width: 100%;
}

.info-edit .all-address-list .no_address{
	font-size: 1.4rem;
	font-weight: 600;
	padding-top: 15px;
	padding-bottom: 15px;
}

.slotpicker{
	width: 100%;
}
.slotpicker .datepicker{
	width: 100%;
}
.slotpicker .datepicker .dates{
	display: grid;
	grid-template-columns: repeat(4, 22%);
	grid-gap: 3%;
	width: 100%;
}
.slotpicker .datepicker .dates .check{
	display: inline-block;
	margin-top: 10px;
}
.slotpicker .datepicker .dates .checkbox{
	display: block;
}
.slotpicker .datepicker .dates .date .text{
	border: 1px solid var(--base-color);
	border-radius: 10px;
	font-size: 0.85rem;
	padding-top: 5px;
}
.slotpicker .datepicker .dates .date .text > *{
	width: 100%;
}
.popup-picker {
	position: relative;
	width: 100%;
}
.popup-picker .input-overlay{
	position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    font-size: 1.3rem;
    color: #666666;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.voorwaarden{
    text-align: left;
}
.voorwaarden i > a{
	color: #0073eb;
}

i.voorwaarden{
	margin-bottom: 20px;
}
i.voorwaarden2{
	margin-top:-17px;
    text-align: left;
}
.voorwaarden3 p{
	margin-top: 0px;
}
.zipcode-list{
	color: #0073eb;
}

.prijsopbouw{
	display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: flex-start;
    justify-content: flex-start;
}
.prijsopbouw span{
	padding-top: 5px;
    text-align: start;
}
.prijsopbouw .price-part{
	display: grid;
    grid-template-columns: 60% 40%;
    width: 95%;
    text-align: start;
}

.price-part .price-text{
	font-weight: 600;
}

.bottom-part{
	margin-top: 25px;
}

.addresses .bottom{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
}
.addresses .address-list{
	display: flex;
	flex-wrap: nowrap;
	flex-direction: column;
	justify-content: flex-start;
    overflow-x: scroll;
    width: 100%;
    align-items: stretch;
}
.addresses .address{    
	margin-bottom: 10px;
    border: 2px solid var(--base-color);
    border-radius: 10px;
    padding: 10px;
    text-align: left;
    width: 80%;
    padding-right: 30px;
}
.address b{
	text-align: right;
    width: calc(100% + 19px);
    display: block;
}

.addresses .address p{
	margin: 7px;
}

.addresses .address .option{
	width: 100%;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    flex-wrap: nowrap;
    justify-content: flex-start;
	font-size: 1rem;
	font-weight: 600;
	margin-bottom: 10px;
}

.addresses .address .option .container{
    padding-left: 15px;
    padding-right: 15px;
	padding-top: 3px;
	font-size: 1rem;
}

.addresses .all-address-list .address{    
    margin-bottom: 10px;
    border: unset;
    border-radius: unset;
    text-align: left;
    width: 96%;
    border-bottom: 2px solid #999999;
    padding: unset;
    margin-left: auto;
    margin-right: auto;
    padding-top: 10px;
	padding-bottom: 10px;
	position: relative;
}
.addresses .all-address-list .address-list{
    width: 96%;
}

.addresses .all-address-list .address .chosen{
	padding-left: 10px;
	display: flex;
}

.addresses .all-address-list .address .chosen .container{	
    padding-left: 10px;
}

.addresses .all-address-list .address b{
	text-align: unset;
    width: unset;
	position: absolute;
	right: 0;
}

.addresses .address b.title{
	text-align: left;
}
@media only screen and (min-width: 500.98px) and (orientation: portrait) {	
	.order.view {
		overflow-y: scroll;
		display: grid;
		grid-template-columns: 50% 50%;
	}
	.return{
		grid-column: 1;
		grid-row: 1;
		width: fit-content;
		padding-left: 10px;
		font-size: 1.4rem;
		margin-left: 15px;
	}

	.first-block{
		grid-row: 2;
		grid-column: 1;
	}

	#information{
		grid-row: 2;
		grid-column: 2;
	}

	.mobile-only{
		display: none;
	}
	
.big-screen{
	padding-top: 10px;
	display: block;		
}
.big-screen-picker label{
	font-size: 1.8rem;
	font-weight: 600;
}
}
@media only screen and (min-height: 500.98px) and (orientation: landscape) {
	
	.mobile-only{
		display: none;
	}
	.order.view {
		overflow-y: scroll;
		display: grid;
		grid-template-columns: 50% 50%;
	}
	.return{
		grid-column: 1;
		grid-row: 1;
		width: fit-content;
		padding-left: 10px;
		font-size: 1.4rem;
		margin-left: 10px;
	}

	.first-block{
		grid-row: 2;
		grid-column: 1;
	}

	#information{
		grid-row: 2;
		grid-column: 2;
	}

	
.big-screen{
	display: block;
}
.big-screen-picker label{
	font-size: 1.8rem;
	font-weight: 600;
}
}

	.modal-overlay.temp{
	top: 0;
	background-color: #F58320;
    height: 95%;
    z-index: 10;
}
	.grid-container{
        display: grid;        
        grid-template-columns: repeat(8, 1fr);
        gap: 5px;
        /*grid-auto-rows: minmax(100px, auto);*/
        border-bottom: 1px solid #ececec;
        padding: 10px;
    }
    .first{
        grid-column: 1/3;
    }
    .second{        
        grid-column: 3/7;
		
		padding-left: 3px;
		text-align: left;
    }    
    .third{        
        grid-column: 7;
    }
    .fourth{
        grid-column: 8;
    }
    .third-long{
        grid-column: 7/9;
		padding-left: 3px;
		text-align: left;
    }
	.zegels{
		font-size: 1.2rem;
		font-weight: 600;
	}

	.payment-method{
		font-size: 1.2rem;
		padding: 20px 0;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	#information .payment-method label{
		margin-bottom: 5px;
	}
	.payment-method select{
		font-size: 1.2rem;
	}
	.order-information{		
		display: flex;
		flex-direction: column;
		flex-wrap: wrap;
		align-items: stretch;
		align-content: center;
		justify-content: space-evenly;
	}
	.order-information .warn{
		color: #ff0000;
	}
	.order-information .payment{
		font-size: 1.2rem;
	}
	.order-information > * {
		padding: 5px 0;
	}
	.accepttype{
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		flex-wrap: wrap;
		justify-content: space-around;
	}
	#information .accepttype .checkbox{
		margin-top: unset;
		margin-bottom: unset;
	}
	.accepting{
		display: block;
		width: calc(100% - 50px);
		text-align: left;
	}
	

	.switch{
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		justify-content: space-evenly;
		align-items: center;
		padding: 15px 0px;
		font-size: 1.6rem;
	}

	#order-button{
		margin-bottom: 30px;
		margin-top: 5px;
		border-radius: 5px;
		background: var(--base-color);
		-webkit-box-shadow: 6px 10px 5px 0px #000000bf;
		box-shadow: 4px 4px 3px 0px #00000066;
		color: #ffffff;
		border: 2px solid var(--base-color);
	}
	
	#order-button:disabled{
		border: 2px solid #acacac;
		background: #cccccc;
	}

	.cookies{
		display: block;
		position: fixed;
		height: 90vh;
		width: 90vw;
		top: 0vh;
		margin: 10px;
		margin-left: auto;
		margin-right: auto;
		background-color: #ffffff;
		color: black;
		border: 1px solid black;
		-webkit-box-shadow: 0 5px 5px 0 #00000099, 0 1px 10px 0 #00000099;
		box-shadow: 0 5px 5px 0 #00000099, 0 1px 10px 0 #00000099;
		justify-content: space-between;
		z-index: 101;
		overflow-y: scroll;
	}
	.closebutton{
		position: absolute;
		right: 5px;
		z-index: 120;
	}
	#information .checkbox.path.grid-item.third{
		margin-top: unset;
	}

	.option .checkbox.path{
		display: block;
	}
</style>
<style lang="scss">
.toggle-container{
	width: 50%;
	height: 2rem;
}
.toggle:not(.toggle-container){
		width: 100%;	
		font-size: 1.5rem;
		width: 100%;
		height: 100%;
	}
	.toggle-off{
		background: var(--base-color-disabled);
	}
	.toggle-on{
		background: var(--base-color);
		border-color: var(--base-color);
	}
	.toggle-handle{
		min-width: 30px;
		aspect-ratio: 1;
		height: 100%;
	}
	.toggle-label{
		width: calc(100% - 1.75rem);
	}


	@media only screen and (min-height: 500.98px) and (orientation: landscape) {
.dp__input_wrap .dp__input{
    padding: 0.375rem 2.75rem;

}
	}

	
	@media only screen and (min-width: 500.98px) and (orientation: portrait) {
.dp__input_wrap .dp__input{
    padding: 0.375rem 2.75rem;

}
	}
</style>

<style scoped>


#mandlist .row{
	border-bottom: 1px solid #cccccc;
	padding: 5px;
	box-shadow: 1px 2px 1px 0px var(--base-color-shadow);
}

.aantalInput{
	-webkit-appearance: inherit;
	-moz-appearance:inherit;
}
.deleteProduct{
	background-color: var(--base-color) !important;
	color: rgb(243, 243, 243) !important;
}
.title h5{
	font-weight: 600;
	margin: 4px;
}

.order.view{
	overflow-y: scroll;
}
.form-group{
	padding-top: 10px;
    display: flex;
	margin: 5px;
}
#information .form-group label{
    margin: 7px;
}
.cost div{
	text-align: right;
}
.picker .close{
	height: 10%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}
.picker .date{
	height: 15%;
}
.picker .time{
	height: 75%;
}
.picker .date label{
	padding-top: 5px;
	font-size: 1.5rem;
	font-weight: 600;
}
.timeslot p{
	font-size: 1.6rem;
	font-weight: 600;
    margin-bottom: 0;
	text-align: left;
}
.timeslot{
	text-align: left;
}
</style>
<style>
#information{
	width: 96%;
	margin-left:auto;
	margin-right: auto;
}
#information label{
	margin-top: auto;
	margin-bottom: auto;
}
#information .form-group > div{
	margin-left: auto;
    margin-right: 20px;
}
#information .form-group{
	width: 100%;
}
.user-information input{
	font-size: 1.2rem;
}
.vue__time-picker .dropdown{
	top: calc(-11.0em + 2px);
}
.vue__time-picker-dropdown ul li:not([disabled]).active, .vue__time-picker-dropdown ul li:not([disabled]).active:focus, .vue__time-picker-dropdown ul li:not([disabled]).active:hover, .vue__time-picker .dropdown ul li:not([disabled]).active, .vue__time-picker .dropdown ul li:not([disabled]).active:focus, .vue__time-picker .dropdown ul li:not([disabled]).active:hover {
    background: #ffae00;
    color: #fff;
}
</style>
<style lang="scss">
#information .date input{
    font-size: 1.5rem;
    padding-left: 10%;
}
.dp__theme_light {
  --dp-primary-color: var(--base-color);
  --dp-success-color: var(--base-color);
  --dp-success-color-disabled: var(--base-color-disabled);
}
.dp__pointer.dp__input.dp__input_icon_pad{
	padding-left: 35px;
    --dp-text-color: #ffffff00;
	--dp-background-color: #ffffff00
}

.dp__menu{
    min-width: 90%;
    font-size: 1.2rem;	
    top: 30% !important;
	left: 5% !important;
    .dp__arrow_top {
        display: none;
    }
}
.dp__input_icon {
    left: 5%;
	font-size: 1.5rem;
}
.dp__clear_icon {
    right: 5%;
}
.dp__calendar {
    width: 100%;
}

.dp__calendar_header {
    width: 100%;
}

.dp__calendar_wrap {
    width: 100%;
}
//.dp__button[aria-label="Open time picker"]{
//    display: none;
//}
@media screen and (orientation: landscape) and (max-height: 539px){
    .dp__menu{
		top: 40px !important;
	}
    .dp__arrow_top {
        display: none;
    }
}
</style>