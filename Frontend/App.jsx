import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import UploadPage from "./pages/UploadPage";
import ProfileTypeSelection from "./pages/ProfileTypeSelection";
import UpdateProfile from "./pages/UpdateProfile";
import SignIn from "./components/Login";
import SignUp from "./components/SignUp";
import CommissionLog from "./pages/CommissionLog";
import PaymentFailed from "./pages/PaymentFailed";
import PaymentProcessed from "./pages/PaymentProcessed";
import OutsiderProfileView from "./pages/OutsiderViewOfProfile";
import NotFound from "./pages/NotFound";
import Forbidden from "./pages/Forbidden";
import MyProfile from "./pages/MyProfile";
import Explore from "./pages/Explore";
import SearchPage from "./pages/Search";
import FollowingPage from "./pages/FollowingPage";
import FollowersPage from "./pages/FollowersPage";
import * as userAPI from "./api/user.js";
import { useEffect, useState } from "react";


function App() {
  const userId = localStorage.getItem("user-id");
  const token = localStorage.getItem("user-token");

  return (
    <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="*" element={<NotFound />} />
      <Route path="forbidden" element={<Forbidden />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/upload" element={<UploadPage />} />
      {(userId && token) ? (
        <Route path="/" element={<Explore />} />
      ) : (
        <Route path="/" element={<Home />} />
      )}
      <Route path="/profile-type" element={<ProfileTypeSelection />} />
      <Route path="/profile-basics" element={<UpdateProfile />} />
      <Route path="/my-profile" element={<MyProfile />} />
      <Route path="/profile/:pageUsername" element={<OutsiderProfileView />} />
      <Route path="/profile/:pageUsername/following" element={<FollowingPage />} />
      <Route path="/profile/:pageUsername/followers" element={<FollowersPage />} />
      <Route path="/payment-processed" element={<PaymentProcessed />} />
      <Route path="/payment-failed" element={<PaymentFailed />} />
      <Route path="/commission-log" element={<CommissionLog />} />
      <Route path="/search" element={<SearchPage />} />
    </Routes>
  );
}

export default App;
