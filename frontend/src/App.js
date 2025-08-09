import React, { useState } from 'react';
import SubscriptionForm from './form';                // or './components/Form'
import SubscriptionList from './components/SubscriptionList';
import SummaryBar from './components/SummaryBar';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const bump = () => setRefreshKey(k => k + 1);

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <h1>SubTrack</h1>
      <SummaryBar refreshKey={refreshKey} />
      <SubscriptionForm onSuccess={bump} />
      <SubscriptionList refreshKey={refreshKey} onChanged={bump} />
    </div>
  );
}

export default App;
