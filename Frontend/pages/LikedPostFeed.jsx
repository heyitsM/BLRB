import { useState, useEffect } from "react";
import { Stack } from "@mui/system";
import Grid from "@mui/material/Grid";
import Post from "../components/Posts/Post.jsx";
import * as React from "react";
import * as postAPI from "../api/post.js";

function LikedPostFeed(props) {
  const { userId, editable } = props;
  const [posts, setPosts] = useState([]);

  const token = localStorage.getItem("user-token");

  useEffect(() => {
    (async () => {
      let likesData = await postAPI.getLikesByFilter(token, { userId });
      let data = [];
      for (const like of likesData.data) {
        const postData = await postAPI.getPost(token, like.postId);
        data.push(postData.data);
      }
      setPosts(data);
    })();
  }, []);


  return (
    <>
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justify="center"
        style={{ minHeight: "100vh" }}
      >
        <Grid item xs={3}>
          <Stack direction="column" spacing={2}>
            {posts.map((post, index) => (
              <React.Fragment key={index}>
                <Post
                  post={post}
                  index={index}
                  editable={editable}
                  setPostsUpdated={((x) => (x))}
                />
              </React.Fragment>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}

export default LikedPostFeed;
