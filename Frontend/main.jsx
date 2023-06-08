import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import {
  ThemeProvider,
  createTheme,
  responsiveFontSizes,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "./font.css"

const theme = responsiveFontSizes(createTheme());
const darkTheme = createTheme({
  typography: {
    fontFamily: "Poppins"
  },
  palette: {
    type: 'dark',
    divider: '#818181',
    background: {
      default: '#121212',
      paper: '#121212',
    },
    text: {
      primary: '#ffffff',
      secondary: '#bdbdbd',
    },
    primary: {
      main: '#EA526F',
      contrastText: "#121212"
    },
    secondary: {
      main: '#f7b32b',
      contrastText: "#121212"
    },
    tertiary: {
      main: "#3fcaa3",
      contrastText: "#121212"
    },
    info: {
      main: '#08b2e3',
      contrastText: "#121212"
    },
    white: {
      main: '#ffffff',
      contrastText: "#121212"
    },
  },
  props: {
    MuiAppBar: {
      color: 'transparent',
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
     <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
  </React.StrictMode>
);
