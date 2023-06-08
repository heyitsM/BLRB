import { Avatar, Box, Chip, Grid, Stack, Typography } from "@mui/material";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

export default function NonEditableFields(props) {
  const { user, profile, targetImage } = props;
  const navigate = useNavigate();

  return (
    Object.keys(targetImage).length === 0 ? 
    <></> :
    <Box alignContent={"flex-end"}>
      <Grid
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
        spacing={2}
    >
        <Grid item>
            {profile.profile_pic ? 
                <Avatar
                    data-testid="avatar"
                    alt={profile.display_name}
                    src={profile.profile_pic}
                    sx={{ bgcolor:stringToColor(user.username),width: 60, height: 60 }}
                />

            :   
                <Avatar
                    data-testid="avatar"
                    alt={profile.display_name}
                    sx={{ bgcolor:stringToColor(user.username),width: 60, height: 60 }}
                />
            }
        </Grid>
        <Grid item>                        
            <Grid
                container
                direction="column"
                justifyContent="flex-start"
                alignItems="flex-start"
            >
                <Grid item>
                    <Typography variant={"h5"} data-testid={"displayname"}>
                        {profile.display_name}
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography variant="body1" data-testid={"username"}>
                        {"@" + user.username}
                    </Typography>
                </Grid>
            </Grid>
        </Grid>
      </Grid>
      <Grid
        marginTop={2}
        justifyContent={"center"} 
      >
        <Grid item>
          <Typography variant="h4" fontWeight={"bold"} data-testid={"non-edit-title"}>
            {targetImage.title}
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="subtitle" data-testid={"non-edit-description"}>
            {targetImage.description && targetImage.description !== "" ?  
              targetImage.description
              :
              ""
            }
          </Typography>
        </Grid>
      </Grid>
      <Box position="absolute" bottom="10%">
        
        <Grid 
            container
            direction="row"
            spacing={.5}
        > 
            {((targetImage.tags).map((t) => 
                <Grid item
                key={Math.random() * 10000000}
                >
                    <Chip label={`${t}`} color="primary" onClick={(e) => { navigate("/search", {state:{title:t, toggle:"users"}}) }} />
                </Grid>
            ))}
        </Grid>
      </Box>
    </Box>
  );
}
