import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { client } from "../config/client";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { UserType } from "../types/userType";
import { Sidebar } from "../components/sidebar";

export function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthUser<UserType>();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registeredStatus, setRegisteredStatus] = useState<string>("");
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await client.get(`/events/${id}`);
        setEvent(response.data);

        // Check if the user is registered for this event
        if (user.type === "participant") {
          const registration = response.data.registrations.find(
            (registration) => registration.user.email === user.email
          );

          if (registration) {
            setRegisteredStatus(registration.status);
          }
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id, user]);

  const handleRegisterClick = async () => {
    setIsRegistering(true);
    try {
      await client.post(
        `/events/${id}/registration`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setRegisteredStatus("pending");
    } catch (error) {
      console.error("Error registering for the event:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  const isCertificateButtonVisible = () => {
    const currentDate = new Date();
    return (
      event && new Date(event.date) < currentDate
    );
  };

  const returnStatus = () => {
    if (isCertificateButtonVisible()) {
      return "Evento Encerrado";
    }

    switch (registeredStatus) {
      case "accepted":
        return "Registrado";
      case "pending":
        return "Pendente";
      case "rejected":
        return "Rejeitado";
      default:
        return "Registrar";
    }
  };

  const returnStatusColor = () => {
    if (isCertificateButtonVisible()) {
      return "#AAA";
    }
    switch (registeredStatus) {
      case "accepted":
        return "#3F51B5";
      case "pending":
        return "#FFC107";
      case "rejected":
        return "#F44336";
      default:
        return "#4CAF50";
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
                {event.name}
              </Typography>
            </Box>

            <Card
              sx={{
                marginBottom: "20px",
                padding: "20px",
                backgroundColor: "#3C3C3C",
                color: "#FFFFFF",
                position: "relative",
              }}
            >
              <Typography variant="body1" sx={{ marginBottom: "10px" }}>
                <strong>Data:</strong>{" "}
                {new Date(event.date).toLocaleDateString()}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: "10px" }}>
                <strong>Horário de Início:</strong> {event.startTime}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: "10px" }}>
                <strong>Horário de Término:</strong> {event.endTime}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: "10px" }}>
                <strong>Local:</strong> {event.location}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: "10px" }}>
                <strong>Nível:</strong> {event.level}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: "10px" }}>
                <strong>Capacidade:</strong> {event.capacity}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: "10px" }}>
                <strong>Descrição:</strong> {event.description}
              </Typography>

              {!isCertificateButtonVisible() && user.type === 'organizer' && (<Button
                variant="contained"
                sx={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  backgroundColor: returnStatusColor(),
                  "&:hover": {
                    backgroundColor: "#66BB6A",
                  },
                }}
                onClick={() => {
                  navigate(`registrations`);
                }}
              >
                Visualizar Solicitações
              </Button>)
              }

              {isCertificateButtonVisible() && user.type === 'organizer' &&  (
                <Button
                  variant="contained"
                  sx={{
                    position: "absolute",
                    bottom: "20px",
                    right: "20px",
                    backgroundColor: "#4CAF50",
                    "&:hover": {
                      backgroundColor: "#66BB6A",
                    },
                  }}
                  onClick={() => {
                    // Implement certificate issuance functionality here
                    console.log("Emitir Certificados");
                  }}
                >
                  Emitir Certificados
                </Button>
              )}

              {user.type === "participant" && (
                <Button
                  variant="contained"
                  sx={{
                    position: "absolute",
                    bottom: "20px",
                    right: "20px",
                    "&:hover": {
                      backgroundColor: "#66BB6A",
                    },
                    "&:disabled": {
                      backgroundColor: returnStatusColor(),
                      color: "#000000",
                    },
                  }}
                  onClick={handleRegisterClick}
                  disabled={
                    returnStatus() === "Registrado" ||
                    returnStatus() === "Pendente" ||
                    returnStatus() === "Rejeitado" ||
                    isCertificateButtonVisible()
                  }
                >
                  {returnStatus()}
                </Button>
              )}
            </Card>

            <Button
              variant="outlined"
              color="secondary"
              sx={{ color: "#FFFFFF", borderColor: "#616161" }}
              onClick={() => navigate(-1)}
            >
              Voltar
            </Button>
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
