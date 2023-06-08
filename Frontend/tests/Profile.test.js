import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import * as portfolio from "../api/portfolio.js";
import userEvent from '@testing-library/user-event';
import Profile from "../components/Profile/Profile.jsx";
import * as postsAPI from "../api/post.js"
import * as profileAPI from "../api/Profile.js";
import * as followingAPI from "../api/following.js";
import * as profArtistAPI from "../api/professionalArtistInfo.js";
import * as recruiterAPI from "../api/recruiterInfo.js";
import * as paymentAPI from "../api/payments.js";
import * as commentAPI from "../api/comment.js";
import * as userAPI from "../api/user.js";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";

const mockedUsedNavigate = jest.fn();

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: () => mockedUsedNavigate,
}));

jest.mock('axios');

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

  describe("Testing A person's own view of their own profile ", () => {

    test("when no user is logged in, navigate out", () => {
        mockedUsedNavigate.mockReset(); 
        render(<ThemeProvider theme={darkTheme}>
                  <MemoryRouter>
                    <Profile/>
                  </MemoryRouter>
                </ThemeProvider>)
        expect(mockedUsedNavigate).toHaveBeenCalledTimes(1);
        expect(mockedUsedNavigate).toHaveBeenCalledWith('/forbidden', {replace:true})
    })
    
    describe("Professional profile", () => {
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

      test("professional view of own page", () => {
        mockedUsedNavigate.mockReset(); 
        localStorage.setItem("user-id", "fake user id");   
        
        const mockGetUser = jest.spyOn(userAPI, "getUser"); 
        localStorage.setItem("user-token", "fake user id"); 
        mockGetUser.mockResolvedValue({ data:testUser})
        const mockGetProfile = jest.spyOn(profileAPI, "getProfile");
        mockGetProfile.mockResolvedValue({data:testProfile})
        const mockGetFollowing = jest.spyOn(followingAPI, "getFollowingByFilter"); // account card profile
        mockGetFollowing.mockResolvedValue({data:[{id:"fake id"}]})
        const mockFilterPost = jest.spyOn(postsAPI, "getPostByFilter");
        mockFilterPost.mockResolvedValue({data:[]})

        render(<ThemeProvider theme={darkTheme}>
          <MemoryRouter>
            <Profile user={testUser} profile={testProfile} editable={true}/>
          </MemoryRouter>
        </ThemeProvider>)
          

        expect(screen.getByTestId("edit-prof-button")).toBeDefined();
        expect(screen.getByTestId("avatar")).toBeDefined();
        expect(screen.getByTestId("username")).toBeDefined();
        expect(screen.getByTestId("displayname")).toBeDefined();
        expect(screen.getByTestId("prof-tabs")).toBeDefined();
        expect(screen.getByTestId("posts-tab")).toBeDefined();
        expect(screen.getByTestId("portfolio-tab")).toBeDefined();
        expect(screen.getByTestId("resume-tab")).toBeDefined();
        expect(screen.getByTestId("bio")).toBeDefined();
      })

      test("outsider view of professional given recruiter", () => {
          mockedUsedNavigate.mockReset(); 
          localStorage.setItem("user-id", "fake user id");   
          
          const mockGetUser = jest.spyOn(userAPI, "getUser"); 
          localStorage.setItem("user-token", "fake user id"); 
          mockGetUser.mockResolvedValue({ data:testUser})
          const mockGetProfile = jest.spyOn(profileAPI, "getProfile");
          mockGetProfile.mockResolvedValue({data:testProfile})
          const mockGetFollowing = jest.spyOn(followingAPI, "getFollowingByFilter"); // account card profile
          mockGetFollowing.mockResolvedValue({data:[{id:"fake id"}]})
          const mockFilterPost = jest.spyOn(postsAPI, "getPostByFilter");
          mockFilterPost.mockResolvedValue({data:[]})

          render(<ThemeProvider theme={darkTheme}>
            <MemoryRouter>
              <Profile user={testUser} profile={testProfile} editable={false} outsideRole="RECRUITER"/>
            </MemoryRouter>
          </ThemeProvider>)
          

        expect(screen.queryByTestId("edit-prof-button")).toBeNull();
        expect(screen.getByTestId("avatar")).toBeDefined();
        expect(screen.getByTestId("username")).toBeDefined();
        expect(screen.getByTestId("displayname")).toBeDefined();
        expect(screen.getByTestId("follow-button")).toBeDefined();
        expect(screen.getByTestId("resume-tab")).toBeDefined();
        expect(screen.getByTestId("mail-button")).toBeDefined();
        expect(screen.getByTestId("prof-tabs")).toBeDefined();
        expect(screen.getByTestId("posts-tab")).toBeDefined();
        expect(screen.getByTestId("portfolio-tab")).toBeDefined();
        expect(screen.getByTestId("bio")).toBeDefined();
      })

      test("outsider view of professional given hobbyist or professional", () => {
        mockedUsedNavigate.mockReset(); 
        localStorage.setItem("user-id", "fake user id");   
        
        const mockGetUser = jest.spyOn(userAPI, "getUser"); 
        localStorage.setItem("user-token", "fake user id"); 
        mockGetUser.mockResolvedValue({ data:testUser})
        const mockGetProfile = jest.spyOn(profileAPI, "getProfile");
        mockGetProfile.mockResolvedValue({data:testProfile})
        const mockGetFollowing = jest.spyOn(followingAPI, "getFollowingByFilter"); // account card profile
        mockGetFollowing.mockResolvedValue({data:[{id:"fake id"}]})
        const mockFilterPost = jest.spyOn(postsAPI, "getPostByFilter");
        mockFilterPost.mockResolvedValue({data:[]})

        render(<ThemeProvider theme={darkTheme}>
          <MemoryRouter>
            <Profile user={testUser} profile={testProfile} editable={false} outsideRole="HOBBYIST"/>
          </MemoryRouter>
        </ThemeProvider>)

        expect(screen.queryByTestId("edit-prof-button")).toBeNull();
        expect(screen.getByTestId("avatar")).toBeDefined();
        expect(screen.getByTestId("username")).toBeDefined();
        expect(screen.getByTestId("displayname")).toBeDefined();
        expect(screen.getByTestId("follow-button")).toBeDefined();
        // will not be true rn
        expect(screen.queryByTestId("mail-button")).toBeNull();
        expect(screen.queryByTestId("resume-tab")).toBeNull();
        expect(screen.getByTestId("prof-tabs")).toBeDefined();
        expect(screen.getByTestId("posts-tab")).toBeDefined();
        
        expect(screen.getByTestId("portfolio-tab")).toBeDefined();
        expect(screen.getByTestId("bio")).toBeDefined();
      })

      test("click portoflio has everything", () => {
        mockedUsedNavigate.mockReset(); 
        localStorage.setItem("user-id", "fake user id"); 
        const mockGetImages = jest.spyOn(portfolio, 'getAllPortfolioItems');
        mockGetImages.mockResolvedValue([]);          
        render(<ThemeProvider theme={darkTheme}>
                <MemoryRouter>
                  <Profile user={testUser} profile={testProfile} editable={true}/>
                </MemoryRouter>
              </ThemeProvider>)

        fireEvent.click(screen.getByTestId("portfolio-tab"))
        expect(screen.getByTestId("add-button")).toBeDefined();
      })  

      test("click resume has nothing when no pdf is uploaded in editor view", () => {
        mockedUsedNavigate.mockReset(); 
        localStorage.setItem("user-id", "fake user id"); 

        const mockResume = jest.spyOn(profArtistAPI, "getInfo"); 
        mockResume.mockResolvedValue({data:{data:{pdf_link:null}}})
        
        render(<ThemeProvider theme={darkTheme}>
          <MemoryRouter>
            <Profile user={testUser} profile={testProfile} editable={true}/>
          </MemoryRouter>
        </ThemeProvider>)
        
        fireEvent.click(screen.getByTestId("resume-tab"))
        expect(screen.getByTestId("pdf-upload")).toBeDefined();
        expect(screen.getAllByText("Preview Area")).toBeDefined();
      })

      test("resume upload goes as expected", async () => {
        mockedUsedNavigate.mockReset(); 
        localStorage.setItem("user-id", "fake user id"); 
        localStorage.setItem("user-token", "fake user id"); 

        const mockResume = jest.spyOn(profArtistAPI, "getInfo"); 
        mockResume.mockResolvedValue({data:{data:{pdf_link:null}}})
        global.URL.createObjectURL = jest.fn(() => "pdf url"); // allows pdf upload
        
        const mockIntersectionObserver = jest.fn();
        mockIntersectionObserver.mockReturnValue({
          observe: () => null,
          unobserve: () => null,
          disconnect: () => null
        });
        window.IntersectionObserver = mockIntersectionObserver;
        
        const uploadResume = jest.spyOn(profArtistAPI, "uploadResume"); // mocks upload process
        uploadResume.mockResolvedValue({data:""})
        
        const pdf = new File(['hello'], 'hello.pdf', {type: 'application/pdf'}) // fake pdf
        
        render(<ThemeProvider theme={darkTheme}>
                <MemoryRouter>
                  <Profile user={testUser} profile={testProfile} editable={true}/>
                </MemoryRouter>
              </ThemeProvider>)
        
        fireEvent.click(screen.getByTestId("resume-tab"))
        expect(screen.getByTestId("pdf-upload")).toBeDefined();
        
        // add pdf
        mockResume.mockResolvedValue({data:{data:{pdf_link:"fake_resume.pdf"}}})
        const pdfUpload = screen.getByTestId("pdf-upload");
        await userEvent.upload(pdfUpload, pdf);
        fireEvent.click(screen.getByTestId("upload-button"))
      })

      test("deleting pdf works", async () => {
        mockedUsedNavigate.mockReset(); 
        localStorage.setItem("useqr-id", "fake user id"); 
        localStorage.setItem("user-token", "fake user id"); 

        const mockResume = jest.spyOn(profArtistAPI, "getInfo"); 
        mockResume.mockResolvedValue({data:{pdf_link:"fake_resume.pdf"}})

        const mockDelete = jest.spyOn(profArtistAPI, "deleteResume"); 
        mockDelete.mockResolvedValue({data:""})
        
        global.URL.createObjectURL = jest.fn(() => "pdf url"); // allows pdf upload
        const mockIntersectionObserver = jest.fn();
        mockIntersectionObserver.mockReturnValue({
          observe: () => null,
          unobserve: () => null,
          disconnect: () => null
        });
        window.IntersectionObserver = mockIntersectionObserver;
        
        render(<ThemeProvider theme={darkTheme}>
                <MemoryRouter>
                  <Profile user={testUser} profile={testProfile} editable={true}/>
                </MemoryRouter>
              </ThemeProvider>)
        
        fireEvent.click(screen.getByTestId("resume-tab"))

        // wait for result to resolve
        await waitFor(() => {
          expect(screen.getByTestId("delete-button")).toBeDefined();
        }, {timeout:5000})

        fireEvent.click(screen.getByTestId("delete-button"));
      })

      test("can update profile with well formed", async () => {
        mockedUsedNavigate.mockReset(); 
        localStorage.setItem("user-id", "fake user id");   
        
        const mockGetUser = jest.spyOn(userAPI, "getUser"); 
        localStorage.setItem("user-token", "fake user id"); 
        mockGetUser.mockResolvedValue({ data:testUser})
        const mockGetProfile = jest.spyOn(profileAPI, "getProfile");
        mockGetProfile.mockResolvedValue({data:testProfile})
        const mockGetFollowing = jest.spyOn(followingAPI, "getFollowingByFilter"); // account card profile
        mockGetFollowing.mockResolvedValue({data:[{id:"fake id"}]})
        const mockFilterPost = jest.spyOn(postsAPI, "getPostByFilter");
        mockFilterPost.mockResolvedValue({data:[]})
        const mockUrl = jest.spyOn(paymentAPI, "getOnboardingURL")
        mockUrl.mockResolvedValue("url")
        const mockAccountEnabled = jest.spyOn(paymentAPI, "isAccountEnabled")
        mockAccountEnabled.mockResolvedValue(true)

        render(<ThemeProvider theme={darkTheme}>
          <MemoryRouter>
            <Profile user={testUser} profile={testProfile} editable={true}/>
          </MemoryRouter>
        </ThemeProvider>)
          

        fireEvent.click(screen.getByTestId("edit-prof-button"));
        
        await waitFor(() => {
          expect(screen.getByTestId("payment-button")).toBeDefined();
        }, {timeout:5000})
        expect(screen.getByTestId("cancel-button")).toBeDefined();
        expect(screen.getByTestId("save-button")).toBeDefined();
        expect(screen.getByTestId("display-name-field")).toBeDefined();
        expect(screen.getByTestId("bio-field")).toBeDefined();
        expect(screen.getAllByTestId("autocomplete")).toBeDefined();
        expect(screen.queryByTestId("company-info-field")).toBeNull();
        expect(screen.queryByTestId("position-field")).toBeNull();
      })

    })
    
    describe("Recruiter profile", () => {
        const testUser = {
            created_at:"date", 
            email:"email@email.com", 
            first_name:"first", 
            id:"d29cde24-8274-4f97-b7fe-4639151c657a", 
            last_name:"last", 
            password:"hashed-pwd", 
            role:"RECRUITER", 
            username:"testProfessional"
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


        test("all features load properly", () => {
          mockedUsedNavigate.mockReset(); 
          localStorage.setItem("user-id", "fake user id");   
          
          const mockGetUser = jest.spyOn(userAPI, "getUser"); 
          localStorage.setItem("user-token", "fake user id"); 
          mockGetUser.mockResolvedValue({ data:testUser})
          const mockGetProfile = jest.spyOn(profileAPI, "getProfile");
          mockGetProfile.mockResolvedValue({data:testProfile})
          const mockGetFollowing = jest.spyOn(followingAPI, "getFollowingByFilter"); // account card profile
          mockGetFollowing.mockResolvedValue({data:[{id:"fake id"}]})
          const mockFilterPost = jest.spyOn(postsAPI, "getPostByFilter");
          mockFilterPost.mockResolvedValue({data:[]})
          const mockCompanyInfo = jest.spyOn(recruiterAPI, "getInfo");
          mockCompanyInfo.mockResolvedValue({data:{company_email:"fake_email", position:"recruiter", company:"fake company"}})
  
          render(<ThemeProvider theme={darkTheme}>
            <MemoryRouter>
              <Profile user={testUser} profile={testProfile} editable={true}/>
            </MemoryRouter>
          </ThemeProvider>)
            
  
          expect(screen.getByTestId("edit-prof-button")).toBeDefined();
          expect(screen.getByTestId("avatar")).toBeDefined();
          expect(screen.getByTestId("username")).toBeDefined();
          expect(screen.getByTestId("bio")).toBeDefined();
          expect(screen.getByTestId("displayname")).toBeDefined();
          expect(screen.getByTestId("posts-tab")).toBeDefined();
          expect(screen.getByTestId("likes-tab")).toBeDefined();
          waitFor(() => {
            expect(screen.getByTestId("company-info")).toBeDefined();
            expect(screen.getByText("recruiter at fake company")).toBeDefined();
          })
        })

        test("can edit profile properly", async () => {
          mockedUsedNavigate.mockReset(); 
          localStorage.setItem("user-id", "fake user id");   
          
          const mockGetUser = jest.spyOn(userAPI, "getUser"); 
          localStorage.setItem("user-token", "fake user id"); 
          mockGetUser.mockResolvedValue({ data:testUser})
          const mockGetProfile = jest.spyOn(profileAPI, "getProfile");
          mockGetProfile.mockResolvedValue({data:testProfile})
          const mockGetFollowing = jest.spyOn(followingAPI, "getFollowingByFilter"); // account card profile
          mockGetFollowing.mockResolvedValue({data:[{id:"fake id"}]})
          const mockFilterPost = jest.spyOn(postsAPI, "getPostByFilter");
          mockFilterPost.mockResolvedValue({data:[]})
          const mockCompanyInfo = jest.spyOn(recruiterAPI, "getInfo");
          mockCompanyInfo.mockResolvedValue({data:{company_email:"fake_email", position:"recruiter", company:"fake company"}})

          render(<ThemeProvider theme={darkTheme}>
            <MemoryRouter>
              <Profile user={testUser} profile={testProfile} editable={true}/>
            </MemoryRouter>
          </ThemeProvider>)
            

          fireEvent.click(screen.getByTestId("edit-prof-button"));
          
          expect(screen.queryByTestId("payment-button")).toBeNull();
          expect(screen.getByTestId("cancel-button")).toBeDefined();
          expect(screen.getByTestId("save-button")).toBeDefined();
          expect(screen.getByTestId("display-name-field")).toBeDefined();
          expect(screen.getByTestId("bio-field")).toBeDefined();
          expect(screen.getAllByTestId("autocomplete")).toBeDefined();
          expect(screen.queryByTestId("company-info-field")).toBeDefined();
          expect(screen.queryByTestId("position-field")).toBeDefined();
        })
    })

    describe("Hobby profile", () => {
        const testUser = {
            created_at:"date", 
            email:"email@email.com", 
            first_name:"first", 
            id:"d29cde24-8274-4f97-b7fe-4639151c657a", 
            last_name:"last", 
            password:"hashed-pwd", 
            role:"FOR_FUN", 
            username:"testProfessional"
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

        test("all features load properly", () => {
          mockedUsedNavigate.mockReset(); 
          localStorage.setItem("user-id", "fake user id");   
          
          const mockGetUser = jest.spyOn(userAPI, "getUser"); 
          localStorage.setItem("user-token", "fake user id"); 
          mockGetUser.mockResolvedValue({ data:testUser})
          const mockGetProfile = jest.spyOn(profileAPI, "getProfile");
          mockGetProfile.mockResolvedValue({data:testProfile})
          const mockGetFollowing = jest.spyOn(followingAPI, "getFollowingByFilter"); // account card profile
          mockGetFollowing.mockResolvedValue({data:[{id:"fake id"}]})
          const mockFilterPost = jest.spyOn(postsAPI, "getPostByFilter");
          mockFilterPost.mockResolvedValue({data:[]})
  
          render(<ThemeProvider theme={darkTheme}>
            <MemoryRouter>
              <Profile user={testUser} profile={testProfile} editable={true}/>
            </MemoryRouter>
          </ThemeProvider>)
            
  
          expect(screen.getByTestId("edit-prof-button")).toBeDefined();
          expect(screen.getByTestId("avatar")).toBeDefined();
          expect(screen.getByTestId("username")).toBeDefined();
          expect(screen.getByTestId("bio")).toBeDefined();
          expect(screen.getByTestId("displayname")).toBeDefined();
          expect(screen.getByTestId("posts-tab")).toBeDefined();
          expect(screen.getByTestId("likes-tab")).toBeDefined();
        })

        test("test update profile properly forms", () => {
          mockedUsedNavigate.mockReset(); 
          localStorage.setItem("user-id", "fake user id");   
          
          const mockGetUser = jest.spyOn(userAPI, "getUser"); 
          localStorage.setItem("user-token", "fake user id"); 
          mockGetUser.mockResolvedValue({ data:testUser})
          const mockGetProfile = jest.spyOn(profileAPI, "getProfile");
          mockGetProfile.mockResolvedValue({data:testProfile})
          const mockGetFollowing = jest.spyOn(followingAPI, "getFollowingByFilter"); // account card profile
          mockGetFollowing.mockResolvedValue({data:[{id:"fake id"}]})
          const mockFilterPost = jest.spyOn(postsAPI, "getPostByFilter");
          mockFilterPost.mockResolvedValue({data:[]})

          render(<ThemeProvider theme={darkTheme}>
            <MemoryRouter>
              <Profile user={testUser} profile={testProfile} editable={true}/>
            </MemoryRouter>
          </ThemeProvider>)
            

          fireEvent.click(screen.getByTestId("edit-prof-button"));
          
          expect(screen.queryByTestId("payment-button")).toBeNull();
          expect(screen.getByTestId("cancel-button")).toBeDefined();
          expect(screen.getByTestId("save-button")).toBeDefined();
          expect(screen.getByTestId("display-name-field")).toBeDefined();
          expect(screen.getByTestId("bio-field")).toBeDefined();
          expect(screen.getAllByTestId("autocomplete")).toBeDefined();
          expect(screen.queryByTestId("company-info-field")).toBeNull();
          expect(screen.queryByTestId("position-field")).toBeNull();
        })
    })

    describe("Following and follower tabs", () => {
      const testUser = {
        created_at:"date", 
        email:"email@email.com", 
        first_name:"first", 
        id:"d29cde24-8274-4f97-b7fe-4639151c657a", 
        last_name:"last", 
        password:"hashed-pwd", 
        role:"FOR_FUN", 
        username:"username"
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

      describe("Following tab tests", () => {
        test("Clicking following navigates to new page", async () => {
          mockedUsedNavigate.mockReset(); 
          localStorage.setItem("user-id", "fake user id");   
          
          const mockGetUser = jest.spyOn(userAPI, "getUser"); 
          localStorage.setItem("user-token", "fake user id"); 
          mockGetUser.mockResolvedValue({ data:testUser})
          const mockGetProfile = jest.spyOn(profileAPI, "getProfile");
          mockGetProfile.mockResolvedValue({data:testProfile})
          const mockGetFollowing = jest.spyOn(followingAPI, "getFollowingByFilter"); // account card profile
          mockGetFollowing.mockResolvedValue({data:[{id:"fake id"}]})
          const mockFilterPost = jest.spyOn(postsAPI, "getPostByFilter");
          mockFilterPost.mockResolvedValue({data:[]})

          render(<ThemeProvider theme={darkTheme}>
            <MemoryRouter>
              <Profile user={testUser} profile={testProfile} editable={true}/>
            </MemoryRouter>
          </ThemeProvider>)

          fireEvent.click(screen.getByTestId("followingButton"));
          expect(mockedUsedNavigate).toHaveBeenCalledTimes(1);
          expect(mockedUsedNavigate).toHaveBeenCalledWith('/profile/username/following');
        })
      })

      describe("Follower tab tests", () => {
        test("Clicking follower navigates to new page", async () => {
          mockedUsedNavigate.mockReset(); 
          localStorage.setItem("user-id", "fake user id");   
          
          const mockGetUser = jest.spyOn(userAPI, "getUser"); 
          localStorage.setItem("user-token", "fake user id"); 
          mockGetUser.mockResolvedValue({ data:testUser})
          const mockGetProfile = jest.spyOn(profileAPI, "getProfile");
          mockGetProfile.mockResolvedValue({data:testProfile})
          const mockGetFollowing = jest.spyOn(followingAPI, "getFollowingByFilter"); // account card profile
          mockGetFollowing.mockResolvedValue({data:[{id:"fake id"}]})
          const mockFilterPost = jest.spyOn(postsAPI, "getPostByFilter");
          mockFilterPost.mockResolvedValue({data:[]})

          render(<ThemeProvider theme={darkTheme}>
            <MemoryRouter>
              <Profile user={testUser} profile={testProfile} editable={true}/>
            </MemoryRouter>
          </ThemeProvider>)

          fireEvent.click(screen.getByTestId("followersButton"));
          expect(mockedUsedNavigate).toHaveBeenCalledTimes(1);
          expect(mockedUsedNavigate).toHaveBeenCalledWith('/profile/username/followers');
        })
      })
    })
});