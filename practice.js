const { app } = require("firebase-admin")


app = express()

///////////////////////////middle funcs////////////////////////////////////////////////
app.use(express.json)


const Tcheack = (req, res, next) => {
    const token = req.cookies.token
    
    if(!token){
        return res.status(400).json({error: "d"})
    }
    
    try{
        const dec = jwt.verify(token, process.env.JWT)
        req.user = dec.id
        next()
    }
    catch(error){
        return res.status(400).json({error: "d"})
    }
}

const Acheack = (Prole) => {
    return (req, res, next) => {
        const {role} = req.user
        if(role !== Prole){
            return res.status(400).json({error: "d"})
        }
        next()
    }
} 

//Auth routes////////////////////////////////////////////////////////////

app.post('/refresh', async (req, res) => {
    // 1. Get the refresh token from cookies
    const refreshToken = req.cookies.refreshtoken;

    if (!refreshToken) {
        return res.status(401).json({ error: "No refresh token" });
    }

    try {
        // 2. Verify the refresh token
        // Use the same secret you used to sign it in the login route
        const dec = jwt.verify(refreshToken, process.env.JWT);

        // 3. Optional: Find user in DB to make sure they still exist/aren't banned
        const user = await User.findById(dec.id);
        if (!user) return res.status(401).json({ error: "User not found" });

        // 4. Create a NEW Access Token
        const newPayload = { id: user.id, role: user.role };
        const newAtoken = jwt.sign(newPayload, process.env.JWT, { expiresIn: '15m' });

        // 5. Send the new token back in a cookie (or JSON for React Native)
        res.cookie('token', newAtoken, {
            httpOnly: true,
            secure: process.env.aa === 'production',
            sameSite: 'strict',
            maxAge: 900000 // 15 minutes
        });

        return res.status(200).json({ noerror: "A", token: newAtoken });
    } catch (error) {
        return res.status(403).json({ error: "Invalid refresh token" });
    }
});

app.post('/reg', async (req, res) => {
    const {Nuser} = req.body
    if(!Nuser){
        return res.status(400).json({error: "d"})
    }
    try{
        const {pas, username} = Nuser
        const salt = await bcrypt.genSalt(12)
        const pass = await bcrypt.hash(pas, salt)
        const nuser = {pas: pass, username: username}
        const nnuser = new User(nuser)
        const nuse = await nnuser.save()
        return res.status(202).json({noerror: "A"})}
    catch(error) {
        console.error(error.message)
        return res.status(500).json({error: error.message})
    }
})

app.post('/logout', (req, res) => {
    
    try{
        res.clearCookie('token', {httpOnly: true, secure: process.env.aa === 'production', sameSite: 'strict'} )
        res.clearCookie('refreshtoken', {httpOnly: true, secure: process.env.aa === 'production', sameSite: 'strict'}  )
        return res.status(200).json({noerror: 'n'})
    }
    catch(error){
        console.error(error.message)
        return res.status(500).json({error: error.message})
    }
})

app.post('/login', async(req, res) => {
    const {pas, use} = req.body
    try{
        const Luser = await User.findOne({username: use})
        if(!Luser){
            return res.status(401).json({e: "g"})
        }
        const isMatch = await bcrypt.compare(pas, Luser.password)
        if(!isMatch){
            return res.status(401).json({e: "g"})
        }

        const payload = {id: Luser.id}

        const Rtoken = jwt.sign(payload, process.env.JWT, {expiresIn: '10m'})
        const Atoken = jwt.sign(payload, process.env.JWT, {expiresIn: '1m'})

        res.cookie('token', Atoken, {httpOnly: true, secure: process.env.aa === 'production', sameSite: 'strict', maxAge: 90000000 })
        res.cookie('refreshtoken', Rtoken, {httpOnly: true, secure: process.env.aa === 'production', sameSite: 'strict', maxAge: 99999999999999})

        await Luser.save()

        return res.status(200).json({e: "g"})
    }
    catch(error){
        console.error(error.message)
        return res.status(500).json({e: "g"})
    }
})

//data routes///////////////////////////////////////////////////

app.post('/api/data', Tcheack, async(req, res) => {
    const {npost} = req.body
        if(!npost){
            return res.status(401).json({error: "D"})    
        }
    try{
        const Npost = new Posts(npost)
        const np = await Npost.save()
        if(!np){
            return res.status(403).json({error: "d"})
        }
        res.status(200).json({noerror: "G"})
    }
    catch(error){
        console.error(error.message)
        return res.status(500).json({error: error.message})
    }
})


app.put('/api/data', Tcheack, async(req, res) => {
    const {Epost, id} = req.body
    try{
    const Ep = await Posts.findByIdAndUpdate(id, Epost, {new: true})
    if(!Ep){
        return res.status(403).json({e: "d"})
    }
    return res.status(200).json({e: "d"})
    } 
    catch(error){
        console.error(error.message)
        return res.status(500).json({e: "e"})
    }
})

app.get('/api/data', Tcheack, async(req, res) => {
    try{
        const FD = await Posts.find()
        
        return res.status(200).json({e: "e", data: FD})
    }
    catch(error){
        console.error(error.message)
        return res.status(500).json({e: "e"})
    }
})

//admin routes//////////////////////////

///admin route to delet posts//////////
app.delete('/api/data', Tcheack, Acheack(admin), async(req, res) => {
    const {id} = req.body
    try{
        const DP = await Posts.findByIdAndDelete(id)
        if(!DP){
            return res.status(403).json({error: "m"})
        } 
        return res.status(200).json({noerror: "m"})
    }
    catch(error){
        console.error(error.message)
        return res.status(500).json({error: error.message})
    }
})

//admin route to delete users/////////////////////////////////
app.delete('/admin/d', Tcheack, Acheack("admin"), async(req, res) => {
    const {id} = req.body
    try{
        const DU = await User.findByIdAndDelete(id)
        return res.status(200).json({noerror: "N"})
        }
    catch(error){
        console.error(error.message)
        return res.status(500).json({error: error.message})
    }
})

///admin route to edit user roles/////////////////////////////fix this//////
app.put('/admin/e', Tcheack, Acheack("admin"), async(req, res) => {
    const {Euser} = req.body
    const {id} =
    try{
        const EU = await User.findByIdAndUpdate(id, Euser, {new: true})
        return res.status(200).json({noerror: "d"})
    }
    catch(error){
        console.error(error.message)
        return res.status(500).json({error: error.message})
    }
})

/////admin route to create users//////////////////////////////

app.post('/admin/p', Tcheack, Acheack("admin"), async(req, res) => {
    const {Apost} = req.body
    try{
        const {pas, username, name} = Apost
        const salt = await bcrypt.genSalt(12)
        const pass = await bcrypt.hash(pas, salt)
        const nnuser = {pas: pass, username: username, name: name}
        const NU = new User(nnuser)
        await NU.save()
        return res.status(200).json({noerror: "D"}) 
    }
    catch(error){
        console.error(error.message)
        return res.status(500).json({error: error.message})
    }
})

app.get('/api/users', Tcheack, async(req, res) => {
    try{
        const UUD = await User.find()
        
        return res.status(200).json({e: "e", data: UUD})
    }
    catch(error){
        console.error(error.message)
        return res.status(500).json({e: "e"})
    }
})