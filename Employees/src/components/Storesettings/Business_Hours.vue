<template>
  <div class="delivery-screen">
    <!--<OrderSearch ref="ordersearch" @changeOrderDate="(callback) => state.orderDate = callback" />-->

    <h3>Openingstijden</h3>
    <div class="tijden">
      <h3>Standaard Openingstijden</h3>
      <div class="timeslots" v-for="day in 7" :key="day">
        <div class="slot weekday">
          <span v-html="Info.weekdays('long', { locale: 'nl-NL' })[day - 1]"> </span>
          <button class="edit" @click="addBusinessHour(day)">Tijd toevoegen</button>
          <div class="modal-overlay" v-if="state.new_hour == day">
            <div class="editor">            
              <button @click="state.new_hour = null">
                <!--<img class="nix18" 
                    :src="require('@/assets/icons/check.svg')" />	--> Sluiten
              </button>
              <b v-html="`Nieuwe openingstijd ${Info.weekdays('long', { locale: 'nl-NL' })[day - 1]}:`"></b>
              <div class="add-input">
                <input
                  placeholder="--:--"
                  type="time"
                  pattern="\d{2}:\d{2}:\d{2}"
                  class="timepicker"
                  name="timeslot_start"
                  v-model="state.new_business_hour.start"
                />
              </div>
              <b>Tot</b>
              <div class="add-input">
                <input
                  placeholder="--:--"
                  type="time"
                  pattern="\d{2}:\d{2}:\d{2}"
                  class="timepicker"
                  name="timeslot_end"
                  v-model="state.new_business_hour.end"
                />
              </div>
              <button @click="saveNewBusinessHour()">
                  <!--<img class="nix18" 
                      :src="require('@/assets/icons/check.svg')" />	--> Opslaan
              </button>
            </div>
          </div>
        </div>
        <div class="timeslot" v-for="slot in timeByDay" :key="slot.business_hours_id">
          <div class="slot" v-if="slot?.start && slot.weekday == day">
            <span
              v-html="` ${formatTime(slot?.start)} - ${formatTime(slot?.end) || ''}`"
            ></span>
            <button class="edit" @click="state.edit_business_hour = slot">
                <img class="nix18" 
                    :src="require('@/assets/icons/pencil.svg')" />	
            </button>
            <button class="delete" @click="deleteBusinessHour(slot)">
                <img class="nix18" 
                    :src="require('@/assets/icons/trash-can.svg')" />	
            </button>
            
          <div class="modal-overlay"  v-if="state.edit_business_hour?.business_hours_id == slot.business_hours_id">
            <div
              class="editor"            
            >            
              <button @click="state.new_hour = null; state.edit_business_hour = {}">
                <!--<img class="nix18" 
                    :src="require('@/assets/icons/check.svg')" />	--> Sluiten
              </button>
            <h3>Wijzigen</h3>
              <div class="add-input">
                <input
                  placeholder="--:--"
                  type="time"
                  pattern="\d{2}:\d{2}:\d{2}"
                  class="timepicker"
                  name="timeslot_start"
                  v-model="state.edit_business_hour.start"
                />
              </div>
              <b>Tot</b>
              <div class="add-input">
                <input
                  placeholder="--:--"
                  type="time"
                  pattern="\d{2}:\d{2}:\d{2}"
                  class="timepicker"
                  name="timeslot_end"
                  v-model="state.edit_business_hour.end"
                />
              </div>
              <button @click="updateBusinessHour()">
                <!--<img class="nix18" 
                    :src="require('@/assets/icons/check.svg')" />--> Opslaan	</button>
            </div>
            </div>
          </div>
        </div>
        <span v-if="isClosed(day).length == 0" v-html="`Gesloten`"></span>
      </div>
    </div>
    <div class="tijden dif">
      <h3>Afwijkende openingstijden</h3>
      <div class="add-diff">
        <button class="edit" @click="addDifferentDay()">Afwijkende tijd toevoegen</button>
        <div class="modal-overlay" v-if="state.new_hour == 8">
        <div
          class="editor"
        >       
        <button @click="state.new_hour = null">
          <!--<img class="nix18" 
              :src="require('@/assets/icons/check.svg')" />	--> Sluiten
        </button>
          <b>Nieuw:</b>
          <div class="add-input">
            Naam
            <input
              placeholder="Custom naam"
              type="text"
              class=""
              name="custom"
              v-model="state.new_business_hour.custom_label"
            />
          </div>
          <div class="add-input">
            Datum
            <input
              placeholder="yyyy-mm-dd"
              type="date"
              pattern="\d{4}-\d{2}-\d{2}"
              class="datepicker"
              name="timeslot_date"
              v-model="state.new_diff"
            />
          </div>
          <div class="add-input">
            <input
              placeholder="--:--"
              type="time"
              pattern="\d{2}:\d{2}:\d{2}"
              class="timepicker"
              name="timeslot_start"
              v-model="state.new_business_hour.start"
            />
            <b>Tot</b>
              <input
                placeholder="--:--"
                type="time"
                pattern="\d{2}:\d{2}:\d{2}"
                class="timepicker"
                name="timeslot_end"
                v-model="state.new_business_hour.end"
              />
              
            <button class="save" @click="saveNewBusinessHour()">
                Opslaan
            </button>
          </div>
        </div>
        </div>
      </div>
      <div class="timeslots" v-for="day in customTimes" :key="day.business_hours_id">
        <div class="slot weekday">
          <div class="title">
            <span class="label" v-html="day.custom_label"></span>
            <span class="date" v-html="getDate(day.weekday, day.week, day.year)"></span>
          </div>
        </div>

        <div class="timeslot" :key="day.business_hours_id">
          <div class="slot">
            <span
              v-html="` ${formatTime(day?.start)} - ${formatTime(day?.end) || ''}`"
            ></span>
            <button class="edit" @click="state.edit_business_hour = day">
                <img class="nix18" 
                    :src="require('@/assets/icons/pencil.svg')" />	</button>
            <button class="delete" @click="deleteBusinessHour(day)">
                <img class="nix18" 
                    :src="require('@/assets/icons/trash-can.svg')" />	</button>
                    
        <div class="modal-overlay" v-if="state.edit_business_hour?.business_hours_id == day.business_hours_id">
            <div
              class="editor"
              
            >
            <button @click="state.edit_business_hour = {}">
              <!--<img class="nix18" 
                  :src="require('@/assets/icons/check.svg')" />	--> Sluiten
            </button>
            <h3>Wijzigen</h3>
              <div class="add-input">
                <input
                  placeholder="--:--"
                  type="time"
                  pattern="\d{2}:\d{2}:\d{2}"
                  class="timepicker"
                  name="timeslot_start"
                  v-model="state.edit_business_hour.start"
                />
              </div>
              <b>Tot</b>
              <div class="add-input">
                <input
                  placeholder="--:--"
                  type="time"
                  pattern="\d{2}:\d{2}:\d{2}"
                  class="timepicker"
                  name="timeslot_end"
                  v-model="state.edit_business_hour.end"
                />
              </div>
              <button @click="updateBusinessHour()">
                Opslaan</button>
            </div>
            </div>
            <span v-html="`Gesloten`" v-if="!day?.start || day?.start == day?.end"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// @ is an alias to /src
