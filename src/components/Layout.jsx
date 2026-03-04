import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useTrip } from '../context/TripContext';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children }) => {
    const { data } = useTrip();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const theme = data.settings.theme;
        let activeTheme = theme;
        if (theme === 'system') {
            activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        document.documentElement.setAttribute('data-theme', activeTheme);
    }, [data.settings.theme]);

    return (
        <div className="app-layout">
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={"sidebar-overlay show"}
                        onClick={() => setSidebarOpen(false)}
                    ></motion.div>
                )}
            </AnimatePresence>

            <header className="top-bar">
                <div className="px-md flex-between" style={{height: '100%'}}>
                    <div className="logo h4 font-bold gradient-text">TripSplit Pro</div>
                    <div className="flex-center gap-sm">
                        <button className="btn-icon lg-hidden" onClick={() => setSidebarOpen(true)}>☰</button>
                    </div>
                </div>
            </header>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="main-content">
                <motion.div
                    key={window.location.pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="view-container p-xl"
                >
                    {children}
                </motion.div>
            </main>

            <div id="toast-container"></div>
        </div>
    );
};

export default Layout;
