const { config } = require('dotenv');
const express = require('express');
const app = express();
const mongoose = require('mongoose')
const User = require('./userDB');
const { jwt } = require('jsonwebtoken');
const port = 8080;

const AC = async (req, res, next) => {
    const {token} = req.cookies

    if(!token){
     return res.status(401).json({error: D})
    }
    try{
      const dec = jwt.verify(token, process.env.JWT)

      if(dec.role === "admin"){
        req.user = dec 
        next()
      }
      else{
        return res.status(403).json({error: D})
      }
    }
    catch(error){
      console.error(error.message)
      return res.status(401).json({error: D})
    }
}

const TK = (req, res, next) => {
    const {token} = req.cookies

  if(!token){
    return res.status(401).json({error: D})
  }
    try{
        const dec = jwt.verify(token, process.env.JWT)
        req.user = dec
        next()
    }
    catch(error){
        console.error(error.message)
        return res.status(401).json({error: D})
    }
}

const Acheack = (req, res, next) => {

  const {token} = req.cookies

  if(!token){
    return res.status(401).json({error: D})
  }

  try{
    const dec = jwt.verify(token, process.env.JWT)
    if(dec.role === "admin"){
      req.user = dec
      next()
    }
    else{
      return res.status(403).json({error: D})
    } 
  }
  catch(error.message)
    console.error(error.message)
    return res.status(401).json({error: D})
}


const Acheack = (req, res, next) => {
  // 1. Get the token from the cookie
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // 2. Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT);
    
    // 3. Check the role we stored in the payload
    if (decoded.role === "admin") {
      req.user = decoded; // Optional: store user info for the next function
      next();
    } else {
      return res.status(403).json({ access: "denied" });
    }
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

const Tcheack = (req, res, next) => {
    const token = req.cookies.token
    if(!token){
      return res.status(401).json({sign_in: invaled})}
    try{
      const dec = jwt.verify(token, process.env.JWT)

      req.user = dec

      next()

    }
    catch(error){
      console.error(error.message)
      res.status(401).json({error: error.message})
    }
}


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

app.post('/api/data', Tcheack, async (req, res) => {
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
app.delete('/api/data', Tcheack, Acheack, async (req, res) => {
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

app.put('/api/data', Tcheack, async (req, res) => {
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
//do npm installs
app.post('/login', async (req, res) => {
    try{
      const {username, pas} = req.body
      const user = await User.findOne({username})
      if(!user){
        return res.status(404).json({ress: fail})
      }
      const isaMatch = await bycript.compair(pas, username.password)
      if(!isaMatch){
        return res.status(404).json({ress: fail})
      }
      const role = pas === process.env.Apas ? "admin" : "user"
      const payload = {id: user.id, role: role}
      const token = jwt.sign(payload, process.env.JWT, {expiresIn: '1h'})
      res.cookie('token', token, {
            httpOnly: true, // Prevents JS access (XSS protection)
            secure: process.env.NODE_ENV === 'production', // Only HTTPS in prod
            sameSite: 'strict', // Prevents CSRF attacks
            maxAge: 3600000 // 1 hour in milliseconds
        })
        return res.status(200).json({ message: "Logged in", role: payload.role })
      }
      catch(error){
        console.error(error.message)
        res.status(500).json({error: error.message})
    }
})

app.post('/logout', async (req, res) => {

})

// 3. Start the Server and Listen to the Port
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});