import { reactive, onMounted, computed, createApp, watch } from "vue";
import { HTTP_Store } from "@/assets/services/http-common.js";
import VueSimpleAlert from "vue3-simple-alert";
//	import OrderSearch from '@/components/CollectingScreen/OrderSearch.vue';
import { DateTime, Info } from "luxon";

const app = createApp({});
app.use(VueSimpleAlert);

const state = reactive({
  zipcodes: [],
  info: null,
  business_hours: {
    default: [],
    non_default: [],
  },
  edit_business_hour: {},
  new_hour: null,
  new_business_hour: {
    weekday: null,
    week: null,
    year: null,
    start: null,
    end: null,
    shop_id: null,
    default: null,
    custom_label: null,
  },
  new_diff: "",
});
function getTimeslots() {
  var params = {
    domain: "cooplubbers.nl",
  };
  HTTP_Store.get(`shops`, { params })
    .then((response) => {
      console.log(response);
      state.info = response.data[0];
      if (state.info.business_hours) {
        state.business_hours.default = state.info.business_hours.filter((bh) => {
          return bh.default;
        });
        state.business_hours.non_default = state.info.business_hours
          .filter((bh) => {
            return !bh.default;
          })
          .sort((a, b) => {
            console.log(`weekday: ${a.weekday}, weeknumber: ${a.week}, year: ${a.year}`);
            var aDate = DateTime.fromISO(`${a.year}-W${a.week}-${a.weekday}`).toJSDate();
            var bDate = DateTime.fromISO(`${b.year}-W${b.week}-${b.weekday}`).toJSDate();
            return aDate - bDate;
          });
      }
      console.log(state.business_hours.non_default);
      console.log(state.info);
      //updateShopInfo()
    })
    .catch((err) => {
      console.log(err);
    });
}

