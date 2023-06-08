import { useState, useEffect } from "react";
import Header from "../Header";
import { Typography, Container, Box, Toolbar, Dialog, DialogTitle, IconButton, DialogContent, Snackbar, Alert, TextField, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CommissionForm from "../Commissions/CommissionForm";
import Portfolio from "../Portfolio/Portfolio";
import ProfileInfo from "./ProfileInfo";
import PostFeed from "../Posts/PostFeed";
import Resume from "../Resume/Resume"
import CloseIcon from '@mui/icons-material/Close';
import UpdateProfileContainer from "./UpdateProfile/UpdateProfileContainer";
import {styled} from "@mui/material";
import LikedPostFeed from "../../pages/LikedPostFeed";


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

export default function Profile(props) {
  const { user, profile, editable, enabledCommissionsForm, commissionRules, handleUpdate, outsideRole } =
    props;
  const [displayName, setDisplayName] = useState("");
  const [userBio, setUserBio] = useState("");
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [value, setValue] = useState("posts");
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ loading, setLoading ] = useState(false)
  let userId = localStorage.getItem("user-id");
  let token = localStorage.getItem("user-token");
  const navigate = useNavigate();

  useEffect(() => {
    if (userId && token) {
      setUserBio(profile.bio);
      setDisplayName(profile.display_name);
      setRole(user.role);
      setUsername(user.username);
      
    } else {
      navigate("/forbidden", { replace: true });
    }
  }, [user, profile]);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleOnEdit = () => {
    setDialogOpen(true);
  };

  const handleClose = (value) => {
    setDialogOpen(false);
  };

  const setTabs = () => {
    if (role === "PROFESSIONALY") {
      return (
        <>
          <Tabs
            data-testid="prof-tabs"
            value={value}
            onChange={handleTabChange}
            centered
          >
            <Tab data-testid="posts-tab" value="posts" label="Posts" />
            <Tab
              data-testid="portfolio-tab"
              value="portfolio"
              label="Portfolio"
            />
            {!editable && enabledCommissionsForm && (outsideRole !== "RECRUITER")? (
              <Tab
                data-testid="commissions-tab"
                value="commissions"
                label="Commissions"
              />
            ) : null}
            { (editable && role === "PROFESSIONALY") || (!editable && outsideRole === "RECRUITER") ? 
              <Tab data-testid="resume-tab" value="resume" label="Resume" />
            : null}
            <Tab data-testid="likes-tab" value="likes" label="Likes" />
          </Tabs>
        </>
      );
    } else if (role === "FOR_FUN") {
      return (
        <>
          <Tabs
            data-testid="hobby-tabs"
            value={value}
            onChange={handleTabChange}
            centered
          >
            <Tab data-testid="posts-tab" value="posts" label="Posts" />
            <Tab data-testid="likes-tab" value="likes" label="Likes" />
          </Tabs>
        </>
      );
    } else {
      return (
        <>
          <Tabs
            data-testid="recruiter-tabs"
            value={value}
            onChange={handleTabChange}
            centered
          >
            <Tab data-testid="posts-tab" value="posts" label="Posts" />
            <Tab data-testid="likes-tab" value="likes" label="Likes" />
          </Tabs>
        </>
      );
    }
  };

  return (
    <>
      { !userId ? <></> : 
      <>
        {alert ? (<Snackbar
            sx={{ zIndex: 2000000 }}
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
        ) : (<></>)}
        <Dialog
          maxWidth={loading ? "sm" : "md"}
          open={dialogOpen}
          fullWidth={loading ? false : true}
        >
        {loading ? <></> :
        <DialogTitle sx={{ m: 2, p: 2 }}>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
            color="primary"
            >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        }
        <DialogContent>
          {loading ? <> <CircularProgress/> </>: 
            <UpdateProfileContainer
              setLoading={setLoading}
              loadNavigation={true}
              CustomTextField={CustomTextField}
              setAlert={setAlert}
              setOpen={setOpen}
              setAlertMsg={setAlertMsg}
              handleClose={handleClose}
              handleUpdate={handleUpdate}
            />
          }
        </DialogContent>
        </Dialog>
        <Container >
          <Toolbar/>
          <ProfileInfo 
            data-testid="profile-info" 
            outsideRole={outsideRole}
            username={username} 
            user={user} 
            userBio={userBio} 
            displayName={displayName} 
            profile={profile} 
            handleOnEdit={handleOnEdit} 
            editable={editable}
          />
          <Box>
            {setTabs()}
          </Box>
          {value === "portfolio" && (
            <Box data-testid="portfolio" py={2}>
              <Portfolio user={user} profile={profile} userId={user.id} editable={editable}/>
            </Box>
          )}
          {value === "commissions" && (
            <Box data-testid="commissions" py={2}>
              { !editable && enabledCommissionsForm ? 
                <CommissionForm 
                  editable={editable} 
                  artist={user} 
                  commissionRules={commissionRules} 
                  setAlertOpen={setOpen} 
                  setAlert={setAlert} 
                  setAlertMsg={setAlertMsg}
                /> 
              : <Typography textAlign={"center"}>This user is not accepting commissions</Typography> 
              }
            </Box>
          )}
          {value === "resume" && (
            <Box data-testid="resume" py={2}>
              <Resume editable={editable} profileUserId={user.id}/>
            </Box>
          )}
          {value === "posts" && (
            <Box data-testid="posts" py={2}>
              <Typography width="500" maxWidth="100%">
                <PostFeed userId={user.id} editable={editable}/>
              </Typography>
            </Box>
          )}
          {value === "likes" && (
            <Box data-testid="likes" py={2}>
              <Typography width="500" maxWidth="100%">
                <LikedPostFeed userId={user.id} editable={false} />
              </Typography>
            </Box>
          )}
        </Container>
      </> }
    </>
  );
}

