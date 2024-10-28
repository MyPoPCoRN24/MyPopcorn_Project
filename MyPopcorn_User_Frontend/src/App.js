import { useEffect } from "react";
import "./App.scss";
import {
  BrowserRouter as Router,
  useParams,
  useNavigate,
} from "react-router-dom";
import { Routes } from "./shared/Routes/Routes";
import "antd/dist/reset.css";
import { StoreProvider } from "./context/appProvider";
import { AlertMessage } from "./shared/Alert/alert";

function App() {
  return (
    <StoreProvider>
      <AlertMessage />
      <Router>
        <Routes></Routes>
      </Router>
    </StoreProvider>
  );
}

export default App;
