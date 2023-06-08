import axios from "axios";
import { config } from "../../Backend/Constants.js";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(config.supabase_url, config.anon_key);

const BASE_URL = config.url;

// To go in Profile.js

async function createProfile(token, { user_id, display_name, bio, img, tags }) {
  const use_display_name = true;
  const response = await axios.post(`${BASE_URL}/profiles`, {
    user_id,
    display_name,
    bio,
    use_display_name,
    img,
    tags,
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
});
  return response.data;
}

// role should either be FORFUN, PROFESSIONAL, or RECRUITER
async function setUserType(token, user_id, role) {
  const response = await axios.put(`${BASE_URL}/users/${user_id}`, {
    role,
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
});
  return response.data;
}

//get profile by user id
async function getProfile(token, user_id) {
  try {
    const response = await axios.get(`${BASE_URL}/profiles/${user_id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (err) {
    return Promise.resolve();
  }
}

//get user role by user id
async function getUserType(token, user_id) {
  const response = await axios.get(`${BASE_URL}/users/${user_id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data.role;
}

//tag in this case would be a string- ONE TAG ONLY
async function getAllProfiles(token, {
  display_name,
  bio,
  use_display_name,
  tag,
  img,
}) {
  const response = await axios.get(`${BASE_URL}/profiles`, {
    display_name,
    bio,
    use_display_name,
    tag,
    img,
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.data;
}

//Update any of this info
//NOTE if you are putting tags in here (array of strings), MUST ALSO put in a boolean for tag_connect (true if you want to add them, false if you want to delete them)
// use_display_name should be boolean, tag_connect is a boolean, tags is an array of strings, and the rest are strings
async function updateProfile(token, {
  user_id,
  display_name,
  use_display_name,
  bio,
  img,
  tags
}) {
  use_display_name = true;
  let filter = { user_id, display_name, use_display_name, bio, img, tags }

  // but this is never true?
  if (tags && tags.length !== 0) {
    
    filter["tag_connect"] = true;

    const profile = await getProfile(token, user_id);
    let tempTags = profile.data.tags;

    const delete_tags = await axios.put(`${BASE_URL}/profiles/${user_id}`, {
    tags: tempTags,
      tag_connect: false //change to false if having problems here
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
      }
    });
    
    
    if (delete_tags.status !== 201) {
      throw new Error("Failed to delete current tags");
    }
  }
  const response = await axios.put(`${BASE_URL}/profiles/${user_id}`, filter, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

async function deleteProfile(token, user_id) {
  const response = await axios.delete(`${BASE_URL}/profiles/${user_id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

async function deleteAllProfiles(token) {
  const response = await axios.delete(`${BASE_URL}/profiles`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

//partial is string- partial display name or username
//tag array is an array of strings
//need to convert to query params here
async function userSearch(token, partial, tag_array) {
    let i = 0;
    let urlparams = "";
    
    for (i = 0; i < tag_array.length; i++) {
        urlparams += `tags=${tag_array[i]}&`;
    }

    urlparams += `partial=${partial}`;
    // let url = `${BASE_URL}/search/users/?${urlparams}`;
    // return url;
    //return `${BASE_URL}/profiles/search/?${urlparams}`;
    const searched = await axios.get(`${BASE_URL}/profiles/search/?${urlparams}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return searched.data;
}

function getProfileImageByUserId(user_id) {
  const { data } = supabase.storage
    .from("public")
    .getPublicUrl(`profile/${user_id}.jpg`);

  if (data) {
    return data.publicUrl;
  } else {
    throw new Error(
      "problem getting the specified profile image. try again later"
    );
  }
}

async function uploadProfileImage(token, file, user_id) {
  const url = `profile/${user_id}.jpg`;

  try {
    let { data, error } = await supabase.storage
      .from("public")
      .upload(url, file, {
        upsert: true,
        cacheControl: 60,
      });
  } catch (err) {
    console.log(err);
  }
  const img = getProfileImageByUserId(user_id);
  const updated = await updateProfile(token, { user_id, img });
  
  return updated.data;
}

async function deleteProfileImage(token, user_id, updateDate) {
  const url = `profile/${user_id}.jpg`;

  const { data, error } = await supabase.storage.from("public").remove([url]);
  if (error) {
    throw new Error(
      "Problem completing this deletion. Please try again later."
    );
  }

  const response = await updateProfile(token, {user_id, img:null});

  if (response) {
    return response.data;
  } else {
    throw new Error(
      "Problem completing this deletion. Please try again later."
    );
  }
}

export { createProfile, setUserType, getProfile, getAllProfiles, getUserType, updateProfile, deleteProfile, deleteAllProfiles, getProfileImageByUserId, uploadProfileImage, userSearch, deleteProfileImage };

