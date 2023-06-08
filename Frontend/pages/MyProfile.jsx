import { useEffect, useState } from "react";
import Profile from "../components/Profile/Profile";
import * as profileAPI from "../api/Profile.js";
import * as userAPI from "../api/user.js";
import { useNavigate } from "react-router";
import { Box, CssBaseline, Divider, Stack } from "@mui/material";
import SideBar from "../components/Explore/SideBar";
import ExploreAccounts from "../components/Explore/ExploreAccounts";
import Header from "../components/Header";

export default function MyProfile() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const userId = localStorage.getItem("user-id");
    const token = localStorage.getItem("user-token");
    const navigate = useNavigate();

    const handleUpdate = async () => {
      try {
        if (userId && token) {
          let profile = await profileAPI.getProfile(token, userId);
          setProfile(profile.data)

          let user = await userAPI.getUser(token, userId);
          setUser(user.data)

        } else {
          navigate("/forbidden", {replace:true});
        }
      } catch (err) {
        console.log(
          "ERROR: Unfortunately this error was encountered. Please try to sign in again!",
          err
        );
      }
    }

    useEffect( () => { 
        (async () => {
            try {
              if (userId && token) {
                let profile = await profileAPI.getProfile(token, userId);
                setProfile(profile.data)
  
                let user = await userAPI.getUser(token, userId);
                setUser(user.data)
              } else {
                navigate("/forbidden", {replace:true});
              }
            } catch (err) {
              localStorage.removeItem("user-id");
              localStorage.removeItem("user-token");
              console.log(
                "ERROR: Unfortunately this error was encountered. Please try to sign in again!",
                err
              );
              window.alert("ERROR: Unfortunately an error was encountered getting your account information. Please try to sign in again!")
              navigate("/", { replace: true });
            }
          }
        )();
      }, []);

    return (
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <Header />
        <SideBar />
        <Box component="main" sx={{ flexGrow: 1, p: 0}} alignItems="center" justifyContent="center">
          { user ? <Profile user={user} profile={profile} editable={true} handleUpdate={handleUpdate}/> : null}
        </Box>
        <Divider orientation="vertical" flexItem />
        <ExploreAccounts/>
      </Box>
    )
}