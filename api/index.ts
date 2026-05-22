import express from "express";
import cors from "cors";
import apiRoutes from "../src/api.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use("/api", apiRoutes);
app.use("/", apiRoutes);

export default app;
