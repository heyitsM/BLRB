import { useState, useEffect } from "react";
import Header from "../Header";
import {
  Typography,
  Divider,
  CardActionArea,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import IconButton from "@mui/material/IconButton";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import * as profileAPI from "../../api/Profile.js";
import * as postAPI from "../../api/post.js";
import * as userAPI from "../../api/user.js";
import * as React from "react";
import CommentFeed from "./CommentFeed";

import img from "../../images/Default_pfp.png";

function Post(props) {
  const { post, index, editable, setPostsUpdated } = props;
  const [like, setLike] = useState(false);
  const [numLikes, setNumLikes] = useState(0);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const userId = localStorage.getItem("user-id");
  const token = localStorage.getItem("user-token");
  const navigate = useNavigate();

  function stringToColor(string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
  }

  useEffect(() => {
    (async () => {
      let tempUser = await userAPI.getUser(token, post.userId);
      setUser(tempUser.data);

      let tempProfile = await profileAPI.getProfile(token, post.userId);
      setProfile(tempProfile.data);

      let tempNumLikes = await postAPI.getNumLikes(token, post.id);
      setNumLikes(tempNumLikes);

      let like = (await postAPI.getLike(token, post.id, userId)).data[0];
      setLike(like ? true : false);
    })();
  }, []);

  const removePost = async (event) => {
    setLike(false);
    await postAPI.removePost(token, post.id);
    setPostsUpdated(true);
  };

  const handleLike = async (e) => {
    let temp = !like;
    if (temp) {
      await postAPI.addLike(token, post.id, userId);
      let tempNumLikes = await postAPI.getNumLikes(token, post.id);
      setLike(temp);
      setNumLikes(tempNumLikes);
    } else {
      let like = (await postAPI.getLike(token, post.id, userId)).data[0];
      await postAPI.removeLike(token, like.id);
      let tempNumLikes = await postAPI.getNumLikes(token, post.id);
      setLike(temp);
      setNumLikes(tempNumLikes);
    }
  };

  return (
    <>
      {user && profile ? (
        <Card variant="outlined">
          {editable ? (
            <Grid
              container
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
              margin={1}
            >
              <Grid item>
                <Grid
                  container
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="center"
                  spacing={2}
                >
                  <Grid item>
                    <Avatar
                      src={profile.profile_pic ? profile.profile_pic : img}
                      sx={{
                        width: "48",
                        height: "48",
                        bgcolor: stringToColor(user.username),
                      }}
                    />
                  </Grid>
                  <Grid item>
                    <Typography component={"span"} variant={"subtitle1"}>
                      {profile.display_name + "   "}
                    </Typography>
                    <Typography component={"span"} variant="subtitle2">
                      {"@" + user.username}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid justifySelf={"flex-end"} item>
                {editable ? (
                  <IconButton onClick={() => removePost(index)}>
                    <DeleteOutlinedIcon
                      sx={{
                        color: "#EA526F",
                        position: "relative",
                        right: "40px",
                      }}
                    />
                  </IconButton>
                ) : (
                  <div />
                )}
              </Grid>
            </Grid>
          ) : (
            <CardActionArea
              onClick={() => navigate(`/profile/${user.username}`)}
            >
              <Grid
                container
                direction="row"
                justifyContent="flex-start"
                alignItems="center"
                spacing={2}
                margin={1}
              >
                <Grid item>
                  <Avatar
                    src={profile.profile_pic ? profile.profile_pic : img}
                    sx={{
                      width: "48",
                      height: "48",
                      bgcolor: stringToColor(user.username),
                    }}
                  />
                </Grid>
                <Grid item>
                  <Typography
                    component={"span"}
                    variant={"subtitle1"}
                    sx={{ fontWeight: "bold", fontSize: 20 }}
                  >
                    {profile.display_name + "   "}
                  </Typography>
                  <Typography
                    component={"span"}
                    variant="subtitle2"
                    color={"#707070"}
                  >
                    {"@" + user.username}
                  </Typography>
                </Grid>
                <Grid justifySelf={"flex-end"} item>
                  {editable ? (
                    <IconButton onClick={() => removePost(index)}>
                      <DeleteOutlinedIcon sx={{ color: "#EA526F" }} />
                    </IconButton>
                  ) : (
                    <div />
                  )}
                </Grid>
              </Grid>
            </CardActionArea>
          )}
          <CardContent>
            <Grid
              container
              justifyItems={"center"}
              alignContent={"center"}
              spacing={2}
            >
              <Grid item>
                <Typography>{post.body}</Typography>
              </Grid>
            </Grid>
          </CardContent>
          {post.img ? (
            <CardMedia
              component="img"
              image={post.img}
              width={500}
              sx={{ objectFit: "contain" }}
            />
          ) : (
            <></>
          )}
          <CardContent>
            <Grid
              container
              justifyContent={"center"}
              alignItems={"center"}
              direction={"column"}
            >
              {post.tags.length === 0 ? (
                <></>
              ) : (
                <Grid item>
                  <Grid
                    container
                    direction="row"
                    justifyContent={"center"}
                    alignItems={"center"}
                    spacing={0.5}
                  >
                    {post.tags.map((t) => (
                      <Grid key={Math.random() * 10000000} item>
                        <Chip
                          size="small"
                          sx={{ margin: 0.2 }}
                          label={`#${t}`}
                          onClick={(e) => {
                            navigate("/search", {
                              state: { title: t, toggle: "posts" },
                            });
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )}
              <Grid item>
                {!editable ? (
                  <IconButton aria-label="like" onClick={handleLike}>
                    {like ? (
                      <FavoriteIcon sx={{ color: "#FC9D9A" }} />
                    ) : (
                      <FavoriteBorderIcon sx={{ color: "#ffffff" }} />
                    )}
                    <Typography marginRight={2} sx={{ color: "#ffffff" }}>
                      {numLikes === 0 ? "" : numLikes}
                    </Typography>
                  </IconButton>
                ) : (
                  <></>
                )}
              </Grid>
            </Grid>
          </CardContent>
          <Divider sx={{ height: 28 }} orientation="horizontal" />
          <CommentFeed post={post} userId={userId} />
          
        </Card>
      ) : (
        <></>
      )}
    </>
  );
}

export default Post;
