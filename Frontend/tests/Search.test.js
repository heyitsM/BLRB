import * as followingAPI from "../api/following";

const mockGetFollowing = jest.spyOn(followingAPI, "getFollowingByFilter"); // account card profile
mockGetFollowing.mockResolvedValue({data:{ data:[{id:"fake id"}] }})

jest.mock('axios');

import { fireEvent, render, screen } from "@testing-library/react";
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import SearchPage from "../pages/Search.jsx";
import * as postsAPI from "../api/post.js"
import * as profileAPI from "../api/Profile.js";
import * as commentAPI from "../api/comment.js";
import * as userAPI from "../api/user.js";
import {within} from '@testing-library/dom'
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";


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


const localStorageMock = (function () {
    let store = {};

    return {
        getItem(key) {
        return store[key];
        },

        setItem(key, value) {
        store[key] = value;
        },

        clear() {
        store = {};
        },

        removeItem(key) {
        delete store[key];
        },

        getAll() {
        return store;
        },
    };
})();
  
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("Testing Search Page", () => {

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

    test("Search bar appears well formed", async () => {
        mockedUsedNavigate.mockReset();
        localStorage.setItem("user-id", "fake user id"); 
        localStorage.setItem("user-token", "fake user token"); 
        const mockGetAllUsers = jest.spyOn(userAPI, "getAllUsers");
        mockGetAllUsers.mockResolvedValue({ data:[]})
        const mockGetUser = jest.spyOn(userAPI, "getUser");
        mockGetUser.mockResolvedValue({ data:testUser})

        render(<ThemeProvider theme={darkTheme}>
                  <MemoryRouter>
                    <SearchPage/>
                  </MemoryRouter>
               </ThemeProvider>)
               
        expect(await screen.findByTestId("select-post-button")).toBeDefined();
        expect(await screen.findByTestId("select-users-button")).toBeDefined();
        expect(await screen.findByTestId("query-field")).toBeDefined();
        expect(await screen.findByTestId("search-button")).toBeDefined();
        expect(await screen.findByTestId("autocomplete")).toBeDefined();
        expect(await screen.queryByTestId("post")).toBeNull();
        expect(await screen.queryByTestId("user")).toBeNull();
        expect(await screen.queryByTestId("bad-submission-alert")).toBeNull();
    })

    describe("post tests", () => {
        test("Text field displays msg when searching posts", async () => {
            mockedUsedNavigate.mockReset();
            localStorage.setItem("user-id", "fake user id"); localStorage.setItem("user-token", "fake user id"); 
            const mockGetAllUsers = jest.spyOn(userAPI, "getAllUsers");
            mockGetAllUsers.mockResolvedValue({ data:[]})
            const mockGetUser = jest.spyOn(userAPI, "getUser");
            mockGetUser.mockResolvedValue({ data:testUser})

            render(<ThemeProvider theme={darkTheme}>
                  <MemoryRouter>
                    <SearchPage/>
                  </MemoryRouter>
               </ThemeProvider>)
            expect(await screen.findByPlaceholderText("Search for Posts")).toBeDefined();
        })

        test("Searching posts without query shows alert", async () => {
            mockedUsedNavigate.mockReset();
            localStorage.setItem("user-id", "fake user id"); localStorage.setItem("user-token", "fake user id"); 
            const mockGetAllUsers = jest.spyOn(userAPI, "getAllUsers");
            mockGetAllUsers.mockResolvedValue({ data:[]})
            const mockGetUser = jest.spyOn(userAPI, "getUser");
            mockGetUser.mockResolvedValue({ data:testUser})

            
            render(<ThemeProvider theme={darkTheme}>
                  <MemoryRouter>
                    <SearchPage/>
                  </MemoryRouter>
               </ThemeProvider>);
            await userEvent.click(await screen.findByTestId("search-button"));
            expect(await screen.findByTestId("bad-submission-alert")).toBeDefined();
            expect(await screen.findByText("Please enter a search request!")).toBeDefined();
        })

        test("Searching posts with query but not tags is not erroneous", async () => {
            mockedUsedNavigate.mockReset();
            localStorage.setItem("user-id", "fake user id"); localStorage.setItem("user-token", "fake user id"); 
            const mockGetAllUsers = jest.spyOn(userAPI, "getAllUsers");
            mockGetAllUsers.mockResolvedValue({ data:[]})
            const mockGetUser = jest.spyOn(userAPI, "getUser");
            mockGetUser.mockResolvedValue({ data:testUser})

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

            const mockFilterPost = jest.spyOn(postsAPI, "getPostByFilter");
            mockFilterPost.mockResolvedValue({data:[testPost]})

            const mockGetProfile = jest.spyOn(profileAPI, "getProfile");
            mockGetProfile.mockResolvedValue({data:testProfile})
            const mockGetLike = jest.spyOn(postsAPI, "getLike");
            mockGetLike.mockResolvedValue({data:true})
            const mockNumLikes = jest.spyOn(postsAPI, "getNumLikes");
            mockNumLikes.mockResolvedValue(4324234)
            const mockComments = jest.spyOn(commentAPI, "getCommentByFilter");
            mockComments.mockResolvedValue({data:[]})

            render(<ThemeProvider theme={darkTheme}>
                  <MemoryRouter>
                    <SearchPage/>
                  </MemoryRouter>
               </ThemeProvider>)
            const field = await screen.findByTestId('search-input')
            fireEvent.change(field, {target: {value: "q34234"}});
            await userEvent.click(await screen.findByTestId("search-button"));
            expect(await screen.queryByTestId("bad-submission-alert")).toBeNull();
        })

        test("Searching posts with tags but not query is not erroneous", async () => {
            mockedUsedNavigate.mockReset();
            localStorage.setItem("user-id", "fake user id"); localStorage.setItem("user-token", "fake user id"); 
            const mockGetAllUsers = jest.spyOn(userAPI, "getAllUsers");
            mockGetAllUsers.mockResolvedValue({ data:[]})
            const mockGetUser = jest.spyOn(userAPI, "getUser");
            mockGetUser.mockResolvedValue({ data:testUser})

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

            const mockFilterPost = jest.spyOn(postsAPI, "getPostByFilter");
            mockFilterPost.mockResolvedValue({data:[testPost]})

            const mockGetProfile = jest.spyOn(profileAPI, "getProfile");
            mockGetProfile.mockResolvedValue({data:testProfile})
            const mockGetLike = jest.spyOn(postsAPI, "getLike");
            mockGetLike.mockResolvedValue({data:true})
            const mockNumLikes = jest.spyOn(postsAPI, "getNumLikes");
            mockNumLikes.mockResolvedValue(4324234)
            const mockComments = jest.spyOn(commentAPI, "getCommentByFilter");
            mockComments.mockResolvedValue({data:[]})

            render(<ThemeProvider theme={darkTheme}>
                  <MemoryRouter>
                    <SearchPage/>
                  </MemoryRouter>
               </ThemeProvider>)
            
            const autocomplete = await screen.findByTestId('autocomplete');
            const input = within(autocomplete).getByRole('combobox');
            autocomplete.focus();
            fireEvent.change(input, { target: { value: 'watercolor' } });
            fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
            fireEvent.keyDown(autocomplete, { key: 'Enter' });
            
            await userEvent.click(await screen.findByTestId("search-button"));
            expect(await screen.queryByTestId("bad-submission-alert")).toBeNull();
        })

        test("empty search result shows alert", async () => {
            mockedUsedNavigate.mockReset();
            localStorage.setItem("user-id", "fake user id"); localStorage.setItem("user-token", "fake user id"); 
            const mockGetAllUsers = jest.spyOn(userAPI, "getAllUsers");
            mockGetAllUsers.mockResolvedValue({ data:[]})
            const mockGetUser = jest.spyOn(userAPI, "getUser");
            mockGetUser.mockResolvedValue({ data:testUser})

            const mockFilterPost = jest.spyOn(postsAPI, "getPostByFilter");
            mockFilterPost.mockResolvedValue({data:[]})

            render(<ThemeProvider theme={darkTheme}>
                  <MemoryRouter>
                    <SearchPage/>
                  </MemoryRouter>
               </ThemeProvider>)

            const field = await screen.findByTestId('search-input')
            fireEvent.change(field, {target: {value: "q34234"}});
            await userEvent.click(await screen.findByTestId("search-button"));
            expect(await screen.findByTestId("bad-submission-alert")).toBeDefined();
            expect(await screen.findByText("No posts found with this query!")).toBeDefined();
        })
        
        test("search shows results", async () => {
            mockedUsedNavigate.mockReset();
            localStorage.setItem("user-id", "fake user id"); localStorage.setItem("user-token", "fake user id"); 
            const mockGetAllUsers = jest.spyOn(userAPI, "getAllUsers");
            mockGetAllUsers.mockResolvedValue({ data:[]})
            const mockGetUser = jest.spyOn(userAPI, "getUser");
            mockGetUser.mockResolvedValue({ data:testUser})

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

            const mockFilterPost = jest.spyOn(postsAPI, "getPostByFilter");
            mockFilterPost.mockResolvedValue({data:[
                {
                    body:"fake post body",
                    date_created:"2023-04-07T18:54:09.700Z",
                    id:"fake-post-id",
                    img:null,
                    num_likes:100,
                    tags:[],
                    userId:"fake-user-id",
                }
            ]})

            const mockGetProfile = jest.spyOn(profileAPI, "getProfile");
            mockGetProfile.mockResolvedValue({data:testProfile})
            const mockGetLike = jest.spyOn(postsAPI, "getLike");
            mockGetLike.mockResolvedValue({data:true})
            const mockNumLikes = jest.spyOn(postsAPI, "getNumLikes");
            mockNumLikes.mockResolvedValue(4324234)
            const mockComments = jest.spyOn(commentAPI, "getCommentByFilter");
            mockComments.mockResolvedValue({data:[]})

            render(<ThemeProvider theme={darkTheme}>
                  <MemoryRouter>
                    <SearchPage/>
                  </MemoryRouter>
               </ThemeProvider>)

            const field = await screen.findByTestId('search-input')
            fireEvent.change(field, {target: {value: "test-search"}});
            await userEvent.click(await screen.findByTestId("search-button"));
            expect(await screen.findByTestId("post")).toBeDefined();
            expect(await screen.findByText("fake post body")).toBeDefined();
        })
        
    })

    describe("users tests", () => {
        const mockUserSearchResult = [{
          id : "test-profile-id",
          bio : "bio", 
          userId: "2089b589-0920-4362-9dca-7c7a65b992c9",
          display_name : "displayname",
          use_display_name : true,
          profile_pic : null,
          update_date : "update-date",
          user : { 
            id: 'test-user-id', 
            email: 'email@email.com', 
            first_name:"firstname", 
            last_name:"lastname", 
            username:"username",
            password:"$2a$10$AbBRiLOyP3uxUuRT0pockO71RSIPL8jk.zOQd46EOEirkQjV/SFSq", 
            created_at: "2023-04-28T20:03:58.981Z",
            role:"PROFESSIONALY", 
          },
          tags : [],
        }]

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

        test("Text field displays msg when searching user", async () => {
            mockedUsedNavigate.mockReset();
            localStorage.setItem("user-id", "fake user id"); localStorage.setItem("user-token", "fake user id"); 
                const mockGetAllUsers = jest.spyOn(userAPI, "getAllUsers");
            mockGetAllUsers.mockResolvedValue({ data:[]})
            const mockGetUser = jest.spyOn(userAPI, "getUser");
            mockGetUser.mockResolvedValue({ data:testUser})

            render(<ThemeProvider theme={darkTheme}>
                  <MemoryRouter>
                    <SearchPage/>
                  </MemoryRouter>
               </ThemeProvider>)
            await userEvent.click(await screen.findByTestId("select-users-button"));
            expect(await screen.findByPlaceholderText("Search for display names or @Usernames")).toBeDefined();
        })

        test("Searching user without query shows alert", async () => {
            mockedUsedNavigate.mockReset();
            localStorage.setItem("user-id", "fake user id"); localStorage.setItem("user-token", "fake user id"); 
                const mockGetAllUsers = jest.spyOn(userAPI, "getAllUsers");
            mockGetAllUsers.mockResolvedValue({ data:[]})
            const mockGetUser = jest.spyOn(userAPI, "getUser");
            mockGetUser.mockResolvedValue({ data:testUser})

            render(<ThemeProvider theme={darkTheme}>
                  <MemoryRouter>
                    <SearchPage/>
                  </MemoryRouter>
               </ThemeProvider>)
            await userEvent.click(await screen.findByTestId("select-users-button"));
            await userEvent.click(await screen.findByTestId("search-button"));
            expect(await screen.findByTestId("bad-submission-alert")).toBeDefined();
            expect(await screen.findByText("Please enter a search request!")).toBeDefined();
        })

        test("Searching user with query but not tags is not erroneous", async () => {
            mockedUsedNavigate.mockReset();
            localStorage.setItem("user-id", "fake user id"); localStorage.setItem("user-token", "fake user id"); 
                const mockGetAllUsers = jest.spyOn(userAPI, "getAllUsers");
            mockGetAllUsers.mockResolvedValue({ data:[]})
            const mockGetUser = jest.spyOn(userAPI, "getUser");
            mockGetUser.mockResolvedValue({ data:testUser})

            const mockUserResult = jest.spyOn(profileAPI, "userSearch");
            mockUserResult.mockResolvedValue({ data:mockUserSearchResult})

            render(<ThemeProvider theme={darkTheme}>
                  <MemoryRouter>
                    <SearchPage/>
                  </MemoryRouter>
               </ThemeProvider>)
            await userEvent.click(await screen.findByTestId("select-users-button"));
            const field = await screen.findByTestId('search-input')
            fireEvent.change(field, {target: {value: "q34234"}});
            await userEvent.click(await screen.findByTestId("search-button"));
            expect(await screen.queryByTestId("bad-submission-alert")).toBeNull();
        })

        test("Searching user with tags but not query is not erroneous", async () => {
            mockedUsedNavigate.mockReset();
            localStorage.setItem("user-id", "fake user id"); localStorage.setItem("user-token", "fake user id"); 
                const mockGetAllUsers = jest.spyOn(userAPI, "getAllUsers");
            mockGetAllUsers.mockResolvedValue({ data:[]})
            const mockGetUser = jest.spyOn(userAPI, "getUser");
            mockGetUser.mockResolvedValue({ data:testUser})

            const mockUserResult = jest.spyOn(profileAPI, "userSearch"); // user result
            mockUserResult.mockResolvedValue({ data:mockUserSearchResult})
            const mockGetProfile = jest.spyOn(profileAPI, "getProfile"); // account card profile
            mockGetProfile.mockResolvedValue({data:testProfile})
            const mockGetFollowing = jest.spyOn(followingAPI, "getFollowingByFilter"); // account card profile
            mockGetFollowing.mockResolvedValue({data:{ data:[{id:"fake id"}] }})

            render(<ThemeProvider theme={darkTheme}>
                  <MemoryRouter>
                    <SearchPage/>
                  </MemoryRouter>
               </ThemeProvider>)
            await userEvent.click(await screen.findByTestId("select-users-button"));
            const autocomplete = await screen.findByTestId('autocomplete');
            const input = within(autocomplete).getByRole('combobox');
            autocomplete.focus();
            fireEvent.change(input, { target: { value: 'watercolor' } });
            fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
            fireEvent.keyDown(autocomplete, { key: 'Enter' });
            
            await userEvent.click(await screen.findByTestId("search-button"));
            expect(await screen.queryByTestId("bad-submission-alert")).toBeNull();
        })

        test("empty search result shows alert", async () => {
            mockedUsedNavigate.mockReset();
            localStorage.setItem("user-id", "fake user id"); localStorage.setItem("user-token", "fake user id"); 
                const mockGetAllUsers = jest.spyOn(userAPI, "getAllUsers");
            mockGetAllUsers.mockResolvedValue({ data:[]})
            const mockGetUser = jest.spyOn(userAPI, "getUser");
            mockGetUser.mockResolvedValue({ data:testUser})

            const mockUserResult = jest.spyOn(profileAPI, "userSearch");
            mockUserResult.mockResolvedValue({ data:[]})
            const mockGetProfile = jest.spyOn(profileAPI, "getProfile"); // account card profile
            mockGetProfile.mockResolvedValue({data:testProfile})
            const mockGetFollowing = jest.spyOn(followingAPI, "getFollowingByFilter"); // account card profile
            mockGetFollowing.mockResolvedValue({data:{ data:[{id:"fake id"}] }})

            render(<ThemeProvider theme={darkTheme}>
                  <MemoryRouter>
                    <SearchPage/>
                  </MemoryRouter>
               </ThemeProvider>)
            await userEvent.click(await screen.findByTestId("select-users-button"));
            const field = await screen.findByTestId('search-input')
            fireEvent.change(field, {target: {value: "q34234"}});
            await userEvent.click(await screen.findByTestId("search-button"));
            expect(await screen.findByTestId("bad-submission-alert")).toBeDefined();
            expect(await screen.findByText("No users found with this query!")).toBeDefined();          
        })

        test("search shows professional user's result correctly", async () => {
            mockedUsedNavigate.mockReset();
            localStorage.setItem("user-id", "fake user id"); localStorage.setItem("user-token", "fake user id"); 
                const mockGetAllUsers = jest.spyOn(userAPI, "getAllUsers");
            mockGetAllUsers.mockResolvedValue({ data:[]})
            const mockGetUser = jest.spyOn(userAPI, "getUser");
            mockGetUser.mockResolvedValue({ data:testUser})

            const mockUserResult = jest.spyOn(profileAPI, "userSearch");
            mockUserResult.mockResolvedValue({ data:mockUserSearchResult})
            const mockGetProfile = jest.spyOn(profileAPI, "getProfile"); // account card profile
            mockGetProfile.mockResolvedValue({data:testProfile})
            const mockGetFollowing = jest.spyOn(followingAPI, "getFollowingByFilter"); // account card profile
            mockGetFollowing.mockResolvedValue({data:{ data:[{id:"fake id"}] }})

            render(<ThemeProvider theme={darkTheme}>
                  <MemoryRouter>
                    <SearchPage/>
                  </MemoryRouter>
               </ThemeProvider>)
            await userEvent.click(await screen.findByTestId("select-users-button"));  
            
            const field = await screen.findByTestId('search-input')
            fireEvent.change(field, {target: {value: "test-search"}});
            await userEvent.click(await screen.findByTestId("search-button"));

            expect(await screen.findByTestId("user")).toBeDefined();
            expect(await screen.findByText("display name")).toBeDefined();
            expect(await screen.findByText("@username")).toBeDefined();
            expect(await screen.findByText("Professional Artist")).toBeDefined();
        })

        test("search shows recruiter user's result correctly", async () => {
            mockedUsedNavigate.mockReset();
            localStorage.setItem("user-id", "fake user id"); localStorage.setItem("user-token", "fake user id"); 
                const mockGetAllUsers = jest.spyOn(userAPI, "getAllUsers");
            mockGetAllUsers.mockResolvedValue({ data:[]})
            const mockGetUser = jest.spyOn(userAPI, "getUser");
            mockGetUser.mockResolvedValue({ data:testUser})

            const mockGetProfile = jest.spyOn(profileAPI, "getProfile"); // account card profile
            mockGetProfile.mockResolvedValue({data:testProfile})
            const mockGetFollowing = jest.spyOn(followingAPI, "getFollowingByFilter"); // account card profile
            mockGetFollowing.mockResolvedValue({data:{ data:[{id:"fake id"}] }})

            const mockUserResult = jest.spyOn(profileAPI, "userSearch");
            mockUserResult.mockResolvedValue({ data:[{
                bio : "bio", 
                display_name : "displayname",
                id : "test-profile-id",
                profile_pic : null,
                tags : [],
                update_date : "update-date",
                use_display_name : true,
                user : { 
                    id: 'test-user-id', 
                    email: 'email@email.com', 
                    first_name:"firstname", 
                    id:"009a4478-104c-4551-b637-d1a7a64ad811", 
                    last_name:"lastname", 
                    password:"$2a$10$AbBRiLOyP3uxUuRT0pockO71RSIPL8jk.zOQd46EOEirkQjV/SFSq", 
                    role:"RECRUITER", 
                    username:"username"
                }
            }]})

            render(<ThemeProvider theme={darkTheme}>
                  <MemoryRouter>
                    <SearchPage/>
                  </MemoryRouter>
               </ThemeProvider>)
            await userEvent.click(await screen.findByTestId("select-users-button"));  
            
            const field = await screen.findByTestId('search-input')
            fireEvent.change(field, {target: {value: "test-search"}});
            await userEvent.click(await screen.findByTestId("search-button"));
            expect(await screen.findByTestId("user")).toBeDefined();
            expect(await screen.findByText("display name")).toBeDefined();
            expect(await screen.findByText("@username")).toBeDefined();
            expect(await screen.findByText("Business Recruiter")).toBeDefined();
        })

        test("search shows hobbyist user's result correctly", async () => {
            mockedUsedNavigate.mockReset();
            localStorage.setItem("user-id", "fake user id"); localStorage.setItem("user-token", "fake user id"); 
                const mockGetAllUsers = jest.spyOn(userAPI, "getAllUsers");
            mockGetAllUsers.mockResolvedValue({ data:[]})
            const mockGetUser = jest.spyOn(userAPI, "getUser");
            mockGetUser.mockResolvedValue({ data:testUser})
            const mockGetProfile = jest.spyOn(profileAPI, "getProfile"); // account card profile
            mockGetProfile.mockResolvedValue({data:testProfile})
            const mockGetFollowing = jest.spyOn(followingAPI, "getFollowingByFilter"); // account card profile
            mockGetFollowing.mockResolvedValue({data:{ data:[{id:"fake id"}] }})

            const mockUserResult = jest.spyOn(profileAPI, "userSearch");
            mockUserResult.mockResolvedValue({ data:[{
                bio : "bio", 
                display_name : "displayname",
                id : "test-profile-id",
                profile_pic : null,
                tags : [],
                update_date : "update-date",
                use_display_name : true,
                user : { 
                    id: 'test-user-id', 
                    email: 'email@email.com', 
                    first_name:"firstname", 
                    id:"009a4478-104c-4551-b637-d1a7a64ad811", 
                    last_name:"lastname", 
                    password:"$2a$10$AbBRiLOyP3uxUuRT0pockO71RSIPL8jk.zOQd46EOEirkQjV/SFSq", 
                    role:"HOBBYIST", 
                    username:"username"
                }
            }]})

            render(<ThemeProvider theme={darkTheme}>
                  <MemoryRouter>
                    <SearchPage/>
                  </MemoryRouter>
               </ThemeProvider>)
            await userEvent.click(await screen.findByTestId("select-users-button"));  
            
            const field = await screen.findByTestId('search-input')
            fireEvent.change(field, {target: {value: "test-search"}});
            await userEvent.click(await screen.findByTestId("search-button"));
            expect(await screen.findByTestId("user")).toBeDefined();
            expect(await screen.findByText("display name")).toBeDefined();
            expect(await screen.findByText("@username")).toBeDefined();
            expect(await screen.findByText("Casual Artist")).toBeDefined();
        })

        test("clicking user navigates to their page", async () => {
            mockedUsedNavigate.mockReset();
            localStorage.setItem("user-id", "fake user id"); localStorage.setItem("user-token", "fake user id"); 
                const mockGetAllUsers = jest.spyOn(userAPI, "getAllUsers");
            mockGetAllUsers.mockResolvedValue({ data:[]})
            const mockGetUser = jest.spyOn(userAPI, "getUser");
            mockGetUser.mockResolvedValue({ data:testUser})

            const mockUserResult = jest.spyOn(profileAPI, "userSearch");
            mockUserResult.mockResolvedValue({ data:mockUserSearchResult})

            render(<ThemeProvider theme={darkTheme}>
              <MemoryRouter>
                <SearchPage/>
              </MemoryRouter>
           </ThemeProvider>)
            await userEvent.click(await screen.findByTestId("select-users-button"));
            const field = await screen.findByTestId('search-input')
            fireEvent.change(field, {target: {value: "test-search"}});
            await userEvent.click(await screen.findByTestId("search-button"));
            await userEvent.click(await screen.findByTestId("account-action-area"));
            expect(mockedUsedNavigate).toHaveBeenCalledTimes(1);
            expect(mockedUsedNavigate).toHaveBeenCalledWith('/profile/username');
        })
    })
});