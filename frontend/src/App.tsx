import { Box, CssBaseline, StyledEngineProvider } from "@mui/material";
import { RootRouter } from "./routes";

export function App() {
  return (
    <StyledEngineProvider injectFirst>
      <CssBaseline />
      <Box className="MainDiv">
        <RootRouter />
      </Box>
    </StyledEngineProvider>
  );
}
