import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LogOut, ShieldAlert, Users, Activity, Pill, Calendar, 
  CreditCard, TrendingUp, Bell, Search, Menu, Stethoscope, 
  Bed, Phone, FlaskConical, Strikethrough, Settings, FileText 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: <TrendingUp size={20}/>, label: 'Dashboard', path: '/admin' },
    { icon: <Users size={20}/>, label: 'Patients', path: '/admin/patients' },
    { icon: <Stethoscope size={20}/>, label: 'Doctors', path: '/admin/doctors' },
    { icon: <Calendar size={20}/>, label: 'Appointments', path: '/admin/appointments' },
    { icon: <CreditCard size={20}/>, label: 'Billing', path: '/admin/billing' },
    { icon: <Pill size={20}/>, label: 'Pharmacy', path: '/admin/pharmacy' },
    { icon: <Activity size={20}/>, label: 'Emergency', path: '/admin/emergency', alert: true },
    { icon: <FlaskConical size={20}/>, label: 'Laboratory', path: '/admin/laboratory' },
    { icon: <Phone size={20}/>, label: 'Reception', path: '/admin/reception' },
    { icon: <Activity size={20}/>, label: 'Ambulance', path: '/admin/ambulance' },
    { icon: <Bed size={20}/>, label: 'ICU', path: '/admin/icu' },
    { icon: <Users size={20}/>, label: 'Staff', path: '/admin/staff' },
    { icon: <FileText size={20}/>, label: 'Reports', path: '/admin/reports' },
    { icon: <Settings size={20}/>, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans">
      
      {/* Light Theme Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="relative z-20 flex flex-col h-screen bg-white border-r border-slate-200 shadow-xl shrink-0"
      >
        <div className="flex items-center justify-between p-6">
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3 overflow-hidden">
                <div className="bg-gradient-to-tr from-primary-600 to-primary-400 p-2 rounded-xl shadow-lg shadow-primary-500/30 shrink-0">
                  <Activity className="text-white" size={24} />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-800">MediNova<span className="text-primary-500">AI</span></span>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-primary-500 transition-colors shrink-0">
            <Menu size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item, idx) => (
            <NavLink 
              key={idx}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) => 
                `w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 relative overflow-hidden group ${
                  isActive 
                  ? 'bg-primary-50 text-primary-600 shadow-sm border border-primary-100' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-primary-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative z-10 flex items-center gap-4 w-full">
                    <span className={item.alert && !isActive ? 'text-rose-500 animate-pulse' : ''}>{item.icon}</span>
                    <AnimatePresence>
                      {isSidebarOpen && (
                        <motion.span initial={{ opacity: 0, w: 0 }} animate={{ opacity: 1, w: 'auto' }} exit={{ opacity: 0, w: 0 }} className="font-medium whitespace-nowrap flex-1 text-left text-sm">
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {item.alert && isSidebarOpen && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>}
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button onClick={handleLogout} className="flex items-center gap-4 p-3 w-full rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all group">
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <AnimatePresence>
              {isSidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-medium text-sm">Sign Out</motion.span>}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Navigation */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center bg-slate-100 rounded-full px-4 py-2 w-96 focus-within:ring-2 focus-within:ring-primary-500/50 transition-all border border-transparent focus-within:border-primary-200 focus-within:bg-white">
            <Search size={18} className="text-slate-400 mr-2" />
            <input type="text" placeholder="Search patients, doctors, or IDs..." className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400" />
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-primary-500 transition-colors bg-slate-50 rounded-full">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-teal-400 p-[2px] shadow-sm">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <ShieldAlert size={18} className="text-primary-600" />
                </div>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-slate-800">{user?.name || 'Administrator'}</p>
                <p className="text-xs text-primary-600 font-medium">{user?.role || 'System Admin'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Nested Routes */}
        <div className="flex-1 overflow-y-auto p-8 relative z-0 bg-slate-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
