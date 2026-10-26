<script setup>
// @ is an alias to /src
import { ref, reactive, onMounted, createApp, watch, onBeforeUnmount } from "vue";
import VueSimpleAlert from "vue3-simple-alert";
import { HTTP } from "@/assets/services/http-common.js";
import { QrcodeStream } from "vue3-qrcode-reader";
import Order from "@/components/ActiescannerScreen/Order.vue";
import Changer from "@/components/ActiescannerScreen/Changer.vue";
import Pickup from "@/components/AfhaalscannerScreen/Actie1.vue";
import PickupOrder from "@/components/AfhaalscannerScreen/Order.vue";
import Laser from "@/components/Scanners/components/Laser.vue";
//import EditProduct from '@/components/Storesettings/Products/EditProduct.vue';
//import ACt from '@/components/ActiescannerScreen/Changer.vue';

import Header from "@/components/Basics/Header.vue";
import ShowProduct from "@/components/Storesettings/Products/ShowProduct.vue";
const app = createApp({});
app.use(VueSimpleAlert);

const scanner = ref();

const state = reactive({
  codeTypes: ["code_39", "codabar", "code_128", "ean_13", "ean_8", "qr_code"],
  runMdnScanner: false,
  test: false,
  code: null,
  customer_actie: "",
  customer_card: "",
  pickup: "",
  order: "",
  ean: "",
  scan: false,
  camera: 'rear',
    devices: [],
  backup: false
});

async function checkScanner() {
  return new Promise((resolve, rejected) => {
    try {
      const barcodeDetector = new window.BarcodeDetector({
        formats: state.codeTypes,
      });

      resolve(barcodeDetector);
    } catch (err) {
      rejected(err);
    }
  });
}

