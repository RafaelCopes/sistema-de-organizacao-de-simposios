import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import registrationRoutes from "./routes/registrationRoutes";
import symposiumRoutes from "./routes/symposiumRoutes";
import eventRoutes from "./routes/eventRoutes";
// Importe outras rotas conforme necessário

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Middleware global
app.use((req, res, next) => {
  next();
});

// Rotas
app.use(authRoutes);
app.use(userRoutes);
app.use(registrationRoutes);
app.use(symposiumRoutes);
app.use(eventRoutes);
// Adicione outras rotas aqui

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ message: "An error occurred on the server" });
});

export { app };
