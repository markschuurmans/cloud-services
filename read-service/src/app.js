import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import swaggerSpec from "./config/swagger.js";
import readRoutes from "./routes/readRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "Read service is running", timestamp: new Date() });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/read", readRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3007;

if (!process.env.JWT_SECRET) {
    console.warn("JWT_SECRET is not defined! Authentication might fail.");
}

app.listen(PORT, () => {
    console.log(`Read service is running on port ${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
