import React,{ useEffect, createContext, useState } from 'react';




export const FeatureContext = createContext(null);

export const DataProvider = async ({children}) => {
    ///usestate for fetching posts
    const [] = useState
    ///usestate for fetching users
    const [] = useState
    ///usestate for api for posts
    const [] = useState

    ///usestate for api for authentication

    return(<FeatureContext.Provider value={{}}>{children}</FeatureContext.Provider>)

}



