import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import clockRoutes from './routes/clockRoutes.js';
import startCronJob from './jobs/deadlineJob.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/clock', clockRoutes);

app.use((err, req, res, next) => {
  console.error('[App] Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/photo_prestiges_clock')
  .then(() => {
    console.log('[App] Connected to MongoDB.');
    app.listen(PORT, () => {
      console.log(`[App] Clock Service running on port ${PORT}`);
      console.log(`[App] Swagger docs available at http://localhost:${PORT}/api-docs`);
      
      startCronJob();
    });
  })
  .catch((err) => {
    console.error('[App] Failed to connect to MongoDB:', err);
  });
