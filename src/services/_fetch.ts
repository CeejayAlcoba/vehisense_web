import axios from "axios";
import { toast } from "react-toastify";

const LOCAL_BASE ="http://localhost:5044/api/";
const ONLINE_BASE="https://vehisense-api.runasp.net/api/";

const _fetch = axios.create({
  baseURL: ONLINE_BASE,
  timeout: 6000,
  headers: { "X-Custom-Header": "foobar" },
});

// Request Interceptor
_fetch.interceptors.request.use(
  (config) => {
    config.headers["X-Custom-Header"] = "foobar";
    return config;
  },
  (error) => {
    toast.error(error.response.data??error.message);
    return Promise.reject(error);
  }
);

// Response Interceptor
_fetch.interceptors.response.use(
  (response) => response,
  (error) => {
    toast.error(error.response.data??error.message);
    return Promise.reject(error);
  }
);

export default _fetch;
