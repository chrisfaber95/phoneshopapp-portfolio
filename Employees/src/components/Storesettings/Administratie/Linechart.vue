<script setup>
import { reactive, defineProps, onMounted, watch } from 'vue'
import { DateTime } from "luxon";
import { LineChart } from 'vue-chart-3';
import { Chart, registerables } from 'chart.js';
import moment from "moment";
import 'chartjs-adapter-moment';
Chart.register(...registerables);

  const props = defineProps({
        'data': Object,
        'chartdate': Array
	})

    const state = reactive({
        options:{
            responsive: true,
            plugins: {
                legend: {
                position: 'top',
                },
                title: {
                    display: false,
                    text: 'Chart.js Doughnut Chart',
                },
            },
            scales: {
                x: {
                    type: "time",
                    min: moment(DateTime.fromISO(new Date(props.chartdate[0]).toISOString()).startOf("day").toJSDate()),
                    max: moment(DateTime.fromISO(new Date(props.chartdate[1]).toISOString()).endOf("day").toJSDate())
                }
            }
        }
    })
    onMounted(() => { 
    })
    watch(() => props.chartdate, (selection) => { 
        
        var start = new Date(selection[0]).toISOString()
        var end = new Date(selection[1]).toISOString()
        var startDate = moment(DateTime.fromISO(start).startOf("day").toJSDate())
        var endDate = moment(DateTime.fromISO(end).endOf("day").toJSDate())
        state.options.scales.x.min = startDate
        state.options.scales.x.max = endDate
    }, {immediate: true, deep: true})
</script>
<template>
    <div class="linechart">
        <div><LineChart ref="lineChart" :chartData="props.data" :options="state.options" /></div>
        
    </div>
</template>