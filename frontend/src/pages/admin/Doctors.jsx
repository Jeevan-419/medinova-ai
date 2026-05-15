import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Stethoscope, MoreVertical, Plus, Star, Phone } from 'lucide-react';

const Doctors = () => {
  const { token } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get('/appointments/doctors', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDoctors(res.data.data);
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-2">Doctors Staff</h1>
          <p className="text-slate-500">Manage hospital physicians and specialists.</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-md shadow-primary-500/20 transition-all hover:-translate-y-0.5 flex items-center gap-2">
          <Plus size={18} /> Add Doctor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center text-slate-500">Loading doctors...</div>
        ) : doctors.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500">No doctors available.</div>
        ) : (
          doctors.map((doc) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
              key={doc._id} 
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow relative group"
            >
              <button className="absolute top-4 right-4 text-slate-400 hover:text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical size={18} />
              </button>
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-4 text-primary-500 shadow-inner">
                  <Stethoscope size={32} />
                </div>
                <h3 className="font-bold text-lg text-slate-800">Dr. {doc.name}</h3>
                <p className="text-sm font-medium text-primary-600 mb-4">{doc.specialization || 'General Practitioner'}</p>
                
                <div className="w-full flex justify-between items-center px-4 py-3 bg-slate-50 rounded-xl mb-4">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">Rating</p>
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-1 justify-center"><Star size={14} className="text-amber-500 fill-amber-500"/> 4.9</p>
                  </div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">Experience</p>
                    <p className="text-sm font-bold text-slate-800">8 Yrs</p>
                  </div>
                </div>

                <div className="w-full flex gap-2">
                  <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    Profile
                  </button>
                  <button className="flex-1 bg-primary-50 hover:bg-primary-100 text-primary-700 py-2 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                    Schedule
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Doctors;
