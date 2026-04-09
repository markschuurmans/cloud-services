require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'Read Service is running' });
});

// Import routes here
// app.use('/read', require('./routes/read'));

const PORT = process.env.PORT || 3007;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/photo_prestiges_read';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to Database');
        app.listen(PORT, () => console.log(`Read Service running on port ${PORT}`));
    })
    .catch(err => console.error('Database connection failed', err));
