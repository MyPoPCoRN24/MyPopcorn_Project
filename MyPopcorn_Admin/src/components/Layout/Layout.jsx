import React, {  useMemo } from "react";
import { Header } from "../../shared/Header/Header";
import { Pagesrouter } from "../Pages/Pagesrouter";
import { Navigate } from "react-router-dom";

export const Layout = () => {
  // Using useMemo to optimize localStorage access
  const loginResponse = useMemo(
    () => localStorage.getItem("userLoginData"),
    []
  );

  // Log the login response for debugging
  console.log("localloginResponse=========>", loginResponse);

  // Conditional redirect if loginResponse is null
  if (!loginResponse) {
    return <Navigate to="/auth/login" replace />;
  } 

  return (
    <React.Fragment>
      <Header />
      <div className="common-layout">
        <Pagesrouter />
      </div>
    </React.Fragment>
  );
};
