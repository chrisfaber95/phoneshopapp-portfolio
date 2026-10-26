<template>
  <div class="product">
    <img
      :src="`https://www.cooplubbers.nl${state.imageUrl}`"
      @click="state.change_image = true; "
    />
    <button @click="state.change_image = true;" v-html="'Afbeelding wijzigen'"></button>        
    <div class="modal-overlay" v-if="state.change_image === true">
      <ChangeImage :item="state.product" 
      @finished="state.change_image = false; updateImageUrl();"
      @close="state.change_image = false;"/>
    </div>
    <div class="basic">
      <label for="title">Productnaam:</label>
      <input
        name="title"
        type="text"
        v-model="state.product.product_information.title"
      />
      <label for="ean">Barcode:</label>
      <input
        name="ean"
        type="text"
        v-model="state.product.ean"
      />
      <label for="code">Productcode:</label>
      <input
        name="code"
        type="text"
        v-model="state.product.schapcode"
      />
    </div>
    <div class="prices">
      <label for="price">Prijs:</label>
      <input
        name="price"
        type="number"
        min="0.00"
        step="0.01"
        v-model="state.product.price"
      />
      <label for="btw">BTW:</label>
      <input
        name="btw"
        type="number"
        min="0"
        step="1"
        max="100"
        v-model="state.product.btw"
      />
      <label for="deposit">Statiegeld:</label>
      <input
        name="deposit"
        type="number"
        min="0.00"
        step="0.01"
        v-model="state.product.statiegeld"
      />
      <label for="sup">SUP-prijs:</label>
      <input
        name="sup"
        type="number"
        min="0.00"
        step="0.01"
        v-model="state.product.sup_price"
      />
    </div>
    <div class="information">
      <label for="variant">Variant:</label>
      <input
        name="variant"
        type="text"
        v-model="state.product.product_information.variant"
      />
      <div class="option">
        <label for="nix" class="container">Nix-18:</label>
        <label class="checkbox path buss">
          <input name="nix" type="checkbox" v-model="state.product.nix18" />
          <svg viewBox="0 0 21 21">
            <path
              d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"
            ></path>
          </svg>
        </label>
      </div>
    </div>
    <div class="department">
      <label for="department"></label>
      <select name="department" v-model="state.product.department_id">
        <option
          v-for="option in departments"
          :key="option.department_id"
          :value="option.department_id"
        >
          {{ option.label }}
        </option>
        <option :value="`-1`">Geen afdeling</option>
      </select>
    </div>
    <button v-if="state.new_product != true" @click="updateProduct">Opslaan</button>
    <button v-if="state.new_product === true" @click="postProduct">Opslaan</button>
    <button v-if="props.ean == null" @click="closeEdit()">Sluiten</button>
    <button v-if="props.ean != null" @click="emit('finished')">Sluiten</button>
  </div>
</template>
<script setup>
import { defineProps, reactive, onMounted, computed, watch, defineEmits, createApp } from "vue";
import { HTTP } from "@/assets/services/http-common.js";
import ChangeImage from '@/components/Storesettings/Products/ChangeImage.vue';
import { useStore } from "vuex";
    import VueSimpleAlert from 'vue3-simple-alert';

const app = createApp({});
    app.use(VueSimpleAlert);
const store = useStore();

const props = defineProps({
  item: Object,
  ean: String
});

const state = reactive({    
    new_product: false,
  departments: [],
  product: {
    beschikbaar: 0,
    btw: 0,
    department_id: -1,
    ean: "",
    end_of_life: 0,
    levertijd_id: 1,
    nix18: false,
    price: "0.00",
    product_has_discount_list: [],
    product_information: {
      ean: "",
      imgurl: "",
      ingredients: "",
      omschrijving:
        "",
      product_additional_information_list: [],
      title: "",
      url: null,
    },
    variant: "",
    schapcode: "",
    schaphoogte: 0,
    schapplaats: 0,
    statiegeld: "0.00",
    stock: 1,
    sup_price: 0.0,
  },
  change_image: false,
  imgurl: ''
});

