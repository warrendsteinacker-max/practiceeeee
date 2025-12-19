app =express()

app.use(express.json)

app.post('/reg', async (req, res) => {
    const {Nuser} = req.body
    if(!Nuser){
        return res.status(401).json({error: "d"})
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