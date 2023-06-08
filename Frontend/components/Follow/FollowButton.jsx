import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import * as followingAPI from "../../api/following";

function FollowButton(props) {

  const {event, userId, blrbo_id} = props;
  
  const [following, setFollowing] = useState(false);
  const [followingObj, setFollowingObj] = useState(null);
  const token = localStorage.getItem("user-token");

  useEffect(() => {
    (async () => {
      await updateFollowing();
    })();
  }, []);

  async function onFollow(event) {
    event.stopPropagation();
    await followingAPI.addFollowing(token, {
      follower_id: userId,
      blrbo_id: blrbo_id,
    });
    await updateFollowing();
  }

  async function onUnfollow(event) {
    event.stopPropagation();
    await followingAPI.removeFollowing(token, followingObj);
    await updateFollowing();
  }

  async function updateFollowing() {
    let followingArray = await followingAPI.getFollowingByFilter(token, {
      follower_id: userId,
      blrbo_id: blrbo_id,
    });
    let followData = followingArray.data[0];
    if (followData) {
      console.log(followData)
      setFollowing(true);
      setFollowingObj(followData.id);
    } else {
      setFollowing(false);
    }
  }

  return (
    <>
      <Button
        data-testid="follow-button"
        color={!following ? "tertiary" : "primary"}
        size="medium"
        variant="outlined"
        sx={{
          ":hover": (!following ? 
            {
              bgcolor: "tertiary.main",
              variant:"contained",
              color:"#121212"
            } :  
            {
              bgcolor: "primary.main",
              variant:"contained",
              color:"#121212"
            } 
            ), 
          fontSize:"16px"
        }}
        onClick={(e) => {
          following ? onUnfollow(e) : onFollow(e);
        }}
      >
        {following ? "UnFollow" : "Follow"}
      </Button>
    </>
  );
}

export default FollowButton;
