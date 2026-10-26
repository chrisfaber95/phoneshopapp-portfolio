<template>
    <div class="change_image">
      <video ref="videoElement" autoplay></video>
      <canvas ref="canvasElement" style="display: none;"></canvas>
      <button @click="captureImage">Capture Image</button>
      <button @click="emit('close'); stopScanner()" v-html="'Sluiten'"></button> 
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, defineProps, defineEmits, createApp, onBeforeUnmount } from 'vue';
import { HTTP } from "@/assets/services/http-common.js";
    import VueSimpleAlert from 'vue3-simple-alert';

const app = createApp({});
    app.use(VueSimpleAlert);
  
  const props = defineProps({
  item: Object,
  ean: String
});


  const videoElement = ref(null);
  const canvasElement = ref(null);
  
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.value.srcObject = stream;
  };
  
  const captureImage = () => {
    const video = videoElement.value;
    const canvas = canvasElement.value;
    const context = canvas.getContext('2d');
  
    const targetSize = 1000;
    const aspectRatio = video.videoWidth / video.videoHeight;
  
    let targetWidth, targetHeight;
    if (aspectRatio > 1) {
      targetWidth = targetSize;
      targetHeight = targetSize / aspectRatio;
    } else {
      targetWidth = targetSize * aspectRatio;
      targetHeight = targetSize;
    }
  
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  
    context.drawImage(video, 0, 0, targetWidth, targetHeight);
    const imageData = canvas.toDataURL('image/jpeg', 1); // Convert canvas to base64 image data
    postProduct(imageData)
    // Now you can send the imageData to your server to replace the existing image
  };
  

    function postProduct(imageData) {
        const params = {
            product: props.item,
            imageData: imageData
        }
        HTTP.post("product/update_images", params)
        .then((r) => {
            console.log(r)
            app.$alert(
                r.data.message,
                '',
                'info',
                {
                    confirmButtonText: 'Ok',
                    confirmButtonColor: '#F58320',
                    cancelButtonColor: '#e4e4e4',
                    timer: 5000,
                }
            )
            .then(()=>{
                emit('finished')
            })
        })
        .catch((e) => {
            console.log(e)
            app.$alert(
                'Er ging iets verkeerd',
                '',
                'warning',
                {
                    confirmButtonText: 'Ok',
                    confirmButtonColor: '#F58320',
                    cancelButtonColor: '#e4e4e4',
                    timer: 5000,
                }
            )
            .then(()=>{
            })
        });
    }

  onMounted(() => {
    startCamera();
  });

  onBeforeUnmount(() => {
      stopScanner();
    });
  
  function stopScanner() {
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
      videoElement.value.srcObject = null;
      canvasElement.value.srcObject = null
  }
  
const emit = defineEmits(['finished', 'close'])
  </script>
  <style scoped>
    video{
        width: 100%;
    }
  </style>
  