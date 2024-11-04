<template>
    <b-row class="justify-content-start">  
      
        <b-col cols="4">            
            <SelectComponent />
        </b-col>
        <b-col cols="3">            
            <RangeComponent class="mb-4" />          
        </b-col>     
        
        <b-col v-if="isDevSelected" cols="12">        
            <!-- <AwesomeCards /> -->
            <SalesCard />
      </b-col>        
        <b-col cols="8">
          <b-col cols="3">
            <SliderComponent class="mb-4" />
        </b-col> 
            <LineChart />
        </b-col>
        <b-col cols="4">
          <CustomProgress />
          <CorelationsHeat />
        </b-col>
        <b-col cols="12">
            <PriceChart />
        </b-col> 
        <b-col cols="12">
            <WeatherChart />
        </b-col>   
        <b-col cols="12">
            <WeatherChartClouds />
        </b-col>   
    </b-row>
  </template>
  <script>
  // -----------------------------------------
  // Import Components Here
  // -----------------------------------------
  
  import SelectComponent from "../dashboard-components/select-component/SelectComponent";
  import RangeComponent from "../dashboard-components/range-component/RangeComponent";
  import LineChart from "../dashboard-components/echarts/LineChart";  
  import PriceChart from "../dashboard-components/echarts/PriceChart"; 
  import WeatherChart from "../dashboard-components/echarts/WeatherChart"; 
  // import AwesomeCards from "../dashboard-components/awesome-cards/AwesomeCards";  
  import CustomProgress from "../dashboard-components/progress-cards/CustomProgress.vue";
  import { mapState } from 'vuex';
  import SalesCard from "../dashboard-components/sales-card/SalesCard.vue";
  import WeatherChartClouds from "../dashboard-components/echarts/WeatherChartClouds.vue";
import CorelationsHeat from "../dashboard-components/echarts/CorelationsHeat.vue";
import SliderComponent from "../dashboard-components/slider-component/SliderComponent.vue";



  
  // -----------------------------------------
  // Export Here
  // -----------------------------------------
  export default {
    name: "ClientDashboard",
    data: () => ({
      title: "ClientDashboard",
      isDevSelected: false      
      
    }),
    components: {
   
    LineChart,
    SelectComponent,    
    RangeComponent,
    PriceChart,
   // AwesomeCards,
    WeatherChart,
    CustomProgress,
    SalesCard,
    WeatherChartClouds,
    CorelationsHeat,
    SliderComponent
    
},

  created(){
    this.checkSelectedDev()
  },

  computed: {
      ...mapState(['selectedDev']),
    },


  methods: {
    checkSelectedDev(){
      if(this.selectedDev){
        this.isDevSelected = true
      }
      else{
        this.isDevSelected = false
      }
    } 
  },
  watch: {
    selectedDev(newDev, oldDev) {
      if (newDev !== oldDev) {
        this.isDevSelected = true;
      }
    },

  },

    };
  </script>

<style scoped>

/* Add your component-specific styles here */
</style>