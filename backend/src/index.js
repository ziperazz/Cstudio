require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const userRoutes = require('./routes/userRoutes');
const clientFolderRoutes = require('./routes/clientFolderRoutes');

const app = express();

connectDB();

// Helmet
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS
app.use(cors({
    origin: ['http://cstudio.ir', 'https://cstudio.ir', 'http://www.cstudio.ir', 'https://www.cstudio.ir', 'http://localhost:3030', 'http://78.157.51.136:3030'],
    credentials: true,
}));

// Body Parser - با محدودیت بالا برای آپلود ویدیو
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/client-folders', clientFolderRoutes);

// Error Handler
app.use((err, req, res, next) => {
    console.error(`[Server Error] ${err.stack}`);
    res.status(err.status || 500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`\n=========================================`);
    console.log(`[Server] Running on port ${PORT}`);
    console.log(`[API Base URL] http://localhost:${PORT}/api`);
    console.log(`=========================================\n`);
});
