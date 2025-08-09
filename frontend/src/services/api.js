const BASE_URL = 'http://localhost:8000';

export async function getSubscriptions() {
  const res = await fetch(`${BASE_URL}/subscriptions`);
  if (!res.ok) throw new Error('Failed to fetch subscriptions');
  return res.json();
}

export async function createSubscription(data) {
  const res = await fetch(`${BASE_URL}/subscriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, cost: Number(data.cost) }),
  });
  if (!res.ok) throw new Error('Failed to create subscription');
  return res.json();
}

export async function deleteSubscription(id) {
  const res = await fetch(`${BASE_URL}/subscriptions/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete subscription');
  return res.json();
}

export async function getSummary() {
  const res = await fetch(`${BASE_URL}/summary`);
  if (!res.ok) throw new Error('Failed to fetch summary');
  return res.json();
}
