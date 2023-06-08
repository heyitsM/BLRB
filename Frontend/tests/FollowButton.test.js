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
import FollowButton from "../components/Follow/FollowButton";

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

describe("Testing Follow Button", () => {
  test("Clicking follow button when not followed causes follow", async () => {
    mockedUsedNavigate.mockReset();
    localStorage.setItem("user-id", "fake user id"); 
    localStorage.setItem("user-token", "fake user id"); 

    const mockGetProfile = jest.spyOn(followingAPI, "getFollowingByFilter"); // account card profile
    mockGetProfile.mockResolvedValue({data:[null]})
    const mockFollow = jest.spyOn(followingAPI, "addFollowing"); // account card profile
    mockFollow.mockResolvedValue({data:{}})

    render(<ThemeProvider theme={darkTheme}>
      <MemoryRouter>
        <FollowButton blurbo_id={"blurbo-id"} userId={"fake user id"}/>
      </MemoryRouter>
    </ThemeProvider>)


    await waitFor(() => {
      expect(screen.getByText("Follow")).toBeDefined();
    })
    mockGetProfile.mockResolvedValue({data:[{id:"fake-id"}]})
    
    fireEvent.click(screen.getByTestId("follow-button"))


    await waitFor(() => {
      expect(screen.getByText("UnFollow")).toBeDefined();
    })
    
  })


  test("Clicking unfollow button when following causes unfollowed", async () => {
    mockedUsedNavigate.mockReset();
    localStorage.setItem("user-id", "fake user id"); 
    localStorage.setItem("user-token", "fake user id"); 

    const mockGetProfile = jest.spyOn(followingAPI, "getFollowingByFilter"); // account card profile
    mockGetProfile.mockResolvedValue({data:[{id:"fake-id"}]})
    const mockFollow = jest.spyOn(followingAPI, "removeFollowing"); // account card profile
    mockFollow.mockResolvedValue({data:{}})

    render(<ThemeProvider theme={darkTheme}>
      <MemoryRouter>
        <FollowButton blurbo_id={"blurbo-id"} userId={"fake user id"}/>
      </MemoryRouter>
    </ThemeProvider>)

    await waitFor(() => {
      expect(screen.getByText("UnFollow")).toBeDefined();
    })
    
    
    fireEvent.click(screen.getByTestId("follow-button"))
    mockGetProfile.mockResolvedValue({data:[null]})

    await waitFor(() => {
      expect(screen.getByText("Follow")).toBeDefined
    })
    
  })
    
});