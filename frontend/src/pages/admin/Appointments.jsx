import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

const Appointments = () => {
  const { token } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get('/appointments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(res.data.data);
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [token]);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/appointments/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(prev => prev.map(app => app._id === id ? { ...app, status } : app));
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-2">Appointments</h1>
          <p className="text-slate-500">Manage all hospital appointments and schedules.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Date & Time</th>
                <th className="p-4 font-semibold">Patient</th>
                <th className="p-4 font-semibold">Doctor</th>
                <th className="p-4 font-semibold">Reason</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-500">Loading appointments...</td></tr>
              ) : appointments.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-500">No appointments scheduled.</td></tr>
              ) : (
                appointments.map((app) => (
                  <motion.tr key={app._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <Calendar size={16} className="text-slate-400" /> {app.date}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <Clock size={14} /> {app.time}
                      </div>
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-800">{app.patient?.name || 'Unknown'}</td>
                    <td className="p-4 text-sm text-primary-600 font-medium">{app.doctor?.name || 'Unknown'}</td>
                    <td className="p-4 text-sm text-slate-600 truncate max-w-[150px]">{app.reasonForVisit}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getStatusBadge(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      {app.status === 'Pending' && (
                        <>
                          <button onClick={() => updateStatus(app._id, 'Approved')} className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors" title="Approve">
                            <CheckCircle size={18} />
                          </button>
                          <button onClick={() => updateStatus(app._id, 'Cancelled')} className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors" title="Cancel">
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
