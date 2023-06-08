import { Avatar, Box, Button, Chip, Grid, Typography } from "@mui/material";
import img from "../../images/Default_pfp.png"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as followingAPI from "../../api/following";
import * as recruiterAPI from "../../api/recruiterInfo";
import FollowButton from "../Follow/FollowButton";
import MailTo from "../MailTo";
import BusinessIcon from '@mui/icons-material/Business';

export default function ProfileInfo(props) {
  const { user, username, userBio, displayName, profile, handleOnEdit, editable, role, outsideRole } = props;
  const [followingNum, setFollowingNum] = useState(0);
  const [followerNum, setFollowerNum] = useState(0);

  const [recruiterInfo, setRecruiterInfo] = useState(null)

  let userId = localStorage.getItem("user-id");
  const navigate = useNavigate();
  const token = localStorage.getItem("user-token");

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

  useEffect(() => {
    (async () => {
      if (userId && token) {
        if (user.role === "RECRUITER") {
          let data = await recruiterAPI.getInfo(token, user.id);
          setRecruiterInfo(data.data)
        }

        let myFollowers = await followingAPI.getFollowingByFilter(token, {
          blrbo_id: user.id,
        });
        setFollowingNum(myFollowers.data.length);

        let myBlrbos = await followingAPI.getFollowingByFilter(token, {
          follower_id: user.id,
        });
        
        setFollowerNum(myBlrbos.data.length);
      } else {
        navigate("/forbidden", { replace: true });
      }
    })();
  }, [])

  function onFollowingClick() {
    navigate(`/profile/${user.username}/following`);
  }

  function onFollowersClick() {
    navigate(`/profile/${user.username}/followers`);
  }

  return (
    <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="flex-start"
        spacing={2}
      >
        <Grid
            container
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            padding={3}
          >
            <Grid item>
              <Avatar 
                  data-testid="avatar"
                  src={profile.profile_pic ? profile.profile_pic : img} 
                  sx={{width:"20vh", height:"20vh", bgcolor: stringToColor(user ? user.username : "")}}
              />
            </Grid>
            <Grid item margin={1}>
            {editable ? (
                <Button
                  data-testid="edit-prof-button"
                  color="tertiary"
                  size="small"
                  variant="outlined"
                  sx={{
                    ":hover": {
                      bgcolor: "tertiary.main",
                      variant:"contained",
                      color:"#121212"
                    }, 
                    fontSize:"16px"
                  }}
                  onClick={handleOnEdit}
                >
                  Edit
                </Button>
            ) : 
            <>
              <Grid alignSelf={"center"} item>
                <Grid
                  container
                  direction={"row"} 
                  justifyContent={"center"}
                  spacing={1}
                >
                  { outsideRole === "RECRUITER" ? 
                    <Grid item>
                      {role !== "FOR_FUN" ? <MailTo data-testid="mail-button" email={recruiterInfo ? recruiterInfo.company_email : user.email}/> : <></>}
                    </Grid>
                  : null}
                  <Grid item>
                    <FollowButton
                      data-testid="follow-button"
                      event={(event) => event}
                      userId={userId}
                      blrbo_id={user.id}
                    />
                  </Grid>           
                </Grid>
              </Grid>
            </>
            }
            </Grid>
        </Grid>
        <Grid item>
          <Grid>
            <Grid item>
              <Typography data-testid="displayname" variant="h4">
                {displayName}
              </Typography>
            </Grid>
            <Grid item>
              <Typography data-testid="username" variant="subtitle" color={"#707070"}>
                {`@${username}`}
              </Typography>
            </Grid>
            { recruiterInfo ? 
              <Grid alignItems={"center"} item>
                <Grid
                  container
                  direction="row"
                  justifyContent="center"
                  alignItems="center" 
                >
                  <Grid item>
                    <BusinessIcon sx={{ mr:1, mt:.5,color:"#bdbdbd" }}/>
                  </Grid>
                  <Grid item>
                    <Typography data-testid="company-info" variant="h6" color={"#bdbdbd"}>
                      {`${recruiterInfo.position} at ${recruiterInfo.company}`}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            : null}
            <Grid item  data-testid="tags">
              <Box marginTop={1}>
                  <Grid
                      container
                      direction="row"
                      spacing={.5}
                  >
                      {((profile.tags).map((t) => 
                          <Grid key={Math.random() * 10000000} item>
                            <Chip label={`${t}`} color="primary" onClick={(e) => { navigate("/search", {state:{title:t, toggle:"users"}}) }} />
                          </Grid>
                      ))}
                  </Grid>
              </Box>
            </Grid>
          </Grid>
        </Grid>
        <Grid item width={"90%"} paddingX={3}>
          <Typography
            data-testid="bio"
            sx={{
              wordWrap:"break-word"
            }}
          >
              {userBio}
          </Typography>
        </Grid>
        <Grid alignSelf={"center"} item m={2}>
          <Grid container spacing={8} py={1}>
            <Grid item>
              <Button
                data-testid="followingButton"
                width="500"
                maxWidth="100%"
                fontSize={15}
                onClick={onFollowingClick}
              >
                {`${followerNum} Following`}
              </Button>
            </Grid>
            <Grid item>
              <Button
                data-testid="followersButton"
                maxWidth="100%"
                fontSize={15}
                onClick={onFollowersClick}
              >
                {followingNum == 1 ? (
                  <>{`${followingNum} Follower`}</>
                ) : (
                  <>{`${followingNum} Followers`}</>
                )}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
  );
}