function updateShopInfo() {
  var data = state.info;
  HTTP_Store.put(`shops`, data)
    .then((response) => {
      console.log(response);
    })
    .catch((errors) => {
      console.log(errors);
    });
}

function validTimeslot(start, end) {
  console.log(start)
  var isValid = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(
    start
  );
  var isValid2 = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(
    end
  );
  if(state.new_diff != ''){
    if (!DateTime.fromFormat(state.new_diff, "yyyy-MM-dd").isValid)
        return "Datum is ongeldig.";
  }
  if (!isValid) return "Begintijd is ongeldig.";
  if (!isValid2) return "Eindtijd is ongeldig.";
  const time1 = DateTime.fromFormat(start, "HH:mm");
  const time2 = DateTime.fromFormat(end, "HH:mm");
  const diff = time2.diff(time1, "seconds").toObject().seconds;

  if (diff > 0) {
    return true;
  } else if (diff === 0) {
    return "Tijden mogen niet hetzelfde zijn.";
  } else {
    return "Begintijd mag niet later zijn dan eindtijd.";
  }
}


function formatTime(time) {
  if (time) {
    const formattedTime = DateTime.fromFormat(time, "HH:mm:ss").toFormat("HH:mm");
    return formattedTime;
  } else return "";
}
onMounted(() => {
  getTimeslots();
});

const timeByDay = computed(() => {
  var slots = [];
  if (state.info?.business_hours.length > 0) {
    console.log(state.info.business_hours);
    slots = state.info?.business_hours
      .filter((e) => {
        return e.default == 1;
      })
      .sort((a, b) => {
        var atime = DateTime.fromISO(`2000-01-01T${a.start}`);
        var btime = DateTime.fromISO(`2000-01-01T${b.start}`);
        return atime < btime ? -1 : atime > btime ? 1 : 0;
      });
  }
  return slots;
});

const isClosed = (day) => {
  if (state.info?.business_hours.length > 0) {
    return state.info?.business_hours.filter((e) => {
      return e.weekday == day && e.default == 1;
    });
  }
  return [];
};

const customTimes = computed(() => {
  var slots = [];
  if (state.info?.business_hours.length > 0) {
    slots = state.info?.business_hours.filter((e) => {
      return e.default == 0;
    }); /*.sort((a, b) => {
                var atime = DateTime.fromObject({
                                weekYear: a.year,
                                weekNumber: a.week,
                                weekday: a.weekday,
                            })
                var btime = DateTime.fromObject({
                                weekYear: b.year,
                                weekNumber: b.week,
                                weekday: b.weekday,
                            })
                return atime < btime ? -1 : atime > btime ? 1 : 0;
            })*/
  }
  return slots;
});

