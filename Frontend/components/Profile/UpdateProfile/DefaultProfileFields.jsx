import { Grid, Typography } from "@mui/material";
import Tags from "../../Tags";

export default function DefaultProfileFields(props) {
    const {
        CustomTextField,
        displayName,
        setDisplayName,
        userBio,
        setUserBio,
        tags, 
        setTags,
        role
    } = props;

    return (
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="stretch"
        spacing={1.5}
      > 
        <Grid alignSelf={"center"} item>
          <Typography variant="h6">
              General Information
          </Typography>
        </Grid>
        <Grid item>
          <CustomTextField // display name textfield
            required
            data-testid="display-name-field"
            id="standard-required"
            label="Display name"
            autoComplete="off"
            value={displayName}
            fullWidth
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </Grid> 
        <Grid item>
          <CustomTextField
            required
            id="standard-required"
            label="Bio"
            data-testid="bio-field"
            autoComplete="off"
            onChange={(e) => setUserBio(e.target.value)}
            value={userBio}
            rows={4}
            multiline
            fullWidth
          />
        </Grid> 
        { role === "PROFESSIONALY" ? 
          <Grid item>
            <Tags tags={tags} setTags={setTags} />
          </Grid>
        : <></>}
        
      </Grid>
    )
}