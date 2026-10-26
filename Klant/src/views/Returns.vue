
<script setup>
    import { reactive, onMounted } from 'vue'
    import { HTTP_Store} from '@/assets/scripts/http-common.js';

    const state = reactive({
     loading: false,
     info: null
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
        })
        .catch((err) => {
            console.log(err)
        })
    }

	function generateReturnForm() {
            state.loading = true
           // HTTP_Files.get(`tac/return-form.pdf`,{
           //     responseType: "application/pdf"
           // })
          //  .then((response) => {
           //     console.log(response)
           //     const blob = new Blob(["\ufeff", response.data]);
          //      const url = URL.createObjectURL(blob);
                const url = '/return-form.pdf';
                const downloadLink = document.createElement("a");
                downloadLink.href = url;
                downloadLink.download = `CoopReturnForm.pdf`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                state.loading = false
                //window.open(URL.createObjectURL(response.data))
         //   })
         //   .catch((err) =>{
         //       console.log(err)
         //   })
        }
        function openInNewTab(url) {
            window.open(url, '_blank', 'noreferrer');
        }
</script>
<template>
  <div class="contact" >
    <h2>Retourneren</h2>
    <div class="content">
        <p v-html="`${state.info?.shopname} doet haar uiterste best om haar diensten zo goed mogelijk en met uiterste nauwkeurigheid samen te stellen. 
                    Mocht je onverhoopt toch niet tevreden zijn met de dienstverlening of met een product wat gekocht is bij 
                    ${state.info?.shopname} dan kun je op de volgende manieren een klacht indienen.`"></p>
        <ul class="options">
            <li><svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="508px" height="512px" version="1.1" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd"
                viewBox="0 0 508 512.06"
                 xmlns:xlink="http://www.w3.org/1999/xlink"
                 xmlns:xodm="http://www.corel.com/coreldraw/odm/2003">
                 <g id="Layer_x0020_1">
                  <metadata id="CorelCorpID_0Corel-Layer"/>
                  <path fill="black" fill-rule="nonzero" d="M123.43 249.39c15.07,27.16 32.42,53.26 54.98,77.05 22.61,23.95 50.71,45.72 87.14,64.3 2.7,1.32 5.27,1.32 7.55,0.42 3.46,-1.33 6.99,-4.18 10.47,-7.67 2.7,-2.69 6.04,-6.99 9.56,-11.7 13.99,-18.44 31.34,-41.29 55.81,-29.86 0.54,0.25 0.95,0.53 1.49,0.78l81.66 46.96c0.22,0.12 0.53,0.42 0.77,0.53 10.78,7.41 15.2,18.84 15.32,31.76 0,13.18 -4.85,27.98 -11.96,40.5 -9.4,16.5 -23.27,27.43 -39.25,34.69 -15.2,7 -32.13,10.75 -48.4,13.15 -25.55,3.77 -49.47,1.37 -73.94,-6.16 -23.94,-7.42 -48.03,-19.63 -74.37,-35.89l-1.95 -1.25c-12.07,-7.52 -25.12,-15.61 -37.91,-25.13 -46.91,-35.4 -94.65,-86.48 -125.74,-142.71 -26.08,-47.2 -40.32,-98.15 -32.53,-146.73 4.3,-26.63 15.72,-50.84 35.63,-66.82 17.35,-13.98 40.74,-21.64 71.01,-18.96 3.48,0.23 6.58,2.27 8.19,5.24l52.33 88.5c7.67,9.93 8.61,19.75 4.44,29.58 -3.49,8.09 -10.47,15.5 -20.04,22.46 -2.82,2.4 -6.18,4.84 -9.69,7.4 -11.71,8.5 -25,18.3 -20.45,29.85l-0.12 -0.29zm97.51 -42.25c-8.08,-2.08 -12.94,-10.35 -10.85,-18.43 2.09,-8.08 10.35,-12.94 18.43,-10.85 24.51,6.39 47.56,19.66 66.21,37.07 18.76,17.52 33.31,39.41 40.66,62.88 2.48,7.99 -1.98,16.49 -9.96,18.97 -7.98,2.49 -16.49,-1.97 -18.97,-9.95 -5.75,-18.37 -17.33,-35.69 -32.36,-49.73 -15.15,-14.15 -33.68,-24.88 -53.16,-29.96zm2.01 -92.74c-8.25,-1.4 -13.79,-9.24 -12.39,-17.49 1.39,-8.24 9.24,-13.79 17.48,-12.39 46.21,8 90.08,31.46 125.25,64.38 35.19,32.92 61.82,75.41 73.53,121.46 2.06,8.12 -2.85,16.38 -10.97,18.44 -8.12,2.06 -16.38,-2.85 -18.44,-10.97 -10.3,-40.48 -33.75,-77.89 -64.75,-106.89 -30.93,-28.95 -69.38,-49.55 -109.71,-56.54zm9.74 -84.19c-8.31,-0.95 -14.28,-8.47 -13.33,-16.78 0.95,-8.31 8.46,-14.29 16.77,-13.34 64.65,7.57 125.4,37.22 173.49,80.81 48.21,43.69 83.83,101.51 98.02,165.22 1.8,8.14 -3.35,16.22 -11.5,18.02 -8.14,1.8 -16.22,-3.35 -18.02,-11.5 -12.8,-57.45 -45.05,-109.73 -88.77,-149.34 -43.53,-39.45 -98.4,-66.28 -156.66,-73.09z"/>
                 </g>
                </svg>
                <p>Via de telefoon: neem hiervoor contact op met {{state.info?.shopname}} via het telefoon nr. {{state.info?.information.phone}} </p></li>
            <li><img :src="require(`@/assets/icons/icons-whatsapp.svg`)"/> 
                <p>Via Whatsapp: Neem hiervoor contact op met {{state.info?.shopname}} via het telefoon nr. {{state.info?.information.mobile}}</p></li>
            <li><svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 112.14"><title>grocery-store</title><path d="M31.21,63.63a1.92,1.92,0,0,1,0-3.84H34A8.93,8.93,0,0,1,38.66,61a7.33,7.33,0,0,1,3.12,4.43.18.18,0,0,0,0,.15l.48,2h1.1v-7.9a1.94,1.94,0,0,1,1.93-1.93H55.48a1.94,1.94,0,0,1,1.93,1.93v4.69a8.69,8.69,0,0,1,6.17-2.58,8.54,8.54,0,0,1,3,.53,10.47,10.47,0,0,1,17.92,5.26h.47a1.9,1.9,0,0,1,1.89,1.9,2.33,2.33,0,0,1-.09.58l-5,20a1.88,1.88,0,0,1-1.85,1.46H48.74C49.42,94,50.11,95.38,51,96c1.12.73,3.07.78,6.33.73H79.42a1.9,1.9,0,0,1,0,3.8h-22c-4,0-6.53,0-8.52-1.37s-3.12-3.7-4.19-7.94h0L38.17,66.55s0,0,0-.09a3.43,3.43,0,0,0-1.46-2.19A5,5,0,0,0,34,63.63H31.21Zm83.35-11v53a6.52,6.52,0,0,1-6.51,6.51H14.83a6.5,6.5,0,0,1-4.6-1.92h0a6.49,6.49,0,0,1-1.91-4.6V52.7a28.35,28.35,0,0,0,5.86.35v52.09a1.12,1.12,0,0,0,.33.8h0a1.12,1.12,0,0,0,.8.32H48.7a4.68,4.68,0,0,1,4.52-3.48h0a4.69,4.69,0,0,1,4.53,3.48H69.2a4.68,4.68,0,0,1,4.52-3.48h0a4.68,4.68,0,0,1,4.53,3.48h29.32a1.13,1.13,0,0,0,1.13-1.13V52.8a26.73,26.73,0,0,0,5.86-.16ZM68.81,75.34a1.35,1.35,0,0,1,2.65,0v7.35a1.35,1.35,0,0,1-2.65,0V75.34Zm-7.94,0a1.35,1.35,0,0,1,2.65,0v7.35a1.35,1.35,0,0,1-2.65,0V75.34Zm-7.93,0a1.35,1.35,0,0,1,2.65,0v7.35a1.35,1.35,0,0,1-2.65,0V75.34ZM69.36,64a9.27,9.27,0,0,1,2.48,3.57h9.29A7.18,7.18,0,0,0,69.36,64Zm3.11,7.37H43.39l4.33,16.31H78.45l4-16.31ZM55.2,67.53c0-.13.11-.27.17-.4V61.07a1.4,1.4,0,0,0-1.4-1.4H47a1.4,1.4,0,0,0-1.4,1.4v6.46ZM106.09,46.4c-1.25-.59-4.33-1.39-5.3-2.35a12.25,12.25,0,0,1-2.12-2.88,12.25,12.25,0,0,1-2.12,2.88c-2.14,2.13-7,3.46-10.29,3.46S78.11,46.18,76,44.05a12.25,12.25,0,0,1-2.12-2.88,12.25,12.25,0,0,1-2.12,2.88c-2.14,2.13-7,3.46-10.29,3.46s-8.15-1.33-10.29-3.46A12.25,12.25,0,0,1,49,41.17a12.25,12.25,0,0,1-2.12,2.88c-2.14,2.13-7,3.46-10.29,3.46s-8.15-1.33-10.29-3.46a12.25,12.25,0,0,1-2.12-2.88,12.25,12.25,0,0,1-2.12,2.88c-1.41,1.4-5.12,2.46-7.08,3-3.95.48-8.61-.09-11.54-3A11.77,11.77,0,0,1,0,35.71V31.07H0a1.44,1.44,0,0,1,.17-.66L8.49,3.76C9.17,1.57,10.84.16,14.07,0h94.09c2.9.31,4.79,1.53,5.57,3.74l9,26.62a1.35,1.35,0,0,1,.19.63h0a.71.71,0,0,1,0,.14v4.58a11.77,11.77,0,0,1-3.47,8.34c-3.48,3.48-8.78,3.39-13.32,2.35Z"/></svg>
                <p>Op lokatie:
                door naar onze lokatie terug te gaan. De contactgegevens staan vermeld op de kassabon en op de contactpagina.</p></li>
            <li><svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 85.57"><title>mail</title><path d="M3.8,0,62.48,47.85,118.65,0ZM0,80.52,41.8,38.61,0,4.53v76ZM46.41,42.37,3.31,85.57h115.9L78,42.37,64.44,53.94h0a3,3,0,0,1-3.78.05L46.41,42.37Zm36.12-3.84,40.35,42.33V4.16L82.53,38.53Z"/></svg>
                <p>Via de mail: 
                neem hiervoor contact op met {{state.info?.shopname}} De contactgegevens zijn {{state.info?.information.mail}}</p></li>
            <li><svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 85.57"><title>mail</title><path d="M3.8,0,62.48,47.85,118.65,0ZM0,80.52,41.8,38.61,0,4.53v76ZM46.41,42.37,3.31,85.57h115.9L78,42.37,64.44,53.94h0a3,3,0,0,1-3.78.05L46.41,42.37Zm36.12-3.84,40.35,42.33V4.16L82.53,38.53Z"/></svg>
                <p>Administratie: 
                administratieve klachten of betalingsherinneringen kunnen worden verzonden naar {{state.info?.information.admin_mail || state.info?.information.mail}}</p></li>
            <li><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 640 640"><path d="M579.999-.012H60C27-.012-.013 27-.013 60.001V580C-.013 613 27 640.012 60 640.012h519.999c33 0 60.013-27.012 60.013-60.012V60c0-33-27.013-60.012-60.013-60.012zM363.819 173.79h73.147V86.068h-73.147c-56.328 0-102.285 45.945-102.285 102.344v43.843h-58.489V320h58.477v233.932h87.734V320h73.075l14.634-87.745h-87.71v-43.843c0-7.938 6.698-14.634 14.564-14.634v.011z"/></svg>
                <p>Via social media: hier vind je alle mogelijkheden om via social media contact op te nemen met {{state.info?.shopname}}</p></li>
        </ul>
        <div class="socials">
            <button class="social-button" v-for="social in state.info?.socials" :key="social.social_id" @click="openInNewTab(social.url)">
                    <img :src="require(`@/assets/icons/${social.type}.svg`)" />
            </button>
        </div>
    <button class="return-button" @click="generateReturnForm()" v-html="`Download het retourformulier`"></button>
    <div v-html="`
    <p>
      ${state.info?.shopname} beantwoordt een klacht zo spoedig mogelijk maar uiterlijk binnen 14 dagen. 
      Je ontvangt in geval van een klacht via het formulier geen ontvangstbevestiging van de klacht. 
      Mocht je niet tevreden zijn over de afhandeling van de klacht, dan kun je jouw klacht voorleggen aan de Geschillencommissie Thuiswinkel via de organisatie Coop 
      (www.sgc.nl). Tevens kun je jouw klacht voorleggen aan de Geschillencommissie via het Europese ODR.  
    </p>
    <p>
        Vragen over je online bestelling bel met ${state.info?.information.phone}
    </p>`"></div>
    <router-link to="/feedback" custom v-slot="{ navigate }">
        <button @click="navigate" @keypress.enter="navigate" role="link" class="return goto">
            Wil je direct contact opnemen?<br/>Vul dan ons klachtenformulier in.
        </button>
    </router-link>
    </div>
  </div>
</template>
<style scoped>
.return{
    font-size: 1.2rem;
	border-color: #ff0000;
	background-color: #ffffff;
    color: #ff0000;
}
.goto:hover, .goto:focus{
	color: #000000;
}

ul.options{
    padding-inline-start: 5px;
}
.options li{
    border-bottom: 2px solid #aaaaaa;
    padding-top: 5px;
    padding-bottom: 5px;
    font-size: 1.2rem;
    list-style: none;
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    justify-content: space-between;
}
.options li img,
.options li svg{
    height: calc(2 * 1.7rem);
    width: calc(2 * 1.7rem);
}

.options li p{
    margin-top: 5px;
    margin-bottom: 5px;
    width: calc(100% - 2 * 2.1rem);
}

  .contact{
    width: 96%;
    color: #000000;
    display: block;
    margin-left:auto;
    margin-right:auto;
    overflow-y: scroll;
}
.content{
    width: 90%;
    margin-left: auto;
    margin-right: auto;
    text-align: left;
}
.content p{
    width: 100%;
    text-align: left;
}
.contactinfo b{
    width: 100%;
}

.social-button{
    height: fit-content;
    padding: 0;
    background-color: unset;
    border: unset;
    box-shadow: unset;
    cursor: pointer;
    margin: 5px;
    text-align: center;
}
.social-button img{
    height: 80px;
}

.return-button{
    background-color: #ffffff;
    border-color: #000000;
    color: #000000;
}
</style>