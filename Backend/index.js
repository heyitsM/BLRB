import express from "express";
import users from "./routes/users.js"
import portfolios from "./routes/portfolios.js"
import portfolioItems from "./routes/portfolioItems.js"
import profiles from "./routes/profiles.js"
import payments from "./routes/payments.js"
import commissions from "./routes/commissions.js"
import posts from "./routes/posts.js"
import postLikes from "./routes/postLikes.js"
import comments from "./routes/comments.js"
import followings from "./routes/followings.js"
import professionalArtistInfos from "./routes/professionalArtistInfos.js"
import emails from "./routes/emails.js"
import login from "./routes/auth.js"
import recruiterInfos from "./routes/recruiterInfos.js"
import tokenRoutes from "./routes/tokenroutes.js"

import cors from "cors";
import helmet from "helmet";
import tags from "./routes/tags.js"

const app = express();

app.use(cors());
app.use(helmet());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the Comm API!");
});

app.use(users);
app.use(portfolios);
app.use(portfolioItems);
app.use(profiles);
app.use(payments);
app.use(commissions);
app.use(posts);
app.use(postLikes);
app.use(comments);
app.use(followings);
app.use(professionalArtistInfos);
app.use(emails);
app.use(login);
app.use(recruiterInfos);
app.use(tags);
app.use(tokenRoutes);
app.use(followings);
app.use(comments);

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
