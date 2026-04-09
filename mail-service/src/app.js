import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import swaggerSpec from "./config/swagger.js";
import mailRoutes from "./routes/mailRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "Mail service is running", timestamp: new Date() });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/", mailRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3006;
const MONGO_URI =
    process.env.MONGO_URI || "mongodb://localhost:27017/photo_prestiges_mail";

if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not defined!");
    process.exit(1);
}

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB for Mail-Service");
        app.listen(PORT, () => {
            console.log(`Mail service is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Database connection failed:", err.message);
        process.exit(1);
    });
