<template>
  <b-card class="mb-4">
    <div class="mt-4">
      <v-chart class="chart" height="250" :option="option" autoresize />
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
]);

const DEVICES = ["Thermostat A", "Thermostat B"];

export default {
  name: "PriceChart",
  components: {
    VChart,
  },
  data() {
    return {
      temperatureDataset: null,
      option: {
        title: {
          text: "Temperature Readings",
          left: "center",
          textStyle: {
            fontSize: 16,
            color: "#b2b9bf",
            fontFamily: "Arial",
            fontWeight: "normal",
          },
        },
        tooltip: {
          trigger: "axis",
          borderWidth: 0,
          backgroundColor: "rgba(17, 20, 27, 0.9)",
          textStyle: {
            color: "#ffffff",
          },
          formatter: (params) => {
            if (!params || !params.length) {
              return "";
            }
            const date = new Date(params[0].value[0]);
            const dateLabel = date.toLocaleString(undefined, {
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            });
            const lines = params
              .map(
                (item) =>
                  `${item.marker}${item.seriesName}: ${Number(item.value[1]).toFixed(
                    2
                  )}°C`
              )
              .join("<br/>");
            return `${dateLabel}<br/>${lines}`;
          },
        },
        legend: {
          data: [],
          selected: {},
          bottom: 0,
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "20%",
          containLabel: true,
        },
        xAxis: {
          type: "time",
          boundaryGap: false,
          axisLabel: {
            color: "#9a9a9a",
            rotate: 40,
          },
        },
        yAxis: [
          {
            type: "value",
            name: "Temperature (°C)",
            nameTextStyle: {
              color: "#9a9a9a",
            },
            axisLabel: {
              color: "#9a9a9a",
            },
            splitLine: {
              show: false,
            },
          },
        ],
        dataZoom: [
          {
            height: 20,
            handleSize: "75%",
            show: true,
            dataBackground: {
              areaStyle: {
                color: "#9a9a9a",
              },
            },
            start: 0,
            end: 100,
          },
        ],
        series: [],
      },
    };
  },
  computed: {
    ...mapState(["dateRange"]),
  },
  mounted() {
    this.fetchData();
  },
  watch: {
    dateRange(newRange, oldRange) {
      if (newRange !== oldRange) {
        this.fetchData();
      }
    },
  },
  methods: {
    fetchData() {
      if (!this.temperatureDataset) {
        this.temperatureDataset = this.generateFakeTemperatureData();
      }
      this.applyTemperatureData();
    },
    generateFakeTemperatureData() {
      const now = new Date();
      const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0, 0));
      const dataPerDevice = DEVICES.reduce((acc, device) => {
        acc[device] = [];
        return acc;
      }, {});

      const cursor = new Date(startOfYear);
      while (cursor <= now) {
        DEVICES.forEach((device, index) => {
          const base = 18.5 + index;
          const variation = (Math.random() - 0.5) * 3.5; // Keeps values roughly between 18-22
          const value = Math.min(22, Math.max(18, base + variation));
          dataPerDevice[device].push([cursor.toISOString(), Number(value.toFixed(2))]);
        });
        cursor.setUTCHours(cursor.getUTCHours() + 1);
      }

      return {
        devices: [...DEVICES],
        start: startOfYear.getTime(),
        end: now.getTime(),
        dataPerDevice,
      };
    },
    applyTemperatureData() {
      if (!this.temperatureDataset) {
        return;
      }

      const { devices, dataPerDevice } = this.temperatureDataset;
      const { filteredData, startTime, endTime } = this.filterDataForRange(
        this.dateRange,
        dataPerDevice
      );

      this.option.series = devices.map((device) => ({
        name: device,
        type: "line",
        sampling: "lttb",
        showSymbol: false,
        connectNulls: true,
        lineStyle: { width: 2 },
        data: filteredData[device],
      }));

      this.option.legend.data = devices;
      this.option.legend.selected = devices.reduce((acc, device) => {
        acc[device] = true;
        return acc;
      }, {});

      this.option.xAxis.min = startTime;
      this.option.xAxis.max = endTime;
    },
    filterDataForRange(range, dataPerDevice) {
      const { startTime, endTime } = this.getRangeBounds(range);

      const filteredData = Object.entries(dataPerDevice).reduce(
        (acc, [device, readings]) => {
          acc[device] = readings.filter(([timestamp]) => {
            const time = new Date(timestamp).getTime();
            return time >= startTime && time <= endTime;
          });
          return acc;
        },
        {}
      );

      return { filteredData, startTime, endTime };
    },
    getRangeBounds(range) {
      const now = new Date();
      const startOfMonth = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)
      );
      const startOfToday = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          0,
          0,
          0,
          0
        )
      );
      const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0, 0));

      let startTime = startOfMonth.getTime();
      if (range === "today") {
        startTime = startOfToday.getTime();
      } else if (range === "year") {
        startTime = startOfYear.getTime();
      }

      return { startTime, endTime: now.getTime() };
    },
  },
};
</script>

<style scoped>
.chart {
  height: 450px;
}
</style>
