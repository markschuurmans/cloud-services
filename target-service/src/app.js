require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'Target Service is running' });
});

// Serve static uploads
app.use('/uploads', express.static('src/uploads'));

// Import routes here
// app.use('/targets', require('./routes/targets'));
// app.use('/submissions', require('./routes/submissions'));

const PORT = process.env.PORT || 3003;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/photo_prestiges_target';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to Database');
        app.listen(PORT, () => console.log(`Target Service running on port ${PORT}`));
    })
    .catch(err => console.error('Database connection failed', err));