onMounted(() => {
    if(props.item != null){
        state.product = props.item;
    }
    else if(props.ean != null){
        getProduct(props.ean)
    }
    else{
        state.new_product = true
    }
    updateImageUrl()
  getDepartments();
});

function updateImageUrl(){
  // Append a timestamp as a query parameter to the image URL
  const timestamp = Date.now();
  state.imageUrl = `${state.product.product_information.imgurl}?${timestamp}`;
  console.log(state.imageUrl)
}

function updateProduct() {
  HTTP.put("product", state.product)
    .then((r) => {
      console.log(r);
    })
    .catch((e) => {
      console.log(e);
    });
}

function postProduct() {
  if(state.product.department_id == -1){
    state.product.department_id = null
  }
  HTTP.post("product/post", state.product)
    .then(() => {
      app.$alert(
          "Product is toegevoegd",
          '',
          'info',
          {
              confirmButtonText: 'Ok',
              confirmButtonColor: '#F58320',
              cancelButtonColor: '#e4e4e4',
              timer: 5000,
          }
      )
      .then(()=>{
          emit('finished')
      })
    })
    .catch((e) => {
      console.log(e);
    });
}

function getDepartments() {
  var params = {};
  HTTP.get(`departments`, { params })
    .then((response) => {
      store.commit("settings/updateDepartments", response.data);
    })
    .catch((e) => {
      console.log(e);
    });
}

function getProduct(ean) {
  if(ean != ''){
    HTTP.get(`product/${ean}`)
    .then((response) => {
        if(response.data != null){
            state.product = response
        }
        else{            
            state.new_product = true
            state.product.ean = ean
        }
    })
    .catch((e) => {
      console.log(e);
    });
  }
  else{            
      state.new_product = true
      state.product.ean = ean
  }
}

function closeEdit() {
  store.commit("settings/updateEditProduct", null);
}

const departments = computed(() => {
  return store.getters["settings/getDepartments"].filter((e) => {
    return e.main_department == null && e.label != null;
  });
});


watch(
  () => state.product?.department_id,
  () => {
    if (
      state.product.department_id != 0 ||
      state.product.department_id != props.item.department_id
    ) {
      var result = departments.value.find((obj) => {
        return obj.department_id === state.product.department_id;
      });
      state.product.department = result;
      updateProduct();
    }
  }
);

watch(
  () => state.product?.ean,
  () => {
    state.product.product_information.ean = state.product?.ean
  }, {
    immediate: true
  }
);

const emit = defineEmits(['finished'])
</script>
<style scoped lang="scss">
.product {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-evenly;
  border-bottom: 1px solid #ececec;
  overflow-y: scroll;
}
.product > * {
  width: 94%;
  white-space: break-spaces;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex-wrap: wrap;
}
.product > img {
  width: 40%;
}

.product > .modal-overlay {
  width: 100%;
  align-items: center;
}

input {
  font-size: 1.1rem;
}

.checkbox {
  --background: #fff;
  --border: #e60000;
  --border-hover: #e60000;
  --border-active: #00c711;
  --tick: #fff;
  position: relative;
  input,
  svg {
    width: 30px;
    height: 30px;
    display: block;
  }
  input {
    -webkit-appearance: none;
    -moz-appearance: none;
    position: relative;
    outline: none;
    background: var(--background);
    border: none;
    margin: 0;
    padding: 0;
    cursor: pointer;
    border-radius: 4px;
    transition: box-shadow 0.3s;
    box-shadow: inset 0 0 0 var(--s, 1px) var(--b, var(--border));
    &:hover {
      --s: 2px;
      --b: var(--border-hover);
    }
    &:checked {
      --b: var(--border-active);
    }
  }
  svg {
    pointer-events: none;
    fill: none;
    stroke-width: 2px;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke: var(--stroke, var(--border-active));
    position: absolute;
    top: 0;
    left: 0;
    width: 31px;
    height: 31px;
    transform: scale(var(--scale, 1)) translateZ(0);
  }
  &.path {
    input {
      &:checked {
        --s: 2px;
        transition-delay: 0.4s;
        & + svg {
          --a: 16.1 86.12;
          --o: 102.22;
        }
      }
    }
    svg {
      stroke-dasharray: var(--a, 86.12);
      stroke-dashoffset: var(--o, 86.12);
      transition: stroke-dasharray 0.6s, stroke-dashoffset 0.6s;
    }
  }
  &.bounce {
    --stroke: var(--tick);
    input {
      &:checked {
        --s: 11px;
        & + svg {
          animation: bounce 0.4s linear forwards 0.2s;
        }
      }
    }
    svg {
      --scale: 0;
    }
  }
}

