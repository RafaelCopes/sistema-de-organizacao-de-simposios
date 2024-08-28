import { RouteObject } from "react-router-dom";
import { Symposiums } from "../pages/symposiums";
import { SymposiumDetails } from "../pages/symposium-details";

export const participantRoutes: RouteObject[] = [
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
        ]
      }
    ]
  }
];
