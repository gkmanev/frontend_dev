<template>
  <b-card class="mb-4">
    <div class="chart" ref="plotlyChart"></div>
  </b-card>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import Plotly from 'plotly.js-dist';

export default {
  name: "HelloWorld",
  data() {
    return {
      created_date_or_created: 'created_date',
      traceVisibility: {
       
        // Add more devIds as needed
      }
    };
  },
  mounted() {
    this.fetchData();
    this.populateTraceVisibility();
  },
  computed: {
    ...mapState(['dateRange','selectedDev', 'selectBoxDevs']),
  },
  watch: {
    selectBoxDevs: {
      handler(newBox, oldBox) {
        if (newBox !== oldBox) {       
          
          this.traceVisibility = newBox
          this.fetchData();
        }
      },
      deep: true // If selectBoxDevs is an array or object, use deep: true
    },
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
  methods: {
    populateTraceVisibility() {
      // for (let i = 1; i <= 30; i++) {
      //   const devId = 'sm-' + ('000' + i).slice(-4); // Generate devId with leading zeros
      //   this.$set(this.traceVisibility, devId, true); // Set visibility for each devId
      // }
      const devIds = Array.from({ length: 31 }, (_, i) =>
          `sm-${(i + 40).toString()}`
      );
      devIds.forEach(el => {
        const devId = el;
        this.$set(this.traceVisibility, devId, true);
      })
      console.log(this.traceVisibility)
    },
    fetchData() {
      let url = '';
      let urlForecast = '';
      
      if (this.$route.path.endsWith('entra')) {
        //url = `http://85.14.6.37:16455/api/posts/?date_range=${this.dateRange}`;
        if (this.dateRange == "today"){
          url = `http://85.14.6.37:16455/api/posts/?date_range=today`          
        }
        else{
          url =  `http://85.14.6.37:16455/api/posts/?date_range=${this.dateRange}`       
        }
       
        
      } else {
        if (this.selectedDev) {
          url = `http://85.14.6.37:16455/api/posts/?date_range=${this.dateRange}&dev=${this.selectedDev}`;
          urlForecast = ""//`http://85.14.6.37:16455/api/post_forecast?date_range=${this.dateRange}&dev=${this.selectedDev}F`;
        }
      }

      try {
        let requestOne = [];
        if (url) {
          requestOne = axios.get(url);          
        }
        let requestTwo = [];
        if (urlForecast) {
          requestTwo = axios.get(urlForecast);
        }

        axios.all([requestOne, requestTwo]).then(axios.spread((...responses) => {
          let devData = responses[0].data
           
          
          let forecastData = responses[1].data;

          this.createPlotlyChart(devData, forecastData);
        }));
      } catch(error) {
        console.log(error);
      }    
    },
    //createPlotlyChart(devData, forecastData)
    createPlotlyChart(devData) {
  const traces = [];
     
  if (devData && devData.length > 0) {
    if (this.dateRange != 'today') {
      this.created_date_or_created = 'created';
    } else if (this.dateRange == 'month') {
      this.created_date_or_created = 'created';
    } else {
      this.created_date_or_created = 'created_date';
    }

    //const devIds = [...new Set(devData.map(item => item.devId))];
    const uniqueDates = [...new Set(devData.map(item => item[this.created_date_or_created]))];
    const devIds = Array.from({ length: 31 }, (_, i) =>
          `sm-${(i + 40).toString()}`
    );
    console.log(devIds)
    // Initialize trace for each device
    devIds.forEach(devId => {
      if (this.traceVisibility[devId]) {
        const traceColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
        const trace = {
          x: uniqueDates,
          y: Array(uniqueDates.length).fill(0), // Initialize y data array with zeros
          type: 'scatter',
          mode: 'lines',
          stackgroup: 'one', // Enable stacking for this trace
          name: devId,
          line: {
            width: 0.5, // Ensure this is set for each trace to make the line width 1
          },
          hoverinfo: 'text',
          marker: {
            color: traceColor // Set the trace color
          },
          hovertemplate:
            '<b style="display: inline-block; margin-right: 5px; color: ' + traceColor + '">&#x25CF;</b>' + // Unicode symbol for a filled circle
            '<b style="display: inline-block; margin-right: 5px;">%{fullData.name}</b><br>' + // Display the trace name in bold
            '<i>Time: %{x}</i><br>' + // Display the x-value in italics
            '<span style="color: gray;">Power: </span>' +
            '<span>%{y}</span><br>' + // Display the y-value
            '<extra></extra>', // Use <extra> to hide the default tooltip content
        };
        traces.push(trace);
      }
    });

    // Populate y data array for each trace
    devData.forEach(item => {
      const index = uniqueDates.indexOf(item[this.created_date_or_created]);
      const traceIndex = devIds.indexOf(item.devId);
      if (traceIndex !== -1 && traces[traceIndex]) {
        traces[traceIndex].y[index] = item.value;
      }
    });
  }

  // Proceed with plotting only if there are traces to display
  if (traces.length > 0) {
    const layout = {
      title: 'Customer Power kW',
      xaxis: {
        title: '',
        tickfont: { color: '#858687' },
      },
      yaxis: {
        title: '',
        tickfont: { color: '#858687' }
      },
      hoverlabel: { bgcolor: "#272b34", bordercolor: "black", font: { color: "white" } },
      plot_bgcolor: '#272b34', // Set background color
      showlegend:false,
      paper_bgcolor: '#272b34'
    };

    if(this.dateRange == 'today'){
      Object.assign(layout.xaxis,{
        tick0: new Date().setHours(0, 0, 0, 0),
        tickangle: -45, // Set tick angle to rotate them vertically
        dtick: 3600000,
        range: [new Date().setHours(0, 0, 0, 0), new Date().setHours(23, 59, 59, 999)], // Set initial range
        type: 'date',
        tickformat: '%H:%M', // Format to display hours and minutes
        rangeslider: {
          tickformat: '%H:%M', // Format to display hours and minutes
          tickmode: 'linear',
          tick0: new Date().setHours(0, 0, 0, 0), // Start from 00:00:00
          dtick: 3600000, // Interval of 1 hour in milliseconds (3600000 ms = 1 hour)
          bordercolor: '#858687', // Border color of the handlebars
          borderwidth: 2, // Border width of the handlebars
          thickness: 0.05, // Thickness of the handlebars
        }
      });
    } else if (this.dateRange === 'month') {
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
      
      Object.assign(layout.xaxis, {
        type: 'date',
        tickformat: '%d', // Format to display day of the month
        tickmode: 'linear',
        tick0: firstDayOfMonth.getTime(), // Start from the beginning of the month
        dtick: 24 * 60 * 60 * 1000, // Interval of 1 day in milliseconds
        range: [firstDayOfMonth.getTime(), lastDayOfMonth.getTime()], // Set X-axis range for the entire month
        tickangle: -45, // Set tick angle to rotate them vertically
        rangeslider: {
          tickformat: '%d', // Format to display hours and minutes
          tickmode: 'linear',
          tick0: firstDayOfMonth.getTime(),
          dtick: 24 * 60 * 60 * 1000, // Interval of 1 day in milliseconds
          bordercolor: '#858687', // Border color of the handlebars
          borderwidth: 2, // Border width of the handlebars
          thickness: 0.05, // Thickness of the handlebars
        }
      });
    } else {
      const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1);
      const lastDayOfYear = new Date(new Date().getFullYear(), 11, 31);
      
      Object.assign(layout.xaxis, {
        type: 'date',
        tickformat: '%b', // Format to display month abbreviation
        tickmode: 'linear',
        tick0: firstDayOfYear.getTime(), // Start from the beginning of the year
        dtick: 30 * 24 * 60 * 60 * 1000, // Interval of 30 days in milliseconds
        range: [firstDayOfYear.getTime(), lastDayOfYear.getTime()], // Set X-axis range for the entire year
        tickangle: -45, // Set tick angle to rotate them vertically
        rangeslider: {
          tickformat: '%d', // Format to display hours and minutes
          tickmode: 'linear',
          tick0: firstDayOfYear.getTime(),
          dtick: 24 * 60 * 60 * 1000, // Interval of 1 day in milliseconds
          bordercolor: '#858687', // Border color of the handlebars
          borderwidth: 2, // Border width of the handlebars
          thickness: 0.05, // Thickness of the handlebars
        }
      });
    }

    const config = {
      responsive: true,
    };

    Plotly.newPlot(this.$refs.plotlyChart, traces, layout, config).then(() => {
      this.$refs.plotlyChart.on('plotly_hover', data => {
        let update = { 'line': { width: 3 } };
        Plotly.restyle(this.$refs.plotlyChart, update, [data.points[0].curveNumber]);
      });

      this.$refs.plotlyChart.on('plotly_unhover', data => {
        let update = { 'line': { width: 1 } };
        Plotly.restyle(this.$refs.plotlyChart, update, [data.points[0].curveNumber]);
      });
    });
  } else {
    console.log('No traces to display.'); // Log a message if there are no traces to display
  }
}

  },
};
</script>

<style scoped>
.chart {
  height: 650px;
  background-color: black;
}
</style>
