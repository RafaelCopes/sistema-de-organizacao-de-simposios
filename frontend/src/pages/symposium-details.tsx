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

export function SymposiumDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthUser<UserType>();
  const [symposium, setSymposium] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeredStatus, setregisteredStatus] = useState<string>("");
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const fetchSymposiumDetails = async () => {
      try {
        const symposiumResponse = await client.get(`/symposiums/${id}`);
        setSymposium(symposiumResponse.data);

        console.log(symposiumResponse.data);

        // Check if the user is registered for this symposium and status is accepted
        if (user.type === "participant") {
          const registration = symposiumResponse.data.registrations.find(
            (participant) => {
              return participant.user.email === user.email;
            }
          );
          console.log("chegou aqui");

          console.log("registration", registration);

          if (registration) {
            setregisteredStatus(registration.status);
          }
        }

        const eventsResponse = await client.get(`/symposiums/${id}/events`);
        setEvents(eventsResponse.data);
      } catch (error) {
        console.error("Error fetching symposium details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSymposiumDetails();
  }, [id, user]);

  const handleRegisterClick = async () => {
    setIsRegistering(true);
    try {
      await client.post(
        `/symposiums/${id}/registration`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setregisteredStatus("pending");
    } catch (error) {
      console.error("Error registering for the symposium:", error);
    } finally {
      setIsRegistering(false);
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

  const isCertificateButtonVisible = () => {
    const currentDate = new Date();
    return (
      user.type === "organizer" &&
      symposium &&
      new Date(symposium.endDate) < currentDate
    );
  };

  const returnStatus = () => {
    if (!isCertificateButtonVisible()) {
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
    if (!isCertificateButtonVisible()) {
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

  return (
    <Box
      sx={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        backgroundColor: "#1E1E1E",
      }}
    >
      {/* Replace old sidebar with Sidebar component */}
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
        {symposium ? (
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
                {symposium.name}
              </Typography>
              {user.type === "organizer" && !isCertificateButtonVisible() && (
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#3F51B5",
                    "&:hover": {
                      backgroundColor: "#5C6BC0",
                    },
                  }}
                  onClick={() => navigate(`create`)}
                >
                  Criar Evento
                </Button>
              )}
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
                <strong>Local:</strong> {symposium.location}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: "10px" }}>
                <strong>Data Começo:</strong>{" "}
                {new Date(symposium.startDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: "10px" }}>
                <strong>Data Fim:</strong>{" "}
                {new Date(symposium.endDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: "10px" }}>
                <strong>Organizador:</strong> {symposium.organizer.name}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: "10px" }}>
                <strong>Descrição:</strong> {symposium.description}
              </Typography>

              {isCertificateButtonVisible() && (
                <Button
                  variant="contained"
                  sx={{
                    position: "absolute",
                    bottom: "20px",
                    right: "20px",
                    backgroundColor: returnStatusColor(),
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

              <Button
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
              </Button>

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
                    returnStatus() == "Registrado" ||
                    returnStatus() == "Pendente" ||
                    returnStatus() == "Rejeitado" ||
                    !isCertificateButtonVisible()
                  }
                >
                  {returnStatus()}
                </Button>
              )}
            </Card>

            <Typography
              variant="h5"
              sx={{ color: "#FFFFFF", marginBottom: "20px" }}
            >
              Lista de todos os eventos do simpósio
            </Typography>

            {events.length === 0 ? (
              <Typography sx={{ color: "#BBBBBB" }}>
                Nenhum evento disponível.
              </Typography>
            ) : (
              <List>
                {events.map((event) => (
                  <Card
                    key={event.id}
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
                      <Typography variant="h6">{event.name}</Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#AAAAAA", marginBottom: "10px" }}
                      >
                        {new Date(event.date).toLocaleDateString()} -{" "}
                        {event.level}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#AAAAAA" }}>
                        {event.description}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() =>
                          navigate(`/organizer/dash/events/${event.id}`)
                        }
                        sx={{ color: "#FFFFFF", borderColor: "#616161" }}
                      >
                        Mais Detalhes
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </List>
            )}
          </Box>
        ) : (
          <Typography sx={{ color: "#BBBBBB" }}>
            Simpósio não encontrado.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
