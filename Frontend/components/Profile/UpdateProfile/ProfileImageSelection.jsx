import { Avatar, Box, Button, Grid, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import img from "../../../images/Default_pfp.png";

export default function ProfileImageSelection(props) {
    const {username, file, setFile, setOpen, setAlert, setAlertMsg} = props;
    const [previewImage, setPreviewImage] = useState();

    useEffect(() => {
        if (!(file instanceof File)) {
            setPreviewImage(file)
        }
    }, [file])

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

    const fileData = () => {
        if (file) {
          return (
            <Grid
                container
                direction="column"
                justifyContent="center"
                alignItems="center"
                spacing={2}
            >   
                <Grid alignSelf={"center"} item>
                    <Typography variant="h6">
                        Profile Picture
                    </Typography>
                </Grid>
                <Grid item>    
                    <Avatar
                        sx={{width:"30vh", height:"30vh", bgcolor: stringToColor(username)}}
                        src={previewImage}
                    />
                </Grid>
                <Grid item>
                    <Button
                        variant="outlined"
                        color="secondary"
                        fullWidth
                        size="large"
                        sx={{
                            ":hover": {
                                bgcolor: "secondary.main",
                                variant:"contained",
                                color:"#121212"
                            }
                        }} 
                        onClick={() => {
                            setFile(null);
                            setPreviewImage(null);
                            fileData()
                        }}
                    >
                        Select a Different Image
                    </Button>
                </Grid>
            </Grid>
          );
        } else {
          // if there is no file selected, allow for file selection
          return (
            <Grid
                container
                direction="column"
                justifyContent="center"
                alignItems="center"
                spacing={2}
            >   
                <Grid item>    
                    <Avatar
                      src={img}
                      sx={{width:"30vh", height:"30vh", bgcolor: stringToColor(username)}}
                    />
                </Grid>
                <Grid item>
                    <Button 
                        variant="outlined"
                        color="secondary"
                        fullWidth
                        size="large"
                        sx={{
                            ":hover": {
                                bgcolor: "secondary.main",
                                variant:"contained",
                                color:"#121212"
                            }
                        }} 
                        component="label"
                    >
                        Click to Upload Profile Image
                        <input 
                            hidden 
                            accept="image/*" 
                            type="file" 
                            onChange={(event) => {
                                if ((event.target.files[0].size >= 8000000)) {
                                    event.target.value = null
                                    setOpen(true)
                                    setAlert(true);
                                    setAlertMsg("Profile image cannot be larger than 8mb.");
                                    fileData();
                                } else {
                                    setFile(event.target.files[0]);
                                    setPreviewImage(URL.createObjectURL(event.target.files[0]));
                                    fileData();
                                }
                            }}
                        />
                    </Button>
                </Grid>
            </Grid>
            
          );
        }
    }

    return fileData();
}