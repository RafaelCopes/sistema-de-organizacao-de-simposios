import { Box, Button, Typography } from "@mui/material";
import { LoginForm } from "../components/loginForm";
import { useState } from "react";
import { RegisterForm } from "../components/registerForm";

export function Login() {
  const [isRegistering, setIsRegistering] = useState(false);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        backgroundColor: "#121212",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          alignItems: "center",
          borderRadius: "12px",
          backgroundColor: "#1E1E1E",
          padding: "30px",
          width: "100%",
          maxWidth: "500px",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.5)",
          color: "#FFFFFF",
        }}
      >
        <Typography
          variant="h5"
          sx={{ marginBottom: "20px", color: "#FFFFFF" }}
        >
          Sistema de Organização de Simpósios
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "15px",
            width: "100%",
          }}
        >
          {isRegistering ? <RegisterForm /> : <LoginForm />}
        </Box>

        <Box sx={{ marginTop: "20px" }}>
          {isRegistering ? (
            <Button onClick={() => setIsRegistering(false)} variant="text">
              Já possui uma conta? Faça login
            </Button>
          ) : (
            <Button variant="outlined" onClick={() => setIsRegistering(true)}>
              Não possui uma conta? Registre-se
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
