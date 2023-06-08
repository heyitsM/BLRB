import { fireEvent, render, screen } from "@testing-library/react";
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import SideBar from "../components/Explore/SideBar";
import { MemoryRouter } from "react-router-dom";

const mockedUsedNavigate = jest.fn();

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: () => mockedUsedNavigate,
}));

jest.mock('axios');

describe("Testing Widescreen Sidebar tests", () => {
    test("all buttons loads", () => {
        mockedUsedNavigate.mockReset();
        render(<MemoryRouter> <SideBar/> </MemoryRouter>)
        
        expect(screen.getByTestId("explore-button-wide")).toBeDefined();
        expect(screen.getByTestId("profile-button-wide")).toBeDefined();
        expect(screen.getByTestId("commission-log-button-wide")).toBeDefined();
    })

    test("clicking explore navigates to explore", async () => {
        mockedUsedNavigate.mockReset();
        render(<MemoryRouter> <SideBar/> </MemoryRouter>)
        
        await userEvent.click(screen.getByTestId("explore-button-wide"));
        expect(mockedUsedNavigate).toHaveBeenCalledTimes(1);
        expect(mockedUsedNavigate).toHaveBeenCalledWith('/explore');
    })

    test("clicking profile navigates to my-profile", async () => {
        mockedUsedNavigate.mockReset();
        render(<MemoryRouter> <SideBar/> </MemoryRouter>)
        
        await userEvent.click(screen.getByTestId("profile-button-wide"));
        expect(mockedUsedNavigate).toHaveBeenCalledTimes(1);
        expect(mockedUsedNavigate).toHaveBeenCalledWith('/my-profile');
    })

    test("clicking commissions navigates to commission-log", async () => {
        mockedUsedNavigate.mockReset();
        render(<MemoryRouter> <SideBar/> </MemoryRouter>)
        
        await userEvent.click(screen.getByTestId("commission-log-button-wide"));
        expect(mockedUsedNavigate).toHaveBeenCalledTimes(1);
        expect(mockedUsedNavigate).toHaveBeenCalledWith('/commission-log');
    })
});


describe("Testing sidebar on smaller screens", () => {
    test("all buttons loads", () => {
        mockedUsedNavigate.mockReset();
        render(<MemoryRouter> <SideBar/> </MemoryRouter>)
        
        expect(screen.getByTestId("explore-button-mini")).toBeDefined();
        expect(screen.getByTestId("profile-button-mini")).toBeDefined();
        expect(screen.getByTestId("commission-log-button-mini")).toBeDefined();
    })

    test("clicking explore navigates to explore", async () => {
        mockedUsedNavigate.mockReset();
        render(<MemoryRouter> <SideBar/> </MemoryRouter>)
        
        await userEvent.click(screen.getByTestId("explore-button-mini"));
        expect(mockedUsedNavigate).toHaveBeenCalledTimes(1);
        expect(mockedUsedNavigate).toHaveBeenCalledWith('/explore');
    })

    test("clicking profile navigates to my-profile", async () => {
        mockedUsedNavigate.mockReset();
        render(<MemoryRouter> <SideBar/> </MemoryRouter>)
        
        await userEvent.click(screen.getByTestId("profile-button-mini"));
        expect(mockedUsedNavigate).toHaveBeenCalledTimes(1);
        expect(mockedUsedNavigate).toHaveBeenCalledWith('/my-profile');
    })

    test("clicking commissions navigates to commission-log", async () => {
        mockedUsedNavigate.mockReset();
        render(<MemoryRouter> <SideBar/> </MemoryRouter>)
        
        await userEvent.click(screen.getByTestId("commission-log-button-mini"));
        expect(mockedUsedNavigate).toHaveBeenCalledTimes(1);
        expect(mockedUsedNavigate).toHaveBeenCalledWith('/commission-log');
    })
})