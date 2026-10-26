<script setup>
import { reactive, ref, onMounted, watch, computed, onBeforeUpdate } from "vue";
import $ from "jquery";
import { HTTP } from "@/assets/services/http-common.js";
import auth from "@/assets/services/auth";

import Header from "@/components/Basics/Header.vue";
//import OrderSearch from '@/components/CollectingScreen/OrderSearch.vue';

import iconup from "@/assets/icons/angle-up-solid.svg";
import iconleft from "@/assets/icons/angle-left-solid.svg";
import iconright from "@/assets/icons/angle-right-solid.svg";

import Receipt from "@/components/CollectingScreen/actie/Receipt.vue";
import { useStore } from "vuex";

const store = useStore();

//const ordersearch = ref(null)
const orderRefs = ref([]);
const state = reactive({
  orderDate: null,
  receiptAmount: 1,
  page: 0,
  currentitem: "",
  orders: [],
  visibleOrders: [],
  showDone: false,
});

const maxPage = computed(() => {
  return Math.round(parseInt(amountOfOrders()) / parseInt(state.receiptAmount)).toFixed(
    0
  );
});

function changePage(update) {
  if (state.page > 0 || (state.page == 0 && update == 1)) {
    state.page += update;
  }
}

function amountOfOrders() {
  var allOrders;
  let or = state.visibleOrders || [];

  allOrders = Object.values(or).filter(
    (e) => e.status != "pending" && e.status != "rejected"
  );
  if (state.showDone === false) {
    allOrders = Object.values(allOrders).filter((e) => e.status != "afgehaald");
  }
  return allOrders.length;
}

function changeReceiptAmount() {
  if (amountOfOrders() <= state.receiptAmount) {
    state.receiptAmount = 1;
    return;
  }
  if (state.receiptAmount == 1) {
    state.receiptAmount = 2;
    return;
  }
  if (state.receiptAmount == 2) {
    state.receiptAmount = 3;
    return;
  }
  if (state.receiptAmount == 3) {
    state.receiptAmount = 1;
    return;
  }
}

function scrollToTop() {
  $(".screen").animate({ scrollTop: 0 }, "fast");
  return false;
}
function formattedDate(date) {
  return new Date(date).toISOString().split("T")[0];
}

function getOrders(date) {
  if (date == "") {
    //		date = formattedDate(state.orderDate)
  }
  const params = {
    /*	0: [{
				filterType: 'and',
				value: [
					{
						pickup_date: date
					}
				],
				}
			],*/
    0: [
      {
        filterType: "and",
        value: [
          {
            status: {
              filterType: "notLike",
              value: "pending",
            },
          },
        ],
      },
    ],
  };
  console.log(params);
  HTTP.get(`actie_order`, { params })
    .then((response) => {
      console.log(response);
      state.orders = response.data;
      store.commit("actie/newOrdersList", state.orders);
    })
    .catch((errors) => {
      console.log(errors);
    });
}
function disableMultipleOrderButton() {
  var x = window.matchMedia("(max-width: 575px)");
  if (x.matches) return true;
  return false;
}
onBeforeUpdate(() => {
  orderRefs.value = [];
});
onMounted(() => {
  getOrders("");
  var x = window.matchMedia("(max-width: 767px)");
  if (x.matches) {
    // If media query matches
    state.receiptAmount = 1;
  } else {
    state.receiptAmount = 2;
  }
});

watch(
  () => state.orderDate,
  (newVal) => {
    getOrders(formattedDate(newVal));
  }
);

const filteredOrders = computed(() => {
  var list = [];
  var allOrders;
  const or = state.visibleOrders;
  console.log(state.visibleOrders);
  if (Object.keys(or).length > 0) {
    allOrders = Object.values(or).filter(
      (e) => e.status != "pending" && e.status != "rejected"
    );
    if (state.showDone === false) {
      allOrders = Object.values(allOrders).filter((e) => e.status != "afgehaald");
    }
    allOrders.sort(function (a, b) {
      return b.createdAt.localeCompare(a.createdAt);
    });
    list = allOrders.slice(
      state.page * state.receiptAmount,
      state.page * state.receiptAmount + state.receiptAmount
    );
  }
  console.log(list);
  return list;
});

