import { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import * as React from "react";
import * as commentAPI from "../../api/comment.js";
import * as profileAPI from "../../api/Profile.js";
import * as userAPI from "../../api/user.js";
import img from "../../images/Default_pfp.png"

function Comment(props) {
    const [ user, setUser ] = useState(null);
    const [ profile, setProfile ] = useState(null);

    const { setShowComments, setCommentsUpdated, post, userId } = props;
    const token = localStorage.getItem("user-token");

    const [comment, setComment] = useState("");

    const handleOnComment = (event) => {
        setComment(event.target.value);
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

    const handleOnPost = async () => {
        try {
            await commentAPI.addComment(token, {userId: userId, postId: post.id, body: comment});
            setShowComments(true);
            setCommentsUpdated(true);
            setComment("");
        } catch (e) {
            console.log(e)
        }
    };

  return (
    <>
    {user && profile ? (
      <Paper 
        elevation={0}
        sx={{display: "flex", alignItems: "flex-start", margin:"10px" }}
      >
        <Avatar 
          src={profile.profile_pic ? profile.profile_pic : img} 
          sx={{width:"30px", height:"30px", bgcolor: stringToColor(user.username)}}
        />
        <InputBase
          sx={{ ml: 3, flex: 1 }}
          placeholder="Add a comment..."
          inputProps={{ "aria-label": "add a comment" }}
          onChange={handleOnComment}
          data-id="input"
          multiline
          value={comment}
        />
        <Button 
          variant="outlined"
          color="tertiary"
          size="large"
          sx={{
            width:"100px",
            ":hover": {
              bgcolor: "tertiary.main",
              variant:"contained",
              color:"#121212"
            }
          }}
          onClick={handleOnPost}
        >
            Post
        </Button>     
      </Paper>   
    ) : (
      <></>
    )}
    </>
  );
}

export default Comment;
