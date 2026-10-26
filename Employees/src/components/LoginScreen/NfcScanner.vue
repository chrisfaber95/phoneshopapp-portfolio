<script setup>
    import { ref } from 'vue'
    import auth from '@/assets/services/auth';
    import PreLoader from '@/components/Basics/Loading.vue';

    const nfcmessage = ref('')
    const nfcscanning = ref(false)
    
    function setNfcMessage(string){
        nfcmessage.value = string
    }

    function setNfcScanning(bit){
        nfcmessage.value = bit
    }

    function ab2str(buf) {
        if (!("TextDecoder" in window))
		alert("Sorry, this browser does not support TextDecoder...");

		var enc = new TextDecoder("utf-8");
		var arr = new Uint8Array(buf);
		return enc.decode(arr);
    }

    function startScan(){
        setNfcScanning(true)
        var abortController = new AbortController();
		abortController.signal.onabort = event => {
		// All NFC operations have been aborted.
			console.log(event)
            setNfcScanning(false)
		};
		try {
			const ndef = new window.NDEFReader();
			ndef.scan({ signal: abortController.signal }).then(() => {
				ndef.onreadingerror = () => {
				alert("Cannot read data from the NFC tag. Try another one?");
			};
			ndef.onreading = event => {const message = event.message;
				for (const record of message.records) {
					switch (record.recordType) {
						case "text":
							nfcLogin(ab2str(record.data.buffer), event.serialNumber)
                            setNfcScanning(false)
                            abortController.abort();
                            break
						default:
							setNfcMessage(message)
                            break;
						}
					}
				};
			}).catch(error => {
				alert(`Error! Scan failed to start: ${error}.`);
                setNfcScanning(false)
			});
		} catch (error) {                
			alert(`Error! Scan failed to start: ${error}.`);
            setNfcScanning(false)
		}
    }


    function nfcLogin(tag, serial){
        auth.nfcLogin(tag, serial)
    }



</script>
<template>
    <div class="ncf-scan">
       <button @click="startScan()">Scan NFC</button>
       <div class="modal-overlay" v-if="nfcscanning" >
            <PreLoader color="#ffa500" :scale=0.6 />
            <p>Scan Pasje</p>
        </div>
    </div>
</template>
<style scoped>

</style>