watch(
  () => store.getters["actie/getOrders"],
  () => {
    state.visibleOrders = store.getters["actie/getOrders"];
  },
  { immediate: true, deep: true }
);
</script>
<template>
  <div class="collecting-screen">
    <div class="screen">
      <!--<div class="actie-switch">
				<router-link :to="'/'"><button>bestellingen</button></router-link>
			</div>
			<OrderSearch ref="ordersearch" @changeOrderDate="(callback) => state.orderDate = callback" />-->
      <div class="verzamelen">
        <div class="verzamelaantal">
          Aantal bestellingen:
          <button @click="changeReceiptAmount()" :disabled="disableMultipleOrderButton()">
            {{ state.receiptAmount }}
          </button>
        </div>
      </div>
      <div class="option">
        <label for="nix" class="container">Afgehaald weergeven:</label>
        <label class="checkbox path buss">
          <input name="nix" type="checkbox" v-model="state.showDone" />
          <svg viewBox="0 0 21 21">
            <path
              d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"
            ></path>
          </svg>
        </label>
      </div>
      <hr />
      <div class="bon-header">
        <div v-if="auth.isAdmin()" class="barcodescan">
          Product barcode scannen:
          <input
            ref="scanproduct"
            id="productinput"
            v-model="state.currentitem"
            placeholder="Product barcode"
          />
        </div>
        <div class="page">
          <button
            @click="changePage(-1)"
            :disabled="state.page == 0"
            class="btn previous round"
          >
            <img :src="iconleft" />
          </button>
          <h3 v-html="`Pagina: ${state.page + 1} / ${maxPage}`"></h3>
          <button
            @click="changePage(1)"
            :disabled="state.page + 1 >= maxPage"
            class="btn nextbtn round"
          >
            <img :src="iconright" />
          </button>
        </div>
      </div>
      <div class="bonnen">
        <Receipt
          class="bon-block"
          v-for="(order, i) in filteredOrders"
          :ref="
            (el) => {
              orderRefs[i] = el;
            }
          "
          :key="order.id + 'row'"
          v-bind:class="[
            { singlebon: state.receiptAmount == 1 },
            { doublebon: state.receiptAmount == 2 },
            { triplebon: state.receiptAmount == 3 },
          ]"
          :order="order"
        />
      </div>
      <div class="topbutton">
        <button class="topping" @click="scrollToTop()"><img :src="iconup" /></button>
      </div>
    </div>
    <Header />
  </div>
</template>
<style scoped lang="scss">
.collecting-screen {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.screen {
  overflow-y: scroll;
  height: 94%;
}
.header {
}
.verzamelaantal {
  font-size: 1.2rem;
  font-weight: 600;
}
.verzamelaantal button {
  padding: 0.6rem 0.9rem;
}
.verzamelaantal button:disabled {
  color: rgb(255, 255, 255);
  background-color: #919191;
  border-color: #cfcfcf;
}
.optbon-header {
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: start;
  align-content: space-around;
  min-width: 50%;
  font-weight: 700;
}
.bon-header h2 {
  margin-top: 10px;
  margin-bottom: 10px;
}
.bonnen {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-around;
}
.bon-block {
  min-width: 30%;
  display: inline-flex;
  margin: 15px;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: center;
  align-content: center;
  justify-content: flex-start;
}

.bon-block.singlebon {
  width: 100%;
}
.bon-block.doublebon {
  width: 50%;
}
.bon-block.triplebon {
  width: 33%;
}
.page {
  display: flex;
  width: 100%;
  justify-content: space-between;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  align-content: center;
  font-size: 3rem;
}
.page h3 {
  font-size: 1.5rem;
}
.page button {
  height: 100%;
  aspect-ratio: 1;
  margin: 0 5px;
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: center;
  flex-wrap: wrap;
  padding: 0.05rem 0.1rem;
}
.page button img {
  width: 100%;
  height: auto;
  max-height: 60px;
  aspect-ratio: 1;
}
.back,
.next {
  display: block;
  width: 10%;
}
.btn {
  text-decoration: none;
  display: inline-block;
  padding: 8px 16px;
  background-color: var(--base-color);
  color: white;
  font-weight: 600;
}

.btn:hover {
  background-color: var(--base-color);
  color: black;
}

.previous,
.nextbtn {
  max-width: 10%;
  height: fit-content;
  background-color: var(--base-color);
  color: #ffffff;
  font-size: x-large;
  font-weight: 700;
  aspect-ratio: 1;
  padding: 5px;
}
.previous img,
.nextbtn img {
  height: 100%;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.previous.disabled,
.previous:disabled,
.nextbtn.disabled,
.nextbtn:disabled {
  color: rgb(255, 255, 255);
  background-color: #919191;
  border-color: #cfcfcf;
}

.previous.disabled img,
.previous:disabled img,
.nextbtn.disabled img,
.nextbtn:disabled img {
  -webkit-filter: invert(100%);
  filter: invert(100%);
}

.round {
  border-radius: 10px;
  aspect-ratio: 1;
}

.verzamelen {
  display: flex;
  flex-wrap: nowrap;
  align-content: center;
  align-items: center;
  justify-content: space-around;
}
@media (max-width: 575px) {
  .receiptamount {
    display: none;
  }
  .bonnen {
    width: 100%;
    display: flex;
    overflow-x: scroll;
  }
  .bon-block {
    width: 100%;
  }
  .verzamelen {
    display: flex;
    flex-wrap: nowrap;
    align-content: center;
    align-items: center;
    justify-content: space-around;
  }
  .searchbar {
    flex-wrap: wrap;
  }
}
.settings {
  width: 50px;
  height: 50px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
  align-items: center;
  background-color: var(--base-color);
}
.settings img {
  height: 100%;
  width: auto;
}
#settings-block {
  background-color: #ddd;
  position: absolute;
  border: 1px solid black;
}
.topbutton {
  position: fixed;
  right: 10px;
  bottom: calc(6% + 10px);
  width: 50px;
  height: 50px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
  align-items: stretch;
}
.topping {
  height: 100%;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}
.topping img {
  height: 100%;
  width: auto;
}
.barcodescan {
  display: none;
}

@media (orientation: portrait) and (min-width: 575px) {
}
@media (orientation: landscape) and (min-width: 740px) and (min-height: 575px) {
  .bon-block.singlebon {
    width: 50%;
  }
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
