import { baseURL } from "@/baseURL";
import axios from "axios";
const api = axios.create({
  baseURL: baseURL + "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default api;
