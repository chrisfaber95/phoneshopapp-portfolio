<template>
	<div class="discounts"><div class="screen">
        {{state.discount_types}}
        <input type="file" multiple @change="onFileChange" ref="file" name="sale"/>
        <button @click="onUploadFile" class="upload-button"
        :disabled="!state.selectedFile">Upload file</button>
       <!-- <label>Selecteer startdatum</label>        
            <b-form-group id="input-group-5" label="Afhaaldatum:" label-for="input-5">
                <datetime v-model="orderDate"></datetime>
            </b-form-group>		

        <label>Selecteer einddatum</label>        
            <b-form-group id="input-group-5" label="Afhaaldatum:" label-for="input-5">
                <datetime v-model="orderDate"></datetime>
            </b-form-group>		-->
            <div class="images" v-for="(item, index) in images" v-bind:key="index">
                <img v-bind:src="'data:image/jpeg;base64,'+dataUrl(index)" />
            </div>
            <div class="list">
                {{state.discount_header}}
                <div class="item" v-for="(item, index) in state.discount_list" :key="index">
                    {{item.group}}{{item.type}}
                    <div class="discount-type">
                        <select v-model="item.type">
                            <option 
                                v-for="discount in state.discount_types"
                                :value="discount.discounttype_id"
                                :key="discount.discounttype_id">
                                    {{discount.discounttype_label}}, min: {{discount.min_amount}}
                            </option>
                        </select>
                    </div>
                    <!--<div class="percentage" v-if="item.isPercentage">
                        {{state.discount_types[item.isPercentage]}}
                    </div>
                    <div class="amount" v-if="item.minimalAmount">
                        {{state.discount_types[item.minimalAmount]}}
                    </div>-->
                    <div class="lines" v-for="(line, index1) in state.discount_list[index].product_discount_list" :key="`index-${index}-line-${index1}`">
                        {{line.schapcode}}--{{line.product}}--{{line.voor}}--{{line.minimalAmount}}
                    </div>
                    <br/>
                </div>
            </div>
    </div>	
        <Header />
    </div>
</template>

<script setup>
// @ is an alias to /src
import {  reactive, ref, onMounted } from 'vue'
import {HTTP} from '@/assets/services/http-common.js';
import Header from '@/components/Basics/Header.vue'
//import $ from 'jquery'


const file = ref(null)

