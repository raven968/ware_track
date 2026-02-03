import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Layout from './components/Layout'

import ProductList from './pages/products/ProductList'
import UserList from './pages/users/UserList'
import { Toaster } from "@/components/ui/sonner"

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function App() {
  const isAuthenticated = !!localStorage.getItem('token')
  const { i18n } = useTranslation();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.locale && user.locale !== i18n.language) {
          i18n.changeLanguage(user.locale);
        }
      } catch (e) {
        console.error("Failed to parse user locale", e);
      }
    }
  }, [i18n]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        
        {/* Protected Routes wrapped in Layout */}
        <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/users" element={<UserList />} />
        </Route>
      </Routes>
      <Toaster />
    </Router>
  )
}

export default App
