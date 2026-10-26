<template>
	<div class="order container-fluid">		
	</div>	
</template>

<script>
import router from "../router"
//import cart from '../cart'
//import auth from '@/assets/scripts/auth';
import {HTTP} from '@/assets/scripts/http-common.js';

export default {
  name: 'orderPage',
  components: {
  },
  props: {
  },
	data: function () {
		return {
		}
	},
	methods: {
		confirmOrder: function(){

			var data = {
				type: "Onlinepayment"
			}			
			if(this.$route.params.orderid == null){
				alert("Order vergeten");
			}
			else{
				HTTP.put(`/order/${this.$route.params.orderid}`, data)
				.then((response) =>{
					if(response.data.docs?._links){
						window.location.href = response.data.docs._links.checkout.href
					}
					else{
						router.push('/')
					}
				})
				.catch((errors) => {
					alert("Er ging iets verkeerd")
					console.log(errors)
				})
			}
		}
	},
	created(){
		this.confirmOrder()
	},
	mounted(){
	},
	watch: {
	},
	computed:{
	}
}
</script>
<style scoped>
</style>