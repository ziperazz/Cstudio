const mongoose = require('mongoose');
const Admin = require('./src/models/Admin');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (adminExists) {
      await Admin.deleteOne({ username: 'admin' });
      console.log('Old admin removed');
    }
    
    await Admin.create({
      username: 'admin',
      password: '142536'
    });
    
    console.log('Admin created!');
    console.log('Username: admin');
    console.log('Password: 142536');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });