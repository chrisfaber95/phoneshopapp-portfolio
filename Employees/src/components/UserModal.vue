<template>
	<div class="userscreen">
        <div class="head">
            <p>Gebruikers Informatie</p>
        </div>
        <div class="content" v-if="state.account">
            <form>
                <label for="firstname">Naam</label>
                <input name="firstname" type="text" placeholder="Naam" v-model="state.account.name"/>
                <label for="firstname">Personeels nr</label>
                <input name="firstname" type="text" placeholder="Personeels nr." v-model="state.account.cardnumber"/>
                <label for="firstname">Email</label>
                <input name="firstname" type="text" placeholder="Email" v-model="state.account.email"/>
			</form>
            <p>Accountrechten: {{state.account.user_role.roleName}}</p>
            <div class="nfc">
                <p v-html="`Heeft pasje: ${state.account.nfctoken ? 'Ja' : 'Nee'}`"></p>      
                <div class="modal-overlay" v-if="state.nfcscanning" >
                    <Preloader color="#ffa500" :scale=0.6 />
                    <p>Scan Pasje</p>
                </div>       
                <button @click="generateTag();">Maak pasje</button>
            </div>
        </div>
        <div class="footer">
            <button @click="emit('close')">Sluiten</button>
            <button @click="save()">Opslaan</button>
        </div>
	</div>
</template>

<script setup>
import { defineProps, reactive, onMounted, defineEmits } from 'vue'
import {HTTP} from '@/assets/services/http-common.js';
import Preloader from './Basics/Loading.vue'

    const props = defineProps({
        'user': Object
    })

    const state = reactive({
        account: null,
        nfcscanning: false,
        nfcmessage: ''
	})

    onMounted(() => {
		state.account = props.user
	})

    const emit = defineEmits(['close'])

    function save(){
        updateAccount()
    }
    function updateAccount(){        
        var params =  {
            user: state.account
        }
        HTTP.put('user/', params)
        .then(() => {
            alert("Account aangepast")
        })
        .catch(() => {
            alert( "Something went wrong")
        })
    }
    
    function makeid(){
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * 
                charactersLength));
        }
        return result;
    }

    function generateTag(){
        state.nfcscanning = true		
        writeNFC(makeid(8))
    }

    function writeNFC(data){
        try {
            const ndef = new window.NDEFReader();
            var abortController = new AbortController();
            abortController.signal.onabort = () => {
            // All NFC operations have been aborted.
                state.nfcscanning = false
            };
			ndef.write({
				records: [{ recordType: "text", data: data }],
				overwrite: true
			}).then(() => {
				setTimeout(() =>{
					const ndef = new window.NDEFReader();
					ndef.scan({ signal: abortController.signal }).then(() => {
						ndef.onreadingerror = () => {
						alert("Cannot read data from the NFC tag. Try another one?");
					};
					ndef.onreading = event => {
						const message = event.message;
						for (const record of message.records) {
						switch (record.recordType) {
						case "text":
						// TODO: Read text record with record data, lang, and encoding.
							state.account.nfc_token = data
							state.account.nfc_serial = event.serialNumber

							updateAccount()
                            state.nfcscanning = false
                            abortController.abort();
						break
						default:
						// TODO: Handle other records with record data.
							state.nfcmessage = message
						}
						}
					};
					}).catch(error => {
						alert(`Error! Scan failed to start: ${error}.`);
                        state.nfcscanning = false
                        abortController.abort();	
					});
				},100)
			}).catch(error => {
				console.log(`Write failed :-( try again: ${error}.`);
                state.nfcscanning = false
                abortController.abort();	
			});
        } 
        catch (error) {                
            alert(`Error! Scan failed to start: ${error}.`);
            state.nfcscanning = false	
        }
    }

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.userscreen{
	position: fixed;
	width: 96%;
	height: 96%;
	left: 2%;
	top: 2%;
	background: white;
    z-index: 2000;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    flex-wrap: wrap;
    align-content: center;
}
.head{
    height: 10%;
}
.head p{
    font-size: 2rem;
    font-weight: 600;
    margin-top: 5px;
    
}
.btn{
	font-size: 2rem;
	font-weight: 600;
	background-color: orange;
	color: white;
    -webkit-box-shadow: 6px 10px 5px 0px rgb(0 0 0 / 75%);
    box-shadow: 4px 4px 3px 0px rgb(0 0 0 / 40%);
    color: #ffffff;
    border: 2px solid #ffa500;
}
.content{
    width: 95%;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    align-content: space-around;
    justify-content: center;
    height: 70%;
    overflow-y: scroll;
}
.nfc p{
    font-size: 1.2rem;
    font-weight: 600;
}
.footer{
    display: flex;    
    height: 10%;
    flex-direction: row;
    align-items: flex-start;
    align-content: flex-start;
    flex-wrap: wrap;
    justify-content: space-around;
}
.modaloverlay{
    position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	display: flex;
	background: #aaaaaae8;
	z-index: 9999;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
}
.modaloverlay p{
    font-size: 2rem;
    font-weight: 600;
    color: #ffffff;
}
@media screen and (orientation: landscape) and (max-height:480px){
    .userscreen{
        justify-content: flex-start;
    }
    .content .form-group{
        margin-bottom: 0;
    }
    .content .form-group label{
        margin-bottom: 0;
    }
}
</style>
<style>
.content .form-group div{
	display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: flex-start;
    align-content: flex-start;
    justify-content: center;
    font-weight: 600;
    font-size: 1.3rem;
    margin-bottom: 10px;
    width: 100%;
}
</style>