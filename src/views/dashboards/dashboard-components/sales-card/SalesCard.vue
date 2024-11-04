<template>
  <div>
    <b-row>
      <b-col lg="3" cols="12" md="6" v-for="sale in sales" :key="sale.title">
        <b-card class="mb-4" :title="sale.title">
          <div class="text-right">
            <h2 class="font-weight-light mb-0">
              <i :class="[sale.progressicon]"></i> {{ sale.rate }}
            </h2>
            <span class="text-muted">{{ sale.subtitle }}</span>
          </div>
          <span :class="'text-' + [sale.percentcolor]"
            >{{ sale.percent }}%</span
          >
          <b-progress
            :value="sale.percent"
            :variant="sale.percentcolor"
            max="100"
          ></b-progress>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>
<script>
import axios from 'axios';
import { mapState } from 'vuex';
export default {
  name: "SalesCard",
  props: {
    review: Object,
  },
  data: () => ({
    title: "Sales Card",
    moment_power: null,

    sales: [
      {
        title: "Moment Power",
        //progressicon: "ti-arrow-up text-success",
        rate: null,
        //subtitle: "Todays Income",
        percent: null,
        percentcolor: "success",
      },
      {
        title: "Minimum Power",
       // progressicon: "ti-arrow-up text-info",
        rate: null,
        //subtitle: "Todays Income",
        percent: null,
        percentcolor: "info",
      },
      {
        title: "Maximum Power",
        //progressicon: "ti-arrow-up text-primary",
        rate: null,
       // subtitle: "Todays Income",
        percent: null,
        percentcolor: "primary",
      },
      {
        title: "Avarage Power",
        //progressicon: "ti-arrow-down text-danger",
        rate: null,
       // subtitle: "Todays Income",
        percent: null,
        percentcolor: "warning",
      },
    ],
  }),
  computed: {
      ...mapState(['all_devs', 'selectedDev', 'dateRange']),
      lastRouteSegment() {
      const pathArray = this.$route.path.split('/');    
      return pathArray.pop() || pathArray[pathArray.length - 1]; // This handles non-trailing slash URLs
  }
    },
  created() {

      this.fetchData()
      
      
    },
    watch: {
    selectedDev(newDev, oldDev) {
      if (newDev !== oldDev) {
        this.fetchData()
      }
    },
    dateRange(newRange, oldRange) {
      if (newRange !== oldRange) {
        this.fetchData();
      }
    },
  },

  methods: {
    fetchData() {
      let url = `http://85.14.6.37:16455/api/aggregate/?date_range=`
      
      if (this.lastRouteSegment == 'entra'){
        url = `${url}${this.dateRange}`
        
        .then(response => {
          const data = response.data;       

        if(this.dateRange == 'today'){
          this.mom = data.today_overview.mom["total_value"].toFixed(2) + " kW"; // Format to 2 decimal places
          this.moment_power = data.today_overview.mom["total_value"].toFixed(2)
          this.awesomes[1].number = data.today_overview.min.toFixed(2) + " kW"; // Format to 2 decimal places
          this.awesomes[2].number = data.today_overview.max.toFixed(2) + " kW";
          this.awesomes[3].number = data.today_overview.avg.toFixed(2) + " kW";
        }
        else if(this.dateRange == 'month'){
          this.awesomes[0].number = this.moment_power + " kW"; // Format to 2 decimal places
          this.awesomes[1].number = data.month_overview.min.toFixed(2) + " kW"; // Format to 2 decimal places
          this.awesomes[2].number = data.month_overview.max.toFixed(2) + " kW";
          this.awesomes[3].number = data.month_overview.avg.toFixed(2) + " kW";
        }
        else if(this.dateRange == 'year'){
            this.awesomes[0].number = this.moment_power + " kW"; // Format to 2 decimal places
            this.awesomes[1].number = data.year_overview.min.toFixed(2) + " kW"; // Format to 2 decimal places
            this.awesomes[2].number = data.year_overview.max.toFixed(2) + " kW";
            this.awesomes[3].number = data.year_overview.avg.toFixed(2) + " kW";
        }      
      })

      .catch(error => {
          console.error('Error fetching data:', error);
        });
      }
      else{
        if (this.selectedDev)
        {
          url = `${url}${this.dateRange}&devId=${this.selectedDev}`
          
          axios.get(url)          
        .then(response => {
          const data = response.data;           
          if(this.dateRange == 'today'){        
          const moment = data.today_overview_single.mom.toFixed(2) 
          this.moment_power = moment        
          const min = data.today_overview_single.min.toFixed(2)
          const max = data.today_overview_single.max.toFixed(2)
          const avg = data.today_overview_single.avg.toFixed(2)         
          this.calculateCapacityPercentage(moment,min,max,avg)
        }
        else if(this.dateRange == 'month'){
          const moment = this.moment_power          
          const min = data.month_overview_single.min.toFixed(2)
          const max = data.month_overview_single.max.toFixed(2)
          const avg = data.month_overview_single.avg.toFixed(2)
          this.calculateCapacityPercentage(moment,min,max,avg)
        }
        else if(this.dateRange == 'year'){
          const moment = this.moment_power          
          const min = data.year_overview_single.min.toFixed(2)
          const max = data.year_overview_single.max.toFixed(2)
          const avg = data.year_overview_single.avg.toFixed(2)
          this.calculateCapacityPercentage(moment,min,max,avg)
        }
          

          
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
      
      }
     
    }
  },
  calculateCapacityPercentage(mom, min, max, avg){
    const found = this.all_devs.find(el => el.id == this.selectedDev)    
    let capacity = found.capacity    
    let momPercent = (mom/capacity)*100
    let minPercent = (min/capacity)*100
    let maxPercent = (max/capacity)*100
    let avgPercent = (avg/capacity)*100


    this.sales[0].rate = mom
    this.sales[0].percent = parseInt(momPercent)

    this.sales[1].rate = min
    this.sales[1].percent = parseInt(minPercent)

    this.sales[2].rate = max
    this.sales[2].percent = parseInt(maxPercent)

    this.sales[3].rate = avg
    this.sales[3].percent = parseInt(avgPercent)


  }
  }



};
</script>