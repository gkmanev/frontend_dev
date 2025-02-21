<template>
   <b-card class="heat-chart mb-4">    
        <v-chart class="chart" :option="option" autoresize/>    
    </b-card>
  </template>
  
  <script>
  import VChart from "vue-echarts";
  import { mapState } from 'vuex';
  import { use } from 'echarts/core'
  import { HeatmapChart } from 'echarts/charts'  
  import axios from 'axios';
  import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    ToolboxComponent,
    VisualMapComponent,    
    GridComponent

  } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  
  use([
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    ToolboxComponent,
    GridComponent,
    HeatmapChart,
    CanvasRenderer,
    VisualMapComponent
    
  ])
  
  export default {
    name: "CorelationsHeat",
    components: {
      VChart
    },
    data() {
      return {
        
        params: ['value', 'temperature', 'clouds', 'heatindex', 'uv'],

        option: {            
            tooltip: {
                position: 'top'
            },
            grid: {
                height: '80%',
                //top: '20%',
                width:'40%',
                //right: '15%',
                left: 'center',
                bottom:'15%'
            
            },
            xAxis: {
                type: 'category',
                data: ['power', 'temp', 'clouds', 'heat', 'uv'],
                splitArea: {
                show: true
                },
                axisLabel: {
                    textStyle: {
                        color: '#979ea5', // Change this to your desired color
                        
                    },
                    rotate: 45
                }
            },
            yAxis: {
                type: 'category',
                data: ['power', 'temp', 'clouds', 'heat', 'uv'],
                splitArea: {
                show: true
                },
                axisLabel: {
                    textStyle: {
                        color: '#979ea5' // Change this to your desired color
                    },
                rotate: 45
          }
            },
            visualMap: {
                min: 0,
                max: 1,
                calculable: true,
                orient: 'vertical',
                //left: 'right',
                right:'20%',
                bottom: '23%'
            },
            series: [
                {
                name: 'Correlation',
                type: 'heatmap',
                data: [],
                label: {
                    show: true
                },
                emphasis: {
                    itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
                }
            ]
        },
        }
    },
    

    mounted() {           

        window.addEventListener('resize', this.updateGridSize);
        this.updateGridSize();

        if(this.selectedDev)
        {
            this.fetchAndUpdateCorrelations(this.selectedDev);
        }
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize);
    },
    methods: {
      
        updateGridSize() {
            const width = window.innerWidth;            
            if (width < 1600) {
                this.option.grid.width = '70%';
                this.option.visualMap.right = '0%';
            }
            // } else if (width < 1024) {
            //     this.option.grid.width = '80%';
            // } else {
            //     this.option.grid.width = '70%';
            // }
        },

        fetchAndUpdateCorrelations(devId) {
            try {
                // Simulate API call or use actual API fetch here
                this.fetchCorrelationDataFromAPI(devId);
                
                //this.updateCorrelations(response.data, devId);
            } catch (error) {
                console.error('Error fetching correlations:', error);
            }
            },

        fetchCorrelationDataFromAPI(devId) {
            let url = `http://85.14.6.37:2323/api/correlations/?devId=${devId}`
            if(url){                
                axios
                .get(url)
                .then(response => this.updateCorrelations(response.data))           
                .catch((error) => console.log(error))      
            }
     
        },

        updateCorrelations(apiResponse) {
            
            const mappedData = apiResponse.map(item => {
                return [
                    this.params.indexOf(item.feature1.name),
                    this.params.indexOf(item.feature2.name),
                    item.correlation_value.toFixed(2)
                ];
            });
            
            // Update Vue component data with new correlations data
            this.correlations = mappedData;

            // Update the option.series[0].data with the updated correlations
            this.option.series[0].data = this.correlations;

        },
    },
    //End methods
    computed: {
        ...mapState(['dateRange','selectedDev']),    
    },
    watch: {     
        dateRange(newRange, oldRange) {
            if (newRange !== oldRange) {
                this.option.series[0].data = []
                if(this.selectedDev){
                    this.fetchAndUpdateCorrelations(this.selectedDev);
                }
            }
        },
        selectedDev(newDev, oldDev) {
            if (newDev !== oldDev) {
                this.option.series[0].data = []
                if(this.selectedDev){
                    this.fetchAndUpdateCorrelations(this.selectedDev);
                }             
                
            }
        },   

  },
  };
  </script>
  
  <style scoped>
  .chart {
    height: 240px;
  }
  </style>
  