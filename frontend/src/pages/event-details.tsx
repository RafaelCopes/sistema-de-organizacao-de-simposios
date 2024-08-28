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

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await client.get(`/events/${id}`);
        setEvent(response.data);
      } catch (error) {
        console.error("Error fetching event details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const isCertificateButtonVisible = () => {
    if (!event) return false;

    const currentDateTime = new Date();
    const eventEndDateTime = new Date(`${event.date}T${event.endTime}`);

    return user.type === "organizer" && currentDateTime > eventEndDateTime;
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
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#3F51B5",
                  "&:hover": {
                    backgroundColor: "#5C6BC0",
                  },
                }}
                onClick={() => navigate(`/events/edit/${id}`)}
              >
                Editar Evento
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
