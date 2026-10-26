<script setup>
import { reactive, ref,  defineProps, onMounted, defineEmits, watch } from 'vue'
const state = reactive({
    previewImage: null,
    location: window.location.origin
})

const props = defineProps({
    'previewImage': String
})


onMounted(() => {
    state.previewImage = props.previewImage
})

    function selectImage() {
        fileInput.value.click()
    }
    function pickFile() {
        let input = fileInput.value
        let file = input.files
        if (file && file[0]) {
            let reader = new FileReader
            reader.onload = e => {
                state.previewImage = e.target.result
                console.log(state.previewImage)
                emit('input', state.previewImage)
            }
            reader.readAsDataURL(file[0])
        }
    }

    const emit = defineEmits(['input'])
    const fileInput = ref()

    watch(
    () => props.previewImage,
    () => {
        if(props.previewImage != state.previewImage )
            {
                state.previewImage = props.previewImage
            }      
    }, {
      immediate: true
    }
  );

</script>
<template>
<div class="image-preview">	
    <img
    class="imagePreviewWrapper"
    :src="`${state.location}/${state.previewImage}`"
    :style="{ 'background-image': `url(${state.previewImage})` }"
    @click="selectImage"/>

  <input
    ref="fileInput"
    type="file"
    @input="pickFile">
</div>
</template>
<style scoped lang="scss">
.imagePreviewWrapper{
    width: 250px;
    height: 250px;
    display: block;
    cursor: pointer;
    margin: 0 auto 30px;
    background-size: cover;
    background-position: center center;
}
</style>
