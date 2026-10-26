
<script setup>
    import { reactive, onMounted } from 'vue'
    import { HTTP_Store} from '@/assets/scripts/http-common.js';
    import { DateTime, Info } from 'luxon';

    const state = reactive({
     loading: false,
     info: null,
     business_hours:{
        default: [],
        non_default: []
     },
    publicPath: process.env.BASE_URL
    })

    onMounted(() => {
        getStoreInformation()   
    })

    function getStoreInformation(){
        var params = {
            "domain": 'cooplubbers.nl'
        }
        HTTP_Store.get(`shops`, {params})
        .then((response) => {
            state.info = response.data[0]
            if (state.info.business_hours) {
                state.business_hours.default = state.info.business_hours.filter((bh) => {
                    return bh.default
                })
                state.business_hours.non_default = state.info.business_hours.filter((bh) => {
                    return !bh.default
                }).sort((a, b) => {
                    var aDate = DateTime.fromISO(`${a.year}-W${a.week}-${a.weekday}`).toJSDate()
                    var bDate = DateTime.fromISO(`${b.year}-W${b.week}-${b.weekday}`).toJSDate()
                    return aDate - bDate
                })
            }
        })
        .catch((err) => {
            console.log(err)
        })
    }

    

    

    function timeByDay(weekday){
        var slots = []
        if(state.business_hours.default.length > 0){
            slots = state.business_hours.default.filter( (e) =>{
                return e.weekday == weekday && e.default;
            }).sort((a, b) => {
                var atime = DateTime.fromISO(`2000-01-01T${a.start}`)
                var btime = DateTime.fromISO(`2000-01-01T${b.start}`)
                return atime < btime ? -1 : atime > btime ? 1 : 0;
            })
        }
        return slots
    }

    

    function formatTime(time){
        return time.split(':').slice(0, 2).join(':')
    }

    function getDate(weekday, week, year){
        var date = DateTime.fromObject({
            weekYear: year,
            weekNumber: week,
            weekday: weekday
        }).setLocale('nl-Nl').toLocaleString(DateTime.DATE_MED)
        return date
    }

</script>
<template>
  <div class="contact" >
    <img class="img-fluid banner" :src="`${state.publicPath}img/background-opening.jpg`"/>        
    <div class="contactinfo">
    <div class="adres">
        <h3>Bezoekadres / postadres</h3>
        <p class="name" v-html="state.info?.shopname"></p>
        <p class="address" v-html="`${state.info?.information.address.street ||''} ${state.info?.information.address.house_number ||''}${state.info?.information.address.house_addition ||''}`"></p>
        <p class="address" v-html="`${state.info?.information.address.zipcode ||''} ${state.info?.information.address.city ||''}`"></p>
        <p v-html="`<b>Tel.:</b> ${state.info?.information.phone}`"></p>
        <p v-html="`<b>Mail:</b> ${state.info?.information.mail}`"></p>
        <p v-html="`<b>K.v.k.:</b> ${state.info?.information.kvk}`"></p>
        <p v-html="`<b>Btw nummer:</b> ${state.info?.information.btw}`"></p>
    </div>
    <div class="tijden">
        <h3>Openingstijden</h3>
        <div class="time" v-for="day in 7" :key="day">
            <div class="slot weekday">
                <span
                    v-html="Info.weekdays('long', { locale: 'nl-NL' })[day-1]">
                </span> 
            </div>
            <div class="slot">
                <div class="timeslot" v-for="slot in timeByDay(day)" :key="slot.business_hours_id">
                    <span v-html="` ${formatTime(slot?.start)} - ${formatTime(slot?.end) || ''}`" v-if="slot?.start"></span> 
                </div>
                <span v-if="timeByDay(day).length == 0" v-html="`Gesloten`"></span>
            </div>
        </div>
    </div>
    <div class="tijden dif" v-if="state.business_hours.non_default.length != 0">
        <h3>Afwijkende openingstijden</h3>
        <div class="time" v-for="day in state.business_hours.non_default" :key="day">
            <div class="slot weekday">
                <span
                    class="label"
                    v-html="day.custom_label"></span>
                <span class="date"
                   v-html="getDate(day.weekday, day.week, day.year)"></span>
            </div>
            
            <div class="slot">
                <div class="timeslot" :key="day.business_hours_id">
                    <span v-html="` ${formatTime(day?.start)} - ${formatTime(day?.end) || ''}`" v-if="day?.start && day?.start != day?.end"></span> 
                    <span v-html="`Gesloten`" v-if="!day?.start || day?.start == day?.end"></span> 
                </div>
            </div>
        </div>
    </div>
   
    <div class="socials">
        <h2>Social media kanalen</h2>
        <button class="social-button" v-for="social in state.info?.socials" :key="social.social_id" @click="openInNewTab(social.url)">
                <img :src="require(`@/assets/icons/${social.type}.svg`)" />
        </button>
    </div>
    <div class="organisatie">
        <p>Het bezoekadres van ons servicekantoor organisatie is:</p>
        <p>Markweg 8</p>
        <p>6883 JM Velp</p>
        <br/>
        <p>Bij vragen of klachten mail naar: info@cooplubbers.nl of bel (050) 3187200</p>
    </div>
    </div>
  </div>
