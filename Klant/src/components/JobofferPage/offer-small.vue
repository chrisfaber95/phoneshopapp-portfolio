<template>
	<div class="product">
        <section class="head">
            <div class="title">
                <h1 v-html="props.offer.title || ''"></h1>
            </div>
        </section>
        <section class="info">
            <div class="location" v-html="props.offer.shop?.information.name || ''"></div>
            <div class="location" v-html="props.offer.shop?.information.address.city || ''"></div>
            <div class="hours" v-html="props.offer.hours || ''"></div>
        </section>
        <section class="bottom">
            <button v-html="'Open vacature'" @click="state.overlay = !state.overlay"></button>
        </section>
    <div class="modal-overlay" v-if="state.overlay">
        <div class="vacature">
            <div class="all-information">
                <section class="info block">
                    <div class="location" v-html="props.offer.shop?.information.name || ''"></div>
                    <div class="location" v-html="props.offer.shop?.information.address.city || ''"></div>
                    <div class="hours" v-html="props.offer.hours || ''"></div>
                    <div class="hours" v-html="props.offer.description || ''"></div>
                    <div class="hours" v-html="props.offer.labour_conditions || ''"></div>
                    <div class="hours" v-html="props.offer.shop?.information.phone || ''"></div>
                </section>
            </div>
            <div class="apply-form block">
                <div class="title" v-html="`Solliciteer op deze vacature`"></div>
                <div class="apply-info">
                    <div class="subtitle" v-html="`Persoonlijke informatie`"></div>
                    <input :placeholder="`Volledige naam`"/>
                    <input :placeholder="`geboortedatum`"/>
                </div>
                <div class="apply-info">
                    <div class="subtitle" v-html="`Adres- en contactgegevens`"></div>
                    <input :placeholder="`Straat`"/>
                    <input :placeholder="`Postcode`"/>
                    <input :placeholder="`Huisnummer`"/>
                    <input :placeholder="`Huisnummer toevoeging`"/>
                    <input :placeholder="`Woonplaats`"/>
                    <input :placeholder="`email adres`"/>
                    <input :placeholder="`telefoonnummer`"/>
                    <input :placeholder="`waar heb je deze vacatur gezien`"/>
                    <input :placeholder="`cv`"/>
                    <input :placeholder="`motivatiebrief`"/>
                    <input :placeholder="`opmerkingen`"/>
                </div>
            </div>
        </div>
    </div>
	</div>
</template>

<script setup>
import { reactive, defineProps, onMounted } from 'vue';
	
const props = defineProps({
    'offer': Object
})

const state = reactive({
    overlay: false
})


    onMounted(() => {
	})

</script>

<style scoped>
.product{
    position: relative;
    width: 100%;
    display: inline-block;
    text-align: start;    
}
.head {
    background-color: #ececec;
    padding-top: 8px;
    padding-bottom: 8px;
}
.head .title h1{
    margin: 0;
}
.info{
    font-size: 1.3rem;
}

.bottom button{
    font-size: 1.1rem;
}

.vacature{
    overflow-y: scroll;
    display: flex;
    justify-content: space-around;
    flex-direction: row;
    flex-wrap: nowrap;
    align-content: flex-start;
    background-color: #eeeeee;
}
.vacature > div{
    width: 48%;
}
.block{
    background-color: #ffffff;
    border: 1px solid #c7c7c7;
    padding: 3px;
    border-radius: 5px;
}
</style>