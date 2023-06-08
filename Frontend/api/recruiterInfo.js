import axios from "axios";
import { config } from "../../Backend/Constants.js";

const BASE_URL = config.url;

async function getAllInfos(token) {
    const response = await axios.get(`${BASE_URL}/recruiterInfos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}

async function getInfoByFilter(token, { company, position, company_email }) {
    const response = await axios.get(`${BASE_URL}/recruiterInfos`, 
        {
            params: { company, position, company_email }
        },
        {
            headers: {
              'Authorization': `Bearer ${token}`
            }
        },
    );
    return response.data;
}

async function getInfo(token, id) {
    const response = await axios.get(`${BASE_URL}/recruiterInfos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}

async function createInfo(token, { id, company, position, company_email }) {
    const response = await axios.post(`${BASE_URL}/recruiterInfos`, {
        id,
        company,
        position,
        company_email
    }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}

async function updateInfo(token, { id, company, position, company_email }) {
    const response = await axios.put(`${BASE_URL}/recruiterInfos/${id}`, {
        company,
        position,
        company_email
    }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}

async function removeInfo(token, id) {
    const response = await axios.delete(`${BASE_URL}/recruiterInfos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}

export {
    getAllInfos,
    getInfoByFilter,
    getInfo,
    createInfo,
    updateInfo,
    removeInfo,
  };