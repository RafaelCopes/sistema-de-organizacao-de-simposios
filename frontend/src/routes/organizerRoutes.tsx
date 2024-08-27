import { RouteObject } from "react-router-dom";
import { Symposiums } from "../pages/symposiums";
import { SymposiumDetails } from "../pages/symposium-details";
import { CreateSymposium } from "../pages/create-symposium";

export const organizerRoutes: RouteObject[] = [
  {
    path: "dash",
    children: [
      {
        index: true,
        element: <Symposiums />,
      },
      {
        path: ":id",
        element: <SymposiumDetails />,
      },
      {
        path: "create",
        element: <CreateSymposium />,
      },
    ],
  },
];
