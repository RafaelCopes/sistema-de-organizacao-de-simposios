import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { useForm } from "react-hook-form";
import { Form, useNavigate } from "react-router-dom";
import { z } from "zod";
import { client } from "../config/client";
import {
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const schema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  type: z.string(),
});

const userTypes = [
  { value: "organizer", label: "Organizador" },
  { value: "participant", label: "Participante" },
];

export const RegisterForm = () => {
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
      await client.post("/users", data);
      const response = await client.post("/login", {
        email: data.email,
        password: data.password,
      });
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
    <Form
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        minWidth: "400px",
      }}
    >
      <TextField
        label="Nome"
        variant="outlined"
        type="name"
        error={!!errors.name}
        helperText={errors.name?.message}
        {...register("name")}
      />
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

      <TextField
        select
        label="Tipo de Usuário"
        defaultValue="participant"
        helperText="Escolha o tipo de usuário"
        {...register("type")}
      >
        {userTypes.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <Button
        variant="contained"
        color="primary"
        type="submit"
        disabled={isSubmitting || !isValid}
        onClick={onSubmit}
      >
        Cadastrar-se
      </Button>
    </Form>
  );
};
