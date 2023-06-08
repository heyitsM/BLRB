import Header from "../components/Header";
import { Typography, Container, Box, CircularProgress, Toolbar, Grid, colors, Snackbar, Alert, IconButton } from "@mui/material";
import * as profileAPI from "../api/Profile.js";
import * as portfolioAPI from "../api/portfolio.js";
import * as recruiterAPI from "../api/recruiterInfo";
import * as userAPI from "../api/user";
import Button from "@mui/material/Button";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ColorLensIcon from '@mui/icons-material/ColorLens';
import BusinessIcon from '@mui/icons-material/Business';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import CloseIcon from "@mui/icons-material/Close";
import img from "../images/ArtStationBackground44.jpg"

function ProfileTypeSelection() {
  const [ loading, setLoading ] = useState(false);
  const [alert, setAlert] = useState(false);
  const [open, setOpen] = useState(false);

  const userId = localStorage.getItem("user-id");
  const token = localStorage.getItem("user-token");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const {fromSignUp} = location.state;

  useEffect(() => {
    if ((!userId && !token)|| !fromSignUp) {
      navigate("/forbidden", { replace: true });
    }
  }, []);

  async function getEmail() {
    userAPI.getUser(token, userId).then((data) => {
      setEmail(data.data.email);
    });
  }

  const handleOnClick = async (event) => {
    try {
      const role = event.currentTarget.value;
      setLoading(true)
      await profileAPI.setUserType(token, userId, role);
      if (role.toLowerCase() === "professional" || role == "PROFESSIONAL") {
        localStorage.setItem("user-role", "PROFESSIONALY")
        portfolioAPI.createPortfolio(token, { userId });
      } else if (role.toLowerCase() === "recruiter" || role == "RECRUITER") {
        await recruiterAPI.createInfo(token, {
          id: userId,
          company: "---",
          position: "---",
        });
        localStorage.setItem("user-role", "RECRUITER")
      } else {
        localStorage.setItem("user-role", "HOBBYIST")
      }
      setLoading(false)
      navigate("/profile-basics", {state: { newAccount:true }});
    } catch (e) {
      // TODO: Make alert to show up if error occurs + remove loading. 
      setAlert(true);
      setOpen(true);
      setLoading(false);
      console.log(e)
    }
  };

  return (
    <>
      {alert ? (
        <Snackbar
            sx={{ zIndex: 10001 }}
            anchorOrigin={{ vertical: 'top', horizontal: 'center'}} 
            open={open} 
            autoHideDuration={4000} 
            onClose={() => setOpen(false)}
        >
            <Alert
                sx={{ marginTop: "2em" }}
                variant="filled"
                severity="warning"
                color="secondary"
                data-testid="bad-submission-alert"
                action={
                <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => {
                    setAlert(false);
                    }}
                >
                    <CloseIcon fontSize="inherit" />
                </IconButton>
                }
            >
                {"There was an error selecting your profile type. Please give it a moment and try again."}
            </Alert>                        
        </Snackbar>
        ) : (
        <></>
      )}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{
          height:"100vh",
          width:"100vw",
          backgroundPosition:"center",
          backgroundImage:`url(${img})`
        }}
      >
        {
          loading ? 
          <Box
            display="flex"
            padding={4}
            justifyItems="flex-start"
            alignItems="flex-start"
            bgcolor='background.default'
            borderRadius='12px'
          >
            <CircularProgress size={"10vw"}/>
          </Box>
          :
          <>
            <Box
              display="flex"
              padding={4}
              justifyItems="flex-start"
              alignItems="center"
              bgcolor='background.default'
              borderRadius='12px'
            >
              <Grid
                container
                direction="column"
                justifyContent="center"
                alignItems="center"
                spacing={2}
              >        
                <Grid item mb={3}>
                  <Typography variant="h2" color="ffffff">
                    Who are you?
                  </Typography>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    value={"professional"}
                    sx={{
                      ":hover": {
                        bgcolor: "primary.main",
                        variant:"contained",
                        color:"#121212"
                      }
                    }}
                    onClick={handleOnClick}
                  >
                    <Grid
                      container
                      direction="row"
                      justifyContent="space-evenly"
                      alignContent="center"
                    >
                      <Grid item mr={3}>
                        <Typography variant="h4">
                          Professional
                        </Typography>
                      </Grid>
                      <Grid item>
                        <ColorLensIcon fontSize="large"/>
                      </Grid>
                    </Grid>
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    fullWidth
                    sx={{
                      ":hover": {
                        bgcolor: "secondary.main",
                        variant:"contained",
                        color:"#121212"
                      }
                    }}
                    onClick={handleOnClick}
                    value={"recruiter"}
                  >
                    <Grid
                      container
                      direction="row"
                      justifyContent="space-evenly"
                      alignContent="center"
                    >
                      <Grid item mr={3}>
                        <Typography role="professional" variant="h4">
                          Recruiter
                        </Typography>
                      </Grid>
                      <Grid item>
                        <BusinessIcon fontSize="large"/>
                      </Grid>
                    </Grid>
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="tertiary"
                    size="large"
                    fullWidth
                    sx={{
                      ":hover": {
                        bgcolor: "tertiary.main",
                        variant:"contained",
                        color:"#121212"
                      }
                    }}
                    onClick={handleOnClick}
                    value={"forfun"}
                  >
                    <Grid
                      container
                      direction="row"
                      justifyContent="space-evenly"
                      alignContent="center"
                    >
                      <Grid item mr={3}>
                        <Typography variant="h4">
                          Casual
                        </Typography>
                      </Grid>
                      <Grid item>
                        <SelfImprovementIcon fontSize="large"/>
                      </Grid>
                    </Grid>
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </>
        }
      </Box>
    </>
  );
}

export default ProfileTypeSelection;
