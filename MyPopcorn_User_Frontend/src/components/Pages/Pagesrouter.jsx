import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Dashboard/Dashboard";
import SurveyDetails from "./SurveyDetails/SurveyDetails";
import Wallet from "./Wallet/Wallet";
import Survey from "./Survey/Survey";
import Settings from "./Settings/Settings";

export const Pagesrouter = () => {
  return (
    <>
      <Routes>
        <Route>
          <Route path="/" element={<Dashboard />}></Route>         
          <Route path="/surveydetails" element={<SurveyDetails />}></Route>
          <Route path="/survey-details/:id" element={<SurveyDetails />}></Route>
          <Route path="/wallet" element={<Wallet />}></Route>
          <Route path="/surveys" element={<Survey />}></Route>
          <Route path="/settings" element={<Settings />}></Route>
          <Route path="/settings/:id" element={<Settings />}></Route>
        </Route>
        <Route path="*" element={<Navigate to="/404-page" />} />
      </Routes>
    </>
  );
};
