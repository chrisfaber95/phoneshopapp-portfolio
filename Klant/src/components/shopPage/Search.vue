<template>
  <div class="searchblock">
    <div class="row" id="result_strip">	
      <div class="products" v-for="item in finalProductList" v-bind:key="item.id"  :id="item.ean">	
        <Product 
          v-bind:product="item"
          @closeModal="(callback) => {emit('closeModal')}"
          @removeProduct="(callback) => {removeProduct(callback)}" 
        />	
      </div>
    </div>
	
    <div class="searchbar">		
      <div class="search">		
        <label for="isbn_input" class="col-12">Zoeken:</label>
        <input id="isbn_input" class="isbn col-12" type="text" v-model="state.searchedItem" />
        <div class="filter-button">
          <button @click="state.filtersOpened = !state.filtersOpened">
            <img :src="require('@/assets/icons/cog-solid.svg')" />
          </button>
        </div>
      </div>		
      <div class="search search-filters"
        :class="state.filtersOpened?'open':''">		
        <label for="isbn_input" class="col-12">Afdeling:</label>
        <select v-model="state.selectedDepartment">
          <option v-bind:value="null">
            
          </option>
          <option v-for="option in state.departments" v-bind:value="option.department_id" v-bind:key="option.department_id">
            {{ option.label }}
          </option>
        </select>
      </div>		
      <div class="buttons">
        <button class="return left-shadow" @click="emit('closeModal')">Sluiten</button>	
        <button class="next" @click="searchProduct()">Zoeken</button>	
      </div>
    </div>
	
  </div>
</template>
<script setup>
	
	import { reactive, onMounted, computed, defineEmits} from 'vue';
	import {HTTP} from '@/assets/scripts/http-common.js';
	import Product from '@/components/shopPage/SearchProduct.vue'
	import {VueSimpleAlert as vAlert} from 'vue3-simple-alert';

  const state = reactive({
		departments: [],
    productList: [],
    products: [],
    searchedItem: '',
    selectedDepartment: null,
    scanning: false,
    removed: [],
    filtersOpened: false
	})

	function getDepartments(){
		const params = {
			'visible': 1
		}
		HTTP.get(`departments`, {params})
		.then((response) => {
			state.departments = response.data
      state.departments.shift()
		})
		.catch(() => {
		})
	}
  function sanitizeString(name){
     
    name = name.replace(/[^a-z0-9áéíóúñü .,_-]/gim,"");
    return name.trim();
  }
  function getProducts(){
      var params = {
        ean: productList.value.map(value => value.ean)
      }
			HTTP.get('product', {params})
			.then((response) => {
				state.products = response.data
			})
			.catch(() => {
			})
  }
  function searchProduct(){
			const search = sanitizeString(state.searchedItem)
      var params
      if(state.selectedDepartment == null){
        params = {
          search: search
        }
      }
      else{
        params = {
          department_id: state.selectedDepartment,
          search: search
        }
      }
			HTTP.get('product/search', {params})
			.then((response) => {
				state.productList = response.data
        if(state.productList.length != 0) {
          getProducts()
        }
        else{
          vAlert.alert(
            'Geen producten gevonden voor deze zoekopdracht',
            'Product zoeken',
            'warning',
            {
                confirmButtonText: 'OK',
                confirmButtonColor: '#F58320',
                cancelButtonColor: '#e4e4e4',
                timer: 5000
          })
          .then(()=>{
          })
        }
			})
			.catch((e) => {
          console.log(e)
			})
		}

    function removeProduct(prod){
      state.removed.push(prod.id)
    }

    const productList = computed(() => {
		var rest = state.productList.filter(
			(el) => {
				if (state.removed.includes(el.id)) return false
				else if(el.price > 99999) return false
				else return true
			}
		)
		return rest
	})

  const finalProductList = computed(() => {

    const eanToIndexMap = new Map();
    state.productList.forEach((product, index) => {
      eanToIndexMap.set(product.ean, index);
    });

		var rest = state.products.filter(
			(el) => {
				if (state.removed.includes(el.id)) return false
				else if(el.price > 99999) return false
				else return true
			}
		)
    rest.sort((a, b) => {
      const indexA = eanToIndexMap.get(a.ean);
      const indexB = eanToIndexMap.get(b.ean);
      return indexA - indexB;
    });

		return rest
	})

	onMounted(() => {
		getDepartments()
	})
  
	const emit = defineEmits(['closeModal'])

</script>

<style scoped>

/* width */
::-webkit-scrollbar {
  width: 5px;
}

/* Track */
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px grey;
  border-radius: 10px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: var(--base-color);
  border-radius: 10px;
}

#result_strip{
    margin-left: auto;
    margin-right: auto;
    width: 95%;
    overflow-x: hidden;
}


.searchblock{
    border: 2px solid var(--base-color);
    -webkit-box-shadow: 4px 5px 4px 0px rgb(0 0 0 / 30%);
    box-shadow: 4px 5px 4px 0px rgb(0 0 0 / 30%);
    background-color: #ffffff;
    z-index: 100000;
    position: fixed;
    bottom: 15%;
    width: 90vw;
    left: 5vw;
    max-height: 82%;
    display: flex;
    flex-direction: column;
}
.searchbar{
	margin: 5px;
  height: 35%;
}

#result_strip{
  height: 65%;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
  justify-content: flex-start;
  align-content: stretch;
  padding-top: 10px;
}

.search{
  width: 96%;
  display: flex;
  margin: auto;
  flex-direction: row;
  align-content: center;
  justify-content: space-around;
  align-items: center;
}
.search label{
	font-size: 1.1rem;
  font-weight: 600;
}

.search select,
.search input{
  width: 60%;
  padding: unset;
  padding-left: 5px;
  margin-left: 5px;
  font-size: 1.5rem;
}

.search .filter-button{
  height: 2.5rem;
}

.search .filter-button button{
  border: unset;
  box-shadow: unset;
  background: unset;
}

.search-filters{
  display: none;
  text-align: left;
}
.search-filters.open{
  display: block;
}


.search .filter-button button{
  width: 2.5rem;
  padding: 5px;
  margin: unset;
  margin-left: 5px;
}

.buttons{
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-evenly;
  width: 80%;
  margin-left: auto;
  margin-right: auto;
}
.buttons .next{
  color: #ffffff;
    background-color: #424242;
    border-color: #424242;
}

@media only screen and (min-height: 500.98px) and (orientation: landscape) {
  #result_strip{
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
	.products{
    border-bottom: 3px solid #ececec;
    padding-top: 5px;
    padding-right: 5px;
    padding-left: 0px;
    border-right: 1px solid #ececec;
    border-left: 1px solid #ececec;
	}
  
  .searchblock{
    bottom: 18%;
  }
  .search{
    width: 50%;
    margin: unset;
  }
  
  .search .filter-button{
    display: none;
  }
  .search-filters{
    display: block;
  }
  .searchbar{
    margin: 5px;
    display: flex;
    max-height: 35%;
    height: unset;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
  }
}
@media only screen and (min-width: 500.98px) and (orientation: portrait) {
  #result_strip{
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
	.products{
    border-bottom: 3px solid #ececec;
    padding-top: 5px;
    padding-right: 5px;
    padding-left: 0px;
    border-right: 2px solid #ececec;
	}
  .search{
    width: 50%;
    margin: unset;
  }
  .search .filter-button{
    display: none;
  }
  .search-filters{
    display: block;
  }
  .searchbar{
    margin: 5px;
    display: flex;
    max-height: 35%;
    height: unset;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
  }
}

</style>