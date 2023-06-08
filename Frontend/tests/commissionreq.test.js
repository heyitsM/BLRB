const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedUsedNavigate,
}));

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CommissionForm from "../components/Commissions/CommissionForm";
import '@testing-library/jest-dom'
import axios from "axios";
import { faker } from "@faker-js/faker";
import { act } from "react-test-renderer";
import * as emailAPI from "../api/email.js";
import * as commissionAPI from "../api/commission.js"
import * as userAPI from "../api/user.js";
import { ThemeProvider, createTheme } from "@mui/material";

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

describe("Testing commission requests + dialogs", () => {
  test("Request button exists", () => {
    mockedUsedNavigate.mockReset();
    localStorage.setItem("user-id", "fake user id"); 

    const mockArtist = {
      id: "234234234", 
      email:"3452345@3454.com"
    }


    act(() => render(<ThemeProvider theme={darkTheme}><CommissionForm  artist={mockArtist}/></ThemeProvider>));
    const reqBtn = screen.getByTestId("request-button");
    expect(reqBtn).toBeInTheDocument();
 })

  test("Cancel button exists", () => {
    mockedUsedNavigate.mockReset();
    localStorage.setItem("user-id", "fake user id"); 

    const mockArtist = {
      id: "234234234", 
      email:"3452345@3454.com"
    }


    act(() => render(<ThemeProvider theme={darkTheme}><CommissionForm  artist={mockArtist}/></ThemeProvider>));
    const cancelBtn = screen.getByTestId("cancel-button");
    expect(cancelBtn).toBeInTheDocument();
  })

  test("Check text fields", () => {
    mockedUsedNavigate.mockReset();
    localStorage.setItem("user-id", "fake user id"); 
    
    const mockArtist = {
      id: "234234234", 
      email:"3452345@3454.com"
    }


    act(() => render(<ThemeProvider theme={darkTheme}><CommissionForm  artist={mockArtist}/></ThemeProvider>));

    const titleField = screen.getByTestId("title-field");
    const descField = screen.getByTestId("desc-field");
    const notesField = screen.getByTestId("notes-field");

    expect(titleField).toBeDefined();
    expect(descField).toBeDefined();
    expect(notesField).toBeDefined();
  })

  test("Dialog is not automatically rendered", () => {
    mockedUsedNavigate.mockReset();
    localStorage.setItem("user-id", "fake user id"); 
    const mockArtist = {
      id: "234234234", 
      email:"3452345@3454.com"
    }


    act(() => render(<ThemeProvider theme={darkTheme}><CommissionForm  artist={mockArtist}/></ThemeProvider>));
    const dialog = screen.queryByTestId("confirmation-dialog");
    expect(dialog).not.toBeInTheDocument();
  })

  test("Cannot submit if title is empty", () => {
    mockedUsedNavigate.mockReset();
    localStorage.setItem("user-id", "fake user id"); 
    
    const mockArtist = {
      id: "234234234", 
      email:"3452345@3454.com"
    }

    const setAlertMsg = jest.fn((x) => (x));
    const setAlert = jest.fn((x) => x);
    const setAlertOpen = jest.fn((x) => x);

    act(() => render(<ThemeProvider theme={darkTheme}><CommissionForm setAlertMsg={setAlertMsg} setAlertOpen={setAlertOpen} setAlert={setAlert} artist={mockArtist}/></ThemeProvider>));

    const titleField = screen.getByTestId("title-input");
    const descField = screen.getByTestId("desc-input");
    act(() => fireEvent.change(titleField, {target: {value: ""}}))
    act(() => fireEvent.change(descField, {target: {value: "desc"}}))

    const requestButton = screen.getByTestId("request-button");
    fireEvent.click(requestButton);

    expect(setAlertMsg).toHaveBeenCalledTimes(1)
    expect(setAlertMsg).toHaveBeenCalledWith("You must enter a title and description to submit a commission!")
    expect(setAlert).toHaveBeenCalledTimes(1)
    expect(setAlertOpen).toHaveBeenCalledTimes(1)
  })

  test("cannot submit if desc is empty", () => {
    mockedUsedNavigate.mockReset();
    localStorage.setItem("user-id", "fake user id"); 
    
    const mockArtist = {
      id: "234234234", 
      email:"3452345@3454.com"
    }

    const setAlertMsg = jest.fn((x) => (x));
    const setAlert = jest.fn((x) => x);
    const setAlertOpen = jest.fn((x) => x);

    act(() => render(<ThemeProvider theme={darkTheme}><CommissionForm setAlertMsg={setAlertMsg} setAlertOpen={setAlertOpen} setAlert={setAlert} artist={mockArtist}/></ThemeProvider>));

    const titleField = screen.getByTestId("title-input");
    const descField = screen.getByTestId("desc-input");
    act(() => fireEvent.change(titleField, {target: {value: "title"}}))
    act(() => fireEvent.change(descField, {target: {value: ""}}))

    const requestButton = screen.getByTestId("request-button");
    fireEvent.click(requestButton);

    expect(setAlertMsg).toHaveBeenCalledTimes(1)
    expect(setAlertMsg).toHaveBeenCalledWith("You must enter a title and description to submit a commission!")
    expect(setAlert).toHaveBeenCalledTimes(1)
    expect(setAlertOpen).toHaveBeenCalledTimes(1)
  })


  test("Check text fields clear on cancel", async () => {
    mockedUsedNavigate.mockReset();
    localStorage.setItem("user-id", "fake user id"); 
    
    const mockArtist = {
      id: "234234234", 
      email:"3452345@3454.com"
    }


    act(() => render(<ThemeProvider theme={darkTheme}><CommissionForm  artist={mockArtist}/></ThemeProvider>));
    
    
    fireEvent.change(screen.getByTestId("title-input"), {target: {value: "fake title"}})
    fireEvent.change(screen.getByTestId("desc-input"), {target: {value: "fake desc"}})
    fireEvent.change(screen.getByTestId("notes-input"), {target: {value: "fake notes"}})

    expect(screen.findByText("fake title")).toBeDefined();
    expect(screen.findByText("fake desc")).toBeDefined();
    expect(screen.findByText("fake notes")).toBeDefined();

    fireEvent.click(screen.getByTestId("cancel-button"));

    
    expect(screen.queryByText("fake title")).toBeNull();
    expect(screen.queryByText("fake desc")).toBeNull();
    expect(screen.queryByText("fake notes")).toBeNull();
  })
  
  test("Dialog appears when requesting commission", () => {
    mockedUsedNavigate.mockReset();
    localStorage.setItem("user-id", "fake user id"); 
    const mockArtist = {
      id: "234234234", 
      email:"3452345@3454.com"
    }

    
    
    act(() => render(<ThemeProvider theme={darkTheme}><CommissionForm  artist={mockArtist}/></ThemeProvider>));
    const titleField = screen.getByTestId("title-input");
    const descField = screen.getByTestId("desc-input");
    act(() => fireEvent.change(titleField, {target: {value: "title"}}))
    act(() => fireEvent.change(descField, {target: {value: "desc"}}))
    
    const requestButton = screen.getByTestId("request-button");
    expect(requestButton).toBeDefined();
    fireEvent.click(requestButton);
    const dialog = screen.queryByTestId("confirmation-dialog");
    expect(dialog).toBeDefined();
  })

  test("Dialog disappears when confirm is clicked", async () => {
    mockedUsedNavigate.mockReset();
    localStorage.setItem("user-id", "fake user id"); 
    const mockArtist = {
      id: "234234234", 
      email:"3452345@3454.com"
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

    const mockCommission = jest.spyOn(commissionAPI, 'createCommission');
    mockCommission.mockResolvedValue({data:{id:"id"}});
    const mockUser = jest.spyOn(userAPI, 'getUser');
    mockUser.mockResolvedValue({data: testUser});
    const mockEmails = jest.spyOn(emailAPI, 'emailOnCommissionStart');
    mockEmails.mockResolvedValue(testUser);

    act(() => render(<ThemeProvider theme={darkTheme}><CommissionForm  artist={mockArtist}/></ThemeProvider>));

    const titleField = screen.getByTestId("title-input");
    const descField = screen.getByTestId("desc-input");
    act(() => fireEvent.change(titleField, {target: {value: "title"}}))
    act(() => fireEvent.change(descField, {target: {value: "desc"}}))

    const requestButton = screen.getByTestId("request-button");
    fireEvent.click(requestButton);
    const dialog = screen.queryByTestId("confirmation-dialog");
    const closeButton = screen.getByTestId("confirmation-ok-button");
    expect(closeButton).toBeDefined();
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId("submission-dialog")).toBeInTheDocument();
    })
  })

  test("Dialog disappears when cancel is clicked", () => {
    mockedUsedNavigate.mockReset();
    localStorage.setItem("user-id", "fake user id"); 
    const mockArtist = {
      id: "234234234", 
      email:"3452345@3454.com"
    }


    act(() => render(<ThemeProvider theme={darkTheme}><CommissionForm  artist={mockArtist}/></ThemeProvider>));

    const titleField = screen.getByTestId("title-input");
    const descField = screen.getByTestId("desc-input");
    act(() => fireEvent.change(titleField, {target: {value: "title"}}))
    act(() => fireEvent.change(descField, {target: {value: "desc"}}))

    const requestButton = screen.getByTestId("request-button");
    fireEvent.click(requestButton);
    const dialog = screen.queryByTestId("confirmation-dialog");
    const closeButton = screen.getByTestId("confirmation-cancel-button");
    expect(closeButton).toBeDefined();
    fireEvent.click(closeButton);
  })
})