import AccountCard from "../components/Explore/AccountCard";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useParams } from "react-router-dom";
import {Typography, Box, Grid} from "@mui/material";
import * as followingAPI from "../api/following";
import * as userAPI from "../api/user";
import NavTabs from "../components/Follow/FollowTabs";

export default function FollowingPage() {
  const { pageUsername } = useParams();
  const [user, setUser] = useState(null);
  const [followingArr, setFollowingArr] = useState([]);
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

          let myFollowers = await followingAPI.getFollowingByFilter(token, {
            blrbo_id: tempUser.id,
          });
          const myFollowingUserObjs = await Promise.all(
            myFollowers.data.map(async (following) => {
              let data = await userAPI.getUser(token, following.follower_id);
              return data.data;
            })
          );
          setFollowingArr(myFollowingUserObjs);
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
    <NavTabs firstPage={"Followers"} text={`Users following ${pageUsername}`} username={pageUsername}></NavTabs>
    <Box sx={{width: "100%"}} display="flex" flexDirection="column" justifyContent="center" alignItems="center" paddingTop={5} paddingLeft={30}>
      {followingArr ? (
        <>
          {followingArr.map((blrbo) => (
            <Box sx={{width: 500}} paddingBottom={5}>
            <AccountCard key={blrbo.id} user={blrbo} />
            </Box>
          ))}
        </>
      ) : (
        <><Typography>No Followers</Typography></>
      )}
      </Box>
    </>
  );
}
