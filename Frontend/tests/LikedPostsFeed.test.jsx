import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import Explore from "../pages/Explore";
import * as postAPI from "../api/post.js";
import * as followingAPI from "../api/following.js";
import * as profileAPI from "../api/Profile.js";
import * as commentAPI from "../api/comment.js";
import * as userAPI from "../api/user.js";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import LikedPostFeed from "../pages/LikedPostFeed";

const testPost = {
  id: "686f3ded-39fd-4abd-8779-1afcc3391cc4",
  userId: "e56008f1-450e-4693-bc26-f87b17026d6f",
  img: null,
  body: "Does anyone know where I can find some cool flowers to take pics of? I need a new place to check out.",
  date_created: "2023-04-28T17:30:52.273Z",
  num_likes: 0,
  tags: [
    "ideas",
    "flowers",
    "nature",
    "hiking"
  ]
}

const testProfile = {
  bio : "bio", 
  display_name : "display name", 
  id : "6d219ccc-f7ca-4736-89bd-d90c961bed90", 
  profile_pic : null, 
  tags : [], 
  update_date : "data",
  use_display_name : true, 
  userId : "d29cde24-8274-4f97-b7fe-4639151c657a"
}

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

describe("Testing Liked Posts Feed Page", () => {

    test("Liked posts are display if they exist", async () => {
      mockedUsedNavigate.mockReset(); 
      localStorage.setItem("user-id", "fake user id");   
      localStorage.setItem("token-id", "fake user id");   
    
      const mockGetLikes = jest.spyOn(postAPI, "getLikesByFilter")
      mockGetLikes.mockResolvedValue({data:["like1"]});
      const mockGetPosts = jest.spyOn(postAPI, "getPost")
      mockGetPosts.mockResolvedValue({data:testPost});

      const mockGetProfile = jest.spyOn(profileAPI, "getProfile");
      mockGetProfile.mockResolvedValue({data:testProfile})
      const mockGetLike = jest.spyOn(postAPI, "getLike");
      mockGetLike.mockResolvedValue({data:true})
      const mockNumLikes = jest.spyOn(postAPI, "getNumLikes");
      mockNumLikes.mockResolvedValue(4324234)
      const mockComments = jest.spyOn(commentAPI, "getCommentByFilter");
      mockComments.mockResolvedValue({data:[]})
      const mockGetUser = jest.spyOn(userAPI, "getUser");
      mockGetUser.mockResolvedValue({ data:testUser})

      render(<ThemeProvider theme={darkTheme}>
        <MemoryRouter>
          <LikedPostFeed/>
        </MemoryRouter>
      </ThemeProvider>)

      await waitFor(() => {
        expect(screen.getByText("Does anyone know where I can find some cool flowers to take pics of? I need a new place to check out.")).toBeDefined();
      })

    })


    test("Liked posts are display if they don't exist", async () => {
      mockedUsedNavigate.mockReset(); 
      localStorage.setItem("user-id", "fake user id");   
      localStorage.setItem("token-id", "fake user id");   
    
      const mockGetLikes = jest.spyOn(postAPI, "getLikesByFilter")
      mockGetLikes.mockResolvedValue({data:[]});
      const mockGetPosts = jest.spyOn(postAPI, "getPost")
      mockGetPosts.mockResolvedValue({data:testPost});

      const mockGetProfile = jest.spyOn(profileAPI, "getProfile");
      mockGetProfile.mockResolvedValue({data:testProfile})
      const mockGetLike = jest.spyOn(postAPI, "getLike");
      mockGetLike.mockResolvedValue({data:true})
      const mockNumLikes = jest.spyOn(postAPI, "getNumLikes");
      mockNumLikes.mockResolvedValue(4324234)
      const mockComments = jest.spyOn(commentAPI, "getCommentByFilter");
      mockComments.mockResolvedValue({data:[]})
      const mockGetUser = jest.spyOn(userAPI, "getUser");
      mockGetUser.mockResolvedValue({ data:testUser})

      render(<ThemeProvider theme={darkTheme}>
        <MemoryRouter>
          <LikedPostFeed/>
        </MemoryRouter>
      </ThemeProvider>)

      await waitFor(() => {
        expect(screen.queryByText("Does anyone know where I can find some cool flowers to take pics of? I need a new place to check out.")).toBeNull();
      })

    })
    
});