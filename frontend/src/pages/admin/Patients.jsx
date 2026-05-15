import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Plus, UserPlus, HeartPulse, MoreVertical } from 'lucide-react';

const Patients = () => {
  const { token } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, fetch users with role Patient. 
    // Wait, the API for users in authController gets all. We can filter it here.
    const fetchPatients = async () => {
      try {
        const res = await axios.get('/auth/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const patientData = res.data.data.filter(u => u.role === 'Patient');
        setPatients(patientData);
      } catch (error) {
        console.error('Failed to fetch patients:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-2">Patients Directory</h1>
          <p className="text-slate-500">Manage patient records, history, and admissions.</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-md shadow-primary-500/20 transition-all hover:-translate-y-0.5 flex items-center gap-2">
          <UserPlus size={18} /> Register Patient
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, ID or email..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Filter</button>
            <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Export</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Patient Info</th>
                <th className="p-4 font-semibold">Contact</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Registered</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">Loading patients...</td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">No patients found.</td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <motion.tr 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                    key={patient._id} 
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{patient.name}</p>
                          <p className="text-xs text-slate-500">ID: {patient._id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-slate-700">{patient.email}</p>
                      <p className="text-xs text-slate-500">+91 - N/A</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                        Active
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {new Date(patient.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <MoreVertical size={18} />
                      </button>
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

export default Patients;
