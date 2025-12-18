const { config } = require('dotenv');
const express = require('express');
const app = express();
const mongoose = require('mongoose')
const User = require('./userDB')
const port = 8080;

config()

mongoose.connect(process.env.MURI).then(() => console.log("good")).catch((error) => console.error(error.message))
// 1. Define a Route Handler (GET /)
// This function runs when someone visits the server's root URL (e.g., http://localhost:3000/)
app.get('/', async (req, res) => {
  try{
    const allusers = await User.find()
    res.status(202).json(allusers)
  }
  catch(error){
    res.status(500).json({error: error.message})
    console.error(error.message)
  }
});



// 2. Define a different Route Handler (GET /api/status)
app.get('/api/status', (req, res) => {
  // Respond with a JSON object (common for APIs)
  res.json({
    status: 'ok',
    message: 'Server is up and running.',
    timestamp: new Date().toISOString()
  });
});

// 3. Start the Server and Listen to the Port
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});