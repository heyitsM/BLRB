import { useEffect, useState } from "react";
import * as userAPI from "../api/user.js";
import { useNavigate } from "react-router";
import { Box, CssBaseline, Typography, Divider, Toolbar, Container} from "@mui/material";
import SideBar from "../components/Explore/SideBar";
import Header from "../components/Header";
import ExplorePosts from "../components/Explore/ExplorePostList";
import AccountCard from "../components/Explore/AccountCard.jsx";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CreatePost from "../components/Posts/CreatePost.jsx"
import ExploreAccounts from "../components/Explore/ExploreAccounts.jsx";

export default function Explore() {
  const [user, setUser] = useState(null);
  const userId = localStorage.getItem("user-id");
  const token = localStorage.getItem("user-token");
  const navigate = useNavigate();
  const [value, setValue] = useState("home");
  const [ postsUpdated, setPostsUpdated] = useState(false);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const setTabs = () => {
    return (
      <>
        <Tabs
          data-testid="explore-tabs"
          value={value}
          onChange={handleTabChange}
          centered
          variant="fullWidth"
        >
          <Tab data-testid="home-tab" value="home" label="Home" />
          <Tab
            data-testid="following-tab"
            value="following"
            label="Following"
          />
        </Tabs>
      </>
    );
  };

  useEffect(() => {
    (async () => {
      try {
        if (!userId && !token) {
          navigate("/forbidden", { replace: true });
        }
      } catch (err) {
        localStorage.removeItem("user-id");
        localStorage.removeItem("user-token");
        console.log(
          "ERROR: Unfortunately this error was encountered. Please try to sign in again!",
          err
        );
        window.alert(
          "ERROR: Unfortunately an error was encountered getting your account information. Please try to sign in again!"
        );
        navigate("/forbidden", { replace: true });
      }
    })();
  }, []);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Header />
      <SideBar />
      <Box component="main" sx={{ flexGrow: 1, p: 3}} alignItems="center" justifyContent="center">
        <Container>
          <Toolbar />
          <CreatePost setPosts={() => {}} setPostsUpdated={() => {}}/>
          {setTabs()}
          {value === "home" && <ExplorePosts mode={"new"} />}
          {value === "following" && <ExplorePosts mode={"following"} />}
        </Container>
      </Box>
      <Divider orientation="vertical" flexItem />
      <ExploreAccounts/>
    </Box>
  );
}
