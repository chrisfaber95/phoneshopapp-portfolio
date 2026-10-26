<template>
	<div class="barcode-scanner">
        <!--<section id="container" class="container">
        <div class="controls">
            <fieldset class="input-group">
                <button class="stop">Stop</button>
            </fieldset>
            <fieldset class="reader-config-group">
                <label>
                    <span>Barcode-Type</span>
                    <select name="decoder_readers">
                        <option value="code_128" selected="selected">Code 128</option>
                        <option value="code_39">Code 39</option>
                        <option value="code_39_vin">Code 39 VIN</option>
                        <option value="ean">EAN</option>
                        <option value="ean_extended">EAN-extended</option>
                        <option value="ean_8">EAN-8</option>
                        <option value="upc">UPC</option>
                        <option value="upc_e">UPC-E</option>
                        <option value="codabar">Codabar</option>
                        <option value="i2of5">Interleaved 2 of 5</option>
                        <option value="2of5">Standard 2 of 5</option>
                        <option value="code_93">Code 93</option>
                    </select>
                </label>
                <label>
                    <span>Resolution (width)</span>
                    <select name="input-stream_constraints">
                        <option value="320x240">320px</option>
                        <option selected="selected" value="640x480">640px</option>
                        <option value="800x600">800px</option>
                        <option value="1280x720">1280px</option>
                        <option value="1600x960">1600px</option>
                        <option value="1920x1080">1920px</option>
                    </select>
                </label>
                <label>
                    <span>Patch-Size</span>
                    <select name="locator_patch-size">
                        <option value="x-small">x-small</option>
                        <option value="small">small</option>
                        <option selected="selected" value="medium">medium</option>
                        <option value="large">large</option>
                        <option value="x-large">x-large</option>
                    </select>
                </label>
                <label>
                    <span>Half-Sample</span>
                    <input type="checkbox" checked="checked" name="locator_half-sample" />
                </label>
                <label>
                    <span>Workers</span>
                    <select name="numOfWorkers">
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option selected="selected" value="4">4</option>
                        <option value="8">8</option>
                    </select>
                </label>
                <label>
                    <span>Camera</span>
                    <select name="input-stream_constraints" id="deviceSelection">
                    </select>
                </label>
                <label style="display: none">
                    <span>Zoom</span>
                    <select name="settings_zoom"></select>
                </label>
                <label style="display: none">
                    <span>Torch</span>
                    <input type="checkbox" name="settings_torch" />
                </label>
            </fieldset>
        </div>
      <div id="result_strip">
        <ul class="thumbnails"></ul>
        <ul class="collector"></ul>
      </div>
      <div id="interactive" class="viewport"></div>
        </section>-->
        <div id="reader"></div>
        <!--<button @click="stopCamera()" v-html="`Stop camera`"></button>
        <button @click="startScan()" v-html="`start camera`"></button>-->
        <span>
          {{state.decodedResult}}
          {{state.decodedText}}
          {{state.decodedErr}}</span>
          <div class="cartitem" v-for="item in shoppingCart" v-bind:key="item.id">
            <div class="itemname">
              <span class="productname" v-html="`${item.product.product_information.title} `"></span>
              <span class="variant" v-html="`${item.product.product_information.variant} `"></span>
              <span class="ean" v-html="`${item.product.ean}`"></span>
            </div>
            
          </div>
          

				<div class="modal-overlay" v-if="state.productModalOpened">
					<ProductModal :product="state.productModalOpened" :discount="ïsDiscounted"
					@closeModal="(callback) => {state.productModalOpened = null;}"/>
				</div>
	</div>	
</template>

<script setup>
import { reactive, defineProps, watch, computed, defineEmits, onMounted, onBeforeUnmount} from 'vue';
import {Html5QrcodeScanner, Html5QrcodeSupportedFormats} from "html5-qrcode"
import $ from "jquery"
import {HTTP} from '@/assets/scripts/http-common.js';

import ProductModal from '@/components/shopPage/ProductModal.vue'


