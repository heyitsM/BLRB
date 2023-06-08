import axios from "axios";
import { config } from "../../Backend/Constants.js";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = config.url;
const supabase = createClient(config.supabase_url, config.anon_key);

// for each returned object get call getPortfolioImage() using the id
export default async function login(email, pwd) {
  const response = await axios.post(`${BASE_URL}/login`, {
    email: email,
    password: pwd,
  });

  return {"data":response.data.data, "token":response.data.token};
}