function getDate(weekday, week, year) {
  var date = DateTime.fromObject({
    weekYear: year,
    weekNumber: week,
    weekday: weekday,
  })
    .setLocale("nl-Nl")
    .toLocaleString(DateTime.DATE_MED);
  return date;
}

function updateBusinessHour() {
  updateShopInfo();
  state.edit_business_hour = null;
  /* const index = state.info.business_hours.findIndex((e) => {
            e.business_hours_id = state.edit_business_hour.business_hours_id
        })
        if(index >= 0){
            state.info.business_hours[index] = state.edit_business_hour
        }*/
}

function deleteBusinessHour(item) {
  const index = state.info.business_hours.findIndex((e) => {
    return e.business_hours_id == item.business_hours_id;
  });
  if (index >= 0) {
    delete state.info.business_hours[index];
    var params = {
            'business_hours_id': item.business_hours_id
        }
        HTTP_Store.delete(`business_hours`, {params: params})
		.then((e) => {
			console.log(e)
		})
		.catch((errors) => {
			console.log(errors)
		})
  }
  /*HTTP_Store.delete('business_hours', item)
        .then((e) => {

        })*/
}

function addBusinessHour(day) {
  state.new_hour = day;
  state.new_business_hour.default = 1;
  state.new_business_hour.shop_id = state.info.shop_id;
  state.new_business_hour.weekday = day;
  state.new_business_hour.week = 0;
  state.new_business_hour.year = null;
  state.new_business_hour.custom_label = null;
}

function addDifferentDay() {
  state.new_hour = 8;
  state.new_business_hour.default = 0;
  state.new_business_hour.shop_id = state.info.shop_id;
  //state.new_business_hour.weekday = day
  state.new_business_hour.week = 0;
  state.new_business_hour.year = null;
  state.new_business_hour.custom_label = '';
}

watch(
  () => state.new_diff,
  () => {
    const d = DateTime.fromSQL(state.new_diff);
    state.new_business_hour.weekday = d.weekday
    state.new_business_hour.week = d.weekNumber
    state.new_business_hour.year = d.weekYear
  }
);

function saveNewBusinessHour(){
    const valid = validTimeslot(state.new_business_hour.start, state.new_business_hour.end)
    if(valid === true){
        state.info.business_hours.push(state.new_business_hour);
        updateBusinessHour()
    }
    else{
        app.$alert(
            `${valid}`,
            `Fout in tijden`,
            'warning',
            {                    
                confirmButtonText: 'Ok',
                confirmButtonColor: '#F58320',
                cancelButtonColor: '#e4e4e4',
                timer: 5000,
            }
        )
    }
}

watch(
  () => state.info?.business_hours,
  () => {
    if (state.info?.business_hours.length > 0) {
      state.info.business_hours.forEach((element) => {
        if (element.start.split(":").length == 2) {
          element.start += ":00";
        }
        if (element.end.split(":").length == 2) {
          element.end += ":00";
        }
      });
    }
  },
  { immediate: true, deep: true }
);
</script>
<style scoped>
.delivery-screen {
  width: 100%;
  overflow: scroll;
}
.delivery-screen {
  width: 100%;
  overflow: scroll;
}

.newslots {
  display: flex;
  width: 100%;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
}
.add-input {
  display: flex;
  width: 95%;
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  align-items: center;
  justify-content: flex-start;
  font-weight: 600;
  margin-left: 10px;
}
.add-input.dif-date{
    display: flex;
    width: 100%;
  }

.add-input input {
  max-width: 50%;
  font-size: 1.2rem;
  line-height: 1.5rem;
  margin-left: 20px;
}
.add-input input[type="radio"]:checked {
  background-color: black;
}

.add-input input[type="radio"] {
  width: 20px;
  height: 20px;
  width: fit-content;
  margin: 15px 5px 15px 34px;
}

