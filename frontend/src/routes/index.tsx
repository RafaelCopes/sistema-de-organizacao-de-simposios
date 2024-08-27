import { useMemo } from "react";
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import { Login } from "../pages/login";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { UserType } from "../types/userType";
import { organizerRoutes } from "./organizerRoutes";
import { participantRoutes } from "./participantRoutes";

const getRouter = (userType: string | null = null) =>
  createBrowserRouter([
    {
      path: "/",
      element: userType ? (
        userType === "organizer" ? (
          <Navigate to="/organizer" replace={true} />
        ) : (
          <Navigate to="/participant" replace={true} />
        )
      ) : (
        <Navigate to="/login" replace={true} />
      ),
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/organizer/*",
      children: [
        {
          index: true,
          element: <Navigate to="/organizer/dash" replace={true} />,
        },
        ...organizerRoutes,
      ],
    },
    {
      path: "/participant/*",
      children: [
        {
          index: true,
          element: <Navigate to="/participant/dash" replace={true} />,
        },
        ...participantRoutes,
      ],
    },
  ]);

export const RootRouter = () => {
  const user = useAuthUser<UserType>();
  const router = useMemo(() => getRouter(user && user.type), [user]);
  return <RouterProvider router={router} />;
};
