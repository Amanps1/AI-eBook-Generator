import axios from "axios"

import {BASE_URL} from "./apiPaths"

const axiosInstance=axios.create({
    baseURL:BASE_URL,
    headers:{
        "Content-Type":"application/json",
        Accept:"application/json"
    }
});

axiosInstance.interceptors.request.use(
    (config)=>{
        const token=localStorage.getItem("token");
        if(token){
            config.headers["Authorization"]=`Bearer ${token}`;
        }
        return config;
    },
    (error)=>{
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response)=>{
        return response;
    },
    (error)=>{
        if(error.response?.status===401){
            localStorage.clear();
            window.location.href='/login';
        }else if(error.response?.status===500){
           console.log("Internal Server Error");
        }else if(error.response?.code === "ECONNABORTED"){
            console.log("Request timed out");
        }
        return Promise.reject(error);
    }
);


export default axiosInstance;