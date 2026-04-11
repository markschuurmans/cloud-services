import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

import swaggerSpec from './config/swagger.js';
import readRoutes from './routes/readRoutes.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'Read service is running', timestamp: new Date() });
});

app.get('/openapi.json', (req, res) => {
    res.json(swaggerSpec);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/read', readRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3007;


app.listen(PORT, () => {
    console.log(`[Read-Service] Running on port ${PORT}`);
});

