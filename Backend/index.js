import express from "express";
import cors from "cors";
import helmet from "helmet";

import users from "./routes/users.js"
const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the Comm API!");
});

app.use(users);

app.use((err, req, res, next) => {
  if (err) {
    const code = err.status || 500;
    res.status(code).json({
      status: code,
      message: err.message || `Internal Server Error!`,
    });
  }
  next();
});

export default app;
