import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import Explore from "../pages/Explore";
import * as postsAPI from "../api/post.js";
import * as followingAPI from "../api/following.js";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";

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

describe("Testing Explore Page", () => {

    test("navigate out of explore page if not signed in", () => {
        mockedUsedNavigate.mockReset(); 
        render(<ThemeProvider theme={darkTheme}>
                  <MemoryRouter>
                    <Explore/>
                  </MemoryRouter>
                </ThemeProvider>)
        expect(mockedUsedNavigate).toHaveBeenCalledTimes(1);
        expect(mockedUsedNavigate).toHaveBeenCalledWith('/forbidden', {replace:true})
    })


    // TODO: Distinguish between following and not following
    describe("Most Recent tab", () => {
        test("create post component appears in explore page", () => {
            mockedUsedNavigate.mockReset(); 
            localStorage.setItem("user-id", "fake user id");   
            localStorage.setItem("token-id", "fake user id");   

            render(<ThemeProvider theme={darkTheme}>
                <MemoryRouter>
                  <Explore/>
                </MemoryRouter>
              </ThemeProvider>)

            expect(screen.getByTestId("create-post")).toBeDefined();
        })

        test("No posts displays message", async () => {
            mockedUsedNavigate.mockReset(); 
            localStorage.setItem("user-id", "fake user id");   
            localStorage.setItem("token-id", "fake user id");   

            const mockPosts = jest.spyOn(postsAPI, 'getAllPosts');
            mockPosts.mockResolvedValue({data:[]});
            window.alert = jest.fn();

            render(<ThemeProvider theme={darkTheme}>
                <MemoryRouter>
                  <Explore/>
                </MemoryRouter>
              </ThemeProvider>)

            await waitFor(() => {
                expect(screen.getByText("No posts exist... Try making your own!")).toBeDefined();   
                expect(screen.queryByTestId("post")).toBeNull();
                expect(screen.queryByText("The people you follow have no posts... Try following more users!")).toBeNull();   
            })

        })

        test("When posts do exist, they are shown", async () => {
            mockedUsedNavigate.mockReset(); 
            localStorage.setItem("user-id", "fake user id");   
            localStorage.setItem("token-id", "fake user id");   

            const mockPosts = jest.spyOn(postsAPI, 'getAllPosts');
            mockPosts.mockResolvedValue({data:[testPost]});

            render(<ThemeProvider theme={darkTheme}>
                <MemoryRouter>
                  <Explore/>
                </MemoryRouter>
              </ThemeProvider>)

            await waitFor(() => {
              expect(screen.queryByText("No posts exist... Try making your own!")).toBeNull();
              expect(screen.getByTestId("post")).toBeDefined();
              expect(screen.queryByText("The people you follow have no posts... Try following more users!")).toBeNull();
            })
        })
    });
    
    describe("Following tab", () => {
        test("post component appears in explore page", async () => {
            mockedUsedNavigate.mockReset(); 
            localStorage.setItem("user-id", "fake user id");   
            localStorage.setItem("token-id", "fake user id");   

            render(<ThemeProvider theme={darkTheme}>
                <MemoryRouter>
                  <Explore/>
                </MemoryRouter>
              </ThemeProvider>)

            expect(screen.getByTestId("following-tab")).toBeDefined();
            fireEvent.click(screen.getByTestId("following-tab"));
            
            const mockPosts = jest.spyOn(postsAPI, 'getAllPosts');
            mockPosts.mockResolvedValue({data:[]});
            window.alert = jest.fn();

            expect(screen.getByTestId("create-post")).toBeDefined();
        })

        test("No posts displays message", async () => {
            mockedUsedNavigate.mockReset(); 
            localStorage.setItem("user-id", "fake user id");   
            localStorage.setItem("token-id", "fake user id");   
            const mockPosts = jest.spyOn(postsAPI, 'getAllPosts');
            mockPosts.mockResolvedValue({data:[]});
            const mockGetFollowing = jest.spyOn(followingAPI, 'getFollowingByFilter');
            mockGetFollowing.mockResolvedValue({data:[]});
            window.alert = jest.fn();

            render(<ThemeProvider theme={darkTheme}>
                <MemoryRouter>
                  <Explore/>
                </MemoryRouter>
              </ThemeProvider>)

            expect(screen.getByTestId("following-tab")).toBeDefined();
            fireEvent.click(screen.getByTestId("following-tab"));

            await waitFor(() => {
              expect(screen.getByText("The people you follow have no posts... Try following more users!")).toBeDefined();
              expect(screen.queryByTestId("post")).toBeNull();
              expect(screen.queryByText("No posts exist... Try making your own!")).toBeNull();
            })
            
        })

        test("When posts do exist, they are shown", () => {
            mockedUsedNavigate.mockReset(); 
            localStorage.setItem("user-id", "fake user id");   
            localStorage.setItem("token-id", "fake user id");   
            const mockPosts = jest.spyOn(postsAPI, 'getAllPosts');
            mockPosts.mockResolvedValue({data:[]});
            window.alert = jest.fn();

            render(<ThemeProvider theme={darkTheme}>
                <MemoryRouter>
                  <Explore/>
                </MemoryRouter>
              </ThemeProvider>)

            expect(screen.getByTestId("following-tab")).toBeDefined();
            fireEvent.click(screen.getByTestId("following-tab"));

            waitFor(() => {
                expect(screen.queryByText("No posts exist... Try making your own!")).toBeNull();
                expect(screen.queryByText("The people you follow have no posts... Try following more users!")).toBeNull();
                expect(screen.getByTestId("post")).toBeDefined();
            })
        })
    });
    
});