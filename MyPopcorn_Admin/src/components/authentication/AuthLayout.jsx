import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import Verification from "./Verification";
import ForgotPassword from "./ForgotPassword";

export const AuthLayout = () => {
  return (
    <>
      <Routes>
        <Route path="" element={<Login />}></Route>
        <Route path="/login" element={<Login />}></Route>
        {/* <Route path="/signup" element={<Signup />}></Route> */}
        <Route path="/verification" element={<Verification />}></Route>
        <Route path="/forgot-password" element={<ForgotPassword />}></Route>
        <Route path="*" element={<Navigate to="/404-page" />} />
      </Routes>
    </>
  );
};
