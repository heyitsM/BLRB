import { useState, useEffect } from "react";
import Header from "../components/Header";
import { Box, Alert, IconButton, Toolbar, Snackbar, CircularProgress } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useLocation, useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import SideBar from "../components/Explore/SideBar";
import {styled} from "@mui/material";
import UpdateProfileContainer from "../components/Profile/UpdateProfile/UpdateProfileContainer";
import img from "../images/ArtStationBackground77.jpg"


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
  }
}));

export default function UpdateProfile(props) {
  const userId = localStorage.getItem("user-id");
  const token = localStorage.getItem("user-token");
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state;
  
  const [ loadNavigation, setLoadNavigation ] = useState(false)
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [ loading, setLoading ] = useState(false)
  

  useEffect(() => {
    (async () => {
      try {
        if (userId && token) { // cannot be f
          if (!state.newAccount) {
            setLoadNavigation(true)
          }  
        } else {
          navigate("/forbidden", { replace: true });
        }
      } catch (err) {
        setOpen(true)
        setAlertMsg(err.response.data.message);
        setAlert(true);
      }
    })();
  }, []);

  return (
    <>
      <Box
        // image background
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{
          height:"100vh",
          backgroundPosition:"center",
          backgroundImage:`url(${img})`
        }}
        >  
        {!loadNavigation ? 
          <></> 
        : 
          <>
            <Header/>
            <Toolbar/>
          </>
        } 
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
        { loadNavigation ? <SideBar/> : <></>}
        <Box
          // black box
          display="flex"
          padding={4}
          justifyItems="center"
          alignItems="center"
          bgcolor='background.default'
          borderRadius='12px'
        >
          { loading ? 
            <CircularProgress size={"10vw"}/>
          :
            <>
              <UpdateProfileContainer
                setLoading={setLoading}
                navigate={navigate}
                loadNavigation={loadNavigation}
                CustomTextField={CustomTextField}
                setAlert={setAlert}
                setOpen={setOpen}
                setAlertMsg={setAlertMsg}
                handleClose={null}
              />
            </>
          }
        </Box>
      </Box>
    </>
  );
}
