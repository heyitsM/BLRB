import axios from "axios";
import { config } from "../../Backend/Constants.js";

const BASE_URL = config.url;

async function getComment(token, commentId) {
  const response = await axios.get(`${BASE_URL}/comments/${commentId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

// to get all comments for a post with postId: getCommentByFilter({ postId })
// to get all comments made by a user: getCommentByFilter({ userId })

async function getCommentByFilter(token, { userId, postId }) {
  const response = await axios.get(`${BASE_URL}/comments`, {
    params: { userId, postId },
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

async function addComment(token, { userId, postId, body }) {
  const response = await axios.post(`${BASE_URL}/comments`, {
    userId,
    postId,
    body,
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.data;
}

async function removeComment(token, commentId) {
  const response = await axios.delete(`${BASE_URL}/comments/${commentId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.data;
}

export { getComment, getCommentByFilter, addComment, removeComment };