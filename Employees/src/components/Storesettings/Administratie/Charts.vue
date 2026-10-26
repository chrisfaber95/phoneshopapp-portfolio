<script setup>
    import { computed, defineProps, onMounted} from 'vue'
    import LineChart from '@/components/Storesettings/Administratie/Linechart.vue';

    const props = defineProps({
        'orders': Array,
        'date': Array
	})

    //const state = reactive({
	//})

    const activeData = computed(() => {
        if(props.orders.length > 0){       
            var data = []
            var labels = []
            props.orders.forEach(element => {
                let date = new Date(element.pickupDate).toISOString().replace(/T/, ' ').split(' ')[0]
                let index = labels.indexOf(date)
                if(index == -1){
                    data.push({'date': date, 'amount': 1, 'finalPrice': parseFloat(element.finalPrice), 'picking_price': parseFloat(element.picking_price) })
                    labels.push(date)
                }
                else{
                    if(element.paycode != null){
                        data[index].amount += 1
                        data[index].finalPrice += parseFloat(element.finalPrice)
                        data[index].picking_price += parseFloat(element.picking_price)
                    }
                    else{                        
                        data[index].amount += 1
                        data[index].picking_price += parseFloat(element.picking_price)
                    }
                }
            });
            return {
                labels: labels.reverse(),
                datasets:[
                    {
                        data: data.reverse(),
                        label: 'Number of Sales',
                        parsing: {
                            xAxisKey: 'date',
                            yAxisKey: 'amount'
                        },
                        backgroundColor: 'rgba(255, 0, 0, 0.5)',
                        borderColor: 'rgba(255, 0, 0, 0.3)'
                    },
                    {
                        data: data.reverse(),
                        label: 'Gross Sales',
                        parsing: {
                            xAxisKey: 'date',
                            yAxisKey: 'finalPrice'
                        },
                        backgroundColor: 'rgba(0, 255, 0, 0.5)',
                        borderColor: 'rgba(0, 255, 0, 0.3)'
                    },
                    {
                        data: data.reverse(),
                        label: 'Gross Packing',
                        parsing: {
                            xAxisKey: 'date',
                            yAxisKey: 'picking_price'
                        },
                        backgroundColor: 'rgba(0, 0, 255, 0.5)',
                        borderColor: 'rgba(0, 0, 255, 0.3)'
                    },
                ]
            }
        }
        else{
            return false
        }
	})
    onMounted(() => {
    })
</script>
<template>
    <div class="charts">
        <LineChart :data="activeData" :chartdate="props.date" v-if="activeData" />
    </div>
</template>
<style lang="scss" scoped>
</style>