<template>
    <b-row class="justify-content-start">        
        <!-- <b-col cols="12">        
            <AwesomeCards />
        </b-col> -->
        <b-col cols="3">            
            <RangeComponent class="mb-4"  @filter="handleFilter" />          
        </b-col>
        <b-col cols="12">
            <DatePicker />
        </b-col>
        <b-col cols="12" v-if="show">
            <LineChart />
        </b-col>
        <b-col cols="12">
            <PriceChart />
        </b-col>
        <b-col cols="12">
            <HumidityChart />
        </b-col>
        <!-- <b-col cols="12">
            <MapCard />
        </b-col> -->
        <b-col cols="12">
            <TableChart />
        </b-col>        
        <b-col cols="12">
            <GridNodes />
        </b-col>


      <!-- --------------------------------------------------------- 
      Sales Summary
      --------------------------------------------------------- -->
      <!-- <b-col cols="12">
        <b-card class="mb-4" no-body>
          <RevenueStatistics />
        </b-card>
      </b-col>      -->
    </b-row>
  </template>
  <script>
  // -----------------------------------------
  // Import Components Here
  // -----------------------------------------
  //import AwesomeCards from "../dashboard-components/awesome-cards/AwesomeCards";  
  import RangeComponent from "../dashboard-components/range-component/RangeComponent";
  import LineChart from "../dashboard-components/echarts/LineChart";
  import PriceChart from "../dashboard-components/echarts/PriceChart";
  import HumidityChart from "../dashboard-components/echarts/HumidityChart";
  import TableChart from "../dashboard-components/echarts/TableChart";


  import GridNodes from "../dashboard-components/echarts/GridNodes";
  import DatePicker from "../dashboard-components/date-picker/DatePicker.vue";
  //import MapCard from '../dashboard-components/echarts/MapCard.vue';
  //import HighChartTest from '../dashboard-components/echarts/HighChartTest.vue';
  


  
  // -----------------------------------------
  // Export Here
  // -----------------------------------------
  export default {
    name: "ModernDashboard",
    data: () => ({
      title: "ModernDashboard",
      show:true,
      // Month Table
      month1: 0,
      monthoptions1: [
        { text: "Monthly", value: 0 },
        { text: "Daily", value: 1 },
        { text: "Weekly", value: 2 },
        { text: "Yearly", value: 3 },
      ],
      // top selling
      selling1: 0,
      sellingoptions1: [
        { text: "Monthly", value: 0 },
        { text: "Daily", value: 1 },
        { text: "Weekly", value: 2 },
        { text: "Yearly", value: 3 },
      ],
      // weather report
      weather1: 0,
      weatheroptions1: [
        { text: "Today", value: 0 },
        { text: "Weekly", value: 1 },
      ],
    }),
    components: {
    //AwesomeCards,    
    RangeComponent,
    LineChart,
    PriceChart,
    HumidityChart,
    TableChart,   
    //MapCard,
    GridNodes,
    //HighChartTest 
    DatePicker
    
},
    methods: {
        handleFilter(period) {
        // Perform API request based on the selected period (today, week, month)
        // Update your content based on the API response
        console.log(`Filtering content for ${period}`);
        // Make API request here and update content
        },
  },
    created() {
        // Trigger "today" filter when the component is created
        this.handleFilter('today');
    },
    };
  </script>