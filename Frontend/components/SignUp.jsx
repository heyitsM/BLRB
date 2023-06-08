import { useState } from "react";
import * as userAPI from "../api/user.js";
import * as emailAPI from "../api/email.js";
import {
  Typography,
  Button,
  Grid,
  InputAdornment,
  IconButton,
  CircularProgress
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import img from "../images/Logo_Transparent_Square.png"

function SignUp(props) {
  const { setAlert, setAlertMsg, setOpen, setMode, CustomTextField} = props;
  const [ isClicked, setClicked ] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = () => setShowPassword(!showPassword);
  const [fields, setFields] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });


  const navigate = useNavigate();

  const handleChange = (e) => {
    const id = e.target.id;
    const update = e.target.value;

    setFields((fields) => ({
      ...fields,
      [id]: update,
    }));
  };

  async function handleOnSubmit() {
    try {
      // post user
      const username = fields.username;
      const first_name = fields.firstName;
      const last_name = fields.lastName;
      const email = fields.email;
      const password = fields.password;

      if (username === "" || first_name === "" || last_name === "" || email === "" || password === "" ) {
        setAlertMsg("Please fill all fields");
        setAlert(true);
        setOpen(true);
        return;
      }

      setClicked(true)
      const data = await userAPI.createUser({ username, first_name, last_name, email, password });
      const newUser = data.data;
      const id = newUser.id
      localStorage.clear();
      localStorage.setItem("user-id", id);
      localStorage.setItem("user-token", data.token);

      await emailAPI.emailOnUserSignup(data.token, {email, name:first_name});
      setClicked(false)
      navigate("/profile-type", {state: {fromSignUp:true}});
    } catch (err) {
      setClicked(false)
      console.log(err)
      setAlertMsg(err.response.data.message);
      setAlert(true);
      setOpen(true);
    }
  }

  return (
      <Grid 
        container
        direction="column"
        justifyContent="flex-start"
        alignItems="stretch"
        spacing={.5}
      >
          <Grid item alignSelf={"center"}>
            <img
              height={"80px"}
              src={img}
            />
          </Grid>
          <Grid item mb={2}>
            <Typography variant="h5">
              Make an Account With Us
            </Typography>
          </Grid>
          <Grid item mb={1}>
            <CustomTextField 
              id="firstName" 
              label="First Name" 
              required
              fullWidth
              variant="outlined" 
              color="primary" 
              disabled={isClicked ? true : false}
              value={fields.firstName}
              onChange={handleChange}
              sx={{ color:"#EA526F" }}
            />
          </Grid>
          <Grid item mb={1}>
            <CustomTextField 
              id="lastName" 
              label="Last Name" 
              variant="outlined" 
              color="primary" 
              required
              fullWidth
              disabled={isClicked ? true : false}
              value={fields.lastName}
              onChange={handleChange}
              sx={{ color:"#EA526F" }}
            />
          </Grid>
          <Grid item mb={1}>
            <CustomTextField 
              id="username" 
              label="Username" 
              variant="outlined" 
              color="primary" 
              required
              fullWidth
              disabled={isClicked ? true : false}
              value={fields.username}
              onChange={handleChange}
              sx={{ color:"#EA526F" }}
            />
          </Grid>
          <Grid item mb={1}>
            <CustomTextField 
              id="email" 
              label="Email" 
              variant="outlined" 
              color="primary" 
              required
              fullWidth
              disabled={isClicked ? true : false}
              value={fields.email}
              onChange={handleChange}
              sx={{ color:"#EA526F" }}
            />
          </Grid>
          <Grid item mb={1}>
            <CustomTextField 
              id="password" 
              label="Password" 
              variant="outlined" 
              color="primary" 
              type={showPassword ? "text" : "password"}
              required
              fullWidth
              disabled={isClicked ? true : false}
              value={fields.password}
              onChange={handleChange}
              sx={{ color:"#EA526F" }}
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
                  onClick={handleOnSubmit}
                >
              {isClicked ? <CircularProgress color="white" /> : "Signup!"}
            </Button>
          </Grid>
          <Grid item alignSelf={"center"}>
            <Button onClick={() => setMode(false)}>
              Already a Member? Log in
            </Button>
          </Grid>
        </Grid>
  );
}

export default SignUp;
