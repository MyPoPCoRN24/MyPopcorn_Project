import axios from "axios";

export const baseUrl = "https://api.mypopcorn.io";

const url = axios.create({
  baseURL: "https://api.mypopcorn.io",
});

url.interceptors.request.use(
  function (config) {
    console.log("=======config=============", config);
    config.withCredentials = true;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

url.interceptors.response.use(
  function (response) {
    console.log("=======response=============", response);
    return response;
  },
  function (error) {
    console.log("=======error=============", error);
    if (error && error?.response?.status === 401) {
      window.location.href = "/auth/login";
      return;
    }    
    return Promise.reject(error);
  }
);

export default url;
