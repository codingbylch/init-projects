import axios from "axios";
import { BETA_URL, ONLINE_URL } from './common'

// 添加请求拦截器
axios.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// 添加响应拦截器
axios.interceptors.response.use(
  (response) => {
    // 返回客户端前，修改响应数据
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const service = ({ url = "", method = "get", params = {}, timeout = 3000, isBeta = false }) => {
  const httpDefault = {
    method,
    baseURL: isBeta ? BETA_URL : ONLINE_URL,
    // baseURL: 'https://mockserver.jd.com/mock/606ea823c3a90f00e645cdf3/example/queryScheme',
    url,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    withCredentials: true,
    params:
      method === "get" || method === "delete"
        ? {
          ...params,
        }
        : null,
    // data:
    //     method === 'post' || method === 'put'
    //         ? qs.stringify({
    //               ...params
    //           })
    //         : null,
    timeout,
  };

  return new Promise((resolve, reject) => {
    axios(httpDefault as any)
      // 此处的.then属于axios
      .then((res) => {
        // successState(res);
        resolve(res);
      })
      .catch((response) => {
        // errorState(response);
        reject(response);
      });
  });
};
export default service;
