const { config } = require('dotenv');
const express = require('express');
const app = express();
const mongoose = require('mongoose')
const User = require('./userDB')
const port = 8080;


//need to do npm installs

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

app.put('/api/data', async (req, res) => {
  try{
    const {Epost, id} = req.body
    epost = await User.findByIdAndUpdate(id, Epost, {new: true})
    if(!epost){
      return res.status(404).json({user: "user not found"})
    }
    res.status(200).json(epost)
  }
  catch(error){
    console.error(error.message)
    res.status(500).json({error: error.message})
  }
})

// 3. Start the Server and Listen to the Port
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});


export const Admin = (req, res, next) => {
  const {password} = req.body
  if (password !== process.env.adminp){
    return res.status(404).json({m: not "admin"})
  } 
  next()
}

import jwt from 'jsonwebtoken'

app.post('/login', async (req, res) => {
  const {user} = req.body
  const token = jwt.sing(user, pocess.env.JWT, { expiresIn: '1h'})

  res.cookie('token', token, {httpOnly: true, secure: true})
  res.status(200).json({G: good})
})




app.post('/login', async (req, res) => {
    try {
        const {username, password } = req.body;

        // 1. Fetch user from DB (Placeholder logic)
        // const user = await User.findOne({ username });
        // if (!user || user.password !== password) return res.status(401).json({ m: "Fail" });

        // 2. Define the payload (what the token "carries")
        const payload = {  
            role: password === process.env.Apas ? "admin" : "user" // Example logic
        };

        // 3. Sign the token (Corrected typos)
        const token = jwt.sign(payload, process.env.JWT, { expiresIn: '1h' });

        // 4. Set the Cookie
        res.cookie('token', token, {
            httpOnly: true, // Prevents JS access (XSS protection)
            secure: process.env.NODE_ENV === 'production', // Only HTTPS in prod
            sameSite: 'strict', // Prevents CSRF attacks
            maxAge: 3600000 // 1 hour in milliseconds
        });

        return res.status(200).json({ message: "Logged in", role: payload.role });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});


const handleLogin = async (logedinfo) => {
  try {
    const {username, password} = logedinfo
    const res = await axios.post('http://localhost:5000/login', 
      { username, password }, 
      { withCredentials: true } // REQUIRED to allow cookies
    );
    
    // Store the role in React state/context to show/hide Admin buttons
    setUserRole(res.data.role); 
  } catch (err) {
    console.error("Login failed");
  }
};





