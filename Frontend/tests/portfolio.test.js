const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedUsedNavigate,
}));

jest.mock('axios');

import { fireEvent, getByTestId, render, screen, waitFor } from "@testing-library/react";
import * as portfolio from "../api/portfolio.js"
import Portfolio from "../components/Portfolio/Portfolio";
import '@testing-library/jest-dom'
import PortfolioDialog from "../components/Portfolio/PortfolioDialog";
import axios from "axios";
import { faker } from "@faker-js/faker";
import { act } from "react-test-renderer";
import { ThemeProvider, createTheme } from "@mui/material";
import * as userAPI from "../api/user.js";
import * as profileAPI from "../api/Profile.js";

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
  

describe("Testing portfolio ", () => {
  test("Add button exists", () => {
    mockedUsedNavigate.mockReset();

    const mockGetImages = jest.spyOn(portfolio, 'getAllPortfolioItems');
    mockGetImages.mockResolvedValue([]);
    render(<Portfolio editable={true} />)
    const addBtn = screen.getByRole("button");
    expect(addBtn).toBeInTheDocument();
 })

  test("image list is rendered", () => {
    mockedUsedNavigate.mockReset();
    const mockGetImages = jest.spyOn(portfolio, 'getAllPortfolioItems');
    mockGetImages.mockResolvedValue([]);
    render(<Portfolio/>)
    const imgList = screen.getByTestId("img-list");
    expect(imgList).toBeInTheDocument();
  })

  test("dialog is not automatically rendered", () => {
    mockedUsedNavigate.mockReset();
    const mockGetImages = jest.spyOn(portfolio, 'getAllPortfolioItems');
    mockGetImages.mockResolvedValue([]);
    render(<Portfolio/>)
    const dialog = screen.queryByTestId("img-dialog");
    expect(dialog).not.toBeInTheDocument();
  })

  test("check to see that text fields are properly created", () => {
    const mockGetImages = jest.spyOn(portfolio, 'getAllPortfolioItems');
    mockGetImages.mockResolvedValue([]);
    mockedUsedNavigate.mockReset();
    const onClose = jest.fn();
    const open = true;

    const testImg = { 
      title:faker.lorem.sentence(), 
      description:faker.lorem.paragraph(), 
      tags:[], 
      img:faker.image.cats()
    }

    render(<ThemeProvider theme={darkTheme}><ThemeProvider theme={darkTheme}><PortfolioDialog onClose={onClose} open={open} targetImage={testImg} editable={true}/></ThemeProvider></ThemeProvider> )
    
    const titleField = screen.getByTestId("title");
    const descField = screen.getByTestId("desc");
    const deleteButton = screen.getByTestId("delete-button");
    const editButton = screen.getByTestId("edit-button");
    const cancelButton = screen.getByTestId("cancel-button");

    expect(titleField).toBeDefined();
    expect(descField).toBeDefined();
    expect(deleteButton).toBeDefined();
    expect(editButton).toBeDefined();
    expect(cancelButton).toBeDefined();
  })

//   // test that you cannot edit a portfolio item to not have a title
  test("check to see that empty title field sends alert", async () => {
    const mockGetImages = jest.spyOn(portfolio, 'getAllPortfolioItems');
    mockGetImages.mockResolvedValue([]);
    mockedUsedNavigate.mockReset();

    const onClose = jest.fn();
    const open = true;

    const testImg = { 
      id:"kdsfsdfksdhfsdf",
      title:faker.lorem.sentence(), 
      description:faker.lorem.paragraph(), 
      tags:[],
      img:faker.image.cats()
    }
    render(<ThemeProvider theme={darkTheme}><PortfolioDialog onClose={onClose} open={open} targetImage={testImg} editable={true}/></ThemeProvider>);
    

    const titleField = screen.getByTestId("title-input");
    const editButton = screen.getByTestId("edit-button");

    expect(titleField).toBeDefined();
    fireEvent.change(titleField, {target: {value: ""}})
    expect(titleField.value).toBe("");
    expect(editButton).toBeDefined();
    fireEvent.click(editButton);
    const emptyTitleAlert = await screen.findByTestId("empty-title-alert");
    expect(emptyTitleAlert).toBeDefined();
  })

  test("check to see that good edit works", async () => {
    const mockGetImages = jest.spyOn(portfolio, 'getAllPortfolioItems');
    mockGetImages.mockResolvedValue([]);
    mockedUsedNavigate.mockReset();
    const mockUpdateImage = jest.spyOn(portfolio, 'updatePortfolioItem');
    mockUpdateImage.mockResolvedValue({});

    const onClose = jest.fn();
    const setIsImageListUpdated = jest.fn();
    const open = true;

    const testImg = { 
      id:"kdsfsdfksdhfsdf",
      title:faker.lorem.sentence(), 
      description:faker.lorem.paragraph(), 
      tags:[],
      img:faker.image.cats()
    }
    render(<ThemeProvider theme={darkTheme}><PortfolioDialog setIsImageListUpdated={setIsImageListUpdated} onClose={onClose} open={open} targetImage={testImg} editable={true}/></ThemeProvider>);
  

    const titleField = screen.getByTestId("title-input");
    expect(titleField).toBeDefined();
    fireEvent.change(titleField, {target: {value: "good title"}})
    expect(screen.getByTestId("edit-button")).toBeDefined();
    fireEvent.click(screen.getByTestId("edit-button"));
    waitFor(() => {
      expect(screen.queryAllByTestId("empty-title-alert")).toBeNull();
    })
  })


  test("check to see that deleting requires a confirmation", async () => {
    mockedUsedNavigate.mockReset();
      const onClose = jest.fn();
      const open = true;

      const testImg = { 
        title:faker.lorem.sentence(), 
        description:faker.lorem.paragraph(), 
        tags:[],
        img:faker.image.cats()
      }

      render(<ThemeProvider theme={darkTheme}><PortfolioDialog onClose={onClose} open={open} targetImage={testImg} editable={true}/></ThemeProvider>);
    
    
    const deleteButton = screen.getByTestId("delete-button");

    expect(deleteButton).toBeDefined();
    fireEvent.click(deleteButton);
    const deleteAlert = await screen.findByTestId("delete-alert");
    expect(deleteAlert).toBeDefined();
  })

  test("test good delete does not throw an error", async () => {
    mockedUsedNavigate.mockReset();
    const onClose = jest.fn();
    const open = true;
    const mockDeleteImages = jest.spyOn(portfolio, 'deletePortfolioItem');
    mockDeleteImages.mockResolvedValue({});

    

    const testImg = { 
      title:faker.lorem.sentence(), 
      description:faker.lorem.paragraph(), 
      tags:[],
      img:faker.image.cats()
    }

    render(<ThemeProvider theme={darkTheme}><PortfolioDialog onClose={onClose} open={open} targetImage={testImg} editable={true}/></ThemeProvider>);
    
    const deleteButton = screen.getByTestId("delete-button");
    expect(deleteButton).toBeDefined();
    fireEvent.click(deleteButton);
    const deleteAlert = await screen.findByTestId("delete-alert");
    expect(deleteAlert).toBeDefined();

    fireEvent.click(screen.getByTestId("confirm-delete"));
    waitFor(() => {
      expect(screen.queryAllByTestId("empty-title-alert")).toBeNull();
    })
  })

  test("test cancel", async () => {
    mockedUsedNavigate.mockReset();
    const onClose = jest.fn();
    const open = true;

    const testImg = { 
      title:faker.lorem.sentence(), 
      description:faker.lorem.paragraph(), 
      tags:[],
      img:faker.image.cats()
    }

    render(<ThemeProvider theme={darkTheme}><PortfolioDialog onClose={onClose} open={open} targetImage={testImg} editable={true}/></ThemeProvider>);
    
    
    const cancelButton = screen.getByTestId("cancel-button");

    expect(cancelButton).toBeDefined();
    fireEvent.click(cancelButton);
  })

}) 

