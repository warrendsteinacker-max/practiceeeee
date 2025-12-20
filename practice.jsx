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
    const MDpost = async() => {

    }

    const Epost = async() => {

    }

    const

    return(<FeatureContext.Provider value={{}}>{children}</FeatureContext.Provider>)

}



