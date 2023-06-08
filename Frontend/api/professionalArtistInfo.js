import axios from "axios";
import { config } from "../../Backend/Constants.js";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = config.url;
// const BASE_URL = "https://comm-api.onrender.com";
const supabase = createClient(config.supabase_url, config.anon_key);

function getResumeByUserId(userId) {
  const { data } = supabase.storage
    .from("public")
    .getPublicUrl(`resume/${userId}.pdf`);

  if (data) {
    return data.publicUrl;
  } else {
    throw new Error(
      "problem getting the specified resume. try again later"
    );
  }
}

async function uploadResume(token, file, userId) {
  const url = `resume/${userId}.pdf`;
  const { data, error } = await supabase.storage
    .from("public")
    .upload(url, file, {
      upsert:true,
      cacheControl:60,
    });
  if (error) {
    console.log(error);
  }

  const pdf_link = getResumeByUserId(userId);
  const response = await axios.put(
    `${BASE_URL}/professionalArtistInfos/${userId}`,
    {
      pdf_link,
    }, {
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

async function deleteResume(token, userId) {
  const url = `resume/${userId}.pdf`;
  const { data, error } = await supabase.storage.from("public").remove([url]);
  if (error) {
    throw new Error(
      "Problem completing this deletion. Please try again later."
    );
  }

  const response = await axios.put(
    `${BASE_URL}/professionalArtistInfos/${userId}`, 
    {
      pdf_link:null
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (response) {
    return response.data;
  } else {
    throw new Error(
      "Problem completing this deletion. Please try again later."
    );
  }
}

async function getAllInfos() {
  const response = await axios.get(`${BASE_URL}/professionalArtistInfos`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

async function getInfo(token, id) {
  const response = await axios.get(`${BASE_URL}/professionalArtistInfos/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

async function getInfoByFilter(token, {
  commission_rules,
  accepting_commissions,
  stripeAccountID,
  pdf_link
}) {
  const response = await axios.get(
    `${BASE_URL}/professionalArtistInfos/${id}`,
    {
      params: { commission_rules, accepting_commissions, stripeAccountID, pdf_link },
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
}

async function createInfo(token, {
  id,
  commission_rules,
  accepting_commissions,
  stripeAccountID,
  pdf_link,
}) {
  const response = await axios.post(`${BASE_URL}/professionalArtistInfos`, {
    id,
    commission_rules,
    accepting_commissions,
    stripeAccountID,
    pdf_link,
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

async function updateInfo(token, {
  commission_rules,
  accepting_commissions,
  stripeAccountID,
  id,
  pdf_link
}) {
  const response = await axios.put(
    `${BASE_URL}/professionalArtistInfos/${id}`,
    {
      commission_rules,
      accepting_commissions,
      stripeAccountID,
      pdf_link,
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
}

async function removeInfo(token, id) {
  const response = await axios.delete(
    `${BASE_URL}/professionalArtistInfos/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
}

export {
  getAllInfos,
  getInfoByFilter,
  getInfo,
  createInfo,
  updateInfo,
  removeInfo,
  getResumeByUserId,
  uploadResume, 
  deleteResume
};
