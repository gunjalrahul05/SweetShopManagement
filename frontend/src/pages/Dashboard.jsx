import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import './Dashboard.css'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const [sweets, setSweets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSweets()
  }, [])

  const fetchSweets = async () => {
    try {
      const response = await axios.get('/api/sweets')
      setSweets(response.data.data)
      setLoading(false)
    } catch (error) {
      setError('Failed to load sweets')
      setLoading(false)
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Sweet Shop Management</h1>
        <div className="user-info">
          <span>Welcome, {user?.username || 'User'}!</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>
      
      <main className="dashboard-content">
        {loading ? (
          <div>Loading sweets...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="sweets-grid">
            {sweets.map((sweet) => (
              <div key={sweet._id} className="sweet-card">
                <h3>{sweet.name}</h3>
                <p className="category">{sweet.category}</p>
                <p className="price">${sweet.price.toFixed(2)}</p>
                <p className="quantity">Stock: {sweet.quantity}</p>
                <button 
                  disabled={sweet.quantity === 0}
                  className={sweet.quantity === 0 ? 'disabled' : ''}
                >
                  {sweet.quantity === 0 ? 'Out of Stock' : 'Purchase'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard

