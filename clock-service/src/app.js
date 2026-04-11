import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import clockRoutes from './routes/clockRoutes.js';
import startCronJob from './jobs/deadlineJob.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'Clock service is running', timestamp: new Date() });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/clock', clockRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3005;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/photo_prestiges_clock';


mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('[Clock-Service] Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`[Clock-Service] Running on port ${PORT}`);
      startCronJob();
    });
  })
  .catch((err) => {
    console.error('[Clock-Service] Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });

