import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ label, value, subtext, gradient, badge }) => {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={`card stat-card ${gradient} p-xl`}
        >
            <div className="flex-between">
                <div>
                    <span className="text-sm uppercase opacity-70 font-bold tracking-wider">{label}</span>
                    <h3 className={gradient === 'gradient-1' ? 'h1 mt-sm' : 'h2 mt-sm'}>{value}</h3>
                    <div className="mt-md text-xs opacity-60 font-medium">{subtext}</div>
                </div>
                {badge !== undefined && (
                    <div className="h2 gradient-text font-bold">{badge}</div>
                )}
            </div>
            {/* Premium Glow Effect */}
            <div className="stat-card-glow"></div>
        </motion.div>
    );
};

export default StatCard;
