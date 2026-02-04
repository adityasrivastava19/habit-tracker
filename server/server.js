const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const habitRoutes = require('./routes/habits');

const app = express();

app.use(cors());
app.use(express.json());

// Ensure MONGO_URI is set
if (!process.env.MONGO_URI) {
    console.error('ERROR: MONGO_URI environment variable is not set!');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);

// Serve static files from the React app
const path = require('path');
const clientBuildPath = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile('index.html', { root: clientBuildPath });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
