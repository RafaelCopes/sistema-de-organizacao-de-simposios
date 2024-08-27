import { useEffect, useState } from "react";
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
import { useNavigate } from "react-router-dom";
import { client } from "../config/client";
import { Sidebar } from "../components/sidebar";

type Symposium = {
  id: number;
  name: string;
  description: string;
};

export function Symposiums() {
  const navigate = useNavigate();
  const [symposiums, setSymposiums] = useState<Symposium[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSymposiums = async () => {
      try {
        const response = await client.get("/symposiums");
        setSymposiums(response.data);
      } catch (error) {
        console.error("Error fetching symposiums:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSymposiums();
  }, []);

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
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ color: "#FFFFFF", textAlign: "center" }}
        >
          Lista de todos os simpósios
        </Typography>

        {symposiums.length === 0 ? (
          <Typography sx={{ color: "#BBBBBB", textAlign: "center" }}>
            Nenhum simpósio disponível.
          </Typography>
        ) : (
          <List>
            {symposiums.map((symposium) => (
              <Card
                key={symposium.id}
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
                  <Typography variant="h6">{symposium.name}</Typography>
                  <Typography variant="body2" sx={{ color: "#AAAAAA" }}>
                    {symposium.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate(`${symposium.id}`)}
                    sx={{ color: "#FFFFFF", borderColor: "#616161" }}
                  >
                    Ver Detalhes
                  </Button>
                </CardActions>
              </Card>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}
