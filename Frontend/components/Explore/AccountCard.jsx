import {
  Avatar,
  Card,
  CardActionArea,
  Chip,
  Grid,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router";
import { Image } from "mui-image";
import { useEffect, useState } from "react";
import { getProfile } from "../../api/Profile";
import * as followingAPI from "../../api/following";
import FollowButton from "../Follow/FollowButton";
import img from "../../images/Default_pfp.png"

export default function AccountCard(props) {
  let userId = localStorage.getItem("user-id");
  let token = localStorage.getItem("user-token");
  const { user, mode } = props;
  const navigate = useNavigate();
  const [ extraTags, setExtraTags ] = useState(0);
  const [profile, setProfile] = useState(null);


  useEffect(() => {
    if (userId !== user.id) {
      (async () => {
        const profileData = (await getProfile(token, user.id)).data;
  
        if (profileData.tags.length > 3) {
          setExtraTags(profileData.tags.length - 3);
          profileData.tags.splice(3);
        }
        
        setProfile(profileData);
      })();
    }
  }, []);
  
  let blrbo_id = user.id;

  const displayRole = () => {
    return user.role === "PROFESSIONALY"
      ? "Professional Artist"
      : user.role === "RECRUITER"
      ? "Business Recruiter"
      : "Casual Artist";
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

  function handleOnClick() {
    navigate(`/profile/${user.username}`);
  }

  return <>
    { profile && user && (userId !== user.id)?
    <Card sx={{ bgcolor:"#2a2a2a"}}>
      <CardActionArea data-testid="account-action-area" onClick={handleOnClick}>
        <Box display="flex" padding={2} width={"100%"} alignItems={"center"}>      
          <Grid
            container
            direction="column"
            justifyContent="flex-start"
            alignItems="center"
            spacing={3}
          >
            <Grid item>
              <Grid
                container
                direction="row"
                justifyContent="flex-start"
                alignItems="flex-start"
                spacing={3}
              >
                <Grid item>
                  <Avatar 
                    src={profile.profile_pic ? profile.profile_pic : img} 
                    sx={{width:"70px", height:"70px", bgcolor: stringToColor(user.username)}}
                  />
                </Grid>
                <Grid item>
                  <Grid
                    container
                    direction="column"
                    justifyContent="flex-start"
                    alignItems="flex-start"
                    spacing={.25}
                  >
                    <Grid item>
                      <Typography variant={"h6"} fontWeight={"bold"}>
                        {profile.display_name}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="body1" color={"#707070"}>{"@" + user.username}</Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="subtitle" color={"#707070"}>{displayRole()}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid ml={"7em"} alignSelf={"center"} item>
                  <FollowButton
                    event={(event) => event}
                    userId={userId}
                    blrbo_id={blrbo_id}
                  />
                </Grid>
              </Grid>
            </Grid>
            { mode === "search" ?
              <Grid item>
                <Grid 
                  container 
                  direction="row" 
                  justifyContent="center"
                  alignItems="center"
                  spacing={0.5}
                >
                  {profile.tags.map((t) => (
                    <Grid key={Math.random() * 10000000} item>
                      <Chip label={`#${t}`} />
                    </Grid>
                  ))}
                  { extraTags > 0 ?
                    <Grid item>
                      <Typography>
                        {`+${extraTags}`}
                      </Typography>
                    </Grid>
                  : <></>}
                </Grid>
              </Grid>
            : null}
          </Grid>
        </Box>
      </CardActionArea>
      
    </Card> : null}
    </>
}