import { useStore } from 'vuex'
const store = useStore()

    defineProps({
    })
    
  

	const state = reactive({        
    qrbox:  100,
    fps: 10,
    decodedText: '1',
    decodedResult: '1',
    decodedErr: '2',
    reader: null,
    searchedProduct: null,
		productModalOpened: null

   /* inputStream: {
            type : "LiveStream",
            constraints: {
                width: {min: 1920},
                height: {min: 1080},
                facingMode: "environment",
                aspectRatio: {min: 1, max: 2}
            }
        },
        locator: {
            patchSize: "medium",
            halfSample: false
        },
        numOfWorkers: 2,
        frequency: 10,
        decoder: {
            readers : [{
                format: "ean",
                config: {}
            },
            {
              format: "ean_8",
                config: {}
            }],
            multiple: false
        },
        locate: true*/
	})
  
  
   // const formatDate = computed(() => {       
  //  })
  onMounted(() => {
    $(document).ready(function() {
      init()
    })
	})
    defineEmits([])

    let ScanResult = function (e, t, n, o, r) {
  (this._decodedText = e),
    (this._decodedResult = t),
    (this._scanType = n),
    (this._codeType = o),
    (this._dateTime = r);
};

(ScanResult.prototype.decodedText = function () {
  return this._decodedText;
}),
  (ScanResult.prototype.decodedResult = function () {
    return this._decodedResult;
  }),
  (ScanResult.prototype.scanType = function () {
    return this._scanType;
  }),
  (ScanResult.prototype.codeType = function () {
    return this._codeType;
  }),
  (ScanResult.prototype.dateTime = function () {
    return this._dateTime;
  });



    function init(){
     /* Quagga.init(state, (err) => {
          if (err) {
              return handleError(err);
          }
          //Quagga.registerResultCollector(resultCollector);
          attachListeners();
          checkCapabilities();
          Quagga.start();
      });*/

      try {
        const qrCodeSuccessCallback = (decodedText, decodedResult) => {
              /* handle success */
              
              state.decodedResult = decodedText
              state.decodedErr = decodedResult 
          };
          const qrCodeErrorCallback = (decodedText) => {
              /* handle success */ 
          };
        var r = new Html5QrcodeScanner("reader", {
            fps: 2,
            qrbox: function (e, t) {
              var n = 350,
                o = e > t ? t : e,
                r = Math.floor(0.75 * o);
              return r < n
                ? o < n
                  ? { width: o, height: o }
                  : { width: n, height: n }
                : { width: r, height: r };
            },
            useBarCodeDetectorIfSupported: !0,
            rememberLastUsedCamera: !0,
            aspectRatio: 3 / 3,
            showTorchButtonIfSupported: !0,
          },{
            verbose: true,
            formatsToSupport: [
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.CODE_39,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.EAN_13,
            ]
          })
          console.log(r)
          state.reader = r
          state.reader.render(qrCodeSuccessCallback, qrCodeErrorCallback)
        /*  var r = new Html5Qrcode(
          "reader", 
          {
            verbose: true,
            formatsToSupport: [
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.CODE_39,
              Html5QrcodeSupportedFormats.EAN_8
            ]
          })
          

          console.log(r)
          state.reader = r
          console.log(state.reader)
          console.log(state.reader.getState())
          r.render((e, n) => {
            console.log(e,n)
            state.decodedResult = e
            state.decodedErr = n
            //alert(e)
            r.getState() !== Html5QrcodeScannerState.NOT_STARTED && r.pause(!0);
           // let c = createScanResult();
           // state.decodedResult = JSON.stringify(c)
          })*/
      } catch (error) {
        
        console.log(error)
      }
    }

    onBeforeUnmount(() =>{
      stopCamera()
    })

    function stopCamera(){
      console.log(state.reader)
      state.reader.clear()
    }
    

     

    /*function attachListeners() {
        initCameraSelection();
        $(".controls").on("click", "button.stop", function(e) {
            e.preventDefault();
            Quagga.stop();
            _printCollectedResults();
        });

        $(".controls .reader-config-group").on("change", "input, select", function(e) {
            e.preventDefault();
            var $target = $(e.target),
                value = $target.attr("type") === "checkbox" ? $target.prop("checked") : $target.val(),
                name = $target.attr("name"),
                state = _convertNameToState(name);

            console.log("Value of "+ state + " changed to " + value);
            setState(state, value);
        });
    }
    function checkCapabilities() {
        var track = Quagga.CameraAccess.getActiveTrack();
        var capabilities = {};
        if (typeof track.getCapabilities === 'function') {
            capabilities = track.getCapabilities();
        }
        applySettingsVisibility('zoom', capabilities.zoom);
        applySettingsVisibility('torch', capabilities.torch);
    }
    
    function handleError(err) {
        console.log(err);
    }

    function updateOptionsForMediaRange(node, range) {
            console.log('updateOptionsForMediaRange', node, range);
            var NUM_STEPS = 6;
            var stepSize = (range.max - range.min) / NUM_STEPS;
            var option;
            var value;
            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }
            for (var i = 0; i <= NUM_STEPS; i++) {
                value = range.min + (stepSize * i);
                option = document.createElement('option');
                option.value = value;
                option.innerHTML = value;
                node.appendChild(option);
            }
        }
        function applySettingsVisibility(setting, capability) {
            // depending on type of capability
            if (typeof capability === 'boolean') {
                var node = document.querySelector('input[name="settings_' + setting + '"]');
                if (node) {
                    node.parentNode.style.display = capability ? 'block' : 'none';
                }
                return;
            }
            if (window.MediaSettingsRange && capability instanceof window.MediaSettingsRange) {
                var node = document.querySelector('select[name="settings_' + setting + '"]');
                if (node) {
                    updateOptionsForMediaRange(node, capability);
                    node.parentNode.style.display = 'block';
                }
                return;
            }
        }
        function initCameraSelection(){
            var streamLabel = Quagga.CameraAccess.getActiveStreamLabel();

            return Quagga.CameraAccess.enumerateVideoDevices()
            .then(function(devices) {
                function pruneText(text) {
                    return text.length > 30 ? text.substr(0, 30) : text;
                }
                var $deviceSelection = document.getElementById("deviceSelection");
                while ($deviceSelection.firstChild) {
                    $deviceSelection.removeChild($deviceSelection.firstChild);
                }
                devices.forEach(function(device) {
                    var $option = document.createElement("option");
                    $option.value = device.deviceId || device.id;
                    $option.appendChild(document.createTextNode(pruneText(device.label || device.deviceId || device.id)));
                    $option.selected = streamLabel === device.label;
                    $deviceSelection.appendChild($option);
                });
            });
        }
        function _printCollectedResults() {
            var results = resultCollector.getResults(),
                $ul = $("#result_strip ul.collector");

            results.forEach(function(result) {
                var $li = $('<li><div class="thumbnail"><div class="imgWrapper"><img /></div><div class="caption"><h4 class="code"></h4></div></div></li>');

                $li.find("img").attr("src", result.frame);
                $li.find("h4.code").html(result.codeResult.code + " (" + result.codeResult.format + ")");
                $ul.prepend($li);
            });
        }
        function _accessByPath(obj, path, val) {
            var parts = path.split('.'),
                depth = parts.length,
                setter = (typeof val !== "undefined") ? true : false;

            return parts.reduce(function(o, key, i) {
                if (setter && (i + 1) === depth) {
                    if (typeof o[key] === "object" && typeof val === "object") {
                        Object.assign(o[key], val);
                    } else {
                        o[key] = val;
                    }
                }
                return key in o ? o[key] : {};
            }, obj);
        }
        function _convertNameToState(name) {
            return name.replace("_", ".").split("-").reduce(function(result, value) {
                return result + value.charAt(0).toUpperCase() + value.substring(1);
            });
        }
        function detachListeners() {
            $(".controls").off("click", "button.stop");
            $(".controls .reader-config-group").off("change", "input, select");
        }
        function applySetting(setting, value) {
            var track = Quagga.CameraAccess.getActiveTrack();
            if (track && typeof track.getCapabilities === 'function') {
                switch (setting) {
                case 'zoom':
                    return track.applyConstraints({advanced: [{zoom: parseFloat(value)}]});
                case 'torch':
                    return track.applyConstraints({advanced: [{torch: !!value}]});
                }
            }
        }
        function setState(path, value) {
            if (typeof _accessByPath(inputMapper, path) === "function") {
                value = _accessByPath(inputMapper, path)(value);
            }

            if (path.startsWith('settings.')) {
                var setting = path.substring(9);
                return applySetting(setting, value);
            }
            _accessByPath(state, path, value);

            console.log(JSON.stringify(state));
            detachListeners();
            Quagga.stop();
            init();
        }
        Quagga.onProcessed(function(result) {
        var drawingCtx = Quagga.canvas.ctx.overlay,
            drawingCanvas = Quagga.canvas.dom.overlay;

        if (result) {
            if (result.boxes) {
                drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                result.boxes.filter(function (box) {
                    return box !== result.box;
                }).forEach(function (box) {
                    Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
                });
            }

            if (result.box) {
                Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2});
            }

            if (result.codeResult && result.codeResult.code) {
                Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3});
            }
        }
    });

    Quagga.onDetected(function(result) {
        var code = result.codeResult.code;

        if (data.lastResult !== code) {
            data.lastResult = code;
            var $node = null, canvas = Quagga.canvas.dom.image;

            $node = $('<li><div class="thumbnail"><div class="imgWrapper"><img /></div><div class="caption"><h4 class="code"></h4></div></div></li>');
            $node.find("img").attr("src", canvas.toDataURL());
            $node.find("h4.code").html(code);
            $("#result_strip ul.thumbnails").prepend($node);
        }
    });*/

    function getProducts(ean){
        if(ean != ''){
          let params
          if(localStorage.getItem('user_id')){
            params = {
              ean: ean,
              customer_id: localStorage.getItem('user_id')
            }
          }
          else{
            params = {
              ean: ean
            }
          }
          HTTP.get(`product`, {params})
          .then((response) => {
            if(response.data.length > 0){
              state.searchedProduct = response.data[0]
            }
            else{
              alert("Product niet aanwezig")
            }
          })
          .catch((err) => {
            alert(err)
          })
        }
        else{
          alert('Geen Ean nummer ingevoerd')
        }
      }

  watch(() => state.decodedResult, (newVal) => {
    getProducts(newVal)
  })

  watch(() => state.searchedProduct, (newVal) =>{
    //cart.addItemToCart(newVal, 1)
    state.productModalOpened = newVal
  })

  
	const shoppingCart = computed(() => store.state.shoppingCart)

