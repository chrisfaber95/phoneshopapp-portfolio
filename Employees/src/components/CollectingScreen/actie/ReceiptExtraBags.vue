<script setup>
    import { onMounted, ref, reactive, defineEmits, computed, defineProps } from 'vue';
	import {HTTP} from '@/assets/services/http-common.js';
	import pick from '@/assets/scripts/picking.js'
    import { createApp } from 'vue';
    import VueSimpleAlert from 'vue3-simple-alert';
    const app = createApp({});
    app.use(VueSimpleAlert);

	const props = defineProps({
		'order': Object
	})


	const state = reactive({
		bags: []
	})

	const bagtypes = ref(process.env.VUE_APP_BAGEAN.split(','))

	function getBagInformation(ean){
		let params = {ean: ean}
		HTTP.get('/product/', {params})
		.then((response) => {
			console.log(response.data)
			state.bags = response.data
			
			console.log(state.bags)
		})
		.catch((errors) => {
			console.log(errors)
		})			
	}

	const emit = defineEmits(['closeExtraBagsModal'])

	onMounted(() => {
		state.bags = []
		getBagInformation(bagtypes.value)
	})

	const bags = computed(() => {
        let list
		list = state.bags.filter(obj => {
			return obj.price < 9999
		})
        return list
    })

	function addExtraBag(bag){
		if(props.order.product_list.some(el => el.product_id === bag.id)) {
			app.$alert(                    
                `${bag.product_information.title}" staat al in de lijst.`,
                "",
                'warning',
                {
                    confirmButtonText: 'Ok',
                    confirmButtonColor: '#F58320',
                    cancelButtonColor: '#e4e4e4',
                    duration: 7000,
                }
            )
            .then(() => {
            })
            .catch(() => {
            })
		}
		else{
			app.$confirm(                    
                `Weet je zeker dat je "${bag.product_information.title}" wilt toevoegen aan de bestelling?`,
                "",
                'info',
                {
                    confirmButtonText: 'Ja',
                    cancelButtonText: 'Nee',
                    confirmButtonColor: '#F58320',
                    cancelButtonColor: '#e4e4e4',
                    duration: 7000,
                }
            )
            .then((e) => {
				console.log(e)
				if(e == true){					
					pick.addProductToOrder(bag, props.order)
				}
            })
            .catch(() => {
            })
		}
	}
</script>

<template>
	<div class="bagchooser">            
		<div class="title" v-html="`Kies draagtas`"></div>
		<div class="extrabags">
			<div class="bag" v-for="bag in bags" :key="bag.id">
				<div class="methode">
					<div v-html="`${bag.product_information.title}`"></div>
					<div v-html="`&euro;${parseFloat((bag.price)).toFixed(2)}`"></div>
					<img :src="bag.product_information.imgurl" />
				</div>
				<button  @click="addExtraBag(bag)" v-html="`Toevoegen`"></button>
			</div>
		</div>
		<button @click="emit('closeExtraBagsModal')" v-html="`Sluiten`"></button>
	</div>
    
</template>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.bagchooser{
    overflow-y: scroll;
}
.extrabags{
	width: 100%;
    display: grid;
    grid-template-columns: repeat(2,1fr);
    align-items: stretch;
    justify-items: stretch;
    grid-auto-rows: 1fr;
	grid-row-gap: 10px;
}
.bag{    
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    align-content: stretch;
	font-size: 1.4rem;
}
.title{
	font-size: 2rem;
	font-weight: 600;
	margin: 10px 0;
}


@media (min-width: 481px){
	.title{
		font-size: 2.4rem;
	}
	.bag{    
		font-size: 1.8rem;
		margin: 20px 0;
	}

	button{
		font-size: 2rem;
	}

/* 
  ##Device = Tablets, Ipads (portrait)
  ##Screen = B/w 768px to 1024px
*/
}
@media (min-width: 768px){
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

@media (orientation: landscape){
	.extrabags{
		width: 100%;
		display: grid;
		grid-template-columns: repeat(4,1fr);
		grid-row-gap: 0px;
		height: calc(100% - 6rem);
	}
	.title{
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0;
	}
	.bag{    
		font-size: 1.2rem;
	}
	button{
		font-size: 1.2rem;
	}
}
</style>