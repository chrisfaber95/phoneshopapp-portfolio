<template>
  <div class="products">
    <div class="product-list">
      <Product
        v-for="item in products"
        :key="item.id"
        :item="item"
        @finished="
          (callback) => {
            state.newProduct = false;
          }
        "
      />
    </div>
    <div class="settings">
      <div class="navigation">
        <div class="filters" v-if="state.filter == true">          
          <label for="isbn_input" class="col-12">Zoeken:</label>
          <input id="isbn_input" class="isbn col-12" type="text" v-model="state.searchedItem" />
          <div class="buttons">
            <button class="filter-button" @click="state.filter = false">
              Sluiten
            </button>
            <button @click="searchProduct()">Zoeken</button>
          </div>
        </div>
        <div class="scanner">
          <button>
            <router-link :to="'/scanner'">
              <img :src="require('@/assets/icons/self-scan.svg') "/>
            </router-link>
          </button>
        </div>
        <div class="filter">
          <Select 
            :options="departments" 
            :current="state.filters.department" 
            :nothing="{disabled: true, selected: true, value: 'null', label:'Kies afdeling'}"
            @updateSelected="(callback) => {state.filters.department = callback.department_id}" 
          />
          <select v-model="state.filters.department">            
            <option :value="null" disabled>
              Kies afdeling
            </option>
            <option
              v-for="option in departments"
              :key="option.department_id"
              :value="option.department_id"
            >
              {{ option.label }}
            </option>
            <option :value="`-1`">
              Geen afdeling
            </option>
          </select>          
          <button class="filter-button" @click="state.filter = !state.filter">
            <img :src="require('@/assets/icons/search-plus-solid.svg')" />
          </button>
        </div>
      </div>
      <div class="buttons">
        <button @click="state.newProduct = true">Nieuw product</button>
      </div>
    </div>

    <div class="modal-overlay" v-if="state.newProduct === true">
      <EditProduct
        v-if="state.newProduct != false"
        @finished="
          (callback) => {
            clear();
          }
        "
        :ean="''"
      />
    </div>
    <div class="modal-overlay" v-if="state.editProduct">
      <ShowProduct :item="state.editProduct" />
    </div>
  </div>
</template>
<script setup>
import { computed, reactive, onMounted, watch } from "vue";
import { HTTP } from "@/assets/services/http-common.js";
import Product from "@/components/Storesettings/Products/Product.vue";
import ShowProduct from "@/components/Storesettings/Products/ShowProduct.vue";
import EditProduct from "@/components/Storesettings/Products/EditProduct.vue";
import Select from "@/components/Basics/Selection/Select.vue";
import { useStore } from "vuex";
const store = useStore();

const state = reactive({
  products: [],
  departments: [],
  page: 0,
  filter: false,
  filters: {
    department: 178,
  },
  editProduct: null,
  newProduct: false,
  searchedItem: ''
});

onMounted(() => {
  getDepartments();
  getProducts();
});

function getProducts() {
  var params = {
    department_id: state.filters.department
  };
  HTTP.get(`product`, { params })
    .then((response) => {
      store.commit("settings/updateProducts", response.data);
      console.log(response.data);
    })
    .catch((e) => {
      console.log(e);
    });
}
function sanitizeString(name){
    // eslint-disable-next-line
    name = name.replace(/[^a-z0-9áéíóúñü \.,_-]/gim,"");
    return name.trim();
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
          console.log(params)
			HTTP.get('product/search', {params})
			.then((response) => {
      store.commit("settings/updateProducts", response.data);
      state.filters.department = null
      state.filter = false
		/*		state.productList = response.data
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
        }*/
			})
			.catch((e) => {
          console.log(e)
			})
		}

function getDepartments() {
  var params = {};
  HTTP.get(`departments`, { params })
    .then((response) => {
      let departments = response.data
      let fav = departments.findIndex((e) => {
        return e.department_id == 1;
      })
      delete departments[fav]
      store.commit("settings/updateDepartments", departments);
    })
    .catch((e) => {
      console.log(e);
    });
}



const products = computed(() => {
  var prods = store.getters["settings/getProducts"].filter((e) => {
    if (state.filters.department == null) {
      return e;
    } else {
      if (state.filters.department == "-1") {
        return e.department_id == null;
      } else {
        return (
          e.department_id == state.filters.department ||
          e.department?.main_department == state.filters.department
        );
      }
    }
  });
  return prods;
});

const departments = computed(() => {
  var deps = store.getters["settings/getDepartments"].filter((e) => {
    return e.main_department == null && e.label != null;
  });
  deps.push({department_id: -1, label: 'Geen afdeling'})
  console.log(deps)
  return deps
});

watch(
  () => store.getters["settings/getEditProduct"],
  () => {
    state.editProduct = store.getters["settings/getEditProduct"];
  }
);

watch(
  () => state.filters.department,
  () => {
    if(state.filters.department != null){
      getProducts()
    }
    
  }
);


function clear() {
  state.newProduct = false
  store.commit("settings/updateEditProduct", null);
}
</script>
<style scoped>
.products{
  height: 100%;
}
.product-list{
  height: 85%;
  overflow-y: scroll;
}
.settings{
  height: 10%;
  padding-top: 5px;
  border-top: 2px solid #ececec;
}
.settings .buttons{
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  width: 96%;
}
.settings .buttons button{
  font-size: 1.2rem;
  margin: 0;
  margin-top: 5px;
  padding: 5px;
}
.settings .buttons button a{
  color: #ffffff;
  text-decoration: none;
}
.navigation{
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: flex-start;
  justify-content: space-evenly;
  position: relative;
}
.navigation .filters{
  position: absolute;
  bottom: calc(100% + 5px);
  background-color: white;
  width: 100%;
  height: fit-content;
  border-top: 2px solid #555555;
  border-bottom: 2px solid #aaaaaa;
  padding-bottom: 10px;
  padding-top: 10px;
}

.scanner button{
  margin: 5px;
  max-width: 3rem;
  padding: 2px;
}
.navigation .filter .filter-button{
  width: 2.2rem;
  margin: 0;
  padding: 1px;
}
.navigation .filter select{
  width: calc(100% - 3rem);
}
.filter-options{
  width: 2.5rem;
}
.filter{
  width: calc(95% - 3rem);
}
.filter select{
  font-size: 1.2rem;
  width: 96%;
}
.filter-options .filter-button{
  margin: 0;
  padding: 5px;
}
.filter-options .filter-button img{
  width: 1.5rem;
}
</style>
