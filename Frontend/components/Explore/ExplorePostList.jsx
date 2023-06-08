import { Box, Divider, Grid, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Post from "../Posts/Post";
import * as postsAPI from "../../api/post.js";
import * as followingAPI from "../../api/following.js";

export default function ExplorePosts(props) {
  const { mode } = props;
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState("");
  const userId = localStorage.getItem("user-id");
  const token = localStorage.getItem("user-token");

  useEffect(() => {
    (async () => {
      let temp = await postsAPI.getAllPosts(token);
      if (mode === "new") {
        setPosts((temp.data).reverse());
        setMessage("No posts exist... Try making your own!");
      } else if (mode === "following") {
        const blrboData = await followingAPI.getFollowingByFilter(token, { follower_id: userId });
        const blrbos = blrboData.data;
        let blrboIdSet = new Set();
        blrbos.forEach((follow) => {
          blrboIdSet.add(follow.blrbo_id);
        });
        let newTemp = temp.data.filter((post) => {
          return blrboIdSet.has(post.userId);
        });
        setPosts(newTemp);
        setMessage("The people you follow have no posts... Try following more users!");
      }
    })();
  }, []);

  return (
    <>
      <Stack
        sx={{ marginTop: "2em"}}
        direction="column"
        justifyContent="center"
        spacing={2}
      >
        <Box my={2} justifyContent="center" marginBottom={2}>
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            spacing={2}
            marginBottom={2}
          >
            {posts.length !== 0 ? (
              posts.map((p) => (
                <Grid key={p.id} item xs={12}>
                  <div data-testid="post">
                    <Post post={p} editable={false} />
                  </div>
                </Grid>
              ))
            ) : (
              <Typography>{message}</Typography>
            )}
          </Grid>
        </Box>
      </Stack>
    </>
  );
}
