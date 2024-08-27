import { Box, Button, Typography } from "@mui/material";
import { LoginForm } from "../components/loginForm";
import { useState } from "react";
import { RegisterForm } from "../components/registerForm";

export function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
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
          borderRadius: "20px",
          backgroundColor: "white",
          minHeight: "600px",
          minWidth: "600px",
        }}
      >
        <Typography variant="h5">
          Sistema de Organização de Simpósios
        </Typography>

        {isRegistering ? <RegisterForm /> : <LoginForm />}

        <Box>
          {isRegistering ? (
            <Button onClick={() => setIsRegistering(false)} variant="text">
              Já possui uma conta? Faça login
            </Button>
          ) : (
            <Button onClick={() => setIsRegistering(true)} variant="text">
              Não possui uma conta? Registre-se
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
