<template>
    <div class="barcodescanner1">
      <button @click="state.codeReader.reset()" style="position: absolute; z-index: 10;">Test</button>
      <button @click="state.result= '8711000008089'" style="position: absolute; z-index: 10; left: 20px;">Test</button>
        <div class="scanner-container">
            <div v-show="state.isScanning">
                <video poster="data:image/gif,AAAA" ref="scanner"></video>
                <div class="overlay-element"></div>
                <Laser class="laser"/>
            </div>
        </div>
        <div class="modal-overlay" v-if="state.scanProduct">
          <Product 
            :product="state.scanProduct"
            @close="(callback) => {state.scanProduct = null;}"/>
        </div>
        <div id="error" v-if="state.error != null">
          {{ state.error }}
        </div>
    </div>
</template>
  
<script setup>
import { BrowserMultiFormatReader, Exception } from "@zxing/library";
import { DecodeHintType } from "@zxing/library";
import { BarcodeFormat } from "@zxing/library";
import { reactive, onMounted, onBeforeUnmount, ref, watch, defineExpose } from 'vue'
import $ from 'jquery'
import Laser from '@/components/Scanners/components/Laser.vue'
  
import {HTTP} from '@/assets/scripts/http-common.js';
import Product from '@/components/Scanners/components/Product.vue'

      const state = reactive({
        reader: null,
        isScanning: false,
        codeReader: null,
        result: '',
        scanProduct: null,
        isMediaStreamAPISupported: navigator && navigator.mediaDevices && "enumerateDevices" in navigator.mediaDevices,
        error: null
      });

      

      function onDecode(result){
        state.result = result
      }
      
      
      

      function startScanner(){
        state.codeReader.decodeFromVideoDevice(undefined, scanner.value, (result, err) => {
            if (result) {
                onDecode(result.text)
            }
        })
      }

      watch(() => state.result, (newVal, oldVal) => {
        state.error = null
        if(state.result != ''){
          //state.codeReader.stopStreams()
          getProduct(state.result)
          state.result = ''
        }
      },{immediate: true, deep: true})

	const scanner = ref();

    onMounted(() => {
        if (!state.isMediaStreamAPISupported) {
            throw new Exception("Media Stream API is not supported");
        }
        
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.CODE_128, BarcodeFormat.UPC_EAN_EXTENSION]);
        hints.set(DecodeHintType.TRY_HARDER, false);
        state.codeReader = new BrowserMultiFormatReader(hints)
        startScanner()
        scanner.value.oncanplay = () => {
            state.isScanning = true;
        }
    })
    onBeforeUnmount(() => {
      navigator.mediaDevices.getUserMedia({ video: true })
      .then(function (mediaStream) {
        var stream = mediaStream;
        var track = stream.getVideoTracks();
        track.forEach(track => {
          track.enabled = false
          track.stop()
        });
      })
      .catch(function (error) {
        console.log(error);
      });
      stopScanner();
    });

function stopScanner() {
  if (state.codeReader) {
    state.codeReader.reset();
    state.isScanning = false;

    if (scanner.value && scanner.value.srcObject) {
      scanner.value.oncanplay = null;
      state.codeReader.stopContinuousDecode();
      state.codeReader.stopStreams();
      state.codeReader.reset();
      state.codeReader.resetPause();

      // Pause the video element to stop the camera access
      scanner.value.pause();

      // Clear the video source object
      scanner.value.srcObject = null;
    }
  }
}
    function getProduct(ean){
      HTTP.get(`product/${ean}`)
      .then((response) => {
        console.log(response)
        if(response.data != null){
          state.scanProduct = response.data
        }
        else{
          state.error = `Het product met barcode ${ean} is niet gevonden in ons assortiment.`
          setTimeout(() => {
            console.log($('#error'))
            $('#error').addClass('closing')
          }, 5000)
          setTimeout(() => {
            $('#error').removeClass('closing')
            state.error = null
          }, 6000)
        }
      })
      .catch((e) => {
              console.log(e)
      })
    }

    function closeProduct(){
      state.scanProduct = null;
    }
    defineExpose({
      closeProduct
    });
  </script>

<style scoped>
.barcodescanner1{
  height: fit-content;
  width: 100%;
  position: relative;
  max-height: 100%;
}
#reader{
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
}
video {
    max-width: 100%;
    max-height: 100%;
  }
  .scanner-container {
    position: relative;
  }
  .overlay-element {
    position: absolute;
    top: 0;
    width: 100%;
    height: 99%;
    background: rgba(30, 30, 30, 0.5);
    -webkit-clip-path: polygon(0% 0%, 0% 100%, 20% 100%, 20% 20%, 80% 20%, 80% 80%, 20% 80%, 20% 100%, 100% 100%, 100% 0%);
    clip-path: polygon(0% 0%, 0% 100%, 20% 100%, 20% 20%, 80% 20%, 80% 80%, 20% 80%, 20% 100%, 100% 100%, 100% 0%);
  }

  .laser {
    width: 60%;
    margin-left: 20%;
    position: absolute;
    top: 50%;
    z-index: 2;
  }

  .scanned-product{
    position: absolute;
    top: 10px;
    height: 85%;
  }

  #error{
    background-color: #ff0000e8;
    padding: 10px;
    bottom: -2rem;
    position: absolute;
    box-shadow: 0px 1px 10px 0px #000000;
    color: #ffffff;
    opacity: 1;
  }
  #error.closing{
    animation: close 1s;
  }
  @keyframes close {
    0%   {opacity: 1;}
    100% {opacity: 0;}
  }
</style>