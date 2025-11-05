<template>
  <b-card class="mb-4 line-chart">
    <div class="mt-4 test">
      <v-chart class="chart" :option="option" autoresize />
    </div>
  </b-card>
</template>

<script>
import VChart from "vue-echarts";
import axios from "axios";
import { mapState } from "vuex";
import { use } from "echarts/core";
import { LineChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  GridComponent,
  DataZoomComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  GridComponent,
  LineChart,
  CanvasRenderer,
  DataZoomComponent,
]);

const timeLineSet = function (value) {
  let date = new Date(value);
  let hours = ("0" + date.getUTCHours()).slice(-2);
  let minutes = ("0" + date.getUTCMinutes()).slice(-2);
  return `${hours}:${minutes}`;
};

export default {
  name: "PowerChartSm46Sm47",
  components: { VChart },

  data() {
    return {
      created_date_or_created: "created_date",
      option: {
        title: {
          text: "Customer Power",
          left: "center",
          textStyle: {
            fontSize: 16,
            color: "#b2b9bf",
            fontFamily: "Arial",
            fontWeight: "normal",
          },
        },
        legend: {
          orient: "horizontal",
          padding: [-500, 100, 0, 0],
          data: ["sm-46", "sm-47"],
          selected: { "sm-46": true, "sm-47": true },
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "line",
            label: { backgroundColor: "#6a7985" },
          },
          backgroundColor: "",
          borderWidth: 0,
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          shadowColor: "transparent",
          formatter: (params) => {
            if (params && params.length) {
              let tooltipContent = `<div class="tooltip-set" style="text-align:left; padding:0; margin:0; background-color: black; border-radius: 8px;">`;
              let localTime;

              params.forEach((param) => {
                let utcTime = new Date(param.data[0]);
                const hours = utcTime.getUTCHours().toString().padStart(2, "0");
                const minutes = utcTime
                  .getUTCMinutes()
                  .toString()
                  .padStart(2, "0");
                const day = utcTime.getUTCDate().toString().padStart(2, "0");
                const month = (utcTime.getUTCMonth() + 1)
                  .toString()
                  .padStart(2, "0");
                const year = utcTime.getUTCFullYear();
                localTime = `${hours}:${minutes} | ${day}.${month}.${year}`;

                tooltipContent += `
                  <div style="padding-right:15px;padding-left:15px;padding-top:3px;padding-bottom:3px;margin-bottom:0;border-bottom-left-radius: 8px;border-bottom-right-radius: 8px;">
                    <ul style="list-style-type: none; margin: 0; padding-left: 0;">
                      <li>
                        <span class="color-point" style="width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 5px; background-color: ${param.color};"></span>
                        <span style="color: gray;">${param.seriesName}: </span>
                        <span style="color: white;">${param.data[1]} W</span>
                      </li>
                    </ul>
                  </div>`;
              });

              const footer = `
                <div style="color: white; padding: 10px; background-color: #333; border-top: 1px solid #999;">
                  <strong>Time: </strong> <span style="color: white;">${localTime}</span>
                </div>`;

              tooltipContent += footer;
              return tooltipContent;
            }
            return "";
          },
        },

        grid: {
          bottom: "35%",
          containLabel: false,
        },

        xAxis: {
          type: "time",
          axisLabel: {
            rotate: 40,
            margin: 20,
            textStyle: { color: "#9a9a9a" },
          },
          axisLine: { show: true },
          boundaryGap: false,
        },

        yAxis: [
          {
            type: "value",
            name: "Power",
            splitLine: { show: false },
          },
        ],

        dataZoom: [
          {
            type: "slider",
            height: 20,
            handleSize: "75%",
            show: true,
            backgroundColor: "#272b34",
            dataBackground: { areaStyle: { color: "#009efb" } },
            start: 0,
            end: 100,
          },
        ],

        series: [],
      },
    };
  },

  mounted() {
    this.fetchData();
  },

  computed: {
    ...mapState([
      "dateRange",
      "selectedDev",
      "checkedDevs",
      "selectBoxDevs",
      "sliderValue",
    ]),

    lastRouteSegment() {
      const pathArray = this.$route.path.split("/");
      return pathArray.pop() || pathArray[pathArray.length - 1];
    },
  },

  watch: {
    selectBoxDevs: {
      handler(newBox, oldBox) {
        if (newBox !== oldBox) {
          this.option.legend.selected = newBox;
          this.fetchData();
        }
      },
      deep: true,
    },
    sliderValue(newSlider, oldSlider) {
      if (newSlider !== oldSlider) this.fetchData();
    },
    dateRange(newRange, oldRange) {
      if (newRange !== oldRange) this.fetchData();
    },
    selectedDev(newDev, oldDev) {
      if (newDev !== oldDev) this.fetchData();
    },
  },

  methods: {
    setHourlyAxisLabels() {
      this.option.xAxis.axisLabel = {
        ...this.option.xAxis.axisLabel,
        formatter: function (value) {
          const date = new Date(value);
          return `${date.getHours()}:00`;
        },
      };
      this.option.xAxis.interval = 3600 * 1000;
    },

    setAxisTimeRange() {
      const now = new Date();
      const todayUTC = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
      );
      let start = new Date(todayUTC);
      let end = new Date(todayUTC);

      if (this.dateRange === "today") {
        end.setUTCHours(23, 0, 0);
        this.option.xAxis.axisLabel.formatter = timeLineSet;
        this.option.xAxis.splitNumber = 23;
      } else if (this.dateRange === "month") {
        start.setUTCDate(1);
        end.setUTCMonth(end.getUTCMonth() + 1, 0);
        end.setUTCHours(23, 0, 0);
        this.option.xAxis.axisLabel.formatter = [];
        this.option.xAxis.splitNumber = 30;
      } else if (this.dateRange === "year") {
        start.setUTCMonth(0, 1);
        end.setUTCFullYear(end.getUTCFullYear() + 1, 0, 0);
        end.setUTCHours(23, 0, 0);
        this.option.xAxis.axisLabel.formatter = [];
        this.option.xAxis.splitNumber = 12;
      }

      this.option.xAxis.min = start.getTime();
      this.option.xAxis.max = end.getTime();
    },

    async fetchData() {
      // choose correct timestamp field
      this.created_date_or_created =
        this.dateRange === "today" ? "created_date" : "created";

      // Build URL
      let url = "";
      if (this.$route && this.lastRouteSegment === "entra") {
        url =
          this.dateRange === "today"
            ? `http://85.14.6.37:16455/api/posts/?date_range=today`
            : `http://85.14.6.37:16455/api/posts/?date_range=${this.dateRange}`;
      } else if (this.selectedDev) {
        url = `http://85.14.6.37:16455/api/posts/?date_range=${this.dateRange}&dev=${this.selectedDev}`;

        // Resampling for "today" based on slider
        if (this.dateRange === "today" && this.sliderValue && this.sliderValue.value) {
          const v = Number(this.sliderValue.value);
          const map = { 15: "15min", 30: "30min", 45: "45min", 60: "60min" };
          if (map[v]) {
            url = `http://85.14.6.37:16455/api/resample_data/?resample=${map[v]}&devId=${this.selectedDev}`;
          }
        }
      }

      if (!url) {
        this.option.series = [];
        return;
      }

      try {
        const { data: devData } = await axios.get(url);

        // Only these two device IDs
        const devIds = ["sm-46", "sm-47"];

        // Build the 2 line series, no stacking/area
        const seriesData = devIds.map((devId) => {
          const points = (devData || [])
            .filter((item) => item.devId === devId)
            .map((item) => [item[this.created_date_or_created], item.value]);

          return {
            name: devId,
            type: "line",
            sampling: "lttb",
            showSymbol: false,
            connectNulls: true,
            lineStyle: { width: 1 },
            emphasis: { focus: "series" },
            data: points,
          };
        });

        // Apply axis range and set series + legend
        this.setAxisTimeRange();
        this.option.series = seriesData;
        this.option.legend.data = ["sm-46", "sm-47"];
        this.option.legend.selected = { "sm-46": true, "sm-47": true };
        this.option.title.text = "Power kW";
      } catch (e) {
        console.error(e);
        this.option.series = [];
      }
    },
  },
};
</script>

<style scoped>
.line-chart {
  height: 430px;
}
.chart {
  height: 370px;
}
.card-body {
  padding-top: 0;
}
</style>
