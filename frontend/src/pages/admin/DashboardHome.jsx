import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Users, Stethoscope, Activity, CreditCard, Calendar, Bed } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const DashboardHome = () => {
  const { token } = useContext(AuthContext);
  const [metrics, setMetrics] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    emergencyCases: 0,
    revenue: 0,
    totalAppointments: 0,
    icuBeds: '0/0',
    recentAppointments: []
  });
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const res = await axios.get('/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMetrics(res.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    // Socket.io for Real-Time Updates
    const socketUrl = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost:5000';
    const socket = io(socketUrl);
    socket.on('dashboardUpdate', () => {
      toast.success('Live update received!');
      fetchMetrics();
    });

    return () => socket.disconnect();
  }, [token]);

  const kpiData = [
    { title: 'Total Patients', value: metrics.totalPatients, icon: <Users size={24} />, color: 'bg-blue-50 text-blue-600', trend: '+12%' },
    { title: 'Doctors Available', value: metrics.totalDoctors, icon: <Stethoscope size={24} />, color: 'bg-teal-50 text-teal-600', trend: '+2' },
    { title: 'Emergency Cases', value: metrics.emergencyCases, icon: <Activity size={24} />, color: 'bg-rose-50 text-rose-600', trend: '-3%' },
    { title: 'Total Revenue', value: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(metrics.revenue), icon: <CreditCard size={24} />, color: 'bg-purple-50 text-purple-600', trend: '+8%' },
    { title: 'Appointments', value: metrics.totalAppointments, icon: <Calendar size={24} />, color: 'bg-amber-50 text-amber-600', trend: '+24' },
    { title: 'ICU Beds', value: metrics.icuBeds, icon: <Bed size={24} />, color: 'bg-cyan-50 text-cyan-600', trend: 'Available' },
  ];

  // Placeholder static charts
  const revenueData = [
    { name: 'Mon', revenue: 40000 },
    { name: 'Tue', revenue: 30000 },
    { name: 'Wed', revenue: 50000 },
    { name: 'Thu', revenue: 27800 },
    { name: 'Fri', revenue: 68900 },
    { name: 'Sat', revenue: 83900 },
    { name: 'Sun', revenue: 74900 },
  ];

  const pieData = [
    { name: 'Cardiology', value: 400 },
    { name: 'Neurology', value: 300 },
    { name: 'Pediatrics', value: 300 },
    { name: 'Orthopedics', value: 200 },
  ];
  const COLORS = ['#0ea5e9', '#8b5cf6', '#14b8a6', '#f59e0b'];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading metrics...</div>;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-2">Hospital Command Center</h1>
          <p className="text-slate-500">Real-time overview of MediNova AI Operations.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
            <Calendar size={16}/> Filter Date
          </button>
          <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-md shadow-primary-500/20 transition-all hover:-translate-y-0.5">
            Generate Report
          </button>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiData.map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${kpi.color}`}>
                {kpi.icon}
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${kpi.trend.includes('-') ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {kpi.trend}
              </span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">{kpi.title}</p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trends */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800">Revenue Analytics</h3>
            <select className="bg-slate-50 text-slate-600 text-sm rounded-lg border-slate-200 focus:ring-primary-500 focus:border-primary-500">
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === revenueData.length - 1 ? '#14b8a6' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg text-slate-800 mb-6">Department Flow</h3>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-sm text-slate-500">Total</p>
                <p className="text-xl font-bold text-slate-800">1.2k</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="text-slate-600 font-medium">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardHome;
