import { useState, useEffect } from 'react'
import api from '../utils/api'
import './Dashboard.css'

function Dashboard({ user, onLogout }) {
  const [sweets, setSweets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSweets()
  }, [])

  const fetchSweets = async () => {
    try {
      const response = await api.get('/sweets')
      if (response.data.success) {
        setSweets(response.data.data)
      }
    } catch (err) {
      setError('Failed to load sweets')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    onLogout()
  }

  if (loading) {
    return <div className="dashboard">Loading sweets...</div>
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Sweet Shop Management</h1>
        <div className="user-info">
          <span>Welcome, {user.username}!</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="sweets-grid">
        {sweets.length === 0 ? (
          <p>No sweets available</p>
        ) : (
          sweets.map((sweet) => (
            <div key={sweet._id} className="sweet-card">
              <h3>{sweet.name}</h3>
              <p className="category">{sweet.category}</p>
              <p className="price">${sweet.price.toFixed(2)}</p>
              <p className="quantity">Stock: {sweet.quantity}</p>
              <button 
                disabled={sweet.quantity === 0}
                className="purchase-btn"
              >
                {sweet.quantity === 0 ? 'Out of Stock' : 'Purchase'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Dashboard

