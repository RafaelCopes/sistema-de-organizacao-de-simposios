import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  List,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { client } from "../config/client";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { UserType } from "../types/userType";
import { Sidebar } from "../components/sidebar"; // Import the Sidebar component

export function EventRegistrations() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthUser<UserType>();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventRegistrations = async () => {
      try {
        const eventResponse = await client.get(`/events/${id}`);
        setEvent(eventResponse.data);

        setRegistrations(eventResponse.data.registrations);
      } catch (error) {
        console.error("Error fetching event registrations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventRegistrations();
  }, [id, user]);

  const handleAccept = async (registrationId) => {
    try {
      await client.put(
        `/events/${event.id}/registrations/${registrationId}`,
        {
            status: "accepted",
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.id === registrationId ? { ...reg, status: "accepted" } : reg
        )
      );
    } catch (error) {
      console.error("Error accepting registration:", error);
    }
  };

  const handleReject = async (registrationId) => {
    try {
      await client.put(
        `/events/${event.id}/registrations/${registrationId}`,
        {
            status: "rejected",
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.id === registrationId ? { ...reg, status: "rejected" } : reg
        )
      );
    } catch (error) {
      console.error("Error rejecting registration:", error);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#121212",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        backgroundColor: "#1E1E1E",
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          padding: "30px",
          backgroundColor: "#1E1E1E",
          overflowY: "auto",
          position: "relative",
        }}
      >
        {event ? (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="h4"
                sx={{ color: "#FFFFFF", marginBottom: "20px" }}
              >
                Solicitações de Inscrição para {event.name}
              </Typography>
            </Box>

            {registrations.length === 0 ? (
              <Typography sx={{ color: "#BBBBBB" }}>
                Nenhuma solicitação de inscrição encontrada.
              </Typography>
            ) : (
              <List>
                {registrations.map((registration) => (
                  <Card
                    key={registration.id}
                    sx={{
                      marginBottom: "20px",
                      backgroundColor: "#3C3C3C",
                      color: "#FFFFFF",
                      padding: "15px",
                      "&:hover": {
                        backgroundColor: "#4A4A4A",
                      },
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6">
                        {registration.user.name} ({registration.user.email})
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#AAAAAA" }}>
                        Status: {registration.status}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleAccept(registration.id)}
                        disabled={registration.status !== "pending"}
                        sx={{ color: "#FFFFFF", borderColor: "#616161" }}
                      >
                        Aceitar
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleReject(registration.id)}
                        disabled={registration.status !== "pending"}
                        sx={{ color: "#FFFFFF", borderColor: "#F44336" }}
                      >
                        Rejeitar
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </List>
            )}
          </Box>
        ) : (
          <Typography sx={{ color: "#BBBBBB" }}>
            Evento não encontrado.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
