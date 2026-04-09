require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'Mail Service is running' });
});

// Import routes here
// app.use('/mail', require('./routes/mail'));

const PORT = process.env.PORT || 3006;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/photo_prestiges_mail';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to Database');
        app.listen(PORT, () => console.log(`Mail Service running on port ${PORT}`));
    })
    .catch(err => console.error('Database connection failed', err));
