import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TripProvider } from './context/TripContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Settings from './pages/Settings';
import CreateTrip from './pages/CreateTrip';

function App() {
    return (
        <TripProvider>
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/members" element={<Members />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/create-trip" element={<CreateTrip />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </Layout>
            </Router>
        </TripProvider>
    );
}

export default App;
