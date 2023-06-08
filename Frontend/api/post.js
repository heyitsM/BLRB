import axios from "axios";
import { config } from "../../Backend/Constants.js";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = config.url;
const supabase = createClient(config.supabase_url, config.anon_key);


async function getAllPosts(token) { 
  const response = await axios.get(`${BASE_URL}/posts`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

async function getPost(token, id) {
  const response = await axios.get(`${BASE_URL}/posts/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

// USE TO SEARCH POSTS or get all posts of one user
// tags is an array of strings
// body is any part of the body of a post
async function getPostByFilter(token, { userId, body, tags }) {
  const response = await axios.get(`${BASE_URL}/posts`, {
    params: { userId, body, tags },
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

// if post has an associated image use uploadPostImage after this call to upload it
async function createPost(token, { userId, body, tags }) {
  const response = await axios.post(`${BASE_URL}/posts`, {
    userId,
    body,
    tags,
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.data;
}

function getPostImageURLById(postId) {
  const { data } = supabase.storage
    .from("public")
    .getPublicUrl(`post/${postId}.jpg`);

  if (data) {
    return data.publicUrl;
  } else {
    throw new Error("problem getting the specified post. try again later");
  }
}

async function uploadPostImage(token, file, postId) {
  const url = `post/${postId}.jpg`;
  const { data, error } = await supabase.storage
    .from("public")
    .upload(url, file);
  if (error) {
    console.log(error);
  }
  // add img url to post data
  const img = getPostImageURLById(postId);
  const response = await axios.put(`${BASE_URL}/posts/${postId}`, {
    img,
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response) {
    return response.data;
  } else {
    throw new Error(
      "Problem completing this creation. Please try again later."
    );
  }
}

async function removePost(token, id) {
  const response = await axios.delete(`${BASE_URL}/posts/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const url = `post/${id}.jpg`;
  const { data, error } = await supabase.storage.from("public").remove([url]);
  if (error) {
    throw new Error(
      "Problem completing this deletion. Please try again later."
    );
  }

  if (response) {
    return response.data;
  } else {
    throw new Error(
      "Problem completing this deletion. Please try again later."
    );
  }
}

async function getNumLikes(token, postId) {

  const response = await axios.get(`${BASE_URL}/postLikes`, {
    params: { postId },
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.data.data.length;
}

// get the like row of a post if post is liked
// data is an empty list if post is not liked
// if post is liked data is a list of one like object
// use the id of this like object to remove the like
async function getLike(token, postId, userId ) {
  const response = await axios.get(`${BASE_URL}/postLikes`, {
    params: { postId, userId },
    headers: {
      'Authorization': `Bearer ${token}`
    }
  
  });
  return response.data;
}

async function getLikesByFilter(token, { postId, userId }) {
  const response = await axios.get(`${BASE_URL}/postLikes`, {
    params: { postId, userId },
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}


async function addLike(token, postId, userId ) {
  // add new like row to PostLike table
  const response = await axios.post(`${BASE_URL}/postLikes`, {
    postId,
    userId,
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  // get number of likes on specific post
  const responseLikes = await axios.get(`${BASE_URL}/postLikes`, {
    params: { postId },
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  // update number of likes on post
  const responsePost = await axios.put(`${BASE_URL}/posts/${postId}`, {
    num_likes: responseLikes.data.data.length,
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.data;
}

async function removeLike(token, likeId) {
  // delete like row from likes table
  const response = await axios.delete(`${BASE_URL}/postLikes/${likeId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const postId = response.data.data.postId;
  // get number of likes on specific post
  const responseLikes = await axios.get(`${BASE_URL}/postLikes`, {
    params: { postId },
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  // update number of likes on post
  const responsePost = await axios.put(`${BASE_URL}/posts/${postId}`, {
    num_likes: responseLikes.data.data.length,
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

export {
  getAllPosts,
  getPostByFilter,
  getPost,
  createPost,
  uploadPostImage,
  removePost,
  getNumLikes,
  getLike,
  getLikesByFilter,
  addLike,
  removeLike,
};
