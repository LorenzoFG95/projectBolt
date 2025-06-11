import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { TenderDetail } from './pages/TenderDetail';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tenders" element={<Dashboard />} />
          <Route path="/tenders/:id" element={<TenderDetail />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;