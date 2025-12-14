import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./ProductDetail.css";

function ProductDetail({ user, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sweet, setSweet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchSweet();
  }, [id]);

  const fetchSweet = async () => {
    try {
      const response = await api.get("/sweets");
      const found = response.data.data.find((s) => s._id === id);
      if (found) {
        setSweet(found);
      } else {
        setError("Product not found");
      }
    } catch (err) {
      setError("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (quantity <= 0 || quantity > sweet.quantity) {
      setError(`Please enter quantity between 1 and ${sweet.quantity}`);
      return;
    }

    setPurchasing(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post(`/sweets/${id}/purchase`, { quantity });
      if (response.data.success) {
        setSuccess(`Successfully purchased ${quantity} ${sweet.name}(s)!`);
        await fetchSweet();
        setTimeout(() => navigate("/dashboard"), 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Purchase failed. Please try again."
      );
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return <div className="product-detail">Loading...</div>;
  }

  if (!sweet) {
    return (
      <div className="product-detail">
        <div className="product-error">
          <p>{error}</p>
          <button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <header className="product-header">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Back
        </button>
        <h1>Product Details</h1>
        <div className="user-info">
          <span>{user?.username}</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="product-container">
        <div className="product-info">
          <h2>{sweet.name}</h2>
          <p className="category">
            Category: <strong>{sweet.category}</strong>
          </p>
          <p className="price">
            Price: <strong>${sweet.price.toFixed(2)}</strong>
          </p>
          <p
            className={`stock ${
              sweet.quantity > 0 ? "in-stock" : "out-of-stock"
            }`}
          >
            Stock: <strong>{sweet.quantity}</strong>
          </p>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {sweet.quantity > 0 ? (
            <div className="purchase-form">
              <div className="quantity-selector">
                <label>Quantity:</label>
                <input
                  type="number"
                  min="1"
                  max={sweet.quantity}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  disabled={purchasing}
                />
              </div>
              <button
                className="purchase-btn"
                onClick={handlePurchase}
                disabled={
                  purchasing || quantity <= 0 || quantity > sweet.quantity
                }
              >
                {purchasing ? "Processing..." : "Purchase Now"}
              </button>
            </div>
          ) : (
            <div className="out-of-stock">
              <p>Out of Stock</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
