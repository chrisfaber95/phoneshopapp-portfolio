<template>
    <div class="barcodescanner1">
    <!--  <button @click="closeProduct()" style="position: absolute; z-index: 10;">Test</button>
      <button @click="state.result= '8711000008089'" style="position: absolute; z-index: 10; left: 20px;">Test</button>
      <button @click="startTorch()" style="position: absolute; z-index: 10; top: 50px;">torch</button>
    -->   <div class="scanner-container">
            <div class="video-block" v-show="state.isScanning">
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
        <button class="return manual" @click="manualInput()">Barcode invoeren</button>
    </div>
</template>
  
<script setup>
import { BrowserMultiFormatReader, Exception } from "@zxing/library";
import { DecodeHintType } from "@zxing/library";
import { BarcodeFormat } from "@zxing/library";
import { reactive, onMounted, onBeforeUnmount, ref, watch, defineExpose } from 'vue'
import $ from 'jquery'
import Laser from '@/components/Scanners/components/Laser.vue'
import {VueSimpleAlert as vAlert} from 'vue3-simple-alert';  
import {HTTP} from '@/assets/scripts/http-common.js';
import Product from '@/components/Scanners/components/Product.vue'

      const state = reactive({
        reader: null,
        isScanning: false,
        codeReaderList: [],
        codeTypes: [
                BarcodeFormat.EAN_13,
                BarcodeFormat.EAN_13,
                BarcodeFormat.EAN_8,
                BarcodeFormat.CODE_128,
     //           BarcodeFormat.UPC_EAN_EXTENSION         
        ],
        codeReader: null,
        codeReader1: null,
        codeReader2: null,
        codeReader3: null,
        result: '',
        scanProduct: null,
        isMediaStreamAPISupported: navigator && navigator.mediaDevices && "enumerateDevices" in navigator.mediaDevices,
        error: null,
        pusher: ['0000000000'],
        loading: 0
      });

      

      function onDecode(result){
        state.result = result
      }
      
      
      
 
      function startScanner(reader){
      //      console.log(reader.stream.getVideoTracks()[0].getSettings())
        reader.decodeFromVideoDevice(undefined, scanner.value, (result, err, fr) => {
            console.log(reader.stream.getVideoTracks()[0].getSettings())
        //    console.log(reader.stream.getVideoTracks()[1]?.getSettings())
        //    console.log(reader.stream.getVideoTracks()[2]?.getSettings())
        //   console.log(reader.stream.getVideoTracks()[3]?.getSettings())
            if (result) {
                onDecode(result.text)
                state.codeReaderList.forEach(element => {
                    element.stopContinuousDecode()
                });
                state.pusher.push(result.text)
            }
        })
      }

      function manualInput(){
        state.codeReaderList.forEach(element => {
            element.stopContinuousDecode()
        });
        vAlert.fire({
  title: 'Voer de barcode in.',
  input: 'number',
  showCancelButton: true,
  confirmButtonText: 'OK',
  cancelButtonText: 'Terug',
  confirmButtonColor: '#F58320',
  cancelButtonColor: '#e4e4e4'
}
        ).then((e)=>{
            if(e.value){
                getProduct(e.value)
            }
            
            state.codeReaderList.forEach(element => {
                startScanner(element)
            });
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
            state.codeTypes.forEach(element => {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(function (mediaStream) {
          var stream = mediaStream;
          var tracks = stream.getVideoTracks();
          tracks.forEach(track => {
            const capabilities = track.getCapabilities();
            const constraints = {
              width: { ideal: capabilities.width.max },
              height: { ideal: capabilities.height.max },
              //advanced: [{torch: true}]
            };
            track.applyConstraints(constraints)
              .then(() => {
                console.log("Resolution changed for video track");
              })
              .catch(e => {
                console.log("Error applying constraints for video track:", e);
              });
          });
        })
        .then(() => {
                let hints = new Map()
                hints.set(DecodeHintType.POSSIBLE_FORMATS, [
                    element
                ])
                hints.set(DecodeHintType.TRY_HARDER, true);
                const codereader = new BrowserMultiFormatReader(hints)
                state.codeReaderList.push(codereader)
                startScanner(codereader)
            scanner.value.oncanplay = () => {
                state.isScanning = true;
            }
        })
        .catch(function (error) {
            console.log(error);
        });
        });
       
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
    state.codeReaderList.forEach(element => {
        element.stopContinuousDecode();
        element.stopStreams();
        element.reset();
      //  element.resetPause();
    });
    state.isScanning = false;
    scanner.value.oncanplay = null;
    // Pause the video element to stop the camera access
    scanner.value.pause();
    // Clear the video source object
    scanner.value.srcObject = null;
}

    function getProduct(ean){
      HTTP.get(`product/${ean}`)
      .then((response) => {
        if(response.data != null){
          state.scanProduct = response.data
        }
        else{
            state.codeReaderList.forEach(element => {
                startScanner(element)
            });
          state.error = `Het product met barcode ${ean} is niet gevonden in ons assortiment.`
          setTimeout(() => {
            $('#error').addClass('closing')
          }, 5000)
          setTimeout(() => {
            $('#error').removeClass('closing')
            state.error = null
          }, 6000)
          startScanner()
        }
      })
      .catch((e) => {
              console.log(e)
      })
    }

    function closeProduct(){
        state.scanProduct = null;
        state.codeReaderList.forEach(element => {
            startScanner(element)
        });
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
  height: 100%;
}
#reader{
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
}
video {
    max-width: 100%;
    max-height: 90%;
  }
  .scanner-container {
    position: relative;
  }
  .video-block{
    max-height: calc(90% - 4rem)
  }

  .manual{    
    position: absolute;
    left: 5px;
    bottom: 0;
    z-index: 5;
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
    bottom: 0;
    position: absolute;
    box-shadow: 0px 1px 10px 0px #000000;
    color: #ffffff;
    opacity: 1;
    left: 0;
    z-index: 6;
  }
  #error.closing{
    animation: close 1s;
  }
  @keyframes close {
    0%   {opacity: 1;}
    100% {opacity: 0;}
  }
</style>