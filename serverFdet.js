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



const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { JSONFileSyncPreset } = require('lowdb/node');
// The database structure now stores passwords exactly as typed
const defaultData = { users: [] }; 
const db = JSONFileSyncPreset('db.json', defaultData);

const app = express();
app.use(express.json()); 
app.use(cookieParser()); 

/////////////////////////// Middlewares ////////////////////////////////////////////////

const Tcheack = (req, res, next) => {
    const token = req.cookies.token;
    if(!token) return res.status(401).json({error: "Access denied"});
    
    try {
        const decoded = jwt.verify(token, process.env.JWT);
        req.user = decoded; 
        next();
    } catch(error) {
        return res.status(403).json({error: "Invalid token"});
    }
}

const UserFolderHandler = (req, res, next) => {
    const userId = req.user.id;
    const content = req.body;
    const safeUserId = String(userId).replace(/[^a-z0-9]/gi, '_');
    const userDir = path.join(__dirname, 'storage', 'users', safeUserId);

    try {
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const fileName = `${req.method}_log_${timestamp}.json`;
        const filePath = path.join(userDir, fileName);

        const fileData = {
            timestamp: new Date().toLocaleString(),
            action: req.method,
            data: content
        };

        fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));
        next();
    } catch (err) {
        return res.status(500).json({ error: "Failed to log action" });
    }
}

/////////////////////////// Auth Routes ////////////////////////////////////////////

app.post('/login', (req, res) => {
    const { pas, use } = req.body; // 'pas' is the password from the frontend
    
    try {
        // Find user in Lowdb
        const Luser = db.data.users.find(u => u.username === use);
        
        if(!Luser) return res.status(401).json({ e: "Invalid credentials" });

        // DIRECT STRING COMPARISON (No bcrypt)
        if(pas !== Luser.pas) {
            return res.status(401).json({ e: "Invalid credentials" });
        }

        const payload = { id: Luser.id, role: Luser.role };
        const Atoken = jwt.sign(payload, process.env.JWT, { expiresIn: '1h' });

        res.cookie('token', Atoken, { httpOnly: true });
        return res.status(200).json({ status: "Success", role: Luser.role });
    } catch(error) {
        return res.status(500).json({ e: "Server error" });
    }
});

/////////////////////////// Data Routes ///////////////////////////////////

//////////gonig to add delet functionalitey to front end for user butt I am going to have a big warning messeage that
//////says   ASK ME BEFOR DELETING POSTS GOT TO DOCUMENT IT

app.post('/api/data', Tcheack, UserFolderHandler, (req, res) => {
    res.status(200).json({ status: "Logged" });
});

app.put('/api/data/:id', Tcheack, UserFolderHandler, (req, res) => {
    res.status(200).json({ status: "Update Logged" });
});

app.listen(3000, () => console.log('Server running on port 3000'));


















////one with delete/////////////////////////////////////////////////////////////////////

const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { JSONFileSyncPreset } = require('lowdb/node');
const defaultData = { users: [] }; 
const db = JSONFileSyncPreset('db.json', defaultData);

const app = express();
app.use(express.json()); 
app.use(cookieParser()); 

// --- Middlewares ---

const Tcheack = (req, res, next) => {
    const token = req.cookies.token;
    if(!token) return res.status(401).json({error: "Access denied"});
    try {
        const decoded = jwt.verify(token, process.env.JWT);
        req.user = decoded; 
        next();
    } catch(error) {
        return res.status(403).json({error: "Invalid token"});
    }
}

// Log POST and PUT actions
const UserFolderHandler = (req, res, next) => {
    const userId = req.user.id;
    const content = req.body;
    const safeUserId = String(userId).replace(/[^a-z0-9]/gi, '_');
    const userDir = path.join(__dirname, 'storage', 'users', safeUserId);

    try {
        if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });

        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const fileName = `${req.method}_log_${timestamp}.json`;
        const filePath = path.join(userDir, fileName);

        fs.writeFileSync(filePath, JSON.stringify({
            timestamp: new Date().toLocaleString(),
            action: req.method,
            data: content
        }, null, 2));
        next();
    } catch (err) {
        return res.status(500).json({ error: "Failed to log action" });
    }
}

// NEW: Delete Middleware to handle file removal
const FileDeleteHandler = (req, res, next) => {
    const userId = req.user.id;
    const { fileName } = req.body; // Frontend must send the exact filename to delete
    const safeUserId = String(userId).replace(/[^a-z0-9]/gi, '_');
    const filePath = path.join(__dirname, 'storage', 'users', safeUserId, fileName);

    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // Physically deletes the file
            console.log(`File ${fileName} deleted by user ${userId}`);
            next();
        } else {
            return res.status(404).json({ error: "File not found on server" });
        }
    } catch (err) {
        return res.status(500).json({ error: "Delete failed" });
    }
}

// --- Auth Routes (Plain Text) ---

app.post('/login', (req, res) => {
    const { pas, use } = req.body;
    const Luser = db.data.users.find(u => u.username === use);
    if(!Luser || pas !== Luser.pas) return res.status(401).json({ e: "Invalid credentials" });

    const Atoken = jwt.sign({ id: Luser.id, role: Luser.role }, process.env.JWT, { expiresIn: '1h' });
    res.cookie('token', Atoken, { httpOnly: true });
    return res.status(200).json({ status: "Success", role: Luser.role });
});

// --- Data Routes ---

app.post('/api/data', Tcheack, UserFolderHandler, (req, res) => {
    res.status(200).json({ status: "Logged" });
});

app.put('/api/data/:id', Tcheack, UserFolderHandler, (req, res) => {
    res.status(200).json({ status: "Update Logged" });
});

// NEW: Delete Route
// FRONTEND WARNING: "ASK ME BEFORE DELETING POSTS GOT TO DOCUMENT IT"
app.delete('/api/data', Tcheack, FileDeleteHandler, (req, res) => {
    res.status(200).json({ status: "File permanently deleted" });
});

app.listen(3000, () => console.log('Server running on port 3000'));







