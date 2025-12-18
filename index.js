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

app.post('/api/data', async (req, res) => {
  try{
    const {nuser} = req.body
    const Nuser = new User(nuser)
    const Nu = await Nuser.save()
    res.status(201).json(Nu)
  }
  catch(error){
    console.error(error.message)
    res.status(500).json({error: error.message})
  }
})

// 2. Define a different Route Handler (GET /api/status)
app.delete('/api/data', async (req, res) => {
  try{// Respond with a JSON object (common for APIs)
    const {id} = req.body
    NdataF = await User.findByIdAndDelete(id)
      if (!NdataF) {
        return res.status(404).json({user: "user not found"})
      }
    res.status(201).json({user: "was deleted", id: id})
    }
  catch(error){
    console.error(error.message)
    res.status(500).json({error: "server error"})  
  }
});

// 3. Start the Server and Listen to the Port
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});