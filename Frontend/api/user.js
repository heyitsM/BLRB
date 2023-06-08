import axios from "axios";
import { config } from "../../Backend/Constants.js";

const BASE_URL = config.url;
// const BASE_URL = "https://comm-api.onrender.com";
// const BASE_URL = "http://localhost:3000";

async function getAllUsers(token) {
  const response = await axios.get(`${BASE_URL}/users`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

async function getUserByUsername(token, username) {
  const response = await axios.post(`${BASE_URL}/users/search`, {
    username,
}, {
  headers: {
    'Authorization':`Bearer ${token}`
  }
});
  return response.data;
}

async function getUser(token, id) {
  const response = await axios.get(`${BASE_URL}/users/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

async function createUser({
  username,
  first_name,
  last_name,
  email,
  password,
  role,
}) {
  const response = await axios.post(`${BASE_URL}/users`, {
    username,
    first_name,
    last_name,
    email,
    password,
    role,
  });
  return {"data": response.data.data, "token": response.data.token};
}

async function updateUser(token, {
  id,
  username,
  first_name,
  last_name,
  email,
  password,
  role,
}) {
  const response = await axios.put(`${BASE_URL}/users/${id}`, {
    username,
    first_name,
    last_name,
    email,
    password,
    role,
  }, {
    headers: {
      'Authorization':`Bearer ${token}`
    }
  });
  return response.data;
}

async function removeUser(id) {
  const response = await axios.delete(`${BASE_URL}/users/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

export {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  removeUser,
  getUserByUsername,
};
