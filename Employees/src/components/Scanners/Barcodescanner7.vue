<template>
    <div class="barcodescanner1">
    <!--  <button @click="closeProduct()" style="position: absolute; z-index: 10;">Test</button>
      <button @click="state.result= '8711000008089'" style="position: absolute; z-index: 10; left: 20px;">Test</button>
      <button @click="startTorch()" style="position: absolute; z-index: 10; top: 50px;">torch</button>
    -->   <div class="scanner-container">
            <div class="video-block" v-show="state.isScanning || state.runMdnScanner == true">
                <video id="videoElement" poster="data:image/gif,AAAA" ref="scanner"></video>
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
        <div class="help">
          <img :src="`${publicPath}img/info_scan.gif`" />
        </div>
        <button class="return manual" @click="manualInput()">Barcode invoeren</button>
    </div>
  </template>
  
  <script setup>
  import { BrowserMultiFormatReader, Exception } from "@zxing/library";
  import { DecodeHintType } from "@zxing/library";
  import { BarcodeFormat } from "@zxing/library";
  import { reactive, onMounted, onBeforeUnmount, ref, watch, defineEmits, defineExpose } from 'vue'
  import $ from 'jquery'
  import Laser from '@/components/Scanners/components/Laser.vue'
  import {VueSimpleAlert as vAlert} from 'vue3-simple-alert';  
  import {HTTP} from '@/assets/scripts/http-common.js';
  import Product from '@/components/Scanners/components/Product.vue'
  
  const publicPath = ref(process.env.BASE_URL)
      const state = reactive({
        reader: null,
        isScanning: false,
        codeReaderList: [],
        codeTypes: [
                BarcodeFormat.EAN_13,
     //           BarcodeFormat.EAN_13,
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
        loading: 0,
        mdnDetector: null,
        bitmap: null,
        runMdnScanner: false
      });
  
      
  
      function onDecode(result){
        state.result = result
      }
      
      function startScanner(bitmap){
        const barcodeDetector = new window.BarcodeDetector({
            formats: ["code_39", "codabar", "ean_13", "ean_8"],
        });

        // check compatibility
        if (barcodeDetector) {
        console.log("Barcode Detector supported!");
        } else {
        console.log("Barcode Detector is not supported by this browser.");
        }
        barcodeDetector
            .detect(bitmap)
            .then((barcodes) => {
                barcodes.forEach((barcode) => {
                    console.log(barcode.rawValue)
                    onDecode(barcode.rawValue)
                    state.runMdnScanner = false
                })
            })
            .catch((err) => {
                console.log(err);
            });
      }

      function startZxingScanner(reader){
        reader.decodeFromVideoDevice(undefined, scanner.value, (result, err, fr) => {
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
            
            state.runMdnScanner = true
            state.codeReaderList.forEach(element => {
                startZxingScanner(element)
            });
        })
  
      }
  
      watch(() => state.result, (newVal, oldVal) => {
        state.error = null
        if(state.result != ''){
          getProduct(state.result)
          state.result = ''
        }
      },{immediate: true, deep: true})
  
    const scanner = ref();
  
    onMounted(() => {
        try{
            new window.BarcodeDetector({
                formats: ["code_39", "codabar", "ean_13", "ean_8"],
            });
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(function (mediaStream) {
                const videoElement = scanner.value;
                videoElement.srcObject = mediaStream;
                videoElement.onloadedmetadata = () => {
                    videoElement.play();
                    captureVideoFrames(videoElement);
                };
            })
            .catch(function (error) {
                console.log(error);
            });
        }
        catch{
            if (!state.isMediaStreamAPISupported) {
                throw new Exception("Media Stream API is not supported");
            }
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(function (mediaStream) {
                var stream = mediaStream;
                var tracks = stream.getVideoTracks();
                tracks.forEach(track => {
                var constraints = {
                    width: { ideal: 1500 * 0.75 },
                    height: { ideal: 1500 },
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
                state.codeTypes.forEach(element => {
                    let hints = new Map()
                    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
                        element
                    ])
                    hints.set(DecodeHintType.TRY_HARDER, true);
                    const codereader = new BrowserMultiFormatReader(hints)
                    state.codeReaderList.push(codereader)
                    startZxingScanner(codereader)
                    scanner.value.oncanplay = () => {
                        state.isScanning = true;
                    }
                });
            })
            .catch(function (error) {
                vAlert.fire({
                title: 'Barcode scanner kan niet worden gestart op dit apparaat.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#F58320',
                cancelButtonColor: '#e4e4e4'
                }
                ).then(()=>{
                    emit('closeScanner')
                })
            });
        }
       
    })


    function captureVideoFrames(videoElement) {
        state.runMdnScanner = true
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        let frameCount = 0;
        const frameRate = 5; // Desired frame rate (frames per second)
        const frameInterval = 1000 / frameRate;

        function processFrame() {
            if (frameCount % frameRate === 0) {
                context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                const frameData = context.getImageData(0, 0, canvas.width, canvas.height);

            // Convert frame data to ImageBitmap
                if(state.runMdnScanner == true){
                    createImageBitmap(frameData)
                    .then(imageBitmap => {
                        // Use the imageBitmap as needed (e.g., display, process, etc.)
                        // You can pass the imageBitmap to another function or store it in an array
                        state.bitmap = imageBitmap
                        startScanner(imageBitmap)
                        console.log(imageBitmap);
                    })
                    .catch(error => {
                        console.log(error);
                    });
                }
            }

            frameCount++;

                // Call the next frame after the specified interval
            setTimeout(() => {
                requestAnimationFrame(processFrame);
            }, frameInterval);
        }
        // Set the canvas dimensions to match the video dimensions
        videoElement.addEventListener('loadedmetadata', () => {
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
        });

        // Start capturing frames
        requestAnimationFrame(processFrame);
    }

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
    state.isScanning = false;
    scanner.value.oncanplay = null;
    scanner.value.pause();
    scanner.value.srcObject = null;
    state.runMdnScanner = false
  }
  
    function getProduct(ean){
      HTTP.get(`product/${ean}`)
      .then((response) => {
        if(response.data != null){
          state.scanProduct = response.data
        }
        else{
            state.runMdnScanner = true
            state.codeReaderList.forEach(element => {
                startZxingScanner(element)
            });
          state.error = `Het product met barcode ${ean} is niet gevonden in ons assortiment.`
          setTimeout(() => {
            $('#error').addClass('closing')
          }, 5000)
          setTimeout(() => {
            $('#error').removeClass('closing')
            state.error = null
          }, 6000)
          //startScanner()
        }
      })
      .catch((e) => {
        console.log(e)
            state.runMdnScanner = true
            state.codeReaderList.forEach(element => {
                startZxingScanner(element)
            });
          state.error = `Er ging iets mis met het ophalen van het product met deze barcode.`
          setTimeout(() => {
            $('#error').addClass('closing')
          }, 5000)
          setTimeout(() => {
            $('#error').removeClass('closing')
            state.error = null
          }, 6000)
      })
    }
  
    function closeProduct(){
        state.scanProduct = null;
        state.runMdnScanner = true
        try{
            new window.BarcodeDetector({
                formats: ["code_39", "codabar", "ean_13", "ean_8"],
            });
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(function (mediaStream) {
                const videoElement = scanner.value;
                videoElement.srcObject = mediaStream;
                videoElement.onloadedmetadata = () => {
                    videoElement.play();
                    captureVideoFrames(videoElement);
                };
            })
            .catch(function (error) {
                console.log(error);
            });
        }
        catch{console.log()}
        state.codeReaderList.forEach(element => {
            startScanner(element)
        });
    }
    defineExpose({
      closeProduct
    });
  
    
    const emit = defineEmits(['closeScanner'])
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
    top: 0;
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
  
  .help{
    height: 25%;
  }
  .help img{
    height: 100%;
    width: auto;
  }
  </style>