@keyframes bounce {
  50% {
    transform: scale(1.2);
  }
  75% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

input[type="radio"].checkbox {
  --background: #fff;
  --border: #e60000;
  --border-hover: #e60000;
  --border-active: #00c711;
  --tick: #fff;
  position: relative;
  input,
  svg {
    width: 30px;
    height: 30px;
    display: block;
  }
  input {
    -webkit-appearance: none;
    -moz-appearance: none;
    position: relative;
    outline: none;
    background: var(--background);
    border: none;
    margin: 0;
    padding: 0;
    cursor: pointer;
    border-radius: 4px;
    transition: box-shadow 0.3s;
    box-shadow: inset 0 0 0 var(--s, 1px) var(--b, var(--border));
    &:hover {
      --s: 2px;
      --b: var(--border-hover);
    }
    &:checked {
      --b: var(--border-active);
    }
  }
  svg {
    pointer-events: none;
    fill: none;
    stroke-width: 2px;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke: var(--stroke, var(--border-active));
    position: absolute;
    top: 0;
    left: 0;
    width: 31px;
    height: 31px;
    transform: scale(var(--scale, 1)) translateZ(0);
  }
  &.path {
    input {
      &:checked {
        --s: 2px;
        transition-delay: 0.4s;
        & + svg {
          --a: 16.1 86.12;
          --o: 102.22;
        }
      }
    }
    svg {
      stroke-dasharray: var(--a, 86.12);
      stroke-dashoffset: var(--o, 86.12);
      transition: stroke-dasharray 0.6s, stroke-dashoffset 0.6s;
    }
  }
  &.bounce1 {
    --stroke: var(--tick);
    input {
      &:checked {
        --s: 11px;
        & + svg {
          animation: bounce1 0.4s linear forwards 0.2s;
        }
      }
    }
    svg {
      --scale: 0;
    }
  }
}

@keyframes bounce1 {
  50% {
    transform: scale(1.2);
  }
  75% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

.option {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 10px;
  width: 100%;
  flex-wrap: nowrap;
  align-items: center;
}

.option .container {
  padding-left: 5px;
  padding-right: 5px;
  padding-top: 3px;
  font-size: 1rem;
  text-align: right;
  margin-bottom: 0px;
}
.container {
  display: block;
  position: relative;
  padding-left: 50px;
  margin-bottom: 12px;
  cursor: pointer;
  font-size: 22px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Hide the browser's default radio button */
.container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

/* Create a custom radio button */
.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 35px;
  width: 35px;
  background-color: #eee;
  border-radius: 50%;
}

/* On mouse-over, add a grey background color */
.container:hover input ~ .checkmark {
  background-color: #ccc;
}

/* When the radio button is checked, add a blue background */
.container input:checked ~ .checkmark {
  background-color: var(--base-color);
}

/* Create the indicator (the dot/circle - hidden when not checked) */
.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

/* Show the indicator (dot/circle) when checked */
.container input:checked ~ .checkmark:after {
  display: block;
}

/* Style the indicator (dot/circle) */
.container .checkmark:after {
  top: 0;
  left: 0;
  width: 50%;
  height: 50%;
  border-radius: 50%;
  background: white;
  transform: translate(50%, 50%);
}
</style>
