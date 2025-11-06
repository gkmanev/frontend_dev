<template>
  <div>
    <b-form-select
      v-model="selected"
      :options="options"
      @change="setSelected"
    ></b-form-select>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import { getVocDataset } from "../echarts/sensorData";
import { ALLOWED_IDS, getDisplayName } from "../echarts/deviceConfig";

const PLACEHOLDER_OPTION = {
  value: null,
  text: "Select a device",
  disabled: true,
};

export default {
  data() {
    return {
      selected: null,
      options: [{ ...PLACEHOLDER_OPTION }],
    };
  },
  computed: {
    ...mapState(["all_devs", "selectedDev"]),
    availableDevices() {
      const dataset = getVocDataset();
      const deviceIds = dataset?.devices || [];
      if (!ALLOWED_IDS?.length) {
        return deviceIds;
      }
      return deviceIds.filter((id) => ALLOWED_IDS.includes(id));
    },
  },
  watch: {
    all_devs: {
      handler() {
        this.populateOptions();
      },
      deep: true,
    },
    selectedDev: {
      handler(newVal) {
        if (newVal !== this.selected) {
          this.selected = newVal;
        }
      },
      immediate: true,
    },
  },
  created() {
    this.populateOptions();
  },
  methods: {
    ...mapActions(["updateSelected"]),
    setSelected(value) {
      this.selected = value;
      this.updateSelected(value);
    },
    populateOptions() {
      const options = this.availableDevices.map((deviceId) => {
        const deviceMeta = this.all_devs.find((dev) => dev.id === deviceId) || {};
        const label = getDisplayName(deviceId, deviceMeta.customer);
        const status = deviceMeta.online ? ` • ${deviceMeta.online}` : "";
        return {
          value: deviceId,
          text: `${label ? `${label} (${deviceId})` : deviceId}${status}`,
        };
      });

      this.options = [{ ...PLACEHOLDER_OPTION }, ...options];

      const activeOption = options.find((opt) => opt.value === this.selectedDev);

      if (activeOption) {
        this.selected = activeOption.value;
      } else if (options.length) {
        this.selected = options[0].value;
        this.updateSelected(options[0].value);
      } else {
        this.selected = null;
        this.updateSelected(null);
      }
    },
  },
};
</script>
