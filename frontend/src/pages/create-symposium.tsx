import { Box, Button, Typography, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { client } from '../config/client';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { UserType } from '../types/userType';

const symposiumSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  location: z.string().min(1, "O local é obrigatório."),
  startDate: z.string().min(1, "A data de início é obrigatória."),
  endDate: z.string().min(1, "A data de término é obrigatória."),
  description: z.string().min(1, "A descrição é obrigatória."),
});

export function CreateSymposium() {
  const navigate = useNavigate();
  
  const user = useAuthUser<UserType>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(symposiumSchema),
  });

  const onSubmit = async (data) => {
    try {
      await client.post('/symposiums', data, {headers: {Authorization: `Bearer ${user.token}`}});

      navigate('/');
    } catch (error) {
      console.error('Error creating symposium:', error);
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#121212",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          alignItems: "center",
          borderRadius: "12px",
          backgroundColor: "#1E1E1E",
          padding: "30px",
          width: "90%",
          maxWidth: "500px",
        }}
      >
        <Typography variant="h5" sx={{ marginBottom: "20px" }}>
          Criar Novo Simpósio
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: "15px", width: "100%" }}>
          <TextField
            label="Nome do Simpósio"
            variant="outlined"
            fullWidth
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            label="Local"
            variant="outlined"
            fullWidth
            {...register('location')}
            error={!!errors.location}
            helperText={errors.location?.message}
          />
          <TextField
            label="Data de Início"
            variant="outlined"
            fullWidth
            type="date"
            {...register('startDate')}
            error={!!errors.startDate}
            helperText={errors.startDate?.message}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Data de Término"
            variant="outlined"
            fullWidth
            type="date"
            {...register('endDate')}
            error={!!errors.endDate}
            helperText={errors.endDate?.message}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Descrição"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            {...register('description')}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
        </Box>

        <Box sx={{ marginTop: "20px" }}>
          <Button type="submit" variant="contained">
            Criar Simpósio
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
