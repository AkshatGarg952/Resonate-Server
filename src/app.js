import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import diagnosticsRoutes from "./routes/diagnostics.routes.js";

const app = express();

app.use(cors());
app.use(express.json());


// ROUTES
app.get("/", (req, res) => {
  res.send("Resonate API is running...");
});
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/diagnostics", diagnosticsRoutes);

export default app;
