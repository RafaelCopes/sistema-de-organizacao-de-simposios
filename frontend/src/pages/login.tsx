import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { Form, useNavigate } from "react-router-dom";
import { z } from "zod";
import { client } from "../config/client";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export function Login() {
  const navigate = useNavigate();
  const signIn = useSignIn();
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await client.post("/login", data);
      signIn({
        auth: { token: response.data.token, type: "Bearer" },
        userState: {
          email: data.email,
          type: response.data.user.type,
          name: response.data.user.name,
        },
      });
      navigate(`/${response.data.user.type}/dash`);
    } catch (error) {
      console.error(error);
    }
  });

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

        <Form
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            minWidth: "400px",
          }}
        >
          <TextField
            label="Email"
            variant="outlined"
            type="email"
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register("email")}
          />
          <TextField
            label="Senha"
            variant="outlined"
            type={showPassword ? "text" : "password"}
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register("password")}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={isSubmitting || !isValid}
            onClick={onSubmit}
          >
            Login
          </Button>
        </Form>

        <Box>
          <Button
            variant="outlined"
            onClick={() => {
              navigate("/register");
            }}
          >
            Registrar-se
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
