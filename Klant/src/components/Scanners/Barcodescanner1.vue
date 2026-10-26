<template>
    <div class="barcodescanner1">
      {{ state.result }}
      {{ state.stream }}
      <button @click="pauseVideo()"></button>
        <div id="reader">
          <video id="video" autoplay></video>          
          <video id="scanning-area" autoplay></video>          
          <Laser  v-if="state.isScanning"/>
        </div>
      <div v-if="state.waitingForAccess == false" class="">
        <p>Waiting...</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { BrowserMultiFormatReader } from "@zxing/library";
  import { DecodeHintType } from "@zxing/library";
import { BarcodeFormat } from "@zxing/library";
  import { reactive, onMounted, onUnmounted, watch } from 'vue'
  import $ from 'jquery'
  import Laser from '@/components/Scanners/components/Laser.vue'
	import {VueSimpleAlert as vAlert} from 'vue3-simple-alert';
  

      const state = reactive({
        reader: null,
        isScanning: false,
        isCameraAccessGranted: null,
        waitingForAccess: false,
        devices:  null,
        currentDeviceId: '',
        stream: null,
        startStream: false,
        result: ''
      });

      

      const requestCameraAccess = async () => {
        return new Promise((resolve, reject) => {
          navigator.mediaDevices.getUserMedia({
            video: true,
          })
          navigator.permissions.query({ name: 'camera' })
            .then(cameraResult => {
              // The state property may be 'denied', 'prompt' and 'granted'
              if(cameraResult.state !== 'granted' || state.isCameraAccessGranted !== 'granted'){
                state.waitingForAccess = true
              }
              state.isCameraAccessGranted = cameraResult.state
              cameraResult.onchange = () =>{
                state.isCameraAccessGranted = cameraResult.state
                if(cameraResult.state == 'granted'){                  
                  state.waitingForAccess = false
                }
              }
              resolve(cameraResult);
            })
            .catch(error => {
              console.error('An error occurred while checking the site permissions', error);
              reject(error);
            });
        });
      };

      async function checkForVideoDevices(){
        return new Promise((resolve, reject) => {

          navigator.mediaDevices.enumerateDevices()
          .then(devices => {
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            let environmentCamera = videoDevices.find(device => device.label.toLowerCase().includes('environment') || device.label.toLowerCase().includes('back'));
            if(!environmentCamera){
              environmentCamera = videoDevices[0]
            }
            state.currentDeviceId = environmentCamera.deviceId
            navigator.mediaDevices.getUserMedia({
              video: {
                deviceId: environmentCamera.deviceId,
              },
            })
            .then(stream => {
              
              /*stream.getTracks().forEach(track => {
                console.log(track)
                track.stop()
              });*/
              console.log(stream)
              resolve(stream);
            })})
            .catch(error => {
              console.error('An error occurred while checking the site permissions', error);
              reject(error);
            });
        });
      }

      
   /*
      onMounted(async () => {
        try {
          await checkForVideoAudioAccess();
          const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
          const video = document.getElementById('video');
          video.srcObject = mediaStream;
          const hints = new Map();
          hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8]);
          const codeReader = new BrowserMultiFormatReader();
          codeReader.decodeFromVideoDevice(video, hints, (result, error) => {
            if (result) {
              console.log('Barcode detected:', result.text);
              codeReader.reset();
            } else if (error) {
              console.error(error);
              codeReader.reset();
            }
          });
        } catch (error) {
          console.error(error);
        }
      })
*/
      async function initCamera(){
        return new Promise((resolve) => {
          checkForVideoDevices()
          .then(stream => {
            var reader = $("#reader")
            let videoElement = document.querySelector('video')
            let videoElement1 = document.querySelector('#scanning-area')
            videoElement.srcObject = stream
            videoElement.width = reader[0].clientWidth
            videoElement.height = reader[0].clientHeight
            videoElement1.srcObject = stream
            videoElement1.width = reader[0].clientWidth
            videoElement1.height = reader[0].clientHeight
            state.stream = stream

            let track = stream.getVideoTracks()[0]
            const maxWidth = track.getCapabilities().width.max
            const maxHeight = track.getCapabilities().height.max
            const constraints = {
              width: { min: 400, ideal: maxWidth/2, max: maxWidth},
              height: { min: 400, ideal: maxHeight/2, max: maxHeight},
              aspectRatio: 1,
              resizeMode: 'none'
            };
            track.applyConstraints(constraints)
            .then(() =>{
              console.log(track.getSettings())
              state.stream = stream
              resolve(track)
            })
            .catch((e)=>{
              console.log(e)
              state.stream = stream
              resolve(track)
            })
            /*.then((e) => {
              console.log(e)
              console.log(state.stream?.getVideoTracks()[0].getConstraints())
              console.log(state.stream?.getVideoTracks()[0].getSettings())
                resolve(track)
            })*/
/*
            getVideoContraints(track)
            .then(track => {
              
              console.log(track.getCapabilities())
              
              console.log(track)
              console.log(track.getSettings())
              state.startStream = true
                resolve(track)
            })*/
          })
          .catch((e) => {
            console.log(e)
            resolve(e)
          });
        })        
      }
