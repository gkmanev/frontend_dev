<template>
  <b-card class="mb-4 line-chart">
    <div class="mt-4 test">
      <v-chart class="chart" :option="option" autoresize />
    </div>
  </b-card>
</template>

<script>
import VChart from "vue-echarts";
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

export default {
  name: "PowerChartSm46Sm47",
  components: { VChart },

  data() {
    return {
      option: {
        title: {
          text: "VOC Sensor Readings",
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
                        <span style="color: white;">${param.data[1]} ppb</span>
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
            name: "VOC (ppb)",
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
    generateFakeVOCData() {
      const devices = ["sm-46", "sm-47"];
      const now = new Date();
      const startOfMonth = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)
      );

      const dataPerDevice = devices.reduce((acc, device) => {
        acc[device] = [];
        return acc;
      }, {});

      const cursor = new Date(startOfMonth);
      while (cursor <= now) {
        devices.forEach((device) => {
          const value = Number((30 + Math.random() * 10).toFixed(2));
          dataPerDevice[device].push([cursor.toISOString(), value]);
        });
        cursor.setUTCHours(cursor.getUTCHours() + 1);
      }

      return {
        devices,
        start: startOfMonth.getTime(),
        end: now.getTime(),
        dataPerDevice,
      };
    },

    fetchData() {
      const { devices, start, end, dataPerDevice } = this.generateFakeVOCData();

      const seriesData = devices.map((device) => ({
        name: device,
        type: "line",
        sampling: "lttb",
        showSymbol: false,
        connectNulls: true,
        lineStyle: { width: 1 },
        emphasis: { focus: "series" },
        data: dataPerDevice[device],
      }));

      this.option.xAxis.min = start;
      this.option.xAxis.max = end;
      this.option.series = seriesData;
      this.option.legend.data = devices;
      this.option.legend.selected = { "sm-46": true, "sm-47": true };
      this.option.title.text = "VOC Sensor Readings";
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
