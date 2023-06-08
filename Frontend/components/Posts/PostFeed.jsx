import { useState, useEffect } from "react";
import CreatePost from "./CreatePost";
import { Stack } from "@mui/system";
import Grid from "@mui/material/Grid";
import Post from "./Post";
import * as React from "react";
import * as postAPI from "../../api/post.js";

function PostFeed(props) {
  const { userId, editable } = props;   
  const [posts, setPosts] = useState([]);

  const [postsUpdated, setPostsUpdated] = useState(false);

  //const userId = localStorage.getItem("user-id");
  const token = localStorage.getItem("user-token");

  useEffect(() => {
    (async () => {
      let data = await postAPI.getPostByFilter(token, {userId});
      setPosts(data.data)
    }
    )();
  }, []);

  const getPosts = async () => {
    try {
      let data =  await postAPI.getPostByFilter(token, {userId})
      setPosts(data.data)
    } catch (e) {
      console.log(e.message);
    }
  };

  useEffect(() => {
    if (postsUpdated) {
      (async () => {
        await getPosts();
        setPostsUpdated(false);
      })();
    }
  }, [postsUpdated]);

  return (
    <>
      <Grid
        container
        direction="column"
      > 
        <Grid item>
          {editable ? <CreatePost setPosts={setPosts} posts={posts} setPostsUpdated={setPostsUpdated} postsUpdated={postsUpdated}/> : null}
        </Grid>
        <Grid item>
          <Stack direction="column-reverse" spacing={2}>
            {posts.map((post, index) => (
              <React.Fragment key={index}>
                <Post post={post} index={index} editable={editable} setPostsUpdated={setPostsUpdated}/>
              </React.Fragment>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}

export default PostFeed;
