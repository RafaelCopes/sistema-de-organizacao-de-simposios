import { RouteObject } from "react-router-dom";
import { Symposiums } from "../pages/symposiums";
import { SymposiumDetail } from "../pages/symposium-detail";

export const organizerRoutes: RouteObject[] = [
  {
    path: "dash",
    children: [
      {
        index: true,
        element: <Symposiums/>,
      },
      {
        path: ":id",
        element: <SymposiumDetail/>,
      }
    ],
  },
];
