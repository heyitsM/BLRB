import AccountCard from "../components/Explore/AccountCard";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {Typography, Box} from "@mui/material";
import { useParams } from "react-router-dom";
import * as followingAPI from "../api/following";
import * as userAPI from "../api/user";
import NavTabs from "../components/Follow/FollowTabs";

export default function FollowersPage() {

  const { pageUsername } = useParams();
  const [user, setUser] = useState(null);
  const [followerArr, setFollowerArr] = useState([]);
  const userId = localStorage.getItem("user-id");
  const token = localStorage.getItem("user-token");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      if (userId && token) {
        try {
          let tempUser = await userAPI.getUserByUsername(token, pageUsername);
          if (tempUser.length === 0) {
            navigate("/404");
          }

          tempUser = tempUser.data[0];

          let myBlrbos = await followingAPI.getFollowingByFilter(token, {
            follower_id: tempUser.id,
          });

          const myBlrbosUserObjs = await Promise.all(
            myBlrbos.data.map(async (following) => {
              let data = await userAPI.getUser(token, following.blrbo_id);
              return data.data;
            })
          );
          setFollowerArr(myBlrbosUserObjs);
        } catch (err) {
          console.log(err);
          navigate("/404", { replace: true });
        }
      } else {
        navigate("/forbidden", { replace: true });
      }
    })();
  }, []);

  return (
    <>
    <NavTabs firstPage={"Following"} text={`Users ${pageUsername} follows`} username={pageUsername}></NavTabs>
    <Box sx={{width: "100%"}} display="flex" flexDirection="column" justifyContent="center" alignItems="center" paddingTop={5} paddingLeft={30}>
    {followerArr.length > 0 ? (
        <>
          {followerArr.map((follower) => (
            <Box sx={{width: 500}} paddingBottom={5}>
            <AccountCard key={follower.id} user={follower} />
            </Box>
          ))}
        </>
      ) : (
        <><Typography>Following No One</Typography></>
      )}
      </Box>
    </>
  )
}
