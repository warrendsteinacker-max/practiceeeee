import { BrowserRouter } from "react-router-dom"




export const App = () => {
    
    
    
    
    return(
    <>
    <DataProvider>
    <BrowserRouter>
    <Routes>
        <Route></Route>      /////////////////////landing page were admin or user logs in and then gets directed to there dsignate home page route
/////////// these ones are protected route in back end via middle funcs
        <Route></Route>    //////admin home page were he has link to creat new User page and can see all the users with buttons for deleting them and Link for each user to edit page were he can edit there profile and a link for each user were he can view there posts and delete them
        <Route></Route>         //////////// admin link for veiwing user posts
        <Route></Route>                    ////// admin edit page for each user and there roles
        <Route></Route>     ////// admin creat new User page
/////////// these ones are protected route in back end via middle funcs
        <Route></Route>    ///////// user page to update edit there post which is a 7day time sheet for documenting hours how many worked per day and calcs pay 
        <Route></Route>     ////////// user home page that they are directed to when loged in it displays all of there posts and has a creat new post link that brings them to post page page which is a 7day time sheet for documenting hours how many worked per day and calcs pay it is a form that save each input put into feilds has a submit button to submitte the hour sheet and a button to exite this page it also has links for each of the already existing posts to edit them
    </Routes>
    </BrowserRouter>
    </DataProvider>
    </>
    )
}