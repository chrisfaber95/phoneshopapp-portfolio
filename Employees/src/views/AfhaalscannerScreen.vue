<script setup>
// @ is an alias to /src
import { ref, reactive, onMounted} from 'vue'
import { QrcodeStream } from 'vue3-qrcode-reader'
//import {HTTP} from '@/assets/services/http-common.js'
import Order from '@/components/AfhaalscannerScreen/Actie.vue';

import Header from '@/components/Basics/Header.vue'

  const state = reactive({
    camera: 'rear',
    qrcode: '',
    result: '',
    resetValidationState: null,
    modalOpened: false,
    devices: [],
    scanning: false,
    correct: null
  })

  function onInit (promise) {
    promise.catch(error => {
      const cameraMissingError = error.name === 'OverconstrainedError'
      const triedFrontCamera = state.camera === 'front'

      if (triedFrontCamera && cameraMissingError) {
        // no front camera on this device
      }
    })
  }

  function changeCamera(){
        state.camera = state.camera == 'rear' ? state.camera = 'front' : state.camera = 'rear'
      }
  function turnCameraOn(id) {
    state.camera = id ? id : 'auto'
  }

	function turnCameraOff() {
    state.camera = 'off'
  }

  function onDecode (decodedString) {
    console.log(decodedString)
    state.result = decodedString
    turnCameraOff()
    if(!state.modalOpened){
      state.qrcode = decodedString
    }
  }

function videoDevices(){
    navigator.mediaDevices.enumerateDevices()
    .then((response)=>{
      console.log(response)
      state.devices = response.filter(deviceInfo => deviceInfo.kind === "videoinput")
    })
  }

  function hide (){
      if(confirm("Weet u het zeker? Gegevens worden niet opgeslagen")){
          state.qrcode = ''
          turnCameraOn('auto')
      }
  }

  onMounted(() => {
    videoDevices()
  })
  const qrcodestream = ref(null)

</script>
<template>
  <div class="afhaalscanner-screen">	 
    <div class="screen">
        <div class="content">
          <qrcode-stream ref='qrcodestream' :camera="state.camera" @decode="onDecode" @init="onInit"></qrcode-stream>
          <div class="modal-overlay" v-if="!state.scanning">
            <div class="warning" v-html="state.correct"></div>
            <button @click="noStamps()" v-html="'Klant wil geen zegels.'" class="start" style="display: none;"></button>
            <button @click="state.scanning = true; turnCameraOn('auto')" v-html="'Scannen'" class="start"></button>
          </div>
          <div class="buttons">
            <div class="left">
              <button @click="turnCameraOn('auto')">Herstart camera*</button>
              <span>*Wanneer vastgelopen</span>
            </div>
            <div class="right">
              <button @click="changeCamera()" v-html="`Wijzig camera`"></button>
              <span v-html="`Huidige camerastand: ${state.camera}`"></span>
            </div>
          </div>
            <div class="modal-overlay" v-if="state.qrcode != ''">
              <button class="close-button" @click="hide()" >X</button>
              <Order 
                v-if="state.qrcode != ''"
                :orderId="state.qrcode"/>
            </div>
        </div> 
        </div>
        <Header />
  </div>
</template>

<style scoped lang="scss">
.afhaalscanner-screen{
  width: 100%;
  height: 100%;
  overflow:hidden;
}

.screen{
  overflow-y:scroll;
  height: 94%;
}
.modal-overlay .warning{
  max-width: 80%;
height: fit-content;
max-height: 60%;
font-size: 1.5rem;
color: #000000;
margin-top: 20px;
}
.start{
  
font-size: 3rem;
}
.close-button{
  position: absolute;
  right: 15px;
  top: 15px;
  z-index: 101;
  padding: 5px;
  margin: 0px 0;
}
.buttons{
max-width: 100%;
display: flex;
flex-direction: row;
align-items: flex-start;
flex-wrap: nowrap;
justify-content: space-around;
}
.buttons > div {
max-width: 45%;
display: flex;
flex-direction: column;
flex-wrap: nowrap;
justify-content: flex-start;
align-items: stretch;
align-content: center;      
}
.buttons div button{
width: 100%;
}
.buttons div span{
width: 100%;
}
/* 
  ##Device = Low Resolution Tablets, Mobiles (Landscape)
  ##Screen = B/w 481px to 767px
*/

@media (orientation: landscape){
}

@media (min-width: 481px){
  

/* 
  ##Device = Tablets, Ipads (portrait)
  ##Screen = B/w 768px to 1024px
*/
}
@media (min-width: 768px){
}

/* 
  ##Device = Tablets, Ipads (landscape)
  ##Screen = B/w 768px to 1024px
*/

@media (min-width: 768px) and (orientation: landscape) {
}


/* 
  ##Device = Laptops, Desktops
  ##Screen = B/w 1025px to 1280px
*/

@media (min-width: 1025px) {
  
}


@media (min-width: 1281px) {
  
  
}

</style>
<style >
.qrcode-stream-overlay{
  max-height: 50%;
}
</style>