</script>
<style scoped>
.barcode-scanner{
  height: 100%;
  width: 100%;
}

#container {
  width: 640px;
  margin: 20px auto;
  padding: 10px;
}

#interactive.viewport {
  width: 640px;
  height: 480px;
}


#interactive.viewport canvas, video {
  float: left;
  width: 640px;
  height: 480px;
}

#interactive.viewport canvas.drawingBuffer, video.drawingBuffer {
  margin-left: -640px;
}

.controls fieldset {
  border: none;
  margin: 0;
  padding: 0;
}

.controls .input-group {
  float: left;
}

.controls .input-group input, .controls .input-group button {
  display: block;
}

.controls .reader-config-group {
  float: right;
}

.controls .reader-config-group label {
  display: block;
}

.controls .reader-config-group label span {
  width: 9rem;
  display: inline-block;
  text-align: right;
}

.controls:after {
  content: '';
  display: block;
  clear: both;
}


#result_strip {
  margin: 10px 0;
  border-top: 1px solid #EEE;
  border-bottom: 1px solid #EEE;
  padding: 10px 0;
}

#result_strip > ul {
  padding: 0;
  margin: 0;
  list-style-type: none;
  width: auto;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}

#result_strip > ul > li {
  display: inline-block;
  vertical-align: middle;
  width: 160px;
}

