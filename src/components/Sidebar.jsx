import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Settings as SettingsIcon, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ isOpen, onClose }) => {
    return (
        <motion.aside
            id="sidebar"
            className={`sidebar ${isOpen ? 'open' : ''}`}
            initial={false}
            animate={{ x: isOpen ? 0 : (window.innerWidth <= 1024 ? "-100%" : 0) }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="sidebar-header">
                <div className="logo h3 font-bold gradient-text">TripSplit Pro</div>
                <div className="text-xs text-muted font-medium tracking-widest uppercase opacity-60">Premium Expense Multiplier</div>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`} onClick={onClose}>
                    <motion.div whileHover={{ x: 5 }} className="flex-center gap-md w-full">
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </motion.div>
                </NavLink>
                <NavLink to="/members" className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`} onClick={onClose}>
                    <motion.div whileHover={{ x: 5 }} className="flex-center gap-md w-full">
                        <Users size={20} />
                        <span>Members</span>
                    </motion.div>
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`} onClick={onClose}>
                    <motion.div whileHover={{ x: 5 }} className="flex-center gap-md w-full">
                        <SettingsIcon size={20} />
                        <span>Settings</span>
                    </motion.div>
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <NavLink to="/create-trip" className="w-full" onClick={onClose}>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-primary w-full flex-center gap-sm py-lg shadow-glow"
                    >
                        <PlusCircle size={18} />
                        <span>New Trip</span>
                    </motion.button>
                </NavLink>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