describe("testing outside view of portfolio", () => {
  test("add button does not appear when portfolio is uneditable", () => {
    mockedUsedNavigate.mockReset();
    const mockGetImages = jest.spyOn(portfolio, 'getAllPortfolioItems');
    mockGetImages.mockResolvedValue([]);
    render(<Portfolio editable={false} />)
    
    expect(screen.queryByRole("button")).toBeNull();
  })

  test("dialog is properly formed when not-editable", () => {
    const mockGetImages = jest.spyOn(portfolio, 'getAllPortfolioItems');
    mockGetImages.mockResolvedValue([]);
    mockedUsedNavigate.mockReset();
    const onClose = jest.fn();
    const open = true;

    const testImg = { 
      title:faker.lorem.sentence(), 
      description:faker.lorem.paragraph(), 
      tags:[], 
      img:faker.image.cats()
    }

    render(<ThemeProvider theme={darkTheme}><PortfolioDialog onClose={onClose} user={testUser} profile={testProfile} open={open} targetImage={testImg} editable={false}/></ThemeProvider>)

    expect(screen.getByTestId("image")).toBeDefined;
    expect(screen.getByTestId("displayname")).toBeDefined;
    expect(screen.getByTestId("username")).toBeDefined;
    expect(screen.getByTestId("non-edit-title")).toBeDefined;
    expect(screen.getByTestId("non-edit-description")).toBeDefined;
    expect(screen.queryByTestId("title")).toBeNull();
    expect(screen.queryByTestId("desc")).toBeNull();
    expect(screen.queryByTestId("delete-button")).toBeNull();
    expect(screen.queryByTestId("edit-button")).toBeNull();
    expect(screen.queryByTestId("cancel-button")).toBeNull();
  })
})