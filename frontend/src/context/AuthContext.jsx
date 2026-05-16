import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      fetchUser();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get('/auth/me');
      setUser(res.data.user);
    } catch (error) {
      console.error('Error fetching user', error);
      setToken(null); // Invalid token
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post('/auth/login', { email, password });
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (userData) => {
    try {
      console.log('Initiating registration request to:', axios.defaults.baseURL + '/auth/register');
      const res = await axios.post('/auth/register', userData);
      console.log('Registration successful:', res.data);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    } catch (error) {
      console.error('Registration API Error:', error);
      if (error.response) {
        // The request was made and the server responded with a status code outside of 2xx
        console.error('Server Response Data:', error.response.data);
        console.error('Server Response Status:', error.response.status);
      } else if (error.request) {
        // The request was made but no response was received (Network error, CORS, 404 router drop)
        console.error('No response received (Network/CORS Error):', error.request);
      } else {
        // Something happened in setting up the request
        console.error('Request Setup Error:', error.message);
      }
      throw error; // Re-throw to be caught by Register.jsx
    }
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
