import React, { useMemo } from "react";
import { Navigate } from "react-router-dom";
import { Header } from "../../shared/Header/Header";
import { Pagesrouter } from "../Pages/Pagesrouter";

export const Layout = () => {
  const loginResponse = useMemo(
    () => localStorage.getItem("userLoginData"),
    []
  );

  // Conditional redirect if loginResponse is null
  if (!loginResponse) {
    return <Navigate to="/auth/login" replace />;
  }
  return (
    <>
      <Header></Header>
      <div className="common-layout">
        <Pagesrouter></Pagesrouter>
      </div>
    </>
  );
};
