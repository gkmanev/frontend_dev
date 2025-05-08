<template>
  <div>
    <b-row>
      <b-col
        lg="3"
        cols="12"
        md="3"
        v-for="awesome in awesomes"
        :key="awesome.id"
      >
        <b-card no-body :class="'p-2 mb-4 text-center bg-' + awesome.cardbg">
          <h2 class="font-weight-light text-white">
            {{ awesome.number }}
          </h2>
          <h6 class="text-white mb-0">{{ awesome.subtitle }}</h6>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>
<script>
import axios from 'axios';
import { mapState } from 'vuex';
export default {
  name: "AwesomeCards",
  props: {
    review: Object,
  },
  data: () => ({
    title: "Awesome Card",
    moment_power:0,
    momentDevice:0,
    awesomes: [
      {
        id: 1,
        cardbg: "warning",
        number: "10%",
        subtitle: "Moment Power",
      },
      {
        id: 2,
        cardbg: "info",
        number: "2,064",
        subtitle: "Min Power",
      },
      {
        id: 3,
        cardbg: "primary",
        number: "1,738",
        subtitle: "Max Power",
      },
      {
        id: 4,
        cardbg: "success",
        number: "5963",
        subtitle: "Average Power",
      },

    ],
  }),

  computed: {
    ...mapState(['dateRange','selectedDev']),
    lastRouteSegment() {
    const pathArray = this.$route.path.split('/');    
    return pathArray.pop() || pathArray[pathArray.length - 1]; // This handles non-trailing slash URLs
  }
  },
  created() {
    this.fetchData();
  },

  methods: {
    fetchData(){
      let url =  `http://85.14.6.37:16455/api/siko/?date_range=`
      //if (this.lastRouteSegment == 'entra'){
        url = `${url}${this.dateRange}`
        if (this.selectedDev && this.lastRouteSegment !== 'entra'){
          url = `${url}&dev=${this.selectedDev}`
        }
        axios.get(url)
        .then(response => {
          const data = response.data;          
        
          const mostRecentTimestamp = data.reduce((latest, item) => {
            return new Date(item.created_date) > new Date(latest) ? item.created_date : latest;
          }, data[0]?.created_date); 

          
          
          // 2. Filter only records with the most recent timestamp
          //const latestRecords = data.filter(item => item[timestampField] === mostRecentTimestamp);
          const uniqueLatestRecords = Object.values(
            data
              .filter(item => item.created_date === mostRecentTimestamp)
              .reduce((acc, item) => {
                acc[item.devId] = item; // override any duplicate devId
                return acc;
              }, {})
          );
          
          // console.log(uniqueLatestRecords)
          // 3. Sum the `value` fields of those records
          const totalValue = uniqueLatestRecords.reduce((sum, item) => sum + item.value, 0);

          
          const momentPower = (totalValue/1000).toFixed(2)

          this.awesomes[0].number = momentPower + " kW"

          // calculate the min of the stacked values
          const sumPerTimestamp = {};

          data.forEach(item => {
            const timestamp = item.created_date;
            if (!sumPerTimestamp[timestamp]) {
              sumPerTimestamp[timestamp] = 0;
            }
            sumPerTimestamp[timestamp] += item.value;
          });

          // 2. Get the minimum of those stacked values
          const minStackedValue = Math.min(...Object.values(sumPerTimestamp));
          const min = (minStackedValue/1000).toFixed(2)
          this.awesomes[1].number = min + " kW"

          const maxStackedValue = Math.max(...Object.values(sumPerTimestamp));
          const max = (maxStackedValue/1000).toFixed(2)
          this.awesomes[2].number = max + " kW"

          const stackedValues = Object.values(sumPerTimestamp);
          const averageStackedValue = stackedValues.reduce((a, b) => a + b, 0) / stackedValues.length;

          const avg = (averageStackedValue/1000).toFixed(2)
          this.awesomes[3].number = avg + " kW"

          
        
          

          
          
          

        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
     // }
    }
    
  //   fetchData() {
  //     let url = `http://85.14.6.37:16455/api/aggregate/?date_range=`

  //     if (this.lastRouteSegment == 'entra'){
  //       url = `${url}${this.dateRange}`
  //       axios.get(url)
  //       .then(response => {
  //         const data = response.data;       

  //       if(this.dateRange == 'today'){
  //         this.awesomes[0].number = data.today_overview.mom["total_value"].toFixed(2) + " kW"; // Format to 2 decimal places
  //         this.moment_power = data.today_overview.mom["total_value"].toFixed(2)
  //         this.awesomes[1].number = data.today_overview.min.toFixed(2) + " kW"; // Format to 2 decimal places
  //         this.awesomes[2].number = data.today_overview.max.toFixed(2) + " kW";
  //         this.awesomes[3].number = data.today_overview.avg.toFixed(2) + " kW";
  //       }
  //       else if(this.dateRange == 'month'){
  //         this.awesomes[0].number = this.moment_power + " kW"; // Format to 2 decimal places
  //         this.awesomes[1].number = data.month_overview.min.toFixed(2) + " kW"; // Format to 2 decimal places
  //         this.awesomes[2].number = data.month_overview.max.toFixed(2) + " kW";
  //         this.awesomes[3].number = data.month_overview.avg.toFixed(2) + " kW";
  //       }
  //       else if(this.dateRange == 'year'){
  //           this.awesomes[0].number = this.moment_power + " kW"; // Format to 2 decimal places
  //           this.awesomes[1].number = data.year_overview.min.toFixed(2) + " kW"; // Format to 2 decimal places
  //           this.awesomes[2].number = data.year_overview.max.toFixed(2) + " kW";
  //           this.awesomes[3].number = data.year_overview.avg.toFixed(2) + " kW";
  //       }      
  //     })

  //     .catch(error => {
  //         console.error('Error fetching data:', error);
  //       });
  //     }
  //     else{
  //       if (this.selectedDev)
  //       {
  //         url = `${url}${this.dateRange}&devId=${this.selectedDev}`
  //         axios.get(url)
  //       .then(response => {
  //         const data = response.data; 
  //         if(this.dateRange == 'today'){        
  //         this.awesomes[0].number = data.today_overview_single.mom.toFixed(2) + " kW"; // Format to 2 decimal places
  //         this.momentDevice = data.today_overview_single.mom.toFixed(2)
  //         this.awesomes[1].number = data.today_overview_single.min.toFixed(2) + " kW"; // Format to 2 decimal places
  //         this.awesomes[2].number = data.today_overview_single.max.toFixed(2) + " kW";
  //         this.awesomes[3].number = data.today_overview_single.avg.toFixed(2) + " kW";
  //       }
  //       else if(this.dateRange == 'month'){
  //         this.awesomes[0].number = this.momentDevice + " kW"; // Format to 2 decimal places
  //         this.awesomes[1].number = data.month_overview_single.min.toFixed(2) + " kW"; // Format to 2 decimal places
  //         this.awesomes[2].number = data.month_overview_single.max.toFixed(2) + " kW";
  //         this.awesomes[3].number = data.month_overview_single.avg.toFixed(2) + " kW";
  //       }
  //       else if(this.dateRange == 'year'){
  //         this.awesomes[0].number = this.momentDevice + " kW"; // Format to 2 decimal places
  //         this.awesomes[1].number = data.year_overview_single.min.toFixed(2) + " kW"; // Format to 2 decimal places
  //         this.awesomes[2].number = data.year_overview_single.max.toFixed(2) + " kW";
  //         this.awesomes[3].number = data.year_overview_single.avg.toFixed(2) + " kW";
  //       }
          

          
  //       })
  //       .catch(error => {
  //         console.error('Error fetching data:', error);
  //       });
      
  //     }
     
  //   }
  // }
    
  },
  watch: {
    
    dateRange(newRange, oldRange) {
      if (newRange !== oldRange) {
        this.fetchData();
      }
    },
    selectedDev(newDev, oldDev) {
      if (newDev !== oldDev) {
        this.fetchData();
      }
    },

  },
};
</script>