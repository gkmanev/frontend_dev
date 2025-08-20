<template>
    <b-card class="mb-4">
      <div class="mt-4">        
        <v-chart class="chart" :option="chartOption" />
      </div>
    </b-card>
  </template>
  
  <script>
  import VChart from 'vue-echarts';
  import { mapState } from 'vuex';
  import axios from 'axios';
  import { use } from 'echarts/core';
  import { CanvasRenderer } from 'echarts/renderers';
  import { TreeChart } from 'echarts/charts';
  import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
  
  use([
    CanvasRenderer,
    TreeChart,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
  ]);
  
  export default {
    name: 'GridNodes',
    components: {
      VChart,
    },
    data() {
      return {
        polling: null,
        chartOption: this.defaultChartOption(),
      };
    },
    computed: {
      ...mapState(['all_devs']),
    },
    watch: {
      all_devs: { handler() { this.fetchData(); }, immediate: false }
    },
    methods: {
      defaultChartOption() {
        return {
          title: {
            text: 'Network',
            left: 'center',
            padding: [1, 1, 5, 1],
            
            textStyle: {
              fontSize: 16,
              color: 'white',
            },
          },
          tooltip: {
            trigger: 'item',
            triggerOn: 'mousemove',
          },
          series: [
            {
              type: 'tree',
              id: 0,
              nodePadding: 30,
              name: 'tree1',
              data: [{
                name: 'Siko Trans',
                children: [],
              }],
            //   top: '25%',
            //   left: '8%',
            //   bottom: '25%',             
              right: '20%',
              symbolSize: 12,
              lineStyle: {
                width: 2,
                color: '#7460ee',
              },
              label: {
                backgroundColor: "none",
                position: 'left',
                verticalAlign: 'bottom',
                align: 'right',
                color: '#fff',
                fontSize: 13,
              },
              leaves: {
                label: {
                  position: 'right',
                  verticalAlign: 'middle',
                  align: 'left',
                  color: '#FFF',
                },
              },
              emphasis: {
                focus: 'descendant',
              },
              expandAndCollapse: false,
            },
          ],
        };
      },
      async pollData() {
        this.polling = setInterval(async () => {
          await this.fetchData();
        }, 15000);
      },
      async fetchData() {
        try {
          const onlineDevices = await this.fetchOnlineDevices();
          const gridAssignments = await this.fetchGridAssignments();
         
          this.updateTreeData(onlineDevices, gridAssignments);
        } catch (error) {
          console.error(error);
        }
      },
      async fetchOnlineDevices() {

        // const response = await axios.get('http://209.38.208.230:8000/api/online/');
        // return response.data.online;
        let online_arr = []
        
        this.all_devs.forEach(el=>{
          if(el.online == "not-ready")
          {           
            online_arr.push(el)
          }
        })
      
        return online_arr
        

      },
      async fetchGridAssignments() {
        const response = await axios.get('http://85.14.6.37:16455/api/grid_asign/');
       
        return response.data;
      },
      updateTreeData(onlineDevices, gridAssignments) {

        const validAssignments = gridAssignments.filter(
          a => a.grid_name && a.grid_name.toLowerCase() !== "test"
        );
        const gridsMap = new Map();
        for (const { grid_name } of validAssignments) {
          const key = String(grid_name).trim();
          if (!gridsMap.has(key)) gridsMap.set(key, { name: key, children: [] });
        }

        validAssignments.forEach(assignment => {
          const key = String(assignment.grid_name).trim();
          const grid = gridsMap.get(key);
          if (!grid) return;

          const device = this.all_devs.find(dev => dev.id === assignment.dev);
          const deviceName = device ? device.id : assignment.dev;
          if (!grid.children.some(c => c.name === deviceName)) {
            grid.children.push({ name: deviceName });
          }
        });

        const treeData = Array.from(gridsMap.values());

        this.chartOption = {
          ...this.chartOption,
          series: [
            {
              ...this.chartOption.series[0],
              data: [{ name: 'Siko Trans', children: treeData }],
            },
          ],
        };
      }

      // determineDeviceStatus(device) {
      //   if (device.ready === 1) {
      //     return device.providing === 1 ? 'providing' : 'ready';
      //   }
      //   return device.ready === 0 ? 'not-ready' : 'offline';
      // },
    },
    created() {
      this.fetchData();
      this.pollData();
      //console.log(this.all_devs)
      
    },
    beforeDestroy() {
      clearInterval(this.polling);
    },
  };
  </script>
  
  <style scoped>
  .chart {
    height: 400px;
  }
  </style>
  