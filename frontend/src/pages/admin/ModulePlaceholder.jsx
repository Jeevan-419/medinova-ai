import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard } from 'lucide-react';

const ModulePlaceholder = ({ moduleName }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center"
    >
      <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-6">
        <LayoutDashboard className="text-primary-500" size={40} />
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-4">{moduleName} Module</h2>
      <p className="text-slate-500 max-w-lg text-lg">
        This module is currently being connected to MongoDB Atlas. It will display real-time interactive tables and forms shortly.
      </p>
    </motion.div>
  );
};

export default ModulePlaceholder;