const state = reactive({
            discounts: [],
            discount_types: [],
            imagesids: [],
            images: [],
            selectedFile: undefined,
            discount_list: [],
            discount_header: []
		})

        onMounted(() => {
            getDiscountTypes()
        })
    /*
		function getDiscounts() {
			HTTP.get('discounts/')
			.then((response) => {
				state.discounts = response.data.docs
			})
			.catch((errors) => {
				console.log(errors)
			})
		}*/
		function getDiscountTypes() {
			HTTP.get('discounts/types')
			.then((response) => {
				state.discount_types = response.data
			})
			.catch((errors) => {
				console.log(errors)
			})
		}
	/*	function getDiscountImages() {
			HTTP.get('discounts/get_images')
			.then((response) => {
                var ids = response.data
				state.imagesids = ids
			})
			.catch((errors) => {
				console.log(errors)
			})
		}
		function getImages(id) {
			HTTP.get(`discounts/get_images/${id}`)
			.then((response) => {
                console.log(response)
				state.images.push(response.data)
			})
			.catch((errors) => {
				console.log(errors)
			})
		}*/
        function onFileChange() {
            state.selectedFile = file.value.files;
        }

        function onUploadFile() {
        let formData = new FormData()
        if (state.selectedFile.length != 0) {
            for (const single_file of state.selectedFile) {
                console.log(single_file)
                formData.append('sales', single_file)
            }
        }

        var reader = new FileReader();
        var fileToRead = state.selectedFile[0];

        // attach event, that will be fired, when read is end
        reader.addEventListener("loadend", function() {
        // reader.result contains the contents of blob as a typed array
        // we insert content of file in DOM here
        //document.getElementById('file').innerText = reader.result;
            var lines = reader.result.split('\n'); 
            var result = []
            var discount_object = []
            var updated_object = []
            //var headers;
            state.discount_header = lines[2].split(";");
            for (var i = 3; i < lines.length; i++) {
                var obj;
                var changed_obj
                if(lines[i] == undefined || lines[i].trim() == "") {
                    continue;
                }

                 obj = lines[i].split(";");
                 obj.pop()
                //for(var j = 0; j < words.length; j++) {
                //    obj[headers[j].trim()] = words[j] || '';
                //}
                if(obj[0] == '""'){
                    let group = discount_object.at(-1)
                    let group1 =''
                    if(group?.[0]){
                        group1 = group[0]
                    }
                    discount_object.pop()
                    updated_object.pop()
                    let typing = changeDiscountType(updated_object[0]?.type, parseInt(updated_object[0]?.isPercentage), parseFloat(updated_object[0]?.minimalAmount), parseFloat(updated_object[0]?.voor) )
                        console.log(typing)
                    result.push({
                        'group': group1, 
                        'product_discount_list' : updated_object, 
                        'type': typing,
                        'minimalAmount': updated_object[0]?.minimalAmount,
                        'isPercentage': updated_object[0]?.isPercentage 
                    })
                    discount_object = []
                    updated_object = []
                }
                else{
                    var percentage = isPercentage(obj[7])
                    var type = parseInt(obj[5].replaceAll('"', ''))
                    var voor = parseInt(obj[7].replaceAll('"', ''))
                    var min = parseInt(obj[8].replaceAll('"', ''))
                    changed_obj = {
                        'schapcode': `${obj[0]}.${obj[4]}`,
                        'product': `${obj[1]} ${obj[2]}`,
                        'van': `${obj[6]}`,
                        'voor': voor,
                        'minimalAmount': min,
                        'isPercentage': `${percentage}`,
                        'type': type
                    }
                    updated_object.push(changed_obj)
                    discount_object.push(obj)
                }
            }
            result.push(discount_object)

            state.discount_list = result
        });

        // start reading a loaded file
        reader.readAsText(fileToRead);
        
        /*const reader = new FileReader();
         reader.onload = function (e) {
            const text = e.target.result;
            console.log(text)
            document.write(text);
         };
         reader.readAsText(formData['sales']);
        //formData.append("sales", this.selectedFile);  // appending file
*/
        for (var key of formData.entries()) {
            console.log(key[0] + ', ' + key[1]);
        }
        // sending file to the backend
        /*HTTP.post("discounts/images", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }})
            .then(res => {
                if(res.data == "uploaded"){
                    alert("Afbeelding geupload")
                    this.getDiscountImages()
                }
            })
            .catch((err) => {
                console.log(err);
            }); */
        }

        function changeDiscountType(type, percentage, amount, price ){
            console.log(type)
            if(type == 1){
                console.log(type, percentage, amount, price)
                if(percentage){
                    if(amount == 1){
                        return 1
                    }
                    if(amount == 2){
                        return 1
                    }
                    if(amount == 3){
                        return 1
                    }
                    if(amount == 4){
                        return 1
                    }
                }
                else{
                    if(amount == 1){
                        return 5
                    }
                    if(amount == 2){
                        return 1
                    }
                    if(amount == 3){
                        return 2
                    }
                    if(amount == 4){
                        return 4
                    }
                }
            }
            else if(type == 3){
                console.log(type, percentage, amount, price)
                if(percentage){
                    if(amount == 1){
                        if(price == 25){
                            return 3
                        }
                        else if(price == 30){
                            return 6
                        }
                        return 1
                    }
                    if(amount == 2){
                        if(price == 5){
                            return 4
                        }
                        else if(price == 25){
                            return 7
                        }
                        return 1
                    }
                    return 1
                }
                else{
                    if(amount == 1){
                        return 1
                    }
                    if(amount == 2){
                        return 1
                    }
                    if(amount == 3){
                        return 1
                    }
                    if(amount == 4){
                        return 1
                    }
                    return 1
                }

            }
            else if(type == 9){
                if(percentage){
                    if(amount == 1){
                        return 1
                    }
                    if(amount == 2){
                        return 1
                    }
                    if(amount == 3){
                        return 1
                    }
                    if(amount == 4){
                        return 1
                    }
                    return 1
                }
                else{
                 return 1   
                }

            }
            else{
                return 1
            }
            return 1
        }
        
        function dataUrl(index){
            if(this.images.length >= 1){
                return this.images[index]
            }
            return null
        }

        function isPercentage(obj){
            if(obj.includes('%')){
                return 1
            }
            else{
                return 0
            }
        }
		
</script>
<style scoped>
.discounts{
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.screen{
	overflow-y:scroll;
	height: 94%;
}

.images{
    width: 20%;
}
.images img{
    width: 100%;
    height: auto;
}
@media (orientation: portrait) and (min-width: 575px){

}

@media (orientation: landscape) and (min-width: 740px) and (min-height: 575px){
	
}
@media screen and (orientation: landscape) and (max-height:480px){
	
}
</style>