#result_strip > ul > li .thumbnail {
  padding: 5px;
  margin: 4px;
  border: 1px dashed #CCC;
}

#result_strip > ul > li .thumbnail img {
  max-width: 140px;
}

#result_strip > ul > li .thumbnail .caption {
  white-space: normal;
}

#result_strip > ul > li .thumbnail .caption h4 {
  text-align: center;
  word-wrap: break-word;
  height: 40px;
  margin: 0px;
}

#result_strip > ul:after {
  content: "";
  display: table;
  clear: both;
}


.scanner-overlay {
  display: none;
  width: 640px;
  height: 510px;
  position: absolute;
  padding: 20px;
  top: 50%;
  margin-top: -275px;
  left: 50%;
  margin-left: -340px;
  background-color: #FFF;
  -moz-box-shadow: #333333 0px 4px 10px;
  -webkit-box-shadow: #333333 0px 4px 10px;
  box-shadow: #333333 0px 4px 10px;
}

.scanner-overlay > .header {
  position: relative;
  margin-bottom: 14px;
}

.scanner-overlay > .header h4, .scanner-overlay > .header .close {
  line-height: 16px;
}

.scanner-overlay > .header h4 {
  margin: 0px;
  padding: 0px;
}

.scanner-overlay > .header .close {
  position: absolute;
  right: 0px;
  top: 0px;
  height: 16px;
  width: 16px;
  text-align: center;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
}


