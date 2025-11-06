export const ALLOWED_IDS = ["sm-46", "sm-47"];

export const CUSTOMER_MAP = {
  "sm-46": "Костинброд",
  "sm-47": "Балша",
};

export function getDisplayName(deviceId, fallback = "") {
  return CUSTOMER_MAP[deviceId] || fallback || deviceId;
}
