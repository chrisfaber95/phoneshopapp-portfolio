
<script setup>
import { defineProps} from 'vue'

defineProps({
    'label': String
});

</script>
<template>
<div class="actietag">
    <span v-html="label"></span>
</div>
</template>
<style lang="scss" scoped>  
    .actietag{
        background-color: red;
        border-radius: 5px;
        padding-bottom: 8px;
        padding-top: 8px;
        padding-right: 2px;
        padding-left: 2px;
        width: min-content;
    }
    .actietag span{
        width: 100%;
        white-space: nowrap;
        color: white;
        border-bottom: 2px solid white;
        border-top: 2px solid white;
        padding: 3px;
        padding-left: 5px;
        padding-right: 5px;
    }
</style>