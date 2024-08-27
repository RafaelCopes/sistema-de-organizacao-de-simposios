import { useMemo } from "react";
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import { Login } from "../pages/login";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { UserType } from "../types/userType";

const getRouter = (userType: string | null = null) =>
  createBrowserRouter([
    {
      path: "/",
      element: userType ? (
        userType === "organizer" ? (
          <Navigate to="/dashOrganizer" replace={true} />
        ) : (
          <Navigate to="/dashUser" replace={true} />
        )
      ) : (
        <Navigate to="/login" replace={true} />
      ),
    },
    {
      path: "/login",
      element: <Login />,
    },
  ]);

export const RootRouter = () => {
  const user = useAuthUser<UserType>();
  const router = useMemo(() => getRouter(user && user.type), [user]);
  return <RouterProvider router={router} />;
};
