import { Box, Button, Typography } from "@mui/material";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { useNavigate } from "react-router-dom";
import { UserType } from "../types/userType";
import useSignOut from "react-auth-kit/hooks/useSignOut";

export const Sidebar = () => {
  const navigate = useNavigate();
  const user = useAuthUser<UserType>();
  const signOut = useSignOut();

  return (
    <Box
      sx={{
        width: "250px",
        backgroundColor: "#2C2C2C",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "20px",
        margin: "15px", // Add padding to ensure content doesn't touch the border
        color: "#FFFFFF",
        boxSizing: "border-box",
        borderRadius: "10px",
      }}
    >
      <Box>
        <Typography variant="h6" sx={{ marginBottom: "20px" }}>
          {user?.name}
        </Typography>
        <Typography variant="body2" sx={{ marginBottom: "20px" }}>
          Email: {user?.email}
        </Typography>
        <Typography variant="body2" sx={{ marginBottom: "20px" }}>
          {user?.type === "organizer" ? "Organizador" : "Participante"}
        </Typography>

        {user?.type === "organizer" ? (
          <Box>
            <Button
              variant="contained"
              sx={{
                width: "100%",
                marginBottom: "10px",
                backgroundColor: "#4CAF50",
                "&:hover": {
                  backgroundColor: "#66BB6A",
                },
              }}
              onClick={() => navigate("/meus-simposios")}
            >
              Meus Simpósios
            </Button>
            <Button
              variant="contained"
              sx={{
                width: "100%",
                marginBottom: "10px",
                backgroundColor: "#4CAF50",
                "&:hover": {
                  backgroundColor: "#66BB6A",
                },
              }}
              onClick={() => navigate("/registros-pendentes")}
            >
              Registros Pendentes
            </Button>
          </Box>
        ) : (
          <Box>
            <Button
              variant="contained"
              sx={{
                width: "100%",
                marginBottom: "10px",
                backgroundColor: "#4CAF50",
                "&:hover": {
                  backgroundColor: "#66BB6A",
                },
              }}
              onClick={() => navigate("/simposios-registrado")}
            >
              Simpósios Registrado
            </Button>
            <Button
              variant="contained"
              sx={{
                width: "100%",
                marginBottom: "10px",
                backgroundColor: "#4CAF50",
                "&:hover": {
                  backgroundColor: "#66BB6A",
                },
              }}
              onClick={() => navigate("/registros-pendentes")}
            >
              Registros Pendentes
            </Button>
          </Box>
        )}
      </Box>
      <Button
        variant="outlined"
        color="secondary"
        sx={{ color: "#FFFFFF", borderColor: "#616161" }}
        onClick={() => {
          signOut();
          navigate("/");
        }}
      >
        Deslogar
      </Button>
    </Box>
  );
};
