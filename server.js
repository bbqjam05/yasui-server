require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app'); // Import the configured Express app

// --- MongoDB Connection ---
const dbURI = process.env.MONGO_URI;
if (!dbURI) {
  console.error('MONGO_URI is not defined in the .env file. Please create a .env file and add your MongoDB connection string.');
  process.exit(1);
}

mongoose.connect(dbURI)
  .then(() => {
    console.log('MongoDB Connected Successfully');
    
    // --- Server Initialization ---
    // Start the server only after the DB connection is successful
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1); // Exit if DB connection fails
  });
