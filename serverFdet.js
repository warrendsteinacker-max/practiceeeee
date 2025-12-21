const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Ensure these match your actual model export file
// const { User, Posts } = require('./models'); 

const app = express();

// --- Essential Middleware ---
app.use(express.json()); 
app.use(cookieParser()); 

/////////////////////////// Middlewares ////////////////////////////////////////////////

// Verify Token and attach user data to req.user
const Tcheack = (req, res, next) => {
    const token = req.cookies.token;
    if(!token) return res.status(401).json({error: "Access denied. No token provided."});
    
    try {
        const decoded = jwt.verify(token, process.env.JWT);
        req.user = decoded; // Contains id and role
        next();
    } catch(error) {
        return res.status(403).json({error: "Invalid or expired token"});
    }
}

// Check Role Permissions
const Acheack = (requiredRole) => {
    return (req, res, next) => {
        if(!req.user || req.user.role !== requiredRole){
            return res.status(403).json({error: "Forbidden: Admin access required"});
        }
        next();
    }
} 

// Directory/File Creator Middleware
const UserFolderHandler = (req, res, next) => {
    const userId = req.user.id;
    const content = req.body;

    // Sanitize userId to prevent path traversal
    const safeUserId = String(userId).replace(/[^a-z0-9]/gi, '_');
    const userDir = path.join(__dirname, 'storage', 'users', safeUserId);

    try {
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const fileName = `post_log_${timestamp}.txt`;
        const filePath = path.join(userDir, fileName);

        const fileData = `--- NEW POST ATTEMPT ---\nDate: ${new Date().toLocaleString()}\nPayload: ${JSON.stringify(content, null, 2)}\n`;

        fs.writeFileSync(filePath, fileData);
        next();
    } catch (err) {
        console.error("FileSystem Error:", err);
        return res.status(500).json({ error: "Failed to log data to user directory" });
    }
}

/////////////////////////// Auth Routes ////////////////////////////////////////////

app.post('/login', async(req, res) => {
    const { pas, use } = req.body;
    try {
        const Luser = await User.findOne({ username: use });
        if(!Luser) return res.status(401).json({ e: "Invalid credentials" });

        const isMatch = await bcrypt.compare(pas, Luser.pas); 
        if(!isMatch) return res.status(401).json({ e: "Invalid credentials" });

        // Add role to payload for the Acheack middleware
        const payload = { id: Luser.id, role: Luser.role };
        const Atoken = jwt.sign(payload, process.env.JWT, { expiresIn: '15m' });
        const Rtoken = jwt.sign(payload, process.env.JWT, { expiresIn: '7d' });

        const options = { httpOnly: true, secure: process.env.aa === 'production', sameSite: 'strict' };
        res.cookie('token', Atoken, { ...options, maxAge: 900000 });
        res.cookie('refreshtoken', Rtoken, { ...options, maxAge: 604800000 });

        return res.status(200).json({ status: "Success", role: Luser.role });
    } catch(error) {
        return res.status(500).json({ e: "Server error" });
    }
});

/////////////////////////// Data Routes ///////////////////////////////////

app.post('/api/data', Tcheack, UserFolderHandler, async(req, res) => {
    const { npost } = req.body;
    if(!npost) return res.status(400).json({ error: "D" });
    
    try {
        const Npost = new Posts(npost);
        await Npost.save();
        res.status(200).json({ noerror: "G" });
    } catch(error) {
        return res.status(500).json({ error: error.message });
    }
});

/////////////////////////// Admin Routes ///////////////////////////////////

/**
 * NEW: Admin Delete Post Route
 * Path: /admin/post/:id
 */
app.delete('/admin/post/:id', Tcheack, Acheack("admin"), async (req, res) => {
    const postId = req.params.id; // Taking ID from URL params for cleaner REST design
    try {
        const deletedPost = await Posts.findByIdAndDelete(postId);
        
        if (!deletedPost) {
            return res.status(404).json({ error: "Post not found" });
        }
        
        return res.status(200).json({ noerror: "Post successfully deleted by admin" });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: "Internal server error during deletion" });
    }
});

// Admin Delete User
app.delete('/admin/user/:id', Tcheack, Acheack("admin"), async(req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        return res.status(200).json({ noerror: "User deleted" });
    } catch(error) {
        return res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
















//////////////////////////////////////////////////////////////////////////////////////////////////////////














