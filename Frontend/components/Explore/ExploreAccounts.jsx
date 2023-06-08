import { Box, Grid, Toolbar, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import AccountCard from "./AccountCard";
import { getAllUsers } from "../../api/user";
import { getProfile } from "../../api/Profile";
import ExploreAccountCard from "./ExploreAccountCard";
import { getFollowing, getFollowingByFilter } from "../../api/following";

export default function ExploreAccounts(props) {
  const [ users, setUsers ] = useState([]);
  const userId = localStorage.getItem("user-id");
  const token = localStorage.getItem("user-token");

  useEffect(() => {
    (async () => {
      let tempUsers = (await getAllUsers(token)).data;
      let tempResult = []
      tempUsers.splice(5)

      for (let i = 0; i < tempUsers.length; i++) {
        if (tempUsers[i].id && tempUsers[i].id !== userId) {
          let result2 = (await getFollowingByFilter(token, {follower_id:userId, blrbo_id:tempUsers[i].id}));
          if (result2.data.length === 0 ) {
            tempResult.push(tempUsers[i])
          }
        }
      }
      setUsers(tempResult)
    })();
  }, [])


    return (
        <Box
          sx={{ minWidth:(window.innerWidth / 4), display: { xs: 'none', md: 'block'} }}
          padding={4}
        >
          <Toolbar/>
          <Box
                display="flex"
                justifyItems="flex-start"
                alignItems="flex-start"
                bgcolor='#2a2a2a'
                borderRadius='12px'
                padding={1}
            >
                <Grid
                  container
                  direction={"column"}
                  justifyContent={"flex-start"}
                  alignItems={"stretch"}
                  spacing={1}
              >
                <Grid item my={2} alignSelf={"center"}>
                    <Typography variant="h6" fontWeight={"bold"}>
                        Who to Follow
                    </Typography>
                </Grid>
                { users.map(
                    (p) => (
                        <Grid key={p.id} item> 
                            <div data-testid="user">
                                <ExploreAccountCard user={p} mode={"search"}/>
                            </div>
                        </Grid>
                    )
                )}
              </Grid>
            </Box>
        </Box>
    )
}