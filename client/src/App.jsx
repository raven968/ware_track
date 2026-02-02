import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Layout from './components/Layout'

function App() {
  const isAuthenticated = !!localStorage.getItem('token')

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        
        {/* Protected Routes wrapped in Layout */}
        <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
          <Route path="/" element={<Dashboard />} />
          {/* Add other protected routes here later, e.g. /products */}
        </Route>
      </Routes>
    </Router>
  )
}

export default App
