<template>
    <div class="chart">
        <D3LineChart :config="chart_config" :datum="chart_data"></D3LineChart>
        {{chart_data}}
    </div>
</template>

<script>
import { D3LineChart  } from 'vue-d3-charts';
export default {
  name: "Linechart",
  data() {
    return {
        chart_data: [],
        chart_config: {
           values: ['y'],
            date: {
                key: 'x',
                inputFormat: '%D',
                outputFormat: '%D',
            },
            points:false,
            axis: {
                yTicks: 3,
            }
        }
    };
  },
  components: {
    D3LineChart,
  },
  props: {
    dataset: {
      type: Array,
      required: true
    },
    options: {
      type: Object
    }
  },
  methods: {
    addData(data) {
      for(var i = 0; i < data.length; i++){
         var jsdate = data[i].x
         var y = data[i].y
        var item = {y, jsdate}
        this.chart_data.push(item);
      }
    }
  },
  watch: {
    /**
     * Re-render the chart on data change
     */
    dataset(data) {
        console.log(data)
        this.data = data;
        if(data != null)
            this.addData(this.data)
    }
  },
  mounted() {
    this.data = this.dataset;
    console.log(this.data)  

  },
  computed: {
    datalist: function(){
        return this.data
    }
  }
};
</script>

<style scoped>
.chart{
  &--linechart {
    font-size: 10px;
  }
  &__point--linechart {
    /* your styles */
  }
  &__line--linechart {
    /* your styles */
  }
}
</style>