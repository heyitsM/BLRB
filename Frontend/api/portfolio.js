import axios from "axios";
import { config } from "../../Backend/Constants.js";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = config.url;
const supabase = createClient(config.supabase_url, config.anon_key);

// for each returned object get call getPortfolioImage() using the id
async function getAllPortfolioItems(token, userId) {
  // get an array of portfolio items
  const response = await axios.get(`${BASE_URL}/portfolioItems`, {
    params: { userId: userId },
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (response) {
    return response.data;
  } else {
    throw new Error(
      `${"problem getting all portfolio items. try again later"}`
    );
  }
}

function getPortfolioImageURLById(portfolioItemId) {
  const { data } = supabase.storage
    .from("public")
    .getPublicUrl(`portfolio/${portfolioItemId}.jpg`);

  if (data) {
    return data.publicUrl;
  } else {
    throw new Error(
      "problem getting the specified portfolio item. try again later"
    );
  }
}

/*  idk how the database works and if you whether you need userID to make this work
     
*/
async function updatePortfolioItem(token, itemId, { title, description, tags }) {
  const response = await axios.put(`${BASE_URL}/portfolioItems/${itemId}`, {
    title,
    description,
    tags,
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response) {
    return response.data;
  } else {
    throw new Error("Problem editting this portfolio item. Try again later");
  }
}

async function deletePortfolioItem(token, portfolioItemId) {
  const response = await axios.delete(
    `${BASE_URL}/portfolioItems/${portfolioItemId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  const url = `portfolio/${portfolioItemId}.jpg`;
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

// file and title are req'd, desc and tags are not
// portfolio item tags are not ready yet
async function createPortfolioItem(token, userId, file, { title, description, tags }) {
  // tags.push("visual art");
  const response = await axios.post(`${BASE_URL}/portfolioItems`, {
    userId,
    title,
    description,
    tags,
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

async function createPortfolio(token, { userId }) {
  const response = await axios.post(`${BASE_URL}/portfolios`, {
    userId,
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

async function uploadPortfolioItemImage(token, file, portfolioItemId) {
  const url = `portfolio/${portfolioItemId}.jpg`;
  const { data, error } = await supabase.storage
    .from("public")
    .upload(url, file);
  if (error) {
    console.log(error);
  }

  const img = getPortfolioImageURLById(portfolioItemId);
  const response = await axios.put(
    `${BASE_URL}/portfolioItems/${portfolioItemId}`,
    {
      img,
    }, 
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (response) {
    return response.data;
  } else {
    throw new Error(
      "Problem completing this creation. Please try again later."
    );
  }
}

export {
  createPortfolio,
  getAllPortfolioItems,
  updatePortfolioItem,
  deletePortfolioItem,
  createPortfolioItem,
  uploadPortfolioItemImage,
  getPortfolioImageURLById,
};
