import { RouteObject } from "react-router-dom";
import { Symposiums } from "../pages/symposiums";
import { SymposiumDetails } from "../pages/symposium-details";
import { CreateSymposium } from "../pages/create-symposium";
import { CreateEvent } from "../pages/create-event";

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
        children: [
          {
            index: true,
            element: <SymposiumDetails />,
          },
          {
            path: "create-event",
            element: <CreateEvent />,
          }
        ],
      },
      {
        path: "create",
        element: <CreateSymposium />,
      },
    ],
  },
];