i.icon-24-scan {
  width: 24px;
  height: 24px;
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QzFFMjMzNTBFNjcwMTFFMkIzMERGOUMzMzEzM0E1QUMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QzFFMjMzNTFFNjcwMTFFMkIzMERGOUMzMzEzM0E1QUMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDMUUyMzM0RUU2NzAxMUUyQjMwREY5QzMzMTMzQTVBQyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDMUUyMzM0RkU2NzAxMUUyQjMwREY5QzMzMTMzQTVBQyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PtQr90wAAAUuSURBVHjanFVLbFRVGP7ua97T9DGPthbamAYYBNSMVbBpjCliWWGIEBMWsnDJxkh8RDeEDW5MDGticMmGBWnSlRSCwgLFNkqmmrRIqzjTznTazkxn5s7c6/efzm0G0Jhwkj/nP+d/nv91tIWFBTQaDQWapkGW67p4ltUub5qmAi0UCqF/a/U2m81tpmddotwwDGSz2dzi4uKSaOucnJycGhsbe1XXdQiIIcdxEAgEtgXq9brySHCht79UXi/8QheawN27d385fPjwuEl6XyKR6LdtW7t06RLK5TKOHj2K/fv3Q87Dw8OYn5/HiRMnMDs7i5mZGQwODiqlPp8PuVwO6XRaOXb16lXl1OnTp5FMJvtosF8M+MWLarWqGJaWlpBKpRRcu3YN4+PjmJ6exsTEhDJw5coVjI6OKgPhcBiZTAbxeBx+vx+XL19Gd3c3Tp48Ka9zqDYgBlTQxYNgMIhIJKLCILkQb+TZsgvdsiyFi+feWRR7oRNZyanQtvW2V4DEUUBiK2eJpeDirSyhCe7F2QPh8fiEp72i9PbsC5G52DbiKZA771yr1dTuGfJ4PQNPFoAyQNR1aNEmsS5eyB3PgjeooMZd2AWvNmzYci/Gea7TeFOcI93jV/K67noGmi4vdRI9gPSDeMLSdKUBZZczlWm1rTtHjLZ24d+WER2tc8N1m+Y+ID74wx0zGYvhg9UNrJdtHJyZRdQfwPsrq9g99xsGlgsYmr6BNzO/IVwsYfjBQ6XYz6JI/72MV366B5/lw0elOkJWGUM3bmKtWjXSLuLaBWhnPnnp0FfoiFi4+TMfVAb2poBkDLjO845uYLEAjL4ALGWBP5YAOsP4AJYBFDaB1HOSVWD2PuV95H2RdV93Lv74/cf6p6Zxq/h6OofeOPJBC39JtONdwOAAViOs4p4OFGTf0Uc8iiyrr9YdQrUnDLsngrVOC0jQib44HlF2RafRZBz1Qy+vfhgK3NJZBlrm+LEm9qWwzFgLU7Ozg0JxZP06jQSRpQ7EerAWDSt6PuhHPmChEAog56fCLvJT5hHTm3OZkz3DyLx7XNWTGEA1GkV14gjWgwbW0ESVjYRwCOuai03L5E7OUBAV4kXSS4auoGIaKOma4m8EA5R1sMEGLh95C+XuLph0WJWpxepYYLtfT0RRgY1KgNODY6BoaChRuEhDCIZQYseuki5KN6hcQHiq7OZNv4/Zq2O6P4Lfkwn46vZjjaYZrIpvWbpzjLErrc4xUGE4avRedpYJalRcIl5hQius/SrPm9xrNOQYJhao6BvNUeWqtY8KaWuNjHOFAr7mM9f4NA4UbKysoUJ8PV9UzVOx6wxDDWUOxnK1pmCD07fOMAvtIsM3l89Dl3HRGhVma9AZMqjOnz2LQqWCxs6dqr3T7x1DTzKJaG8SekcHhg4cgI/56uKdlKnBV/WndqN3YAB/7tyBd3oT6GBIOzs7kc/nDfFdDFT5bS73cp06dQoaPa/Rw/rtO/resTHxxE2m9rCrbSR27UJCcMf1BpiA5rAAGgdfc868fUR1sMwj0cm9Iu9IctweisViB3hhKTHDcHc5jv/LspbyaZrR1OD82/fIlOkuB9LnEWRmDX2TsddUPg3D5gvuc0je0rZaD5EW6G3yjS+A3eeBEWq3XW/Abw1HhUspXADufQb86oW7tZytkYCN//3hHwBvDALPi8EnSOYK8DAOfCc2h4aGcO7cuafkzampqf9UripH12/DtOZbx8ciVGzYy5OO40o25ascGRl5Ssc/AgwAjW3JwqIUjSYAAAAASUVORK5CYII=");
  display: inline-block;
  background-repeat: no-repeat;
  line-height: 24px;
  margin-top: 1px;
  vertical-align: text-top;
}

