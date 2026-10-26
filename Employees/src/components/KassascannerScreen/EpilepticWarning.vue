<script setup>
    import { defineEmits } from 'vue';

    const emit = defineEmits(['closeWarning'])

</script>
<template>
    <div class="warning">		
        <div class="warningscreen">                    
        <h2 v-html="`Waarschuwing ‘lichtgevoelige’ epilepsie`"></h2>
        <p v-html="`
            Een zeer klein percentage personen kan een aanval krijgen bij blootstelling aan bepaalde visuele beelden, 
            zoals lichtflitsen of patronen die in deze dienst* kunnen voorkomen. \n
            Zelfs mensen die nooit last hebben gehad van toevallen of epilepsie kunnen tijdens het gebruik van deze dienst een 
            lichte aandoening krijgen die kan leiden tot deze 'lichtgevoelige epileptische aanvallen'.\n
            Stop onmiddellijk met het gebruik van deze dienst en raadpleeg een arts als je één van deze symptomen hebt.\n
            Deze aanvallen kunnen gepaard gaan met een verscheidenheid aan symptomen, zoals duizeligheid, verminderd gezichtsvermogen, 
            trillingen van ogen of gezicht, schokkende of trillende armen of benen, desoriëntatie, verwardheid of tijdelijk verlies van bewustzijn. \n
            Aanvallen kunnen ook leiden tot bewusteloosheid of stuiptrekkingen, waardoor iemand kan vallen of voorwerpen in de omgeving raken en letsel oplopen.\n
            \n
            Afdelingsverantwoordelijken dienen te letten op de bovengenoemde symptomen of hun collega’s ernaar te vragen. \n
            Tieners lopen meer kans op dergelijke toevallen dan volwassenen. \n
            Bij het gebruik van de kassa scanner dient de gebruiker een minimale leeftijd van 15 (vijftien) jaren oud te zijn. \n
            Het gebruik of in het zichtveld plaatsen van deze omgeving dient ook zo goed mogelijk door de gebruiker beperkt te worden voor deze genoemde groep.\n
            \n
            Het risico op lichtgevoelige epileptische aanvallen kan worden verminderd door de volgende voorzorgsmaatregelen:\n
            • Gebruik de dienst in een goed verlichte omgeving.\n
            • Maak geen gebruik van deze dienst als je slaperig of vermoeid bent.\n
            Raadpleeg een arts voordat je deze dienst gaat gebruiken als jezelf of een van je familieleden al eerder aanvallen of epilepsie heeft gehad.\n
            \n
            *Definitie voor deze dienst. De digitale omgeving die beschikbaar is gesteld en waar op dit moment gebruik van wordt gemaakt. \n
            Deze informatie is terug te vinden op de pagina algemene voorwaarden www.
        `">

            </p>
            </div>
        <hr>
        <button @click="emit('closeWarning')" >Sluiten</button>
    </div>
</template>
<style scoped>
.warning{
    height: 96%;
    width: 96%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    align-content: stretch;
    flex-wrap: wrap;
}
.warningscreen{
    height: 80%;
    overflow-y: scroll;
}
.warningscreen p{
    text-align: left;
    white-space: pre-line;
}
</style>