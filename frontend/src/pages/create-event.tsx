import { Box, Button, Typography, TextField } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { client } from '../config/client';

const eventSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  date: z.string().min(1, "A data é obrigatória."),
  startTime: z.string().min(1, "O horário de início é obrigatório."),
  endTime: z.string().min(1, "O horário de término é obrigatório."),
  location: z.string().min(1, "O local é obrigatório."),
  level: z.string().min(1, "O nível é obrigatório."),
  description: z.string().min(1, "A descrição é obrigatória."),
});

export function CreateEvent() {
  const navigate = useNavigate();

  const { id } = useParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventSchema),
  });

  const onSubmit = async (data) => {
    try {
      await client.post('/events', {data, symposiumId: id});
      navigate('/events');
    } catch (error) {
      console.error('Error creating event:', error);
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
          backgroundColor: "#1E1E1E",
          alignItems: "center",
          borderRadius: "12px",
          padding: "30px",
          width: "90%",
          maxWidth: "500px",
        }}
      >
        <Typography variant="h5" sx={{ marginBottom: "20px" }}>
          Criar Novo Evento
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: "15px", width: "100%" }}>
          <TextField
            label="Nome do Evento"
            variant="outlined"
            fullWidth
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            label="Data"
            variant="outlined"
            fullWidth
            type="date"
            {...register('date')}
            error={!!errors.date}
            helperText={errors.date?.message}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Horário de Início"
            variant="outlined"
            fullWidth
            type="time"
            {...register('startTime')}
            error={!!errors.startTime}
            helperText={errors.startTime?.message}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Horário de Término"
            variant="outlined"
            fullWidth
            type="time"
            {...register('endTime')}
            error={!!errors.endTime}
            helperText={errors.endTime?.message}
            InputLabelProps={{ shrink: true }}
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
            label="Nível"
            variant="outlined"
            fullWidth
            {...register('level')}
            error={!!errors.level}
            helperText={errors.level?.message}
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
            Criar Evento
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
