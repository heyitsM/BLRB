import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as profileAPI from "../api/Profile.js";
import * as userAPI from "../api/user.js";
import Profile from "../components/Profile/Profile.jsx";
import { useNavigate } from "react-router";

import * as professionalArtistInfoAPI from "../api/professionalArtistInfo.js"
import Header from "../components/Header.jsx";
import { Box, CssBaseline, Divider, Stack } from "@mui/material";
import SideBar from "../components/Explore/SideBar.jsx";
import ExploreAccounts from "../components/Explore/ExploreAccounts.jsx";

export default function OutsiderProfileView() {
    const { pageUsername } = useParams();
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [ outsideRole, setOutsideRole ] = useState(null)
    const [enabledCommissionsForm, setEnableCommissionsForm] = useState(false)
    const [ commissionRules, setCommissionsRequirements ] = useState("");
    const userId = localStorage.getItem("user-id");
    const token = localStorage.getItem("user-token");
    const navigate = useNavigate();

    useEffect( () => { 
        (async () => {
            if (userId && token) {
                try {
                  const tempUser = await userAPI.getUserByUsername(token, pageUsername);
                  if(tempUser.length === 0) {
                    navigate("/404");
                  }

                  // user is a recruiter, they should not be able to see the artist's commissions
                  const me = (await userAPI.getUser(token, userId)).data
                  setOutsideRole(me.role)
                  // user is for_fun should not see artist resume!

                  if (tempUser.data[0].id === userId) {
                    navigate("/my-profile")
                  }

                  setUser(tempUser.data[0]);

                  // set up commission page information
                  if (tempUser.data[0].role === "PROFESSIONALY") {
                    const tempCommReq = await professionalArtistInfoAPI.getInfo(token, tempUser.data[0].id);
                    setEnableCommissionsForm(tempCommReq.data.accepting_commissions);
                    setCommissionsRequirements(tempCommReq.data.commission_rules ? tempCommReq.data.commission_rules : "")
                  } else {
                    setEnableCommissionsForm(false);
                    setCommissionsRequirements("")
                  }
                  
                  const tempProfile = await profileAPI.getProfile(token, tempUser.data[0].id);
                  setProfile(tempProfile.data); 
                } catch (err) {
                  // there was an issue getting the user
                  console.log(err)
                  navigate("/404", {replace:true});
                }
            } else {
              navigate("/forbidden", {replace:true});
            }
          }
        )();
    }, []);

    useEffect(() => {
      (async () => {
        if (userId && token) {
          try {
            const tempUser = await userAPI.getUserByUsername(token, pageUsername);
            if(tempUser.length === 0) {
              navigate("/404");
            }

            // user is a recruiter, they should not be able to see the artist's commissions
            const me = (await userAPI.getUser(token, userId)).data
            setOutsideRole(me.role)
            // user is for_fun should not see artist resume!

            if (tempUser.data[0].id === userId) {
              navigate("/my-profile")
            }

            setUser(tempUser.data[0]);

            // set up commission page information
            if (tempUser.data[0].role === "PROFESSIONALY") {
              const tempCommReq = await professionalArtistInfoAPI.getInfo(token, tempUser.data[0].id);
              setEnableCommissionsForm(tempCommReq.data.accepting_commissions);
              setCommissionsRequirements(tempCommReq.data.commission_rules ? tempCommReq.data.commission_rules : "")
            } else {
              setEnableCommissionsForm(false);
              setCommissionsRequirements("")
            }
            
            const tempProfile = await profileAPI.getProfile(token, tempUser.data[0].id);
            setProfile(tempProfile.data); 
          } catch (err) {
            // there was an issue getting the user
            console.log(err)
            navigate("/404", {replace:true});
          }
        } else {
          navigate("/forbidden", {replace:true});
        }
      }
     )();
    }, [pageUsername])

    return (
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <Header />
        <SideBar />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mr:4 }} alignItems="center" justifyContent="center">
          { user && profile ? <Profile user={user} profile={profile} editable={false} enabledCommissionsForm={enabledCommissionsForm} commissionRules={commissionRules} outsideRole={outsideRole}/> : null}
        </Box>
        <Divider orientation="vertical" flexItem />
        <ExploreAccounts/>
      </Box>
    );
}