@media (max-width: 603px) {

  #container {
    width: 300px;
    margin: 10px auto;
    -moz-box-shadow: none;
    -webkit-box-shadow: none;
    box-shadow: none;
  }

  #container form.voucher-form input.voucher-code {
    width: 180px;
  }
}
@media (max-width: 603px) {

  .reader-config-group {
    width: 100%;
  }

  .reader-config-group label > span {
      width: 50%;
  }

  .reader-config-group label > select, .reader-config-group label > input {
      max-width: calc(50% - 2px);
  }

  #interactive.viewport {
    width: 300px;
    height: 300px;
    overflow: hidden;
  }


  #interactive.viewport canvas, video {
    margin-top: -50px;
    width: 300px;
    height: 400px;
  }

  #interactive.viewport canvas.drawingBuffer, video.drawingBuffer {
    margin-left: -300px;
  }


  #result_strip {
    margin-top: 5px;
    padding-top: 5px;
  }

  #result_strip ul.thumbnails > li {
    width: 150px;
  }

  #result_strip ul.thumbnails > li .thumbnail .imgWrapper {
    width: 130px;
    height: 130px;
    overflow: hidden;
  }

  #result_strip ul.thumbnails > li .thumbnail .imgWrapper img {
    margin-top: -25px;
    width: 130px;
    height: 180px;
  }
}
@media (max-width: 603px) {

  .overlay.scanner {
    width: 640px;
    height: 510px;
    padding: 20px;
    margin-top: -275px;
    margin-left: -340px;
    background-color: #FFF;
    -moz-box-shadow: none;
    -webkit-box-shadow: none;
    box-shadow: none;
  }

  .overlay.scanner > .header {
    margin-bottom: 14px;
  }

  .overlay.scanner > .header h4, .overlay.scanner > .header .close {
    line-height: 16px;
  }

  .overlay.scanner > .header .close {
    height: 16px;
    width: 16px;
  }
}
</style>

<style>
#reader{
  height: 50%;
}
#reader__scan_region{
  width: 100%;
  min-height: 100px;
  text-align: center;
  position: relative;
  height: 100%;
}

#reader__scan_region video{
  width: 100%;
  display: block;
  height: 100%;
}
</style>