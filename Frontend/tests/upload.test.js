const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedUsedNavigate,
}));

jest.mock('axios');

import { fireEvent, render, screen } from "@testing-library/react";
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { faker } from "@faker-js/faker";
import UploadPage from "../pages/UploadPage";
import * as portfolio from "../api/portfolio.js"
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


describe("Testing portfolio ", () => {

  test("everything exists on initial render", () => {
    mockedUsedNavigate.mockReset();

    render(<ThemeProvider theme={darkTheme}><UploadPage/></ThemeProvider>);
    expect(screen.getByTestId("submission-section")).toBeDefined();
    expect(screen.getByTestId("upload-boxes")).toBeDefined();
    expect(screen.getByTestId("confirm-button")).toBeDefined();
    expect(screen.getByTestId("cancel-button")).toBeDefined();
    expect(screen.getByTestId("upload-box")).toBeDefined();
    expect(screen.getByTestId("title")).toBeDefined();
    expect(screen.getByTestId("desc")).toBeDefined();
 })

 test("no preview if file has not been submitted.", () => {
    render(<ThemeProvider theme={darkTheme}><UploadPage/></ThemeProvider>);
    expect(screen.getByTestId("upload-box")).toBeDefined();
    expect(screen.queryByTestId("image")).toBeNull();
 })

  test("check to see that selecting an image displays information & img", async () => {
    window.URL.createObjectURL = jest.fn();
    const file = new File(['hello'], 'hello.png', {type: 'image/png'})

    render(<ThemeProvider theme={darkTheme}><UploadPage/></ThemeProvider>)
    const input = screen.getByTestId("file-upload");

    await userEvent.upload(input, file);

    expect(input.files[0]).toBe(file)
    expect(input.files.item(0)).toBe(file)
    expect(input.files).toHaveLength(1)

    expect(screen.getByTestId("image")).toBeDefined();
    expect(screen.getByTestId("reselection-button")).toBeDefined();
    expect(screen.queryByTestId("file-upload")).toBeNull();
  })

  test("submit without img opens alert", async () => {
    render(<ThemeProvider theme={darkTheme}><UploadPage/></ThemeProvider>);
    const confirmButton = screen.getByTestId("confirm-button");
    expect(confirmButton).toBeDefined();

    fireEvent.click(confirmButton);

    const badMsg = await screen.findByTestId("bad-submission-alert");
    expect(badMsg).toBeDefined();
  })

  test("submit without title opens alert", async () => {
    window.URL.createObjectURL = jest.fn();
    const file = new File(['hello'], 'hello.png', {type: 'image/png'})

    render(<ThemeProvider theme={darkTheme}><UploadPage/></ThemeProvider>)
    const input = screen.getByTestId("file-upload");

    await userEvent.upload(input, file);

    const confirmButton = screen.getByTestId("confirm-button");
    expect(confirmButton).toBeDefined();
    fireEvent.click(confirmButton);

    const badMsg = await screen.findByTestId("bad-submission-alert");
    expect(badMsg).toBeDefined();
  })

  test("successful submission gives alert", async () => {
    window.URL.createObjectURL = jest.fn();
    const file = new File(['hello'], 'hello.png', {type: 'image/png'})
    const mockCreatePortfolioItem = jest.spyOn(portfolio, 'createPortfolioItem');
    mockCreatePortfolioItem.mockResolvedValue(Promise.resolve({data: {data: { id: "w3ewr" }}}));
    const mockUploadImage = jest.spyOn(portfolio, 'uploadPortfolioItemImage');
    mockUploadImage.mockResolvedValue({});

    render(<ThemeProvider theme={darkTheme}><UploadPage/></ThemeProvider>)
    const input = screen.getByTestId("file-upload");

    await userEvent.upload(input, file);

    const titleField = screen.getByTestId("title-input");
    expect(titleField).toBeDefined();
    fireEvent.change(titleField, {target: {value: "New title"}});

    const confirmButton = screen.getByTestId("confirm-button");
    expect(confirmButton).toBeDefined();
    fireEvent.click(confirmButton);

    const submissionMsg = await screen.findByTestId("submission-alert");
    expect(submissionMsg).toBeDefined();
  });

  test("reselecting image returns back to upload box", async () => {
    window.URL.createObjectURL = jest.fn();
    const file = new File(['hello'], 'hello.png', {type: 'image/png'})

    render(<ThemeProvider theme={darkTheme}><UploadPage/></ThemeProvider>)
    const input = screen.getByTestId("file-upload");

    await userEvent.upload(input, file);
    const reselectionButton = screen.getByTestId("reselection-button")
    expect(reselectionButton).toBeDefined();

    fireEvent.click(reselectionButton);
    expect(screen.getByTestId("upload-box")).toBeDefined();

  })

})