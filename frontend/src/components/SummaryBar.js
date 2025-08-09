import React, { useEffect, useState } from 'react';
import { getSummary } from '../services/api';

function SummaryBar({ refreshKey }) {
  const [sum, setSum] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setErr('');
        const data = await getSummary();
        setSum(data);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, [refreshKey]);

  if (err) return <div style={{ color: 'crimson' }}>{err}</div>;
  if (!sum) return <div>Loading summary…</div>;

  return (
    <div style={{ margin: '16px 0', padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
      <b>Total monthly cost:</b> ${sum.total_monthly.toFixed(2)}
      <div style={{ marginTop: 8 }}>
        <b>By category:</b>{' '}
        {Object.keys(sum.by_category).length === 0 ? '—' :
          Object.entries(sum.by_category).map(([k, v]) => `${k}: $${v.toFixed(2)}`).join(' • ')
        }
      </div>
    </div>
  );
}

export default SummaryBar;
