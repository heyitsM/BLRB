import axios from "axios";
import { config } from "../../Backend/Constants.js";

const BASE_URL = config.url;

async function decodeToken(token) {
    const response = await axios.get(`${BASE_URL}/tokens/${token}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    return response.data.body["id"];
}

export { decodeToken };