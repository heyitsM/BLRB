import { useState, useEffect } from "react";
import { Box, Snackbar, Alert, IconButton, Typography, makeStyles } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import SignUp from "../components/SignUp.jsx";
import CloseIcon from "@mui/icons-material/Close";
import TextField from '@mui/material/TextField';
import SignIn from "../components/Login.jsx";
import {styled} from "@mui/material";
import img1 from "../images/ArtStationBackground22.jpg"
import img2 from "../images/ArtStationBackground33.jpg"

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
  }, 
  "& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor:"#bdbdbd",
    borderRadius: 20,
    borderColor: "#bdbdbd"
  }, 
  "& .MuiInputBase-input.Mui-disabled:hover fieldset": {
    borderRadius: 20,
    borderColor: "#bdbdbd !important"
  }, 
  "& .Mui-disabled .MuiOutlinedInput-notchedOutline": {
    borderColor: "#bdbdbd !important"
  },
  "& label.Mui-disabled": {
    color: "#bdbdbd"
  },  
}));

function Home(props) {
  const userId = localStorage.getItem("user-id");
  const token = localStorage.getItem("user-token");
  const [alert, setAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [mode, setMode] = useState(false) // true if signing up, false if logging in

  useEffect(() => {
    if (userId && token) {
      navigate("/my-profile", {replace:true})
    }
  }, []);

  return (  
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{
        height:"100vh",
        width:"100vw",
        backgroundPosition:"center",
        backgroundImage:(mode ? `url(${img1})` : `url(${img2})`)

      }}
    >
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
                  setAlertMsg("")
                  setAlert(false);
                  }}
              >
                  <CloseIcon fontSize="inherit" />
              </IconButton>
              }
            >
                {alertMsg}
            </Alert>                        
        </Snackbar>
        ) : (
        <></>
      )}
      <Box
        display="flex"
        padding={4}
        justifyItems="flex-start"
        alignItems="flex-start"
        bgcolor='background.default'
        borderRadius='12px'
      >
          {mode ? 
            <SignUp 
              setAlert={setAlert} 
              setAlertMsg={setAlertMsg} 
              setOpen={setOpen} 
              setMode={setMode} 
              CustomTextField={CustomTextField}
            /> 
          : 
            <SignIn 
              setAlert={setAlert}  
              setAlertMsg={setAlertMsg} 
              setOpen={setOpen} 
              setMode={setMode}
              CustomTextField={CustomTextField}
            />
          }
      </Box>
    </Box>
  );
}

export default Home;
