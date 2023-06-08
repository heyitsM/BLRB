import { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import * as React from "react";

import { Typography } from "@mui/material";

import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import img from "../../images/Default_pfp.png"

import * as commentAPI from "../../api/comment.js";
import * as profileAPI from "../../api/Profile.js";
import * as userAPI from "../../api/user.js";

function HandleComment(props) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const token = localStorage.getItem("user-token");

  const { comment, setCommentsUpdated, post, userId, editable } = props;

  const onDeleteComment = async () => {
    await commentAPI.removeComment(token, comment.id);
    setCommentsUpdated(true);
  };

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
      let tempUser = await userAPI.getUser(token, userId);
      setUser(tempUser.data);

      let tempProfile = await profileAPI.getProfile(token, userId);
      setProfile(tempProfile.data);
    })();
  }, []);

  return (
    <>
      {user && profile ? (
        <CardContent>
          <Grid
            container
            direction="column"
            justifyItems={"flex-start"}
            alignContent={"flex-start"}
            spacing={2}
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
                < Avatar 
                    src={profile.profile_pic ? profile.profile_pic : img} 
                    sx={{width:"40px", height:"40px", bgcolor: stringToColor(user.username)}}
                  />
                </Grid>
                <Grid item>
                  <Grid 
                    container
                    direction="row"
                    justifyContent="flex-start"
                    alignItems="flex-start"
                    spacing={1}
                  >
                    <Grid item>
                      <Typography variant={"body1"} fontSize={16} fontWeight={"bold"}>
                        <strong>{profile.display_name}</strong>
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography color={"#707070"} fontSize={14} variant={"subtitle2"}>
                        {"@" + user.username}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid position={"absolute"} right={"30%"} item>
                  {editable ? (
                        <IconButton color="primary" onClick={() => onDeleteComment()}>
                          <DeleteOutlinedIcon />
                        </IconButton>
                      ) : (
                        <></>
                      )}
                </Grid>                
              </Grid>
              <Grid item>
                <Typography>{comment.body}</Typography>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      ) : (
        <></>
      )}
    </>
  );
}

export default HandleComment;
