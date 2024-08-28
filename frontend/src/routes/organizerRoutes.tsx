import { RouteObject } from "react-router-dom";
import { Symposiums } from "../pages/symposiums";
import { SymposiumDetails } from "../pages/symposium-details";
import { CreateSymposium } from "../pages/create-symposium";
import { CreateEvent } from "../pages/create-event";
import { EventDetails } from "../pages/event-details";
import { SymposiumRegistrations } from "../pages/symposiums-registrations";
import { EventRegistrations } from "../pages/event-registrations";

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
            path: "create",
            element: <CreateEvent />,
          },
          {
            path: "registrations",
            element: <SymposiumRegistrations />,
          },
        ],
      },
      {
        path: "create",
        element: <CreateSymposium />,
      },
      {
        path: "events/:id", // This is the event details route
        children: [
          {
            index: true,
            element: <EventDetails />,
          },
          {
            path: "registrations",
            element: <EventRegistrations />,
          }
        ]
      },
    ],
  },
];
