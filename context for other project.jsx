import React, { useEffect, createContext, useState } from 'react';
import axios from 'axios';

export const FeatureContext = createContext(null);

// REMOVED 'async' from the component definition
export const DataProvider = ({ children }) => {
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null); // For Auth state

    // 1. Fetch Users (Admin Only)
    useEffect(() => {
        const fetchU = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/api/users');
                setUsers(response.data);
            } catch (error) {
                console.error("User fetch error:", error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchU();
    }, []);

    // 2. Fetch Posts
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('/api/data');
                setPosts(response.data);
            } catch (error) {
                console.error("Post fetch error:", error.message);
            }
        };
        fetchPosts();
    }, []);

    // --- POST FUNCTIONS ---

    const Mpost = async (NNpost) => {
        try {
            const response = await axios.post('/api/data', NNpost);
            setPosts([...posts, response.data]);
        } catch (error) {
            console.error(error.message);
        }
    };

    const Epost = async (Npost) => {
        try {
            await axios.put('/api/data', Npost);
            setPosts(posts.map((p) => (p._id === Npost._id ? Npost : p)));
        } catch (error) {
            console.error(error.message);
        }
    };

    const Dpost = async (id) => {
        try {
            await axios.delete(`/api/data/${id}`);
            setPosts(posts.filter((p) => p._id !== id));
        } catch (error) {
            console.error("Delete failed:", error.message);
        }
    };

    // --- ADMIN USER MANAGEMENT FUNCTIONS ---

    // Create New User (Admin Route)
    const adminCreateUser = async (userData) => {
        try {
            const response = await axios.post('/admin/p', { Apost: userData });
            if (response.data.noerror === "D") {
                // Refresh user list to show the new person
                const updatedUsers = await axios.get('/api/users');
                setUsers(updatedUsers.data);
            }
        } catch (error) {
            console.error("Admin Create Error:", error.message);
        }
    };

    // Edit User Role / Data
    const adminEditUser = async (updatedUser) => {
        try {
            await axios.put('/admin/e', updatedUser);
            setUsers(users.map(u => u._id === updatedUser._id ? updatedUser : u));
        } catch (error) {
            console.error("Admin Edit Error:", error.message);
        }
    };

    // Delete User
    const adminDeleteUser = async (userId) => {
        try {
            await axios.delete(`/admin/users/${userId}`);
            setUsers(users.filter(u => u._id !== userId));
        } catch (error) {
            console.error("Admin Delete Error:", error.message);
        }
    };

    // Provide everything through the value object
    return (
        <FeatureContext.Provider value={{ 
            posts, users, loading, 
            Mpost, Epost, Dpost, 
            adminCreateUser, adminEditUser, adminDeleteUser 
        }}>
            {children}
        </FeatureContext.Provider>
    );
};