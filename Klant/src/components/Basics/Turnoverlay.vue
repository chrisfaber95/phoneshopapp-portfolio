<script setup>
    import { reactive, onMounted } from 'vue'
    
    import $ from 'jquery'

    const state = reactive({
        publicPath: process.env.BASE_URL,
        originalPotion: false,
        keyboardOpen: false
    })

    onMounted(() => {
        $(document).ready(function(){
            if (state.originalPotion === false) state.originalPotion = $(window).width() + $(window).height();
        });

        $(document).on('focus blur', 'select, textarea, input[type=text], input[type=date], input[type=password], input[type=email], input[type=number]', function(e){
            //var $obj = $(this);
            var nowWithKeyboard = (e.type == 'focusin');
            $('body').toggleClass('view-withKeyboard', nowWithKeyboard);
            onKeyboardOnOff(nowWithKeyboard);
        });

        $(window).on('resize orientationchange', function(){
            applyAfterResize();
        });
    })

    function onKeyboardOnOff(isOpen) {
    // Write down your handling code
    if (isOpen) {
        state.keyboardOpen = true
    } else {
        state.keyboardOpen = false
    }
}



/**
 * Determine the mobile operating system.
 * This function returns one of 'iOS', 'Android', 'Windows Phone', or 'unknown'.
 *
 * @returns {String}
 */
function getMobileOperatingSystem() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

      // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
        return "winphone";
    }

    if (/android/i.test(userAgent)) {
        return "android";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "ios";
    }

    return "";
}

function applyAfterResize() {

    if (getMobileOperatingSystem() != 'ios') {
        if (state.originalPotion !== false) {
            var wasWithKeyboard = $('body').hasClass('view-withKeyboard');
            var nowWithKeyboard = false;

                var diff = Math.abs(state.originalPotion - ($(window).width() + $(window).height()));
                if (diff > 100) nowWithKeyboard = true;

            $('body').toggleClass('view-withKeyboard', nowWithKeyboard);
            if (wasWithKeyboard != nowWithKeyboard) {
                onKeyboardOnOff(nowWithKeyboard);
            }
        }
    }
}



</script>
<template>
    <div class="turn-overlay" :class="{'keyboard': state.keyboardOpen}">
		<img class="turn" v-bind:src="require('@/assets/icons/nietdraaien.jpeg')" />
	</div>
</template>
<style scoped>
.turn-overlay{
	display: none;
}

@media only screen and (max-height: 500.98px) and (orientation: landscape) {
	.turn-overlay{
		width: 100vw;
		height: 100vh;
		position: absolute;
		top: 0;
		left: 0;
		background: #ffffff;
		z-index: 10000;
		display: inline-block;
		background-color: var(--base-color);
	}
	.turn-overlay img{
		height: 90%;
		width: auto;
		max-width: 100%;

	}
	.turn-overlay.keyboard{
		display: none !important;
	}
}
</style>