import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "./context/FeatureContext"; // Adjust path as needed

// Import your components (You will need to create these files)
import Login from "./pages/Login";
import AdminHome from "./pages/AdminHome";
import AdminCreateUser from "./pages/AdminCreateUser";
import AdminEditUser from "./pages/AdminEditUser";
import AdminViewUserPosts from "./pages/AdminViewUserPosts";
import UserHome from "./pages/UserHome";
import TimeSheetForm from "./pages/TimeSheetForm";

export const App = () => {
    return (
        <DataProvider>
            <BrowserRouter>
                <Routes>
                    {/* 1. Landing / Login Page */}
                    <Route path="/" element={<Login />} />

                    {/* 2. ADMIN ROUTES */}
                    {/* Admin Dashboard: View all users + Delete buttons */}
                    <Route path="/admin/home" element={<AdminHome />} />
                    
                    {/* Admin: Create New User */}
                    <Route path="/admin/create-user" element={<AdminCreateUser />} />
                    
                    {/* Admin: Edit specific user profile/role */}
                    <Route path="/admin/edit-user/:userId" element={<AdminEditUser />} />
                    
                    {/* Admin: View and Delete specific user's posts */}
                    <Route path="/admin/user-posts/:userId" element={<AdminViewUserPosts />} />

                    {/* 3. USER ROUTES */}
                    {/* User Dashboard: View personal timesheets */}
                    <Route path="/user/home" element={<UserHome />} />
                    
                    {/* Create New Timesheet (7-day form) */}
                    <Route path="/user/new-sheet" element={<TimeSheetForm />} />
                    
                    {/* Edit Existing Timesheet */}
                    <Route path="/user/edit-sheet/:postId" element={<TimeSheetForm />} />
                </Routes>
            </BrowserRouter>
        </DataProvider>
    );
};