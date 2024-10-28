import { useLocation, useRoutes } from "react-router-dom";
import { Layout } from "../../components/Layout/Layout";
import { AuthLayout } from "../../components/authentication/AuthLayout";
import PageNotFound from "../../components/PageNotFound/PageNotFound";

export const Routes = () => {
  const path = useLocation();

  const segments = path?.pathname?.split("/");
  const surveyId = segments[segments.length - 1];

  if (segments.includes("survey-details")) {
    localStorage.setItem("survey_id", surveyId);
  }

  let routes = useRoutes([
    {
      path: "*",
      element: <Layout />,
    },
    {
      path: "/auth/*",
      element: <AuthLayout />,
    },
    {
      path: "/404-page",
      element: <PageNotFound />,
    },
  ]);
  return routes;
};
