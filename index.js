const { config } = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken'); // Corrected import
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const Joi = require('joi');

// Models
const User = require('./userDB'); 
const Posts = require('./postDB'); // Ensure this matches your filename

const app = express();
const port = 8080;
config();


// Validation Logic
const validatePost = (req, res, next) => {
    const schema = Joi.object({
        Npost: Joi.object({
            title: Joi.string().min(5).max(100).required(),
            content: Joi.string().min(10).required(),
        }).required()
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    next();
};

// Auth: Admin Only
const Acheack = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "No token, denied" });
    try {
        const decoded = jwt.verify(token, process.env.JWT);
        if (decoded.role === "admin") {
            req.user = decoded;
            next();
        } else {
            return res.status(403).json({ access: "denied" });
        }
    } catch (err) {
        res.status(401).json({ message: "Token invalid" });
    }
};

// Auth: Logged In User
const Tcheack = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ sign_in: "invalid" });
    try {
        req.user = jwt.verify(token, process.env.JWT);
        next();
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

const postLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: "Too many requests, try again later." }
});



const corsOptions = {

  // Replace with your Vite dev server URL (usually 5173)
  origin: 'http://localhost:5173',
  credentials: true, // Required for your 'token' cookie to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']

};



app.use(helmet());              
app.use(cors(corsOptions));      
app.use(express.json());        
app.use(cookieParser());        
app.use(mongoSanitize());

mongoose.connect(process.env.MURI).then(() => console.log("connected")).catch((error) => console.error(error.message))

app.get('/', async (req, res) => {
  try{
    const allp = await Posts.find()
    res.status(202).json(allp)
  }
  catch(error){
    res.status(500).json({error: error.message})
    console.error(error.message)
  }
});

//
//
//DATA POSTS ROUTES
// 2. Define a different Route Handler (GET /api/status)
app.delete('/api/data', Acheack, async (req, res) => {
  try{// Respond with a JSON object (common for APIs)
    const {id} = req.body
    NdataF = await Posts.findByIdAndDelete(id)
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
    epost = await Posts.findByIdAndUpdate(id, Epost, {new: true})
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

app.post('/api/data', postLimiter, Tcheack, validatePost, async(req, res) => {
  const {Npost} = req.body 
  try{
    const newp = new Posts(Npost)
    const np = await newp.save()
    if(np){
      return res.status(201).json({noerror: "good"})
      }
    }
  catch(error){
    console.error(error.message)
    return res.status(500).json({error: error.message})
  }
})

//
//
//
//Athentication routes USER routes
app.post('/login', postLimiter, async (req, res) => {
    const { username, pas } = req.body;
    
    try {
        // 2. Fixed spelling: await
        const user = await User.findOne({ username });
        
        if (!user) {
            // 3. Send a clear string, not error.message (which is undefined here)
            return res.status(403).json({ error: "Invalid username or password" });
        }

        // 4. Fixed spelling: bcrypt.compare
        const isMatch = await bcrypt.compare(pas, user.password);
        if (!isMatch) {
            return res.status(403).json({ error: "Invalid username or password" });
        }

        // 5. Determine the role correctly
        const userRole = user.password === process.env.Apas ? "admin" : "user";

        // 6. Create the payload for the token
        const payload = { id: user._id, role: userRole };
        
        const token = jwt.sign(payload, process.env.JWT, { expiresIn: '1h' });

        // 7. Set the cookie
        res.cookie('token', token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict', 
            maxAge: 3600000 
        });

        // 8. Success!
        return res.status(200).json({ message: "Logged in", role: userRole });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: "Server Error" });
    }
});

app.post('/logout', async (req, res) => {
  try{
    res.clearCookie( 'token',{
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict'}
    )
    return res.status(200).json({noerror: "good"})
  }
  catch(error){
    console.error(error.message)
    return res.status(500).json({error: error.message})
  }

})

app.post('/reg', async (req, res) => {
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



app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke on the server!' });
});
// 3. Start the Server and Listen to the Port
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});


