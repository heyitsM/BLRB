import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import Explore from "../pages/Explore";
import * as postsAPI from "../api/post.js";
import * as followingAPI from "../api/following.js";
import { MemoryRouter } from "react-router-dom";
import * as userAPI from "../api/user.js";
import { ThemeProvider, createTheme } from "@mui/material";
import * as profileAPI from "../api/Profile.js";
import ExploreAccountCard from "../components/Explore/ExploreAccountCard";

const testUser = {
  created_at:"date", 
  email:"email@email.com", 
  first_name:"first", 
  id:"d29cde24-8274-4f97-b7fe-4639151c657a", 
  last_name:"last", 
  password:"hashed-pwd", 
  role:"PROFESSIONALY", 
  username:"testProfessional"
}

const testProfile = {
    bio : "bio", 
    display_name : "display name", 
    id : "6d219ccc-f7ca-4736-89bd-d90c961bed90", 
    profile_pic : null, 
    tags : ["art", "artist"], 
    update_date : "data",
    use_display_name : true, 
    userId : "d29cde24-8274-4f97-b7fe-4639151c657a"
}

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

const mockedUsedNavigate = jest.fn();

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: () => mockedUsedNavigate,
}));

// jest.mock('axios');

describe("Testing ExploreAccountCard", () => {
  test("All Explore account card fields are fully formed", async () => {
    mockedUsedNavigate.mockReset();
    localStorage.setItem("user-id", "fake user id"); localStorage.setItem("user-token", "fake user id"); 
    const mockGetProfile = jest.spyOn(profileAPI, "getProfile"); // account card profile
    mockGetProfile.mockResolvedValue({data:testProfile})

    render(<ThemeProvider theme={darkTheme}>
      <MemoryRouter>
        <ExploreAccountCard user={testUser}/>
      </MemoryRouter>
    </ThemeProvider>)

    await waitFor(() => {
      expect(screen.getByTestId("avatar")).toBeDefined();
      expect(screen.getByText("display name")).toBeDefined();
      expect(screen.getByTestId("displayname")).toBeDefined();
      expect(screen.getByTestId("username")).toBeDefined();
      expect(screen.getByText("@testProfessional")).toBeDefined();
      expect(screen.getByTestId("follow-button")).toBeDefined();
    })
            
  })


  test("clicking card nevigates to page", async () => {
    mockedUsedNavigate.mockReset();
    localStorage.setItem("user-id", "fake user id"); localStorage.setItem("user-token", "fake user id"); 
    const mockGetProfile = jest.spyOn(profileAPI, "getProfile"); // account card profile
    mockGetProfile.mockResolvedValue({data:testProfile})

    render(<ThemeProvider theme={darkTheme}>
      <MemoryRouter>
        <ExploreAccountCard user={testUser}/>
      </MemoryRouter>
    </ThemeProvider>)

    await waitFor(() => {
      expect(screen.getByTestId("account-action-area")).toBeDefined();
    })

    fireEvent.click(screen.getByTestId("account-action-area"));

    expect(mockedUsedNavigate).toHaveBeenCalledTimes(1);
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/profile/testProfessional');
  })
    
});