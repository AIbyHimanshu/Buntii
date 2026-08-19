import axios from "axios";

export const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign"];

export function stashAttribution(search) {
  try {
    const params = new URLSearchParams(search);
    const found = {};
    UTM_KEYS.forEach((k) => {
      const v = params.get(k);
      if (v) found[k] = v;
    });
    const ref = params.get("ref");
    if (ref) found.referred_by = ref;
    if (Object.keys(found).length) {
      sessionStorage.setItem("buntii_attr", JSON.stringify(found));
    }
  } catch (e) { /* noop */ }
}

export function getAttribution() {
  try {
    return JSON.parse(sessionStorage.getItem("buntii_attr") || "{}");
  } catch (e) {
    return {};
  }
}

export function formatApiError(error, fallback = "Something went wrong. Give it another go.") {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => d?.msg).filter(Boolean).join(" ");
  return fallback;
}
