import axios from "axios";
import { config } from "../../Backend/Constants.js";

const BASE_URL = config.url;

export default async function getAllTags() {
    try {
        const response = await axios.get(`${BASE_URL}/tags`);
        return response.data;
    } catch (e) {
        console.log("Error encountered getting all tags", e);
    }
  }