<template>
	<div class="alarm">
		<div class="alarmicon" v-if="amount >= 0" @click="clearAlarm()">
            {{amount}} <img :src=alarm v-bind:class="[{'red': amount > 0}, {'black': amount == 0}]"/>
        </div>
	</div>
</template>

<script>
import alarm from '@/assets/icons/alarm.svg'


export default {
	name: 'alarm',
	props: {
		msg: String
	},
	data: function () {
		return {
            alarm: alarm,
            amount: 0
		}
	},
	methods: {
		clearAlarm(){
			this.$store.commit("clearAlarm")
		}
	},
	computed:{
	},
	created(){
	},
	mounted(){
	//	auth.checkAuth();
		
	},
    watch:{        
		'$store.state.alarm':{
			immediate: true,
			deep: true,
			handler(){
				var alarm = this.$store.state.alarm
				this.amount = alarm
			}
		},
    }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.alarm{
    height: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: stretch;
    justify-content: flex-end;
    align-content: center;
}
.alarmicon{
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-content: center;
    align-items: stretch;
    justify-content: flex-end;
    height: 100%;
}
.alarm img{
    height: 100%;
}
.alarm img.red{
	filter: invert(23%) sepia(98%) saturate(6452%) hue-rotate(357deg) brightness(123%) contrast(132%);
}

.alarm img.black{
	filter: none;
}
</style>
