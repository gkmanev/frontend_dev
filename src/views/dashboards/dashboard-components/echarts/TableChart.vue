<template>
  <b-row>
    <b-col cols="12">
      <b-card class="mb-4">
        <h5 class="card-title mb-3">Installed Smartmeters</h5>

        <b-table
          :items="all"
          :fields="fields"
          :select-mode="selectMode"
          responsive="sm"
          ref="selectableTable"
        >
          <template #cell(selected)="data">
            <b-form-checkbox
              v-model="data.item.selected"
              @change="toggleRowSelection(data.item)"
            />
          </template>

          <!-- online status LED -->
          <template #cell(status)="{ item }">
            <span class="led-indicator" :class="getLedClass(item.online)"></span>
          </template>
        </b-table>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapState, mapActions } from "vuex";
import axios from "axios";

const ALLOWED_IDS = ["sm-46", "sm-47"];

export default {
  name: "SmartmeterTableSm46Sm47",

  data() {
    return {
      selectMode: "multi",
      selected: [],
      fields: [
        { key: "selected", sortable: false },
        { key: "id", sortable: true },
        { key: "status", sortable: true },
        { key: "customer", sortable: true },
        { key: "power", sortable: true, label: "Power kW" },
        { key: "capacity", label: "Capacity" },
        { key: "clsA", sortable: true, label: "Cluster A" },
        { key: "clsB", sortable: true, label: "Cluster B" },
        { key: "clsC", sortable: true, label: "Cluster C" },
      ],
      power: "",
      powerCorr: "",
      time: "",
      countDown: {},
      polling: null,
      newEntries: {},
      singleCorrection: {},
      checked: true,
      allSelected: true,
      activeClass: "disabled",
      btn_class: "btn btn-success mb-2",
      all: [],
      posts: [],
      preparedArrForLineChartsToggle: [],
      online: [],
    };
  },

  methods: {
    ...mapActions(["checkedDevsCreation", "selectBoxDevsCreation"]),

    initializeSelection() {
      this.all.forEach((item) => {
        item.selected = true;
      });
    },

    toggleRowSelection() {
      // Build { 'sm-46': true/false, 'sm-47': true/false }
      const allDevsMap = this.all.reduce((acc, item) => {
        acc[item.id] = !!item.selected;
        return acc;
      }, {});
      this.selectBoxDevsCreation(allDevsMap);
    },

    async pollData() {
      this.polling = setInterval(async () => {
        await this.createAllDevs();
        await this.capacityLog();
        await this.asignedNodes();
      }, 15000);
    },

    async capacityLog() {
      axios
        .get("http://85.14.6.37:16455/api/capa_asign/")
        .then((response) =>
          response.data.forEach((el) => {
            const found = this.all.find((element) => element.id === el.dev);
            if (found) found.capacity = el.capacity;
          })
        )
        .catch((error) => console.log(error));
    },

    async asignedNodes() {
      axios
        .get("http://85.14.6.37:16455/api/grid_asign/")
        .then((response) =>
          response.data.forEach((el) => {
            const found = this.all.find((element) => element.id === el.dev);
            if (found) found.grid = el.grid_name;
          })
        )
        .catch((error) => console.log(error));
    },

    getLedClass(status) {
      switch (status) {
        case "not-ready":
          return "led-blue";
        case "offline":
          return "led-gray";
        case "ready":
          return "led-green";
        case "providing":
          return "led-orange";
        default:
          return "";
      }
    },

    updateDeviceStatus() {
      // Start from Vuex-provided all_devs, but keep only sm-46 & sm-47
      const filteredBase = (this.all_devs || []).filter((d) =>
        ALLOWED_IDS.includes(d.id)
      );

      const deviceMap = {};
      filteredBase.forEach((dev) => {
        deviceMap[dev.id] = {
          ...dev,
          selected: dev.selected ?? true, // default selected
        };
      });

      // Apply latest online snapshot (only those two IDs)
      (this.online || []).forEach((entry) => {
        if (!ALLOWED_IDS.includes(entry.devId)) return;
        const dev = deviceMap[entry.devId];
        if (dev) {
          dev.online = entry.value >= 0 ? "not-ready" : "offline";
          dev.power = entry.value;
        }
      });

      // Finalize "all" table items: just the two, sorted numerically
      this.all = Object.values(deviceMap)
        .sort((a, b) => {
          const aId = parseInt(a.id.split("-")[1], 10);
          const bId = parseInt(b.id.split("-")[1], 10);
          return aId - bId;
        })
        .filter((dev) => ALLOWED_IDS.includes(dev.id));
    },

    async createAllDevs() {
      const url = `http://85.14.6.37:16455/api/siko/?date_range=today`;
      axios.get(url).then((response) => {
        const data = response.data.data || [];
        if (!data.length) {
          this.online = [];
          this.updateDeviceStatus();
          return;
        }

        // Find most recent timestamp and take unique latest records
        const mostRecentTimestamp = data.reduce((latest, item) => {
          return new Date(item.created_date) > new Date(latest)
            ? item.created_date
            : latest;
        }, data[0]?.created_date);

        const uniqueLatestRecords = Object.values(
          data
            .filter((item) => item.created_date === mostRecentTimestamp)
            .reduce((acc, item) => {
              acc[item.devId] = item;
              return acc;
            }, {})
        );

        // keep only sm-46 & sm-47 here too
        this.online = uniqueLatestRecords.filter((r) =>
          ALLOWED_IDS.includes(r.devId)
        );

        this.updateDeviceStatus();
      });
    },
  },

  created() {
    this.createAllDevs();
    this.capacityLog();
    this.asignedNodes();
    this.pollData();

    // Select all shown rows by default
    this.$nextTick(() => {
      if (this.$refs.selectableTable) {
        this.$refs.selectableTable.selectAllRows();
      }
    });
  },

  mounted() {
    this.initializeSelection();
  },

  beforeDestroy() {
    clearInterval(this.polling);
  },

  computed: {
    isDisabled() {
      return !this.power || !this.countDown;
    },
    ...mapState(["all_devs"]),
  },
};
</script>

<style scoped>
.led-indicator {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 5px;
}

.led-blue {
  background-color: skyblue;
}

.led-gray {
  background-color: gray;
}

.led-green {
  background-color: green;
}

.led-orange {
  background-color: orange;
}
</style>
