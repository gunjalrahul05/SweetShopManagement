import React, { useState, useEffect } from "react";
import api from "../utils/api";
import "./Dashboard.css";

function Dashboard({ user, onLogout }) {
  const [sweets, setSweets] = useState([]);
  const [filteredSweets, setFilteredSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchFilters, setSearchFilters] = useState({
    name: "",
    category: "",
    minPrice: "",
    maxPrice: "",
  });
  const [purchaseQuantities, setPurchaseQuantities] = useState({});
  const [purchasing, setPurchasing] = useState({});
  // Admin states
  const [adminForm, setAdminForm] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
  });
  const [editSweetId, setEditSweetId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
  });
  const [restockQuantities, setRestockQuantities] = useState({});
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    fetchSweets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sweets, searchFilters]);

  const fetchSweets = async () => {
    try {
      const response = await api.get("/sweets");
      if (response.data.success) {
        setSweets(response.data.data);
        setFilteredSweets(response.data.data);
      }
    } catch (err) {
      setError("Failed to load sweets");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...sweets];

    if (searchFilters.name) {
      filtered = filtered.filter((sweet) =>
        sweet.name.toLowerCase().includes(searchFilters.name.toLowerCase())
      );
    }

    if (searchFilters.category) {
      filtered = filtered.filter((sweet) =>
        sweet.category
          .toLowerCase()
          .includes(searchFilters.category.toLowerCase())
      );
    }

    if (searchFilters.minPrice) {
      filtered = filtered.filter(
        (sweet) => sweet.price >= parseFloat(searchFilters.minPrice)
      );
    }

    if (searchFilters.maxPrice) {
      filtered = filtered.filter(
        (sweet) => sweet.price <= parseFloat(searchFilters.maxPrice)
      );
    }

    setFilteredSweets(filtered);
  };

  const handleFilterChange = (e) => {
    setSearchFilters({
      ...searchFilters,
      [e.target.name]: e.target.value,
    });
  };

  const handleQuantityChange = (sweetId, value) => {
    setPurchaseQuantities({
      ...purchaseQuantities,
      [sweetId]: parseInt(value) || 1,
    });
  };

  // Admin handlers
  const handleAdminInputChange = (e) => {
    setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
  };

  const handleCreateSweet = async (e) => {
    e.preventDefault();
    setAdminLoading(true);
    setError("");
    try {
      await api.post("/sweets", {
        name: adminForm.name,
        category: adminForm.category,
        price: parseFloat(adminForm.price),
        quantity: parseInt(adminForm.quantity),
      });
      setAdminForm({ name: "", category: "", price: "", quantity: "" });
      await fetchSweets();
      setSuccess("Sweet added successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add sweet");
    } finally {
      setAdminLoading(false);
    }
  };

  const handleStartEdit = (sweet) => {
    setEditSweetId(sweet._id);
    setEditForm({
      name: sweet.name,
      category: sweet.category,
      price: sweet.price,
      quantity: sweet.quantity,
    });
  };

  const handleCancelEdit = () => {
    setEditSweetId(null);
    setEditForm({ name: "", category: "", price: "", quantity: "" });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdateSweet = async (id) => {
    setAdminLoading(true);
    setError("");
    try {
      await api.put(`/sweets/${id}`, {
        name: editForm.name,
        category: editForm.category,
        price: parseFloat(editForm.price),
        quantity: parseInt(editForm.quantity),
      });
      setEditSweetId(null);
      await fetchSweets();
      setSuccess("Sweet updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update sweet");
    } finally {
      setAdminLoading(false);
    }
  };

  const handleDeleteSweet = async (id) => {
    if (
      !window.confirm("Are you sure you want to permanently delete this sweet?")
    )
      return;
    setAdminLoading(true);
    setError("");
    try {
      await api.delete(`/sweets/${id}`);
      await fetchSweets();
      setSuccess("Sweet deleted successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete sweet");
    } finally {
      setAdminLoading(false);
    }
  };

  const handleRestockChange = (sweetId, value) => {
    setRestockQuantities({
      ...restockQuantities,
      [sweetId]: parseInt(value) || 0,
    });
  };

  const handleRestock = async (id) => {
    const qty = restockQuantities[id];
    if (!qty || qty <= 0) {
      setError("Please provide a valid restock quantity");
      return;
    }
    setAdminLoading(true);
    setError("");
    try {
      await api.post(`/sweets/${id}/restock`, { quantity: qty });
      const newQs = { ...restockQuantities };
      delete newQs[id];
      setRestockQuantities(newQs);
      await fetchSweets();
      setSuccess("Restock successful");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to restock");
    } finally {
      setAdminLoading(false);
    }
  };

  const handlePurchase = async (sweet) => {
    const quantity = purchaseQuantities[sweet._id] || 1;

    if (quantity <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    if (quantity > sweet.quantity) {
      setError(`Only ${sweet.quantity} items available`);
      return;
    }

    setPurchasing({ ...purchasing, [sweet._id]: true });
    setError("");
    setSuccess("");

    try {
      const response = await api.post(`/sweets/${sweet._id}/purchase`, {
        quantity,
      });
      if (response.data.success) {
        setSuccess(`Successfully purchased ${quantity} ${sweet.name}(s)!`);
        // Refresh sweets list
        await fetchSweets();
        // Clear purchase quantity
        const newQuantities = { ...purchaseQuantities };
        delete newQuantities[sweet._id];
        setPurchaseQuantities(newQuantities);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Purchase failed. Please try again."
      );
    } finally {
      setPurchasing({ ...purchasing, [sweet._id]: false });
    }
  };

  const clearFilters = () => {
    setSearchFilters({
      name: "",
      category: "",
      minPrice: "",
      maxPrice: "",
    });
  };

  const handleLogout = () => {
    onLogout();
  };

  if (loading) {
    return <div className="dashboard">Loading sweets...</div>;
  }

  // Get unique categories for filter dropdown
  const categories = [...new Set(sweets.map((sweet) => sweet.category))];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Sweet Shop Management</h1>
        <div className="user-info">
          <span>Welcome, {user.username}!</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Admin Panel */}
        {user?.role === "admin" && (
          <div className="admin-section">
            <h2>Admin Panel</h2>
            <form className="admin-form" onSubmit={handleCreateSweet}>
              <input
                name="name"
                placeholder="Name"
                value={adminForm.name}
                onChange={handleAdminInputChange}
                required
              />
              <input
                name="category"
                placeholder="Category"
                value={adminForm.category}
                onChange={handleAdminInputChange}
                required
              />
              <input
                name="price"
                placeholder="Price"
                type="number"
                step="0.01"
                value={adminForm.price}
                onChange={handleAdminInputChange}
                required
              />
              <input
                name="quantity"
                placeholder="Quantity"
                type="number"
                value={adminForm.quantity}
                onChange={handleAdminInputChange}
                required
              />
              <button type="submit" disabled={adminLoading}>
                {adminLoading ? "Working..." : "Add Sweet"}
              </button>
            </form>
          </div>
        )}
        {/* Search and Filter Section */}
        <div className="filters-section">
          <h2>Search & Filter</h2>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                placeholder="Search by name..."
                value={searchFilters.name}
                onChange={handleFilterChange}
              />
            </div>
            <div className="filter-group">
              <label>Category</label>
              <select
                name="category"
                value={searchFilters.category}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Min Price</label>
              <input
                type="number"
                name="minPrice"
                placeholder="Min"
                value={searchFilters.minPrice}
                onChange={handleFilterChange}
                min="0"
                step="0.01"
              />
            </div>
            <div className="filter-group">
              <label>Max Price</label>
              <input
                type="number"
                name="maxPrice"
                placeholder="Max"
                value={searchFilters.maxPrice}
                onChange={handleFilterChange}
                min="0"
                step="0.01"
              />
            </div>
            <div className="filter-group">
              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="results-info">
          Showing {filteredSweets.length} of {sweets.length} sweets
        </div>

        <div className="sweets-grid">
          {filteredSweets.length === 0 ? (
            <p className="no-results">No sweets found matching your filters</p>
          ) : (
            filteredSweets.map((sweet) => (
              <div key={sweet._id} className="sweet-card">
                <h3>{sweet.name}</h3>
                <p className="category">{sweet.category}</p>
                <p className="price">${sweet.price.toFixed(2)}</p>
                <p className="quantity">Stock: {sweet.quantity}</p>

                {sweet.quantity > 0 && (
                  <div className="purchase-section">
                    <div className="quantity-input-group">
                      <label>Quantity:</label>
                      <input
                        type="number"
                        min="1"
                        max={sweet.quantity}
                        value={purchaseQuantities[sweet._id] || 1}
                        onChange={(e) =>
                          handleQuantityChange(sweet._id, e.target.value)
                        }
                        className="quantity-input"
                      />
                    </div>
                    <button
                      onClick={() => handlePurchase(sweet)}
                      disabled={purchasing[sweet._id] || sweet.quantity === 0}
                      className="purchase-btn"
                    >
                      {purchasing[sweet._id] ? "Purchasing..." : "Purchase"}
                    </button>
                  </div>
                )}

                {sweet.quantity === 0 && (
                  <button disabled className="purchase-btn">
                    Out of Stock
                  </button>
                )}

                {user?.role === "admin" && (
                  <div className="admin-card-controls">
                    {editSweetId === sweet._id ? (
                      <div className="edit-form">
                        <input
                          name="name"
                          value={editForm.name}
                          onChange={handleEditChange}
                        />
                        <input
                          name="category"
                          value={editForm.category}
                          onChange={handleEditChange}
                        />
                        <input
                          name="price"
                          type="number"
                          step="0.01"
                          value={editForm.price}
                          onChange={handleEditChange}
                        />
                        <input
                          name="quantity"
                          type="number"
                          value={editForm.quantity}
                          onChange={handleEditChange}
                        />
                        <button
                          onClick={() => handleUpdateSweet(sweet._id)}
                          disabled={adminLoading}
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={adminLoading}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="admin-actions">
                        <button
                          onClick={() => handleStartEdit(sweet)}
                          disabled={adminLoading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSweet(sweet._id)}
                          disabled={adminLoading}
                        >
                          Delete
                        </button>
                        <div className="restock-group">
                          <input
                            type="number"
                            min="1"
                            placeholder="Restock"
                            value={restockQuantities[sweet._id] || ""}
                            onChange={(e) =>
                              handleRestockChange(sweet._id, e.target.value)
                            }
                          />
                          <button
                            onClick={() => handleRestock(sweet._id)}
                            disabled={adminLoading}
                          >
                            Restock
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
