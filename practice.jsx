import React,{ useEffect, createContext, useState } from 'react';




export const FeatureContext = createContext(null);

export const DataProvider = async ({children}) => {
    ///usestate for fetching posts
    const [] = useState
    ///usestate for fetching users
    const [] = useState
    ///usestate for api for posts
    const [] = useState
    ///usestate for api for authentication sign in reg logout
    const [] = useState
    ///usestate for api for admin edit roles make new users and delete
    const [] = useState
    ///state for loading
    const [] = useState

    
    ////useeffect to fetch admin data Users but he can still manipulate posts
    useEffect(()=>{
        setLoading(true)
        const fetchU = async() => {

        try{
            const response = await axios.get('/api/users')
            const d = response.data
            setUsers(d)
        }
        catch(error){
            console.error(error.message)
        }
        finally{
            setLoading(false)
        }
    }
    fetchU()
    }, [])
////useeffect to fetch post data Posts but 
    useEffect(()=>{
        
        try{

        }
        catch(error){

        }
    }, [])

    /// func to make post for posts to back end
const Mpost = async (NNpost) => {
    try {
        // 1. Post to the server (Vite proxy handles the localhost part)
        const response = await axios.post('/api/data', NNpost);
        
        // 2. The server returns the NEW document created by Mongo
        // This object now has the auto-generated _id
        const savedData = response.data;

        // 3. Update state with the official DB version
        setPosts([...posts, savedData]);
    }
    catch (error) {
        console.error(error.message);
    }
}
//// edit post func 
    const Epost = async(Npost) => {
        try{
            await axios.put('api/data', Npost)
            const Nposts = posts.map((post) => { if(Npost._id !== post._id){return post} else{return Npost}})
            setPosts(Nposts)
        }
        catch(error){
            console.error(error.message)
        }  
    }
/// del func for admin del posts
const Dpost = async (id) => {
    try {
        // 1. You must await the call
        // 2. Pass the ID in the URL (standard REST practice)
        await axios.delete(`/api/data/${id}`); 

        // 3. Filter the state using the ID
        const np = posts.filter((post) => post._id !== id);
        setPosts(np);
    }
    catch (error) {
        console.error("Delete failed:", error.message);
    }
}

    return(<FeatureContext.Provider value={{}}>{children}</FeatureContext.Provider>)

}



