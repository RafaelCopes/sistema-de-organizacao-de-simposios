import { Button } from "@mui/material";
import { client } from "./config/client";

function App() {
  client.get("/users").then((data) => {
    console.log(data);
  });

  return (
    <>
      <div>
        <Button variant="contained">teste</Button>
      </div>
    </>
  );
}

export default App;
