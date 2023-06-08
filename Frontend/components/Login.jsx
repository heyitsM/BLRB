import * as React from "react";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import login from "../api/login.js"
import * as userAPI from "../api/user.js"
import { Alert, CircularProgress, IconButton, InputAdornment } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import img from "../images/Logo_Transparent_Square.png"

export default function SignIn(props) {
  const { setAlert, setAlertMsg, setOpen, setMode, CustomTextField} = props
  const [showPassword, setShowPassword] = React.useState(false);
  const [isClicked, setClicked] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = () => setShowPassword(!showPassword);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (localStorage.getItem("user-id") && localStorage.getItem("user-token")) {
      navigate("/explore", {replace:true})
    }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const data = new FormData(event.currentTarget);
    if (!data.get("email") || data.get("email") === "") {
      setAlertMsg("You must have an email to login!");
      setAlert(true);
      setOpen(true)
      return;
    }

    if (!data.get("password") || data.get("password") === "") {
      setAlertMsg("You must have an password to login!");
      setAlert(true);
      setOpen(true);
      return;
    }
    
    setClicked(true)
    await login(data.get("email"), data.get("password"))
      .then(async (data) => {
        localStorage.clear();
        localStorage.setItem("user-id", data.data.userId);
        localStorage.setItem("user-token", data.token);
        const me = (await userAPI.getUser(data.token, data.data.userId)).data
        console.log(me.role)
        localStorage.setItem("user-role", me.role)
        setClicked(false)
        navigate("/explore", { replace: true });
      })
      .catch((err) => {
        setClicked(false)
        console.log(err);
        setAlertMsg("Error logging in, please check your username or password and try again!");
        setAlert(true);
        setOpen(true);
      });
  };

  return (
    
    <Box
    component="form"
    onSubmit={handleSubmit}
    noValidate
    sx={{ mt: 1 }}
  >
    <Grid 
      container
      direction="column"
      justifyContent="flex-start"
      alignItems="stretch"
      spacing={1}
    >  
      <Grid item alignSelf={"center"}>
        <img
          height={"80px"}
          src={img}
        />
      </Grid>
      <Grid item alignSelf={"center"} mb={4}>
        <Typography data-testid="signin-title" component="h1" variant="h5">
          Sign in
        </Typography>
      </Grid>
      <Grid item mb={1}>
        <CustomTextField
          data-testid="email-txt"
          required
          autoComplete="off"
          fullWidth
          id="email"
          disabled={isClicked ? true : false}
          label="Email Address"
          name="email"
          variant="outlined" 
          inputProps={{ "data-testid": "email-input" }}
        />
      </Grid>
      <Grid item>
        <CustomTextField
          data-testid="pwd-txt"
          required
          autoComplete="off"
          fullWidth
          disabled={isClicked ? true : false}
          variant="outlined" 
          name="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          id="password"
          inputProps={{ "data-testid": "pwd-input"}}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  color="primary"
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ) 
          }}
        />
      </Grid>
      <Grid item>
        <Button
          data-testid="submit-button"
          type="submit"
          fullWidth
          disabled={isClicked ? true : false}
          variant="outlined"
          color="tertiary"
          size="large"
          sx={{
            mt:2,
            ":hover": {
              bgcolor: "tertiary.main",
              variant:"contained",
              color:"#121212"
            }
          }}
        >
          {isClicked ? <CircularProgress color="white" /> : "Login"}
        </Button>
      </Grid>
      <Grid data-testid="signup-link" item alignSelf={"center"}>
        <Button 
          onClick={() => setMode(true)}
        >
          Not on BLRB? Sign up
        </Button>
      </Grid>
    </Grid>
  </Box>
  );
}
