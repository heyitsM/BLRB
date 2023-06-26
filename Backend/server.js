import app from "./index.js";
import * as dotenv from "dotenv";
import { config } from './Constants.js';

dotenv.config();
const API_URL = config.url;
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`BLRB API at ${API_URL}`);
});
