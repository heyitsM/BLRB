import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Divider, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Header from "../Header";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import SideBar from "../Explore/SideBar";
import ExploreAccounts from "../Explore/ExploreAccounts";

export default function NavTabs(props) {
  const {firstPage, text, username} = props;

  const [value, setValue] = useState(firstPage);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
    <Header />
    <SideBar />
    <Box sx={{ width: "100%" }} display="flex" justifyContent="center" alignItems="center" paddingTop={15} paddingLeft={30}>
    <Typography variant="h4"> {text} </Typography>
    </Box>
    <Box sx={{ width: "100%" }} display="flex" justifyContent="center" alignItems="center" paddingTop={5} paddingLeft={30}>
      <Tabs centered value={value} onChange={handleChange} data-testid="follow-tabs">
        <Tab component={Link} label="Followers" to={`/profile/${username}/followers`} value={"Followers"} />
        <Tab component={Link} label="Following" to={`/profile/${username}/following`} value={"Following"} />
      </Tabs>
    </Box>
    </>
  );
}
