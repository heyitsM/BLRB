import axios from "axios";
import { config } from "../../Backend/Constants.js";

const BASE_URL = config.url;
// const BASE_URL = "https://comm-api.onrender.com";

async function getAllCommissions(token) {
  const response = await axios.get(`${BASE_URL}/commissions`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

async function getCommission(token, id) {
  const response = await axios.get(`${BASE_URL}/commissions/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

async function getCommissionByFilter(token, { artist_id, commissioner_id, status }) {
  const response = await axios.get(`${BASE_URL}/commissions`, {
    params: { artist_id, commissioner_id, status },
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

async function createCommission(token, {
  artist_id,
  commissioner_id,
  title,
  description,
  notes,
}) {
  const response = await axios.post(`${BASE_URL}/commissions`, {
    artist_id,
    commissioner_id,
    title,
    description,
    notes,
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

async function updateCommission(token, { id, price, status }) {
  const response = await axios.put(`${BASE_URL}/commissions/${id}`, {
    price,
    status,
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

async function removeCommission(token, id) {
  const response = await axios.delete(`${BASE_URL}/commissions/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

export {
  getAllCommissions,
  getCommissionByFilter,
  getCommission,
  createCommission,
  updateCommission,
  removeCommission,
};
