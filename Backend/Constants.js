// Constants.js
const production = {
  url: "https://comm-api.onrender.com",
  frontend_url:"https://comm-u8cy.onrender.com",
  supabase_url: "https://bqrvqfnrjhaiocnyrjvv.supabase.co",
  anon_key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxcnZxZm5yamhhaW9jbnlyanZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzY5MTY4MTksImV4cCI6MTk5MjQ5MjgxOX0.9fgQViAaVUF6uyqAxYEASZD9VGbV2IRDB3A4hu1lBLU",
  db_url: "postgresql://postgres:ZMBndal4MMCq0D8c@db.bqrvqfnrjhaiocnyrjvv.supabase.co:5432/postgres"
};

const development = {
  url: "http://localhost:3000",
  frontend_url:"http://localhost:5173",
  supabase_url: "https://mofzfumunbqymkabdmae.supabase.co",
  anon_key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZnpmdW11bmJxeW1rYWJkbWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzc4NTU3NzEsImV4cCI6MTk5MzQzMTc3MX0.Ngf5Ctc-OYEI2AKFI2qK1dVU1scPkSkeKMPr3Pk_AME",
  db_url: "postgresql://postgres:okhCIVXosRC8cEyH@db.mofzfumunbqymkabdmae.supabase.co:5432/postgres"
};
export const config = process.env.NODE_ENV === "development" ? development : production;