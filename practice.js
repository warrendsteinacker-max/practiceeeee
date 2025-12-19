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