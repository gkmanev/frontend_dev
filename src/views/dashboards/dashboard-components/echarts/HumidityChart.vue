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
import { filterDatasetByRange, getHumidityDataset } from "./sensorData";

use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  GridComponent,
  LineChart,
  CanvasRenderer,
]);

export default {
  name: "HumidityChart",
  components: {
    VChart,
  },
  data() {
    return {
      humidityDataset: null,
      option: {
        title: {
          text: "Относителна влажност",
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
                  )}%`
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
            name: "Humidity (%)",
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
    ...mapState(["dateRange", "selectedDev"]),
    isClientRoute() {
      const path = this.$route?.path || "";
      return path.includes("/dashboard/client");
    },
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
    selectedDev(newDev, oldDev) {
      if (newDev !== oldDev) {
        this.fetchData();
      }
    },
  },
  methods: {
    fetchData() {
      if (!this.humidityDataset) {
        this.humidityDataset = getHumidityDataset();
      }
      this.applyHumidityData();
    },
    applyHumidityData() {
      if (!this.humidityDataset) {
        return;
      }

      const { devices, dataPerDevice } = this.humidityDataset;
      const { filteredData, startTime, endTime } = filterDatasetByRange(
        this.dateRange,
        dataPerDevice
      );

      const devicesToDisplay = this.getDevicesToDisplay(devices);

      this.option.series = devicesToDisplay.map((device) => ({
        name: device,
        type: "line",
        sampling: "lttb",
        showSymbol: false,
        connectNulls: true,
        lineStyle: { width: 2 },
        data: filteredData[device] || [],
      }));

      this.option.legend.data = devicesToDisplay;
      this.option.legend.selected = devicesToDisplay.reduce((acc, device) => {
        acc[device] = true;
        return acc;
      }, {});

      this.option.xAxis.min = startTime;
      this.option.xAxis.max = endTime;
    },
    getDevicesToDisplay(devices) {
      if (!this.isClientRoute) {
        return devices;
      }

      if (!this.selectedDev) {
        return devices;
      }

      const filtered = devices.filter((device) => device === this.selectedDev);
      return filtered.length ? filtered : devices;
    },
  },
};
</script>

<style scoped>
.chart {
  height: 450px;
}
</style>
