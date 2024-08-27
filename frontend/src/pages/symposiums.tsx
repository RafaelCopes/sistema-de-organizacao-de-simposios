import { useEffect, useState } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { client } from '../config/client';

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
        const response = await client.get('/symposiums');
        setSymposiums(response.data);
      } catch (error) {
        console.error('Error fetching symposiums:', error);
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
          width: '100vw',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'black',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        backgroundColor: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <Box
        sx={{
          width: '600px',
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5" gutterBottom>
          Lista de Simpósios
        </Typography>

        {symposiums.length === 0 ? (
          <Typography>Nenhum simpósio disponível.</Typography>
        ) : (
          <List sx={{ width: '100%' }}>
            {symposiums.map((symposium) => (
              <ListItem key={symposium.id} button onClick={() => navigate(`${symposium.id}`)}>
                <ListItemText primary={symposium.name} secondary={symposium.description} />
              </ListItem>
            ))}
          </List>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/create-symposium')}
          sx={{ marginTop: '20px' }}
        >
          Criar Novo Simpósio
        </Button>
      </Box>
    </Box>
  );
}
