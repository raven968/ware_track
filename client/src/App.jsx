import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'

function App() {
  const isAuthenticated = !!localStorage.getItem('token')

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={
          isAuthenticated ? (
            <div className="p-10">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p>Welcome to WareTrack</p>
              <button 
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => {
                  localStorage.removeItem('token')
                  window.location.reload()
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>
    </Router>
  )
}

export default App
