const express = require('express');
const app = express();
const mongodbC = require('mongodb')
const port = 8080;


// 1. Define a Route Handler (GET /)
// This function runs when someone visits the server's root URL (e.g., http://localhost:3000/)
app.get('/', (req, res) => {
  console.log('Request received for the home page.');
  res.send('<h1>Hello from the Express Server!</h1><p>The server is running on port ' + port + '</p>');
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