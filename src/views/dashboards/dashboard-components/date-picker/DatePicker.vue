<template>
  <div class="card bg-dark text-light p-2" style="max-width:800px;">
    <div class="row align-items-center">
      <div class="col-auto">
        <h6 class="mb-0 font-weight-bold">Date Range:</h6>
      </div>
      <div class="col-auto">
        <label for="startTime" class="sr-only">Start Date & Time</label>
        <input
          type="datetime-local"
          v-model="startTime"
          id="startTime"
          class="form-control-sm bg-secondary text-light border-0 datetime-input"
          :max="endTime"
          placeholder="Start"
        />
      </div>
      <div class="col-auto">
        <span class="text-muted">to</span>
      </div>
      <div class="col-auto">
        <label for="endTime" class="sr-only">End Date & Time</label>
        <input
          type="datetime-local"
          v-model="endTime"
          id="endTime"
          class="form-control-sm bg-secondary text-light border-0 datetime-input"
          :min="startTime"
          placeholder="End"
        />
      </div>
      <div class="col-auto">
      <button
        class="btn btn-success btn-sm font-weight-bold ml-2"
        @click="downloadCSV"
      >
        Download CSV
      </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      startTime: "",
      endTime: "",
      deviceId: "sm-49",
    };
  },
  methods: {

      toOffsetIso(datetimeLocal) {
      // Create a Date in the browser's local time from the datetime-local value
      // Note: Safari needs the "T" preserved; datetime-local already has it
      const d = new Date(datetimeLocal);
      if (Number.isNaN(d.getTime())) return null;

      // Build a string "YYYY-MM-DDTHH:mm:SS"
      const pad = (n) => String(n).padStart(2, "0");
      const Y = d.getFullYear();
      const M = pad(d.getMonth() + 1);
      const D = pad(d.getDate());
      const h = pad(d.getHours());
      const m = pad(d.getMinutes());
      const s = pad(d.getSeconds());

      // Local tz offset in minutes; east of UTC is negative here
      const tzMin = -d.getTimezoneOffset();
      const sign = tzMin >= 0 ? "+" : "-";
      const abs = Math.abs(tzMin);
      const offH = pad(Math.floor(abs / 60));
      const offM = pad(abs % 60);
      const offset = `${sign}${offH}:${offM}`;

      return `${Y}-${M}-${D}T${h}:${m}:${s}${offset}`;
    },

 
    async downloadCSV() {
      if (!this.startTime || !this.endTime) {
        alert("Please select both dates.");
        return;
      }

      const startIso = this.toOffsetIso(this.startTime);
      const endIso   = this.toOffsetIso(this.endTime);
      if (!startIso || !endIso) {
        alert("Invalid date/time.");
        return;
      }

      const params = new URLSearchParams({
        start_time: startIso,
        end_time: endIso,
        // add other filters if your CSV endpoint supports them, e.g. dev
        // dev: this.deviceId
      });

      // IMPORTANT: this is your CSV endpoint path you mentioned
      const url = `http://85.14.6.37:16455/api/siko_consumption/?${params.toString()}`;

      try {
        const res = await axios.get(url, { responseType: "blob" });

        // Try to get filename from the header, fallback if missing
        let filename = "consumption.csv";
        const dispo = res.headers["content-disposition"];
        if (dispo) {
          const m = dispo.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)/i);
          if (m && m[1]) filename = decodeURIComponent(m[1].replace(/["']/g, ""));
        }

        // Create a temporary link and click it
        const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
        const href = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = href;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(href);
      } catch (err) {
        console.error("CSV download failed:", err?.response?.data || err.message);
        alert("CSV download failed. Check console for details.");
      }
    },
  },
};
</script>

<style scoped>
.card {
  margin-bottom: 15px;
}

label {
  letter-spacing: 0.15em;
}

.btn-primary {
  background: linear-gradient(90deg, #3a81f1, #5bc0de);
  border: none;
}

/* Enhanced datetime-local input styling */
.datetime-input {
  cursor: pointer;
  position: relative;
  /* Compact sizing */
  padding: 4px 8px;
  font-size: 0.85rem;
  width: 180px;
  /* Remove any potential overlay issues */
  z-index: auto;
}

/* Restore native appearance and ensure full clickability */
input[type="datetime-local"].datetime-input {
  -webkit-appearance: none;
  -moz-appearance: textfield;
  appearance: none;
  background-color: #6c757d !important;
  color: #f8f9fa !important;
  border: 1px solid transparent;
  border-radius: 4px;
}

/* Style the calendar icon area */
input[type="datetime-local"].datetime-input::-webkit-calendar-picker-indicator {
  background: transparent;
  bottom: 0;
  color: transparent;
  cursor: pointer;
  height: auto;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  width: auto;
  /* Make the entire input clickable by expanding the picker indicator */
}

/* Firefox specific */
input[type="datetime-local"].datetime-input::-moz-calendar-picker-indicator {
  cursor: pointer;
}

/* Focus states */
input[type="datetime-local"].datetime-input:focus {
  border-color: #5bc0de !important;
  box-shadow: 0 0 6px #5bc0de !important;
  outline: none !important;
}

/* Hover effect */
input[type="datetime-local"].datetime-input:hover {
  background-color: #7a8288 !important;
}
</style>