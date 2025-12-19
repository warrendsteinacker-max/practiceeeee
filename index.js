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
const hpp = require('hpp');
const morgan = require('morgan');

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
// FIX: Change process.env.JWT to process.env.JWT_ACCESS
const Acheack = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "No token, denied" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS); // FIX HERE
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

const Tcheack = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ sign_in: "invalid" });
    try {
        req.user = jwt.verify(token, process.env.JWT_ACCESS); // FIX HERE
        next();
    } catch (error) {
        res.status(401).json({ error: "Access expired" });
    }
};

const postLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: "Too many requests, try again later." }
});

const validateRegister = (req, res, next) => {
    const schema = Joi.object({
        nuser: Joi.object({
            username: Joi.string().alphanum().min(3).max(30).required(),
            password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,30}$')).required(),
            name: Joi.string().required()
        }).required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    next();
};



const corsOptions = {

  // Replace with your Vite dev server URL (usually 5173)
  origin: 'http://localhost:5173',
  credentials: true, // Required for your 'token' cookie to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']

};


app.use(morgan('dev'));
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"], // Vite needs inline scripts for dev
            connectSrc: ["'self'", "http://localhost:8080"], // Allow API calls
        },
    },
}));              
app.use(cors(corsOptions));      
app.use(express.json());        
app.use(cookieParser());        
app.use(mongoSanitize());
app.use(hpp());

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
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(403).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(pas, user.password);
        if (!isMatch) {
            return res.status(403).json({ error: "Invalid credentials" });
        }

        // Logic for Admin role
        const userRole = user.password === process.env.Apas ? "admin" : "user";
        const payload = { id: user._id, role: userRole };

        // 1. Generate Access Token (15 minutes)
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS, { expiresIn: '15m' });

        // 2. Generate Refresh Token (7 days)
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH, { expiresIn: '7d' });

        // 3. SAVE Refresh Token to Database
        user.refreshToken = refreshToken; 
        await user.save();

        // 4. Send Access Token Cookie
        res.cookie('token', accessToken, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict', 
            maxAge: 900000 // 15 mins
        });

        // 5. Send Refresh Token Cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 604800000 // 7 days
        });

        return res.status(200).json({ message: "Logged in", role: userRole });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: "Server Error" });
    }
});

app.post('/logout', Tcheack, async (req, res) => {
  try {
    // 1. Remove Refresh Token from the Database for this user
    // req.user comes from your Tcheack middleware
    await User.findByIdAndUpdate(req.user.id, { $unset: { refreshToken: 1 } });

    // 2. Clear both cookies
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    };

    res.clearCookie('token', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    return res.status(200).json({ noerror: "good" });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Logout failed" });
  }
});

app.post('/reg', validateRegister, async (req, res) => {
  try{
    const {username, password, name} = req.body.nuser
    const Nuser = new User({person: {username, password, name}})
    const Nu = await Nuser.save()
    res.status(201).json(Nu)
  }
  catch(error){
    console.error(error.message)
    res.status(500).json({error: error.message})
  }
})

app.post('/refresh', async (req, res) => {
    const refToken = req.cookies.refreshToken;
    if (!refToken) return res.status(401).json({ error: "Access denied" });

    try {
        // 1. Verify the token signature first
        const decoded = jwt.verify(refToken, process.env.JWT_REFRESH);

        // 2. Find the user AND ensure the token in their DB matches exactly
        const user = await User.findOne({ _id: decoded.id, refreshToken: refToken });
        if (!user) return res.status(403).json({ error: "Session expired" });

        // 3. RE-CALCULATE the role (since it's not in your DB)
        // This ensures the new token actually works with your Acheack middleware
        const userRole = user.password === process.env.Apas ? "admin" : "user";

        // 4. Sign the new Access Token
        const newAccessToken = jwt.sign(
            { id: user._id, role: userRole }, 
            process.env.JWT_ACCESS, 
            { expiresIn: '15m' }
        );

        // 5. Send cookie with same security settings as Login
        res.cookie('token', newAccessToken, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 900000 
        });

        res.json({ message: "Refreshed", role: userRole });
    } catch (err) {
        console.error("Refresh error:", err.message);
        res.status(403).json({ error: "Invalid refresh token" });
    }
});



app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke on the server!' });
});
// 3. Start the Server and Listen to the Port
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});


