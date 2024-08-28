import { RouteObject } from "react-router-dom";
import { Symposiums } from "../pages/symposiums";

export const participantRoutes: RouteObject[] = [
  {
    path: "dash",
    element: <Symposiums />,
  },
];
