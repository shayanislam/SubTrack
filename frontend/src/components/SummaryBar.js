import React, { useEffect, useState } from "react";

export default function SummaryBar({ refreshKey }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const res = await fetch("http://localhost:8000/summary");
        if (!res.ok) throw new Error("Failed to load summary");
        const json = await res.json();
        setData(json);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, [refreshKey]);

  if (err) return <div style={{ color: "crimson" }}>{err}</div>;
  if (!data) return <div>Loading summary…</div>;

  return (
    <div style={{ margin: "16px 0", padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
      <b>Total monthly cost:</b> ${data.total_monthly.toFixed(2)}
      <div style={{ marginTop: 8 }}>
        <b>By category:</b>{" "}
        {Object.keys(data.by_category).length === 0
          ? "—"
          : Object.entries(data.by_category)
              .map(([k, v]) => `${k}: $${v.toFixed(2)}`)
              .join(" • ")}
      </div>
    </div>
  );
}