/***
 * Only left-bottom corner is scanning
 * */
      function startBarcodeReader(stream){
          const hints = new Map();
          hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8]);
          hints.set(DecodeHintType.TRY_HARDER, true);
          const codeReader = new BrowserMultiFormatReader(hints);
          codeReader.stopContinuousDecode
          state.reader = codeReader
          state.isScanning = true
          const sourceElem = document.querySelector('#video');
          //codeReader.decodeFromConstraints({ video: { deviceId: state.currentDeviceId }}, 'video', (result, error) => {
          //codeReader.decodeFromStream(stream, sourceElem, (result, error) => {
          codeReader.decodeFromVideoElementContinuously( sourceElem, (result, error) => {
           if (result) {
              //openProduct()
              console.log(result)
              codeReader.stopContinuousDecode()
              state.result = result.text
              console.log(`Barcode detected: ${result.text}`);
            } else {
              //console.log(error)
              //codeReader.stopAsyncDecode()
              //codeReader.stopContinuousDecode()
              //state.result = '8710624258672'
              console.error(`Failed to decode barcode: ${error}`);
            }
          }, hints);
      }

      function pauseVideo(){
          //sourceElem.pause()
          //state.reader.stopContinuousDecode()
      }

      watch(() => state.isCameraAccessGranted, async (newVal, oldVal) => {
        if(state.isCameraAccessGranted == 'granted'){
          const videoStream = await initCamera()
          //initBarcodeReader()
          console.log(videoStream)
        }
      })

      watch(() => state.stream, async (newVal, oldVal) => {
        if(state.stream.getVideoTracks()[0]){
          console.log(state.stream.getVideoTracks()[0].getSettings())
          startBarcodeReader(state.stream)
        }
      })

      watch(() => state.result, (newVal, oldVal) => {
        if(state.result != ''){
          state.reader.stopContinuousDecode()
          vAlert.alert(
            state.result,
            'Scan'
            )
          .then(()=>{
            state.result = ''
            startBarcodeReader(state.stream)
          })
        }
      },{immediate: true, deep: true})

      watch(() => state.startStream, (newVal, oldVal) => {
          console.log(state.startStream)
          console.log(state.stream)
          console.log(state.stream?.getVideoTracks()[0]?.getSettings())
          const capabilities = state.stream?.getVideoTracks()[0].getCapabilities();
          console.log(capabilities)
          const constraints = state.stream?.getVideoTracks()[0].getConstraints();
          console.log(constraints)
            
          //initBarcodeReader()
      })

      onMounted(async () => {
          console.log("videoStream")
        const cameraAccess = await requestCameraAccess()
        console.log(cameraAccess)
        if(cameraAccess.state == 'granted'){
          state.isCameraAccessGranted = 'granted'
        }

        onUnmounted(() =>{
          state.reader.stop()
        })
       /* const devices = await checkForVideoAudioAccess1()
        const stream = new MediaStream()
        stream.addTrack(devices)
        //let tracks = devices.getTracks()
        /*  console.log(BrowserMultiFormatReader)
          console.log(Result)
          console.log(DecodeHintType)
          console.log(BarcodeFormat)
          console.log(navigator.mediaDevices)
          //state.devices = e
          const constraints = {
            video: {
              deviceId: state.currentDeviceId
            }
          };*/
            // console.log(mediaStream)

           //   var reader = $("#reader")
         /*     var video = $('<video />', {
                id: 'video',
                src: window.URL.createObjectURL(e),
                type: 'video/mp4',
                controls: true,
                autoplay: true
            });
            video.appendTo(reader);*/

      /*      let videoElement = document.querySelector('video');
            videoElement.srcObject = stream;
            videoElement.width = reader[0].clientWidth;
            videoElement.height = reader[0].clientHeight
            
            const constraint = { height: { exact: 1500 }, width: { exact: 1000 } };

            const track = stream.getVideoTracks()[0]
            const apply = await track.applyConstraints(constraint)
            console.error(apply);
              // Failed to change video track resolution
            videoElement.play();
            console.log(
            stream.getVideoTracks()[0].getCapabilities())
            console.log(
            stream.getVideoTracks()[0].getSettings())
            const canvas = document.createElement('canvas');
            canvas.id = 'canvas';
            document.body.appendChild(canvas);


            const drawRect = (rect) => {
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.width, rect.height);
  ctx.stroke();
};
    // Define the constraints for scanning barcodes
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8]);
    hints.set(DecodeHintType.TRY_HARDER, true);
          const codeReader = new BrowserMultiFormatReader(hints);

          
          
    // Start scanning for barcodes
    state.isScanning = true
    codeReader.decodeFromConstraints({ video: { deviceId: state.currentDeviceId }}, 'video', (result, error) => {
      if (result) {
        console.log(result)
        console.log(`Barcode detected: ${result.text}`);
      } else {
        //console.log(error)
        console.error(`Failed to decode barcode: ${error}`);
      }
    }, hints, 100);*/
     /*       state.reader = new BrowserMultiFormatReader();
            state.isScanning = true;
            const hints = new Map();
            hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8]);
            
            console.log(hints)
            try {
              console.log(constraints)
                const result = await state.reader.decodeFromVideoDevice(videoElement, hints, constraints.video);
                console.log(result)
                console.log("Barcode detected:", result.text);
           //     state.isScanning = false;
            //    state.reader.reset();
            } catch (error) {
                console.error(error);
         //       state.isScanning = false;
           //     state.reader.reset();
            }*/
         /*   
          })}*/
//        const mediaStream = await ;
        
        
     
      })
  
      onUnmounted(() => {
       // state.reader.reset();
        //video.value.srcObject.getTracks().forEach(track => track.stop());
      });

  </script>

<style scoped>
.barcodescanner1{
  height: 100%;
  width: 100%;

}
#reader{
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
}
video{
  position: absolute;
  top: 0;
  left: 0;
}
#video{
  clip-path: inset(25% 25% 25% 25%);
}
.overlay {
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}


</style>