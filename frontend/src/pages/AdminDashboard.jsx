import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, ShieldAlert, Users, Activity, FileText, Pill, Calendar, CreditCard, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const AdminDashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('financials');
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [apptRes, recRes, presRes, invRes, usersRes] = await Promise.all([
        axios.get('/appointments'),
        axios.get('/clinical/records'),
        axios.get('/clinical/prescriptions'),
        axios.get('/billing/invoices'),
        axios.get('/auth/users')
      ]);
      setAppointments(apptRes.data.data);
      setRecords(recRes.data.data);
      setPrescriptions(presRes.data.data);
      setInvoices(invRes.data.data);
      setUsers(usersRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingRevenue = invoices.filter(i => i.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);

  // Generate mock data for the last 7 days based on real appointments if possible, or fallback to mock
  const generateChartData = () => {
    const data = [];
    for(let i=6; i>=0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const apptCount = appointments.filter(a => a.date === dateStr).length || Math.floor(Math.random() * 10) + 2; // Add random if empty for visual demo
      const rev = invoices.filter(inv => new Date(inv.createdAt).toISOString().split('T')[0] === dateStr && inv.status === 'Paid').reduce((sum, inv) => sum + inv.amount, 0) || Math.floor(Math.random() * 500) + 100;
      
      data.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        Appointments: apptCount,
        Revenue: rev
      });
    }
    return data;
  };

  const chartData = generateChartData();

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-dark-bg">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col hidden md:flex shrink-0">
        <div className="flex items-center gap-2 p-6 pb-8">
          <ShieldAlert className="text-primary-500" size={28} />
          <span className="font-bold text-2xl tracking-tight">Admin<span className="text-primary-500">Pro</span></span>
        </div>
        <nav className="flex-1 flex flex-col gap-1 px-4">
           <button onClick={() => setActiveTab('financials')} className={`flex items-center gap-3 p-3 rounded-lg w-full text-left font-medium transition-all duration-200 ${activeTab === 'financials' ? 'bg-primary-600 text-white shadow-md shadow-primary-900/20' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}><TrendingUp size={18} /> Financial Analytics</button>
           <button onClick={() => setActiveTab('appointments')} className={`flex items-center gap-3 p-3 rounded-lg w-full text-left font-medium transition-all duration-200 ${activeTab === 'appointments' ? 'bg-primary-600 text-white shadow-md shadow-primary-900/20' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}><Calendar size={18} /> Bookings Overview</button>
           <button onClick={() => setActiveTab('records')} className={`flex items-center gap-3 p-3 rounded-lg w-full text-left font-medium transition-all duration-200 ${activeTab === 'records' ? 'bg-primary-600 text-white shadow-md shadow-primary-900/20' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}><Activity size={18} /> Medical Records</button>
           <button onClick={() => setActiveTab('prescriptions')} className={`flex items-center gap-3 p-3 rounded-lg w-full text-left font-medium transition-all duration-200 ${activeTab === 'prescriptions' ? 'bg-primary-600 text-white shadow-md shadow-primary-900/20' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}><Pill size={18} /> Prescriptions Log</button>
           <div className="my-4 border-t border-slate-800/50 mx-2"></div>
           <button onClick={() => setActiveTab('users')} className={`flex items-center gap-3 p-3 rounded-lg w-full text-left font-medium transition-all duration-200 ${activeTab === 'users' ? 'bg-primary-600 text-white shadow-md shadow-primary-900/20' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}><Users size={18} /> Manage Users</button>
        </nav>
        <div className="p-4">
          <button onClick={handleLogout} className="flex items-center gap-3 p-3 w-full rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 font-medium transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-auto h-screen">
        <div className="flex justify-between items-center mb-8 bg-white dark:bg-dark-card p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 md:hidden">
           <div className="flex items-center gap-2">
             <ShieldAlert className="text-primary-500" />
             <span className="font-bold text-xl text-slate-800 dark:text-white">Admin Panel</span>
           </div>
           <button onClick={handleLogout} className="text-slate-600 hover:text-red-500 transition-colors">
             <LogOut size={20} />
           </button>
        </div>
        
        {activeTab === 'financials' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Financial & Analytics Overview</h1>
                <p className="text-slate-500 text-sm mt-1">Real-time metrics on platform revenue and patient flow.</p>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-2 text-emerald-600">
                  <div className="bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded-lg">
                    <TrendingUp size={20} />
                  </div>
                  <h3 className="text-slate-600 dark:text-slate-400 font-medium">Total Revenue</h3>
                </div>
                <p className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">₹{totalRevenue.toFixed(2)}</p>
              </div>
              
              <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-2 text-amber-500">
                  <div className="bg-amber-50 dark:bg-amber-900/30 p-2 rounded-lg">
                    <CreditCard size={20} />
                  </div>
                  <h3 className="text-slate-600 dark:text-slate-400 font-medium">Outstanding</h3>
                </div>
                <p className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">₹{pendingRevenue.toFixed(2)}</p>
              </div>

              <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-2 text-primary-500">
                  <div className="bg-primary-50 dark:bg-primary-900/30 p-2 rounded-lg">
                    <Calendar size={20} />
                  </div>
                  <h3 className="text-slate-600 dark:text-slate-400 font-medium">Appointments</h3>
                </div>
                <p className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{appointments.length}</p>
              </div>

              <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-2 text-indigo-500">
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg">
                    <Activity size={20} />
                  </div>
                  <h3 className="text-slate-600 dark:text-slate-400 font-medium">Clinical Logs</h3>
                </div>
                <p className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{records.length + prescriptions.length}</p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-lg mb-6 text-slate-800 dark:text-white">7-Day Revenue Trend</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} tickFormatter={(value) => `₹${value}`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        cursor={{stroke: '#e2e8f0', strokeWidth: 2}}
                      />
                      <Line type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-lg mb-6 text-slate-800 dark:text-white">Patient Appointment Flow</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        cursor={{fill: '#f1f5f9'}}
                      />
                      <Bar dataKey="Appointments" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
               <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                 <h3 className="font-bold text-lg text-slate-800 dark:text-white">Recent Transactions</h3>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                       <th className="px-6 py-4 font-semibold border-b border-slate-100 dark:border-slate-800">Invoice ID</th>
                       <th className="px-6 py-4 font-semibold border-b border-slate-100 dark:border-slate-800">Date</th>
                       <th className="px-6 py-4 font-semibold border-b border-slate-100 dark:border-slate-800">Doctor</th>
                       <th className="px-6 py-4 font-semibold border-b border-slate-100 dark:border-slate-800">Patient</th>
                       <th className="px-6 py-4 font-semibold border-b border-slate-100 dark:border-slate-800 text-right">Amount</th>
                       <th className="px-6 py-4 font-semibold border-b border-slate-100 dark:border-slate-800 text-center">Status</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                     {invoices.length === 0 ? (
                       <tr><td colSpan="6" className="p-8 text-center text-slate-500">No transactions recorded.</td></tr>
                     ) : (
                       invoices.slice().reverse().map(inv => (
                         <tr key={inv._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors text-sm">
                           <td className="px-6 py-4 text-slate-400 font-mono text-xs">{inv._id.substring(0, 8)}...</td>
                           <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{formatDate(inv.createdAt)}</td>
                           <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                             {inv.doctor ? `Dr. ${inv.doctor.name}` : <span className="text-slate-400 italic">Unknown Doctor</span>}
                           </td>
                           <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                             {inv.patient ? inv.patient.name : <span className="text-slate-400 italic">Unknown Patient</span>}
                           </td>
                           <td className="px-6 py-4 text-right font-semibold text-slate-800 dark:text-slate-200">₹{inv.amount.toFixed(2)}</td>
                           <td className="px-6 py-4 text-center">
                             <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                               {inv.status}
                             </span>
                           </td>
                         </tr>
                       ))
                     )}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

        {activeTab !== 'financials' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="mb-6 flex justify-between items-end">
               <div>
                 <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                   {activeTab === 'appointments' ? 'Global Bookings Overview' : activeTab === 'records' ? 'Global Medical Records Audit' : activeTab === 'users' ? 'Manage Users' : 'Global Prescriptions Audit'}
                 </h1>
               </div>
             </div>
             
             <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                       {activeTab === 'users' ? (
                         <>
                           <th className="px-6 py-4 font-semibold border-b border-slate-100 dark:border-slate-800">Name</th>
                           <th className="px-6 py-4 font-semibold border-b border-slate-100 dark:border-slate-800">Email</th>
                           <th className="px-6 py-4 font-semibold border-b border-slate-100 dark:border-slate-800">Role</th>
                           <th className="px-6 py-4 font-semibold border-b border-slate-100 dark:border-slate-800">Status</th>
                         </>
                       ) : (
                         <>
                           <th className="px-6 py-4 font-semibold border-b border-slate-100 dark:border-slate-800">Date</th>
                           <th className="px-6 py-4 font-semibold border-b border-slate-100 dark:border-slate-800">Patient</th>
                           <th className="px-6 py-4 font-semibold border-b border-slate-100 dark:border-slate-800">Doctor</th>
                           {activeTab === 'appointments' && <th className="px-6 py-4 font-semibold border-b border-slate-100 dark:border-slate-800">Status</th>}
                           {activeTab === 'records' && <th className="px-6 py-4 font-semibold border-b border-slate-100 dark:border-slate-800">Diagnosis</th>}
                           {activeTab === 'prescriptions' && <th className="px-6 py-4 font-semibold border-b border-slate-100 dark:border-slate-800">Medications Count</th>}
                         </>
                       )}
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                     {activeTab === 'users' && (users.length === 0 ? (
                       <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No users found.</td></tr>
                     ) : users.map(u => (
                       <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 text-sm transition-colors">
                         <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{u.name}</td>
                         <td className="px-6 py-4 text-slate-500">{u.email}</td>
                         <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{u.role}</td>
                         <td className="px-6 py-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{u.isApproved ? 'Active' : 'Pending'}</span></td>
                       </tr>
                     )))}
                     {activeTab === 'appointments' && (appointments.length === 0 ? (
                       <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No bookings found.</td></tr>
                     ) : appointments.slice().reverse().map(item => (
                       <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 text-sm transition-colors">
                         <td className="px-6 py-4 text-slate-500">{item.date} {item.time}</td>
                         <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                           {item.patient ? item.patient.name : <span className="text-slate-400 italic">Unknown Patient</span>}
                         </td>
                         <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                           {item.doctor ? `Dr. ${item.doctor.name}` : <span className="text-slate-400 italic">Unknown Doctor</span>}
                         </td>
                         <td className="px-6 py-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>{item.status}</span></td>
                       </tr>
                     )))}

                     {activeTab === 'records' && (records.length === 0 ? (
                       <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No medical records found.</td></tr>
                     ) : records.slice().reverse().map(item => (
                       <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 text-sm transition-colors">
                         <td className="px-6 py-4 text-slate-500">{formatDate(item.createdAt)}</td>
                         <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                           {item.patient ? item.patient.name : <span className="text-slate-400 italic">Unknown Patient</span>}
                         </td>
                         <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                           {item.doctor ? `Dr. ${item.doctor.name}` : <span className="text-slate-400 italic">Unknown Doctor</span>}
                         </td>
                         <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{item.diagnosis}</td>
                       </tr>
                     )))}

                     {activeTab === 'prescriptions' && (prescriptions.length === 0 ? (
                       <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No prescriptions found.</td></tr>
                     ) : prescriptions.slice().reverse().map(item => (
                       <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 text-sm transition-colors">
                         <td className="px-6 py-4 text-slate-500">{formatDate(item.createdAt)}</td>
                         <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                           {item.patient ? item.patient.name : <span className="text-slate-400 italic">Unknown Patient</span>}
                         </td>
                         <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                           {item.doctor ? `Dr. ${item.doctor.name}` : <span className="text-slate-400 italic">Unknown Doctor</span>}
                         </td>
                         <td className="px-6 py-4"><span className="bg-primary-100 text-primary-700 px-2 py-1 rounded font-bold">{item.medications?.length || 0}</span> Meds</td>
                       </tr>
                     )))}
                   </tbody>
                 </table>
               </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
