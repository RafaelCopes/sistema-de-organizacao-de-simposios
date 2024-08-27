import { Box, Button, Typography } from "@mui/material";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { useNavigate } from "react-router-dom";
import { UserType } from "../types/userType";

export const Sidebar = () => {
  const navigate = useNavigate();
  const user = useAuthUser<UserType>();
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
        <Typography variant="body2" sx={{ marginBottom: "40px" }}>
          Email: {user?.email}
        </Typography>
        <Button
          variant="contained"
          sx={{
            width: "100%",
            marginBottom: "20px",
            backgroundColor: "#3F51B5",
            "&:hover": {
              backgroundColor: "#5C6BC0",
            },
          }}
          onClick={() => navigate("create")}
        >
          Adicionar Simpósio
        </Button>
      </Box>
      <Button
        variant="outlined"
        color="secondary"
        sx={{ color: "#FFFFFF", borderColor: "#616161" }}
        onClick={() => {
          // Implement logout functionality here
          console.log("Logout");
        }}
      >
        Deslogar
      </Button>
    </Box>
  );
};
