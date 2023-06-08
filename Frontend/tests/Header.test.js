import { fireEvent, render, screen } from "@testing-library/react";
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import Header from "../components/Header";
import { MemoryRouter } from "react-router-dom";

const mockedUsedNavigate = jest.fn();

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: () => mockedUsedNavigate,
}));

jest.mock('axios');

describe("Header tests", () => {
    test("all buttons loads", () => {
        mockedUsedNavigate.mockReset();
        render(<MemoryRouter> <Header/> </MemoryRouter>)
        
        expect(screen.getByTestId("search-button-header")).toBeDefined();
        expect(screen.getByTestId("logout-button-header")).toBeDefined();
        expect(screen.getByTestId("logo")).toBeDefined();
    })


    test("clicking search navigates to \"/\" when no one is logged in", async () => {
      mockedUsedNavigate.mockReset();
      localStorage.removeItem("user-id", "fake user id"); 
      localStorage.removeItem("user-token", "fake user token"); 
      render(<MemoryRouter> <Header/> </MemoryRouter>)
      
      await userEvent.click(screen.getByTestId("search-button-header"));
      expect(mockedUsedNavigate).toHaveBeenCalledTimes(1);
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/',  {"replace": true});
    })

    test("clicking search navigates to \"/search\" when no one is logged in", async () => {
      mockedUsedNavigate.mockReset();
      localStorage.setItem("user-id", "fake user id"); 
      localStorage.setItem("user-token", "fake user token"); 
      render(<MemoryRouter> <Header/> </MemoryRouter>)
      
      await userEvent.click(screen.getByTestId("search-button-header"));
      expect(mockedUsedNavigate).toHaveBeenCalledTimes(1);
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/search',  {"replace": true});
    })

    test("clicking logoout navigates to \"/home\" when no one is logged in", async () => {
      mockedUsedNavigate.mockReset();
      localStorage.setItem("user-id", "fake user id"); 
      localStorage.setItem("user-token", "fake user token"); 
      render(<MemoryRouter> <Header/> </MemoryRouter>)
      
      await userEvent.click(screen.getByTestId("logout-button-header"));
      expect(mockedUsedNavigate).toHaveBeenCalledTimes(1);
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/home',  {"replace": true});
    })


    test("clicking logout navigates to \"/home\" when no one is logged in", async () => {
      mockedUsedNavigate.mockReset();
      localStorage.removeItem("user-id", "fake user id"); 
      localStorage.removeItem("user-token", "fake user token"); 
      render(<MemoryRouter> <Header/> </MemoryRouter>)
      
      await userEvent.click(screen.getByTestId("logout-button-header"));
      expect(mockedUsedNavigate).toHaveBeenCalledTimes(1);
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/home',  {"replace": true});
    })
});