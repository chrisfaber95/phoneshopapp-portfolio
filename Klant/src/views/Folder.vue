<template>
	<div class="folder1">
		<iframe
            :src="`https://folder.coop.nl/week-${weeknumber}-${year}-1/page/1`"
            width="100%"
            height="100%"
            frameborder="0" >
           </iframe>
		<!--<folder :pageAmount="6" :doublePage="true">
		</folder>	-->	  
	</div>
</template>

<script setup>
import { onMounted, computed } from 'vue';	
import { DateTime } from 'luxon';
//import Stamps from '@/components/'



	const weeknumber = computed(() => {
		return DateTime.local().weekNumber
	})
	const year = computed(() => {
		return DateTime.local().year
	})
	onMounted(() => {
	})
	
	

</script>
	
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.folder{
}
</style>
<style>
    iframe #publication #content.front-cover #banner-cta{
        display: none;
    }
</style>
