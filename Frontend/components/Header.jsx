import { useNavigate } from "react-router-dom";
import { IconButton, Typography, Box, Toolbar, AppBar } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from '@mui/icons-material/Search';

import * as React from "react";
import logo from "../images/Logo_Black_Line.png";


function Header(props) {
  const userId = localStorage.getItem("user-id");
  const token = localStorage.getItem("user-token");
  const navigate = useNavigate();

  const handleOnClickLogout = () => {
    if (userId && token) {
      localStorage.clear();
      navigate("/home", { replace: true });
    } else {
      navigate("/home", { replace: true });
    }
  };



  const handleOnSearch = () => {
    if (userId && token) {
      navigate("/search", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  return (
      <AppBar sx={{ backgroundColor: "#121212",  zIndex: 10000 }} position="fixed">
        <Toolbar>
          <img
            data-testid="logo"
            height={"50px"}
            src={logo}
          />
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <IconButton
              size="large"
              aria-label="go home"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              data-testid="search-button-header"
              onClick={handleOnSearch}
              color="white"
            >
              <SearchIcon fontSize="inherit" />
            </IconButton>
            
            <IconButton
              size="large"
              aria-label="logout"
              aria-controls="menu-appbar"
              aria-haspopup="logout-button"
              data-testid="logout-button-header"
              onClick={handleOnClickLogout}
              color="white"
            >
              <LogoutIcon fontSize="inherit" />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
  );
}

export default Header;