</template>
<style scoped>
  .contact{
    width: 100%;
    color: #000000;
    overflow-y: scroll;
}
.banner{
    max-height: 25vh;
    object-fit: cover;
}
.contactinfo{
    width: 90%;
    margin-left: auto;
    margin-right: auto;
}
.contactinfo p{
    width: 100%;
}
.contactinfo b{
    width: 100%;
}

.adres{
    text-align: left;
}

.adres p{
    margin-top: 5px;
    margin-bottom: 5px;
}

.adres .name,
.adres .address{
font-size: 1.2rem;
}

.tijden{
    text-align: left;
    text-transform: capitalize;
}

.tijden .time{
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    padding-bottom: 3px;
}

.tijden .time span{
    font-size: 1.3rem;
}
.tijden .time span.label{
    font-size: 1.1rem;
}
.tijden .time span.date{
    font-size: 1.1rem;
}
.tijden .time .weekday{
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    flex-wrap: wrap;
}
.social-button{
    height: fit-content;
    padding: 0;
    background-color: unset;
    border: unset;
    box-shadow: unset;
    cursor: pointer;
    margin: 5px;
}
.social-button img{
    height: 80px;
}

@media only screen and (min-height: 500.98px) and (orientation: landscape) {
    .contactinfo{
        display: grid;
        grid-template-columns: repeat(2, 50%);
    }
    .adres h3{
        font-size:1.7rem;
    }
    .adres p{
        font-size: 1.2rem;
    }
    .adres .name,
    .adres .address{
        font-size: 1.4rem;
    }
    
    .tijden h3{
        font-size:1.7rem;
    }
    .tijden .time span{
        font-size: 1.6rem;
    }
    .socials{
        grid-column: 1;
        grid-row: 3;
    }
    .socials h2{
        font-size: 1.7rem;
    }
    .organisatie{
        grid-column: 2;
        grid-row: 3;
        font-size: 1.3rem;
    }
}

@media only screen and (min-width: 500.98px) and (orientation: portrait) {
    .contactinfo{
        display: grid;
        grid-template-columns: repeat(2, 50%);
    }
    .adres{
        grid-column: 1;
        grid-row: 1;
    }
    .adres h3{
        font-size:1.7rem;
    }
    .adres p{
        font-size: 1.2rem;
    }
    .adres .name,
    .adres .address{
        font-size: 1.4rem;
    }

    .tijden{
        grid-column: 2;
        grid-row: 1;
    }

    .tijden.dif{
        grid-column: 2;
        grid-row: 2;
    }
    
    .tijden h3{
        font-size:1.7rem;
    }
    .tijden .time span{
        font-size: 1.6rem;
    }

    .socials{
        grid-column: 1;
        grid-row: 3;
    }
    .socials h2{
        font-size: 1.7rem;
    }
    .organisatie{
        grid-column: 2;
        grid-row: 3;
        font-size: 1.3rem;
    }
}
</style>