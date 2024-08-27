import { Box, CssBaseline, StyledEngineProvider } from "@mui/material";
import { RootRouter } from "./routes";
import { ThemeProvider } from '@mui/material/styles';
import theme from "./config/theme";

export function App() {
  return (
    <StyledEngineProvider injectFirst>
      <CssBaseline />
      <Box className="MainDiv">
        <ThemeProvider theme={theme}>
          <RootRouter />
        </ThemeProvider>
      </Box>
    </StyledEngineProvider>
  );
}
