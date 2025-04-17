import axios from "axios";
import { toast } from "react-toastify";
import { TIMEOUT_REQUEST } from "../configs/request.config";
import { LOCAL_BASE, ONLINE_BASE } from "../configs/baseurl.config";


const _fetch = axios.create({
  baseURL: LOCAL_BASE,
  timeout: TIMEOUT_REQUEST,
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
