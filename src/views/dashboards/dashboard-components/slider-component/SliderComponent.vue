<template>
 <div>
    <label for="range-1">Select data aggragation:</label>
    <b-form-input id="range-1" v-model="value" type="range" min="0" max="60" step="15" @input="sendValue"></b-form-input>
    <div class="mt-2">Value: {{ value }}</div>
  </div>
  </template>
  
  <script>
import { mapActions } from 'vuex';
import { mapState } from 'vuex';
  export default {
    data() {
      return {
        value: 0,
        currentDev : null
      }
    },
    computed: {
      ...mapState(['selectedDev'])     
    }, 
    mounted() {     
    //   if (this.selectedDev) {
    //     console.log(this.selectedDev)

    //   }
    },

    watch: {
        selectedDev(newDev, oldDev) {
        if (newDev !== oldDev) {
            this.currentDev = newDev
            
        }
        },
    },

    methods: {
        ...mapActions(['updateSliderValue']),
        sendValue() {
            const sliderObj = {
                "dev": this.currentDev,
                "value": this.value
            }
            this.updateSliderValue(sliderObj) 
          
        }
    },

  }
  
  </script>
  