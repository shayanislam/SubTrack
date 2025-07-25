import React, { useState } from 'react';

function SubscriptionForm() {
  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    renewal_date: '',
    frequency: '',
    category: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('http://localhost:8000/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      alert('Subscription added!');
      setFormData({ name: '', cost: '', renewal_date: '', frequency: '', category: '' });
    } else {
      alert('Error adding subscription.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: '400px' }}>
      <label>Name:</label>
      <input name="name" value={formData.name} onChange={handleChange} required />

      <label>Cost:</label>
      <input name="cost" type="number" value={formData.cost} onChange={handleChange} required />

      <label>Renewal Date:</label>
      <input name="renewal_date" type="date" value={formData.renewal_date} onChange={handleChange} required />

      <label>Frequency:</label>
      <input name="frequency" value={formData.frequency} onChange={handleChange} required />

      <label>Category:</label>
      <input name="category" value={formData.category} onChange={handleChange} />

      <button type="submit" style={{ marginTop: '1rem' }}>Add Subscription</button>
    </form>
  );
}

export default SubscriptionForm;
