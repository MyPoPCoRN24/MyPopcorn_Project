import { useRoutes } from "react-router-dom";
import { Layout } from "../../components/Layout/Layout";
import { AuthLayout } from "../../components/authentication/AuthLayout";
import PageNotFound from "../../components/PageNotFound/PageNotFound";


export const Routes = () => {
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
      path: "/404-page", element: <PageNotFound />
    },
  ]);
  return routes;
};
