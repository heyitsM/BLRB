import {
    Avatar,
    Card,
    CardActionArea,
    Chip,
    Grid,
    Typography,
    Box,
  } from "@mui/material";
  import { useNavigate } from "react-router";
  import { useEffect, useState } from "react";
  import { getProfile } from "../../api/Profile";
  import FollowButton from "../Follow/FollowButton";
  import img from "../../images/Default_pfp.png"
  
  export default function ExploreAccountCard(props) {
    let userId = localStorage.getItem("user-id");
    let token = localStorage.getItem("user-token");
    const { user, mode } = props;
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [followingObj, setFollowingObj] = useState(null);
  
    useEffect(() => {
      if (userId != user.id) {
        (async () => {
          const profileData = (await getProfile(token, user.id)).data;
          setProfile(profileData);
        })();
      }
    }, []);
    
    let blrbo_id = user.id;
  
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
      { profile && user && (userId !== user.id) ?
        <Card variant="outlined" sx={{ bgcolor:"#2a2a2a"}}>
            <CardActionArea data-testid="account-action-area" onClick={handleOnClick}>
              <Box display="flex" padding={2} width={"100%"} alignItems={"center"}>      
                <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={1}
                >
                    <Grid item>
                      <Grid
                        container
                        direction="row"
                        justifyContent="flex-start"
                        alignItems="flex-start"
                        spacing={1}
                      >
                        <Grid item>
                          <Avatar 
                            data-testid="avatar"
                            src={profile.profile_pic ? profile.profile_pic : img} 
                            sx={{width:"40", height:"40", bgcolor: stringToColor(user.username)}}
                          />
                        </Grid>
                        <Grid item>
                          <Grid
                              container
                              direction="column"
                              justifyContent="flex-start"
                              alignItems="flex-start"
                              spacing={.1}
                          >
                              <Grid item>
                                  <Typography data-testid="displayname" variant={"body1"} fontWeight={"bold"}>
                                      {profile.display_name}
                                  </Typography>
                              </Grid>
                              <Grid item>
                                  <Typography data-testid="username" variant="subtitle" color={"#707070"}>{"@" + user.username}</Typography>
                              </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item>
                        <FollowButton
                            event={(event) => event}
                            userId={userId}
                            blrbo_id={blrbo_id}
                        />
                    </Grid>
                </Grid>
              </Box>
            </CardActionArea>
            
        </Card> : null}
      </>
  }
  