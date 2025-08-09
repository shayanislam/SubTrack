import React, { useEffect, useState } from "react";
import SubscriptionForm from "./form";
import SummaryBar from "./components/SummaryBar";

// Reuse the same frequency options as the form
const FREQUENCY_OPTIONS = [
  { label: "Monthly", value: "monthly" },
  { label: "Annual (Yearly)", value: "annual" },
  { label: "Quarterly (every 3 months)", value: "quarterly" },
  { label: "Semiannual (every 6 months)", value: "semiannual" },
  { label: "Every 4 Weeks", value: "every_4_weeks" },
  { label: "Biweekly (every 2 weeks)", value: "biweekly" },
  { label: "Weekly", value: "weekly" },
];

export default function App() {
  const [subs, setSubs] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // edit state
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    cost: "",
    renewal_date: "",
    frequency: "monthly",
    category: "",
  });
  const [editErr, setEditErr] = useState("");

  const loadSubs = async () => {
    const res = await fetch("http://localhost:8000/subscriptions");
    if (!res.ok) {
      console.error("Failed to fetch subscriptions");
      return;
    }
    const json = await res.json();
    setSubs(json);
  };

  useEffect(() => {
    loadSubs();
  }, []);

  const addSubscription = async (data) => {
    const res = await fetch("http://localhost:8000/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to add subscription");
    await loadSubs();
    setRefreshKey((k) => k + 1);
  };

  const deleteSubscription = async (id) => {
    const res = await fetch(`http://localhost:8000/subscriptions/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete subscription");
    await loadSubs();
    setRefreshKey((k) => k + 1);
    // if we were editing this one, cancel edit
    if (editId === id) cancelEdit();
  };

  // ---- Edit helpers ----
  const toInputDate = (isoOrDateStr) => {
    // Ensure YYYY-MM-DD for <input type="date">
    const d = new Date(isoOrDateStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const startEdit = (sub) => {
    setEditErr("");
    setEditId(sub.id);
    setEditData({
      name: sub.name || "",
      cost: sub.cost ?? "",
      renewal_date: toInputDate(sub.renewal_date),
      frequency: sub.frequency || "monthly",
      category: sub.category || "",
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditErr("");
    setEditData({
      name: "",
      cost: "",
      renewal_date: "",
      frequency: "monthly",
      category: "",
    });
  };

  const saveEdit = async () => {
    try {
      setEditErr("");
      // basic checks
      if (!editData.name.trim()) throw new Error("Name is required");
      if (!editData.cost || Number(editData.cost) <= 0)
        throw new Error("Cost must be > 0");
      if (!editData.renewal_date) throw new Error("Renewal date is required");

      const payload = {
        ...editData,
        cost: Number(editData.cost),
      };

      const res = await fetch(
        `http://localhost:8000/subscriptions/${editId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to update subscription");
      }
      await loadSubs();
      setRefreshKey((k) => k + 1);
      cancelEdit();
    } catch (e) {
      setEditErr(e.message || "Failed to update");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <h1>SubTrack</h1>

      <SummaryBar refreshKey={refreshKey} />

      <SubscriptionForm onAdd={addSubscription} />

      <div style={{ marginTop: 24 }}>
        <h3>Your Subscriptions</h3>
        {subs.length === 0 ? (
          <div>No subscriptions yet.</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {subs.map((s) => {
              const isEditing = editId === s.id;
              return (
                <li
                  key={s.id}
                  style={{
                    border: "1px solid #ddd",
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                >
                  {!isEditing ? (
                    // ---- Display mode ----
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div>
                          <b>{s.name}</b> — ${s.cost} / {s.frequency}
                        </div>
                        <div>
                          Renews:{" "}
                          {new Date(s.renewal_date).toLocaleDateString()}
                        </div>
                        <div>Category: {s.category || "Uncategorized"}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => startEdit(s)}>Edit</button>
                        <button onClick={() => deleteSubscription(s.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    // ---- Edit mode ----
                    <div style={{ display: "grid", gap: 8 }}>
                      <h4>Edit Subscription</h4>
                      {editErr && (
                        <div style={{ color: "crimson" }}>{editErr}</div>
                      )}

                      <label>Name</label>
                      <input
                        value={editData.name}
                        onChange={(e) =>
                          setEditData({ ...editData, name: e.target.value })
                        }
                      />

                      <label>Cost ($)</label>
                      <input
                        type="number"
                        value={editData.cost}
                        onChange={(e) =>
                          setEditData({ ...editData, cost: e.target.value })
                        }
                      />

                      <label>Renewal Date</label>
                      <input
                        type="date"
                        value={editData.renewal_date}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            renewal_date: e.target.value,
                          })
                        }
                      />

                      <label>Frequency</label>
                      <select
                        value={editData.frequency}
                        onChange={(e) =>
                          setEditData({ ...editData, frequency: e.target.value })
                        }
                      >
                        {FREQUENCY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      <label>Category</label>
                      <input
                        value={editData.category}
                        onChange={(e) =>
                          setEditData({ ...editData, category: e.target.value })
                        }
                      />

                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button onClick={saveEdit}>Save</button>
                        <button onClick={cancelEdit}>Cancel</button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
