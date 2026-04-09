require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'Clock Service is running' });
});

const PORT = process.env.PORT || 3005;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/photo_prestiges_clock';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to Database');
        app.listen(PORT, () => console.log(`Clock Service running on port ${PORT}`));
        
        // Start cron jobs
        // require('./jobs/deadlineJob');
    })
    .catch(err => console.error('Database connection failed', err));
