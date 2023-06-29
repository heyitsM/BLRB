// Constants.js
import * as dotenv from "dotenv";
dotenv.config();

const production = {
  url: "https://comm-api.onrender.com",
  frontend_url:"https://comm-u8cy.onrender.com",
  supabase_url: process.env.DATABASE_PROD_BASE_URL,
  anon_key: process.env.DATABASE_PROD_ANON_KEY,
  db_url: process.env.DATABASE_PROD_URL
};

const development = {
  url: "http://localhost:3000",
  frontend_url:"http://localhost:5173",
  supabase_url: process.env.DATABASE_DEV_BASE_URL,
  anon_key: process.env.DATABASE_DEV_ANON_KEY,
  db_url: process.env.DATABASE_DEV_URL
};
export const config = process.env.NODE_ENV === "development" ? development : production;