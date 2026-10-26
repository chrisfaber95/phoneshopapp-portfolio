<template>
    <div class="warning-block">       
        <h2>Camera toestemming</h2>
        <p>Om gebruik te maken voor deze functie moet u toestemming geven.</p>
        <p>Er wordt geen data opgeslagen dat wordt opgenomen door de camera.</p>
        <p>X Ik geef geen toestemming.</p>
        <p @click="emits('clickResult', true)">X Ik geef toestemming. vraag niet opnieuw</p>
        <p>X Ik geef toestemming. Vraag wanneer ik de zelfscanner opnieuw open</p>
    </div>
</template>

<script setup>
import { defineEmits } from 'vue'

    const emits = defineEmits(['clickResult'])

</script>

<style scoped>
.warning-block{
    width: 94%;
    height: fit-content;
    max-height: 75%;
}
</style>