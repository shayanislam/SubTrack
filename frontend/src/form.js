// frontend/src/form.js
import React, { useState } from "react";

// Centralized frequency options so you can reuse later
const FREQUENCY_OPTIONS = [
  { label: "Monthly", value: "monthly" },
  { label: "Annual (Yearly)", value: "annual" },
  { label: "Quarterly (every 3 months)", value: "quarterly" },
  { label: "Semiannual (every 6 months)", value: "semiannual" },
  { label: "Every 4 Weeks", value: "every_4_weeks" },
  { label: "Biweekly (every 2 weeks)", value: "biweekly" },
  { label: "Weekly", value: "weekly" },
];

export default function SubscriptionForm({ onAdd }) {
  const [formData, setFormData] = useState({
    name: "",
    cost: "",
    renewal_date: "",
    frequency: "monthly",
    category: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // simple client-side checks
    if (!formData.name.trim()) return setError("Name is required");
    if (!formData.cost || Number(formData.cost) <= 0) return setError("Cost must be > 0");
    if (!formData.renewal_date) return setError("Renewal date is required");

    try {
      setSaving(true);
      // normalize cost to number before sending up
      await onAdd?.({ ...formData, cost: Number(formData.cost) });
      // reset form
      setFormData({
        name: "",
        cost: "",
        renewal_date: "",
        frequency: "monthly",
        category: "",
      });
    } catch (err) {
      setError(err?.message || "Failed to add subscription");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, maxWidth: 420 }}>
      <h3>Add Subscription</h3>
      {error && <div style={{ color: "crimson" }}>{error}</div>}

      <label>Subscription Name</label>
      <input name="name" value={formData.name} onChange={handleChange} required />

      <label>Cost ($)</label>
      <input name="cost" type="number" value={formData.cost} onChange={handleChange} required />

      <label>Renewal Date</label>
      <input name="renewal_date" type="date" value={formData.renewal_date} onChange={handleChange} required />

      <label>Frequency</label>
      <select name="frequency" value={formData.frequency} onChange={handleChange} required>
        {FREQUENCY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <small style={{ marginBottom: 8 }}>
        We’ll convert this to monthly totals for your dashboard.
      </small>

      <label>Category (optional)</label>
      <input name="category" value={formData.category} onChange={handleChange} placeholder="Streaming, Productivity…" />

      <button type="submit" disabled={saving}>{saving ? "Saving…" : "Add Subscription"}</button>
    </form>
  );
}
