<script setup>
	
	import { computed, defineProps} from 'vue';
    import Loading from '../Basics/Loading.vue';

	const props = defineProps({
		'nutrients': Object
	})

  const nutrient_records_length = computed(() => {
        return props.nutrients?.nutrient_records.length
    })
</script>
<template>
	<div class="product-nutrients">
		<div class="nutrients-table" v-if="nutrients && nutrient_records_length > 0 ">
            <table>
                <thead>
                  <tr>
                    <th></th>
                    <th class="default">100 {{nutrients?.portion_uom?.label}}</th>
                    <th class="default">GDA</th>
                    <th v-if="nutrients?.portion_size">{{nutrients?.portion_size}} {{nutrients?.portion_uom?.label}}</th>
                    <th v-if="nutrients?.portion_size" class="default">Portie GDA</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="nutrient in nutrients?.nutrient_records" :key="nutrient.nutrient_record_id">
                    <td>{{ nutrient.nutrient_type?.name }}</td>
                    <td>{{ nutrient.default_amount }}{{ nutrient.record_uom?.label }}</td>
                    <td>{{ nutrient.default_gda }}{{ nutrient.record_uom?.label }}</td>
                    <td v-if="nutrients?.portion_size">{{nutrients?.portion_amount}}{{ nutrient.record_uom?.label }}</td>
                    <td v-if="nutrients?.portion_size">{{nutrients?.portion_gda}}{{ nutrient.record_uom?.label }}</td>
                  </tr>
                </tbody>
              </table>
        </div>
        <div class="err" v-if="!nutrients || nutrient_records_length == 0">
            <Loading />
            <h2>Voedingswaarden kunnen momenteel niet worden ingeladen</h2>
        </div>

        </div>
</template>

<style scoped>
.product-nutrients {
  width: 100%;
}

.nutrients-table {
  width: 100%;
  text-align: center;
}

.nutrients-table table {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
}

.nutrients-table th {
  background-color: #eee;
  border: 1px solid #ddd;
  padding: 0.5rem;
}

.nutrients-table td {
  border: 1px solid #ddd;
  padding: 0.5rem;
}

.err {
  color: #f00;
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}


  @media only screen and (min-height: 500.98px) and (orientation: landscape) {

  }
  
  
  @media only screen and (min-width: 500.98px) and (orientation: portrait) {
  
  }
</style>