.add-input .timepicker {
  min-height: 2rem;
}
.slots {
  width: 100%;
  overflow-x: scroll;
  display: flex;
  overflow-x: scroll;
  flex-direction: column;
  align-items: stretch;
  flex-wrap: wrap;
  align-content: center;
}
.slot-block {
  max-width: 100%;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  white-space: pre-line;
  word-break: break-word;
  border-bottom: 2px solid #ececec;
}
.slot-block > div {
  display: inline-block;
  margin-top: auto;
  margin-bottom: auto;
}
#header {
  background-color: orange;
  padding-top: 5px;
  height: 6%;
  border-bottom: 2px solid rgba(0, 0, 0, 0.6);
}
#header .row {
  height: 100%;
}

#header .row .col-8 {
  height: 100%;
}

#header .row .col-8 img {
  height: 100%;
}
#header .row .col-3 .logo {
  max-height: 100%;
}
#header .row .col-3 {
  max-height: 100%;
}
#menu-btn center {
  height: 100%;
}

#menu-btn center svg {
  height: 100%;
  width: 100%;
}
.page {
  display: inline-flex;
  width: 100%;
}
.back {
  display: flex;
  width: 50%;
}
.next {
  display: flex;
  width: 50%;
  float: right;
}
.next .btn {
  margin-left: auto;
}
@media (max-width: 575px) {
  .bonnen {
    width: 100%;
    display: flex;
    overflow-x: scroll;
  }
}

.tijden .timeslots {
  padding-bottom: 10px;
  padding-top: 5px;
  border-bottom: 2px solid #ececec;
}

.timeslots .slot {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  display: grid;
  grid-template-columns: 50% 10% 10%;
  text-align: left;
  border-top: 1px solid #ececec;
  padding-top: 4px;
  padding-bottom: 4px;
  min-height: 2rem;
}


.timeslots .slot.weekday {
  font-size: 1.2rem;
  font-weight: 600;
  grid-template-columns: 50% 40%;
  padding-bottom: 10px;
}
.timeslots .slot.weekday button{
  font-size: 1rem;
}
.slot.weekday .title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.timeslots .timeslot .slot {
  padding-top: 3px;
}
.timeslots .timeslot .slot span {
  font-size: 1.2rem;
}

.timeslots button {
  margin: 0;
  padding: 3px;
}
.timeslots .slot button{
    height: 2.5rem;
  }
  .timeslots .slot button.delete{
    background-color: unset;
    border-color: transparent;
    box-shadow: unset;
  }
  .timeslots .slot button.delete img{
    filter: invert(21%) sepia(74%) saturate(7487%) hue-rotate(8deg) brightness(97%) contrast(132%);
  }
  .timeslots .slot button.edit img{
    /*filter: invert(99%) sepia(3%) saturate(997%) hue-rotate(174deg) brightness(118%) contrast(100%);*/
  }
.timeslots .slot button img{
    height: 100%;
    width: auto;
  }
  

.editor {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-around;
  flex-wrap: nowrap;
  border-top: 1px solid #ececec;
  border-bottom: 1px solid #ececec;
  margin-left: auto;
  margin-right: auto;
  margin-top: 10px;
  height: auto;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 10px;
  width: calc(96% - 10px);
  min-height: 30%;
}

.add-diff .editor{
    flex-direction: column;
}
.editor .add-input {
  width: 95%;
  margin-left: 0px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
}
.editor .add-input input {
  font-size: 1.3rem;
  line-height: 1.8rem;
  width: 75%;
  margin: 5px 5px;
  padding: 0.1rem 0.1rem;
  max-width: unset;
}

.editor .add-input.dif-time input{
    max-width: 30%;
  }

.editor .add-input button{
    height: 2rem;
    margin: 0;
    padding: 3px;
}
.editor .add-input button img{
    height: 100%;
    width: auto;
}
</style>