function videoElement() {
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } })
    .then((mediaStream) => {
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

function captureVideoFrames(videoElement) {
  state.runMdnScanner = true;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  let frameCount = 0;
  const frameRate = 5; // Desired frame rate (frames per second)
  const frameInterval = 1000 / frameRate;

  function processFrame() {
    if (frameCount % frameRate === 0) {
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      const frameData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Convert frame data to ImageBitmap
      if (state.runMdnScanner == true) {
        createImageBitmap(frameData)
          .then((imageBitmap) => {
            // Use the imageBitmap as needed (e.g., display, process, etc.)
            // You can pass the imageBitmap to another function or store it in an array
            state.bitmap = imageBitmap;
            startScanner(imageBitmap);
            console.log(imageBitmap);
          })
          .catch((error) => {
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
  videoElement.addEventListener("loadedmetadata", () => {
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
  });

  // Start capturing frames
  requestAnimationFrame(processFrame);
}

function startScanner(bitmap) {
  const barcodeDetector = new window.BarcodeDetector({
    formats: state.codeTypes,
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
        console.log(barcode);
        onDecode(barcode.rawValue);
        state.runMdnScanner = false;
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

function checkQrCode(decodedString){
  if (decodedString.includes("change||")) {
    state.customer_actie = decodedString.replace("change||", "");
  } else if (decodedString.length > 13) {    
    if (decodedString.includes("order||")) {
      state.order = decodedString.replace("order||", "");
      console.log(state.order)
    }
    else{
      state.pickup = decodedString;
    }
  } else {
    state.customer_card = decodedString;
  }
}
function onDecode(decodedString) {
  console.log(decodedString)
  state.code = decodedString;
  if (!state.modalOpened) {
    if(state.backup == true){
      checkQrCode(decodedString)
    }
    else if (decodedString.format == "qr_code") {
      checkQrCode(decodedString.rawValue)
    } else {
      state.ean = decodedString;
    }
  }
  if(decodedString != ''){
    var audio = new Audio(require("@/assets/finished.wav")); // path to file
    audio.play();
  }
}

onMounted(() => {});

function clear() {
  state.ean = "";
  state.customer_card = "";
  state.pickup = "";
  state.order = "";
  state.customer_actie = "";
  state.scan = false;
}

//  const qrcodestream = ref(null)

function noStamps() {
  var data = {
    gebruiker: 1,
  };
  HTTP.put(`/customer_spaaractie/nostamps`, data)
    .then((response) => {
      state.correct = response.data.message;
      setTimeout(() => {
        state.correct = null;
      }, 2500);
    })
    .catch((errors) => {
      state.adding = true;
      state.error = errors;
    });
}

function backupInit(){
  state.backup = true
  navigator.mediaDevices.enumerateDevices()
  .then((response)=>{
    state.devices = response.filter(deviceInfo => deviceInfo.kind === "videoinput")
  })
}

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

watch(
  () => state.scan,
  () => {
    if (state.scan == true) {
      checkScanner()
        .then(() => {
          videoElement();
        })
        .catch((err) => {
          backupInit()
          console.log(err);
        });
    }
  },
  { immediate: true, deep: true }
);

function stopScanner() {
    state.isScanning = false;
    scanner.value.oncanplay = null;
    scanner.value.pause();
    scanner.value.srcObject = null;
    state.runMdnScanner = false
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

  const qrcodestream = ref(null)
</script>
<template>
  <div class="afhaalscanner-screen">
    <div class="screen">
      <div class="content">
        <div class="scanner-container" v-if="state.backup == false">
          <div class="video-block" v-show="state.runMdnScanner == true">
            <video id="videoElement" poster="data:image/gif,AAAA" ref="scanner"></video>
            <div class="overlay-element"></div>
            <Laser class="laser" />
          </div>
        </div>
        <div class="scanner-container" v-if="state.backup == true">
          <qrcode-stream ref='qrcodestream' :camera="state.camera" @decode="onDecode" @init="onInit"></qrcode-stream>
          
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
        </div>

        <div class="modal-overlay" v-if="state.scan == false">
          <div class="warning" v-html="state.correct"></div>
          <button
            @click="noStamps()"
            v-html="'Klant wil geen zegels.'"
            class="start"
            style="display: none"
          ></button>
          <button @click="state.scan = true" v-html="'Scannen'" class="start"></button>
          <div class="warning">
            * Exclusief cadeaubonnen en wettelijk niet toegestane artikelen (rookwaren,
            koopzegels, slijterijartikelen, babyvoeding tot 1 jaar, geneesmiddelen,
            postzegels, loten en telefoonkaarten).
          </div>
        </div>
        <div class="buttons" style="display: none">
          <div class="left">
            <button @click="turnCameraOn('auto')">Herstart camera*</button>
            <span>*Wanneer vastgelopen</span>
          </div>
          <div class="right">
            <button @click="changeCamera()" v-html="`Wijzig camera`"></button>
            <span v-html="`Huidige camerastand: ${state.camera}`"></span>
          </div>
        </div>
        <!--<select v-model="state.camera">
                  <option v-for="option in state.devices" :value="option.deviceId" v-bind:key="option.deviceId">
                    {{ option.label }}
                  </option>
                </select>-->

        <div
          class="modal-overlay"
          v-if="
            state.customer_card != '' ||
            state.customer_actie != '' ||
            state.pickup != '' ||
            state.order != '' ||
            state.ean != ''
          "
        >
          <Order
            v-if="state.customer_card != ''"
            :klantenkaart="state.qrcode"
            @back="
              (callback) => {
                hide();
                state.scanning = false;
              }
            "
            @finished="
              (callback) => {
                clear();
              }
            "
          />
          <Changer
            v-if="state.customer_actie != ''"
            :actie="state.customer_actie"
            @back="
              (callback) => {
                hide();
                state.scanning = false;
              }
            "
            @finished="
              (callback) => {
                clear();
              }
            "
          />
          <Pickup
            v-if="state.pickup != ''"
            :orderId="state.pickup"
            @finished="
              (callback) => {
                clear();
              }
            "
          />
          <PickupOrder
            v-if="state.order != ''"
            :orderId="state.order"
            @finished="
              (callback) => {
                clear();
              }
            "
          />
          
          <ShowProduct
           v-if="state.ean != ''" 
           @finished="
            (callback) => {
              clear();
            }
          "
           :ean="state.ean"/>
        </div>
      </div>
    </div>

    <Header />
  </div>
</template>

<style scoped lang="scss">
.afhaalscanner-screen {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.screen {
  overflow-y: scroll;
  height: 94%;
}
.modal-overlay .warning {
  max-width: 80%;
  height: fit-content;
  max-height: 60%;
  font-size: 1.5rem;
  color: #000000;
  margin-top: 20px;
}
.start {
  font-size: 3rem;
}
.close-button {
  position: absolute;
  right: 15px;
  top: 15px;
  z-index: 101;
  padding: 5px;
  margin: 0px 0;
}
.buttons {
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
.buttons div button {
  width: 100%;
}
.buttons div span {
  width: 100%;
}

video {
  max-width: 100%;
  max-height: 90%;
}
.scanner-container {
  position: relative;
}
.video-block {
  max-height: calc(90% - 4rem);
}
.overlay-element {
  position: absolute;
  top: 0;
  width: 100%;
  height: 99%;
  background: rgba(30, 30, 30, 0.5);
  -webkit-clip-path: polygon(
    0% 0%,
    0% 100%,
    20% 100%,
    20% 20%,
    80% 20%,
    80% 80%,
    20% 80%,
    20% 100%,
    100% 100%,
    100% 0%
  );
  clip-path: polygon(
    0% 0%,
    0% 100%,
    20% 100%,
    20% 20%,
    80% 20%,
    80% 80%,
    20% 80%,
    20% 100%,
    100% 100%,
    100% 0%
  );
}

.laser {
  width: 60%;
  margin-left: 20%;
  position: absolute;
  top: 50%;
  z-index: 2;
}
/* 
      ##Device = Low Resolution Tablets, Mobiles (Landscape)
      ##Screen = B/w 481px to 767px
    */

@media (orientation: landscape) {
}

@media (min-width: 481px) {
  /* 
      ##Device = Tablets, Ipads (portrait)
      ##Screen = B/w 768px to 1024px
    */
}
@media (min-width: 768px) {
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
<style>
.qrcode-stream-overlay {
  max-height: 50%;
}
</style>
