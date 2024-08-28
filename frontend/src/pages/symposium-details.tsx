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

export function SymposiumDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthUser<UserType>();
  const [symposium, setSymposium] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSymposiumDetails = async () => {
      try {
        const symposiumResponse = await client.get(`/symposiums/${id}`);
        setSymposium(symposiumResponse.data);
        const eventsResponse = await client.get(`/symposiums/${id}/events`);
        setEvents(eventsResponse.data);
      } catch (error) {
        console.error("Error fetching symposium details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSymposiumDetails();
  }, [id]);

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
      <Box
        sx={{
          width: "250px",
          backgroundColor: "#2C2C2C",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "20px",
          margin: "15px",
          color: "#FFFFFF",
          boxSizing: "border-box",
          borderRadius: "10px",
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ marginBottom: "20px" }}>
            Nome
          </Typography>
          <Typography variant="body2" sx={{ marginBottom: "40px" }}>
            Email
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="secondary"
          sx={{ color: "#FFFFFF", borderColor: "#616161" }}
          onClick={() => {
            // Implement logout functionality here
            console.log("Logout");
          }}
        >
          Deslogar
        </Button>
      </Box>

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
