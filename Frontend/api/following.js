import axios from "axios";
import { config } from "../../Backend/Constants.js";

const BASE_URL = config.url;

async function getFollowing(token, followingId) {
  const response = await axios.get(`${BASE_URL}/followings/${followingId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.data;
}

// get the following row of a two users: getFollowingByFilter({ follower_id, blrbo_id })
//   -> if data is an empty array if follower does not follow the blrbo
//   -> if follower does follow blrbo, data is an ARRAY of one following object
//   -> use the id of this following object to remove the like
// to get all users that follow a user (or a blrbo): getFollowingByFilter({ blrbo_id })
// to get all users (or blrbos) that a user follows: getFollowingByFilter({ follower_id })

async function getFollowingByFilter(token, { follower_id, blrbo_id }) {
  const response = await axios.get(`${BASE_URL}/followings`, {
    params: { follower_id, blrbo_id },
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

async function addFollowing(token, { follower_id, blrbo_id }) {
  // add new like row to following table
  const response = await axios.post(`${BASE_URL}/followings`, {
    follower_id,
    blrbo_id,
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.data;
}

// first use getFollowingByFilter({ follower_id, blrbo_id }) to get the following object
async function removeFollowing(token, followingId) {
  // delete following row from followings table
  const response = await axios.delete(`${BASE_URL}/followings/${followingId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.data;
}


export { getFollowing, getFollowingByFilter, addFollowing, removeFollowing };