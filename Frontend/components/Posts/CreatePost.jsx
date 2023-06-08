import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import { IconButton } from "@mui/material";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import * as profileAPI from "../../api/Profile.js";
import * as postAPI from "../../api/post.js";
import * as userAPI from "../../api/user.js";
import Tags from "../Tags.jsx";
import img from "../../images/Default_pfp.png"
import styled from "@emotion/styled";
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';

const CustomTextField = styled(TextField)((theme) =>( {
  "& label.Mui-focused": {
    color: "#EA526F"
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "#EA526F"
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderRadius: 20,
      borderColor: "#bdbdbd"
    },
    "&:hover fieldset": {
      borderColor: "#ffffff"
    },
    "&.Mui-focused fieldset": {
      borderRadius: 20,
      borderColor: "#EA526F"
    }
  }
}));

function CreatePost(props) {
  const { setPosts, setPostsUpdated } = props;
  const userId = localStorage.getItem("user-id");
  const token = localStorage.getItem("user-token");
  const [ user, setUser ] = useState(null) 
  const [profileImage, setProfileImg] = useState(null)
  const [val, setVal] = useState("");
  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [body, setBody] = useState("");
  const [tags, setTags] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      let data = await postAPI.getPostByFilter(token, {userId})
      setPosts(data.data);

      let tempUser = await userAPI.getUser(token, userId);
      setUser(tempUser.data)

      let tempProfileImg = (await profileAPI.getProfile(token, userId)).data;
      setProfileImg(tempProfileImg.profile_pic)
    })()
  }, []);

  function stringToColor(string) {
    let hash = 0;
    let i;
  
    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
  
    let color = '#';
  
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */
  
    return color;
  }

  const handleChange = (e) => {
    const { value } = e.target;
    setBody(value);
    // setNewPost({ ...newPost, body: value });
  };

  const handleOnPost = async () => {
    try {
      let data = await postAPI.createPost(token,
        {userId, body: body, tags: tags})
      let postItem = data.data;
      if(file) {
        await postAPI.uploadPostImage(token, file, postItem.id);
        setFile(null);
      }      

      setVal("");
      setBody("");
      setTags([]);
      setPostsUpdated(true);
    } catch (e) {
      console.log(e)
    }

  };

  const handleFileSelection = (event) => {
    if ((event.target.files[0].size >= 8000000)) {
      event.target.value = null
      window.alert("Image cannot be larger than 8mb.");
    } else {
        setFile(event.target.files[0]);
        setPreviewImage(URL.createObjectURL(event.target.files[0]));
    }
  };

  const handleResubmit = (event) => {
    setFile(null);
    setPreviewImage(null)
  };

  return (
    <Card data-testid="create-post" variant="outlined">
      <CardContent>
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="flex-start" 
          mb={3}
          spacing={2}
        >
          <Grid item >
            <Avatar 
                src={profileImage ? profileImage : img} 
                sx={{width:"48px", height:"48px", bgcolor: stringToColor(user ? user.username : "")}}
            />
          </Grid>
          <Grid item xs={10}>
            <CustomTextField
              fullWidth
              multiline
              maxRows={5}
              placeholder="What's on your mind?"
              value={body}
              onChange={(e) => handleChange(e)}
            />
          </Grid>
        </Grid>
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={3}
        >
          <IconButton color="primary" aria-label="upload picture" component="label">
            <input hidden accept="image/*" type="file" 
            onChange={handleFileSelection}/>
            <ImageIcon sx={{ width:"30px", height:"30px"}} />
          </IconButton>  
          <Grid item>
            <Tags tags={tags} setTags={setTags}/>
          </Grid>
          <Grid item>
            <Button 
              variant="outlined"
              color="tertiary"
              size="large"
              sx={{
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
          </Grid>
        </Grid>
        {file ? (
          <>
            <Grid
              container
              direction="row"
              justifyContent="center"
              alignItems="flex-start"
              my={2}
            >
              <img
                src={previewImage}
                height={200}
              />
              <IconButton color="primary" onClick={handleResubmit}>
                <CloseIcon/>
              </IconButton>
            </Grid>
          </>
        ) : (
          <></>
        )}
      </CardContent>
      <CardActions>
        <Stack direction={"column"} spacing={2}>
        </Stack>
      </CardActions>
    </Card>
  );
}

export default CreatePost;
