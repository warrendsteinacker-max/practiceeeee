const { findByIdAndUpdate } = require("./userDB")

app =express()

app.use(express.json)

app.post('/reg', async (req, res) => {
    const {Nuser} = req.body
    if(!Nuser){
        return res.status(400).json({error: "d"})
    }
    try{
        const nuser = new User(Nuser)
        const nuse = await nuser.save()
        return res.status(202).json({noerror: "A"})}
    catch(error) {
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

app.post('/api/data', async(req, res) => {
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


app.delete('/api/data', async(req, res) => {
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

app.put('/api/data', async(req, res) => {
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

app.get('/api/data', async(req, res) => {
    try{
        const FD = await Posts.find()
        
        return res.status(200).json({e: "e", data: FD})
    }
    catch(error){
        console.error(error.message)
        return res.status(500).json({e: "e"})
    }
})