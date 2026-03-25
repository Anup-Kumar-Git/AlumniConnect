const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if the URI exists before trying to connect
    const uri = process.env.MONGO_URI;
    
    if (!uri) {
      console.error('Error: MONGO_URI is not defined in .env file');
      return;
    }

    await mongoose.connect(uri);
    console.log('MongoDB Atlas Connected Successfully');
  } catch (err) {
    console.error('Database Connection Error:', err.message);
  }
};

module.exports = connectDB;