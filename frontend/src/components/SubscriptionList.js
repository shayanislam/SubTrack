import React, { useEffect, useState } from 'react';
import { getSubscriptions, deleteSubscription } from '../services/api';

function SubscriptionList({ refreshKey, onChanged }) {
  const [subs, setSubs] = useState([]);
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      setErr('');
      const data = await getSubscriptions();
      setSubs(data);
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => { load(); }, [refreshKey]);

  const handleDelete = async (id) => {
    await deleteSubscription(id);
    await load();
    onChanged?.();
  };

  if (err) return <div style={{ color: 'crimson' }}>{err}</div>;

  return (
    <div style={{ marginTop: 24 }}>
      <h3>Your Subscriptions</h3>
      {subs.length === 0 && <div>No subscriptions yet.</div>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {subs.map(s => (
          <li key={s.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8, marginBottom: 8 }}>
            <div><b>{s.name}</b> — ${s.cost} / {s.frequency}</div>
            <div>Renews: {new Date(s.renewal_date).toLocaleDateString()}</div>
            <div>Category: {s.category}</div>
            <button onClick={() => handleDelete(s.id)} style={{ marginTop: 8 }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SubscriptionList;
