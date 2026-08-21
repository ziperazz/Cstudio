const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studio_portfolio';

        const conn = await mongoose.connect(MONGO_URI);

        console.log(`[MongoDB] Connected Successfully! Host: ${conn.connection.host}, Database: ${conn.connection.name}`);
    } catch (error) {
        console.error(`[MongoDB] Connection Failed! Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;