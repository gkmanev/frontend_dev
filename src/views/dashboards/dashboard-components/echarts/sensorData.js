const VOC_DEVICES = ["sm-46", "sm-47"];
const TEMPERATURE_DEVICES = ["sm-46", "sm-47"];
const HUMIDITY_DEVICES = ["sm-46", "sm-47"];

let vocDatasetCache = null;
let temperatureDatasetCache = null;
let humidityDatasetCache = null;

function generateHourlyTimestamps(start, end) {
  const cursor = new Date(start);
  const timestamps = [];
  while (cursor <= end) {
    timestamps.push(cursor.toISOString());
    cursor.setUTCHours(cursor.getUTCHours() + 1);
  }
  return timestamps;
}

function generateVocDataset() {
  const now = new Date();
  const startOfYear = new Date(
    Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0, 0)
  );

  const timestamps = generateHourlyTimestamps(startOfYear, now);

  const dataPerDevice = VOC_DEVICES.reduce((acc, device) => {
    acc[device] = timestamps.map((timestamp) => {
      const value = Number((30 + Math.random() * 10).toFixed(2));
      return [timestamp, value];
    });
    return acc;
  }, {});

  return {
    devices: [...VOC_DEVICES],
    start: startOfYear.getTime(),
    end: now.getTime(),
    dataPerDevice,
  };
}

function generateTemperatureDataset() {
  const now = new Date();
  const startOfYear = new Date(
    Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0, 0)
  );

  const timestamps = generateHourlyTimestamps(startOfYear, now);

  const dataPerDevice = TEMPERATURE_DEVICES.reduce((acc, device, index) => {
    acc[device] = timestamps.map((timestamp) => {
      const base = 18.5 + index;
      const variation = (Math.random() - 0.5) * 3.5;
      const value = Math.min(22, Math.max(18, base + variation));
      return [timestamp, Number(value.toFixed(2))];
    });
    return acc;
  }, {});

  return {
    devices: [...TEMPERATURE_DEVICES],
    start: startOfYear.getTime(),
    end: now.getTime(),
    dataPerDevice,
  };
}

function generateHumidityDataset() {
  const now = new Date();
  const startOfYear = new Date(
    Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0, 0)
  );

  const timestamps = generateHourlyTimestamps(startOfYear, now);

  const dataPerDevice = HUMIDITY_DEVICES.reduce((acc, device, index) => {
    acc[device] = timestamps.map((timestamp) => {
      const base = 52 + index * 2;
      const variation = (Math.random() - 0.5) * 4;
      const value = Math.min(60, Math.max(50, base + variation));
      return [timestamp, Number(value.toFixed(2))];
    });
    return acc;
  }, {});

  return {
    devices: [...HUMIDITY_DEVICES],
    start: startOfYear.getTime(),
    end: now.getTime(),
    dataPerDevice,
  };
}

export function getVocDataset() {
  if (!vocDatasetCache) {
    vocDatasetCache = generateVocDataset();
  }
  return vocDatasetCache;
}

export function getTemperatureDataset() {
  if (!temperatureDatasetCache) {
    temperatureDatasetCache = generateTemperatureDataset();
  }
  return temperatureDatasetCache;
}

export function getHumidityDataset() {
  if (!humidityDatasetCache) {
    humidityDatasetCache = generateHumidityDataset();
  }
  return humidityDatasetCache;
}

export function getLatestReading(dataPerDevice) {
  return Object.entries(dataPerDevice).reduce((acc, [device, readings]) => {
    if (Array.isArray(readings) && readings.length) {
      const latest = readings[readings.length - 1];
      acc[device] = latest[1];
    }
    return acc;
  }, {});
}

export function filterDatasetByRange(range, dataPerDevice) {
  const { startTime, endTime } = getRangeBounds(range);

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
}

export function getRangeBounds(range) {
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
}

export function resetSensorDataCaches() {
  vocDatasetCache = null;
  temperatureDatasetCache = null;
  humidityDatasetCache = null;
}
