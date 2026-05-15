import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Stethoscope, CheckCircle, XCircle, Calendar, Plus, Activity, Pill, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DoctorDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [availableSlots, setAvailableSlots] = useState(user?.availableSlots || []);
  const [newSlot, setNewSlot] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Clinical Actions state
  const [activeClinicalTab, setActiveClinicalTab] = useState('record'); // record, prescription
  const [selectedPatientId, setSelectedPatientId] = useState('');
  
  const [recordForm, setRecordForm] = useState({ diagnosis: '', treatment: '', notes: '' });
  
  const [prescriptionForm, setPrescriptionForm] = useState({ notes: '' });
  const [medications, setMedications] = useState([{ name: '', dosage: '', duration: '', instructions: '' }]);

  // Billing Modal
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [appointmentToComplete, setAppointmentToComplete] = useState(null);
  const [feeForm, setFeeForm] = useState({ amount: '', description: 'Consultation Fee' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [apptRes, invRes] = await Promise.all([
        axios.get('/appointments'),
        axios.get('/billing/invoices')
      ]);
      setAppointments(apptRes.data.data);
      setInvoices(invRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`/appointments/${id}/status`, { status });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const initiateCompletion = (apt) => {
    setAppointmentToComplete(apt);
    setShowBillingModal(true);
  };

  const handleCompleteWithInvoice = async (e) => {
    e.preventDefault();
    try {
      // Create invoice
      await axios.post('/billing/invoices', {
        patientId: appointmentToComplete.patient._id,
        amount: Number(feeForm.amount),
        description: feeForm.description
      });
      // Mark completed
      await handleStatusUpdate(appointmentToComplete._id, 'Completed');
      
      setShowBillingModal(false);
      setAppointmentToComplete(null);
      setFeeForm({ amount: '', description: 'Consultation Fee' });
      setMessage({ text: 'Appointment completed and invoice generated.', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to generate invoice', type: 'error' });
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!newSlot) return;
    const updatedSlots = [...availableSlots, newSlot].sort();
    try {
      await axios.put('/appointments/availability', { availableSlots: updatedSlots });
      setAvailableSlots(updatedSlots);
      setNewSlot('');
      setMessage({ text: 'Availability updated.', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveSlot = async (slotToRemove) => {
    const updatedSlots = availableSlots.filter(s => s !== slotToRemove);
    try {
      await axios.put('/appointments/availability', { availableSlots: updatedSlots });
      setAvailableSlots(updatedSlots);
    } catch (err) {
      console.error(err);
    }
  };

  const submitMedicalRecord = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) return setMessage({ text: 'Select a patient first', type: 'error' });
    try {
      await axios.post('/clinical/records', { patientId: selectedPatientId, ...recordForm });
      setMessage({ text: 'Medical record saved successfully.', type: 'success' });
      setRecordForm({ diagnosis: '', treatment: '', notes: '' });
      setSelectedPatientId('');
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to save record', type: 'error' });
    }
  };

  const submitPrescription = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) return setMessage({ text: 'Select a patient first', type: 'error' });
    try {
      await axios.post('/clinical/prescriptions', { patientId: selectedPatientId, medications, notes: prescriptionForm.notes });
      setMessage({ text: 'Prescription generated successfully.', type: 'success' });
      setMedications([{ name: '', dosage: '', duration: '', instructions: '' }]);
      setPrescriptionForm({ notes: '' });
      setSelectedPatientId('');
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to save prescription', type: 'error' });
    }
  };

  const uniquePatients = () => {
    const validAppts = appointments.filter(a => ['Pending', 'Approved', 'Completed'].includes(a.status));
    const unique = [];
    const map = new Map();
    for (const item of validAppts) {
      if(item.patient && !map.has(item.patient._id)){
          map.set(item.patient._id, true);
          unique.push({ id: item.patient._id, name: item.patient.name });
      }
    }
    return unique;
  };

  const pendingCount = appointments.filter(a => a.status === 'Pending').length;
  const todayCount = appointments.filter(a => a.status === 'Approved' && a.date === new Date().toISOString().split('T')[0]).length;
  const totalEarnings = invoices.reduce((acc, curr) => acc + curr.amount, 0);
  const pendingEarnings = invoices.filter(i => i.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg p-4 md:p-8">
      
      {/* Billing Modal Overlay */}
      {showBillingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-2">Complete Appointment</h3>
            <p className="text-slate-500 text-sm mb-6">Generate an invoice for {appointmentToComplete?.patient?.name}</p>
            
            <form onSubmit={handleCompleteWithInvoice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fee Amount (₹)</label>
                <input type="number" required min="0" step="0.01" value={feeForm.amount} onChange={e => setFeeForm({...feeForm, amount: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" placeholder="150.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <input type="text" required value={feeForm.description} onChange={e => setFeeForm({...feeForm, description: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowBillingModal(false)} className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors">Generate & Complete</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white dark:bg-dark-card p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full text-emerald-600 dark:text-emerald-400">
              <Stethoscope size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">Doctor Portal</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Dr. {user?.name}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-slate-600 hover:text-red-500 transition-colors">
            <LogOut size={20} /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl mb-6 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-slate-500 text-sm font-medium">Pending Requests</h3>
            <p className="text-3xl font-bold mt-2 text-amber-500">{pendingCount}</p>
          </div>
          <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-slate-500 text-sm font-medium">Today's Appointments</h3>
            <p className="text-3xl font-bold mt-2 text-emerald-600">{todayCount}</p>
          </div>
          <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-slate-500 text-sm font-medium">Total Appointments</h3>
            <p className="text-3xl font-bold mt-2 text-primary-600">{appointments.length}</p>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl shadow-sm border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <IndianRupee size={16} className="text-emerald-400"/>
                <h3 className="text-slate-300 text-sm font-medium">Total Billed</h3>
              </div>
              <p className="text-3xl font-bold mt-1">₹{totalEarnings.toFixed(2)}</p>
            </div>
            {pendingEarnings > 0 ? (
              <div className="mt-4 inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-md text-xs font-medium border border-amber-500/30 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                ₹{pendingEarnings.toFixed(2)} Awaiting Payment
              </div>
            ) : (
              <div className="mt-4 inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-md text-xs font-medium border border-emerald-500/30 w-fit">
                <CheckCircle size={12} /> All Paid
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Availability & Appointments */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Availability Manager */}
            <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-2 mb-4">
                 <Calendar className="text-primary-500" />
                 <h3 className="font-semibold text-lg">Availability Slots</h3>
               </div>
               
               <form onSubmit={handleAddSlot} className="flex gap-2 mb-4">
                 <input type="time" required value={newSlot} onChange={(e) => setNewSlot(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 text-sm" />
                 <button type="submit" className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium"><Plus size={20}/></button>
               </form>

               {availableSlots.length > 0 && (
                 <div className="flex flex-wrap gap-2">
                   {availableSlots.map(slot => (
                     <div key={slot} className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-sm">
                       <span>{slot}</span>
                       <button onClick={() => handleRemoveSlot(slot)} className="text-slate-400 hover:text-red-500"><XCircle size={14}/></button>
                     </div>
                   ))}
                 </div>
               )}
            </div>

            {/* Appointment Requests */}
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex-1 max-h-[600px] flex flex-col">
               <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                 <h3 className="font-semibold text-lg">Appointments Queue</h3>
               </div>
               <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto flex-1">
                 {appointments.length === 0 ? (
                   <p className="p-8 text-center text-slate-500">No appointments.</p>
                 ) : (
                   appointments.slice().reverse().map(apt => (
                     <div key={apt._id} className="p-4 flex flex-col justify-between gap-3">
                       <div>
                         <div className="flex items-center justify-between">
                           <h4 className="font-semibold text-slate-800 dark:text-slate-200">{apt.patient?.name}</h4>
                           <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${apt.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : apt.status === 'Pending' ? 'bg-amber-100 text-amber-700' : apt.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>{apt.status}</span>
                         </div>
                         <div className="flex items-center gap-2 mt-1 text-sm text-slate-600 dark:text-slate-400">
                           <span className="font-medium text-primary-600">{apt.date}</span> at <span className="font-medium text-primary-600">{apt.time}</span>
                         </div>
                         <p className="text-xs text-slate-500 mt-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded">Reason: {apt.reasonForVisit}</p>
                       </div>
                       
                       <div className="flex justify-end gap-2">
                         {apt.status === 'Pending' && (
                           <>
                             <button onClick={() => handleStatusUpdate(apt._id, 'Approved')} className="flex items-center gap-1 px-3 py-1 bg-emerald-500 text-white rounded text-xs font-medium hover:bg-emerald-600"><CheckCircle size={14}/> Approve</button>
                             <button onClick={() => handleStatusUpdate(apt._id, 'Rejected')} className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded text-xs font-medium hover:bg-red-100"><XCircle size={14}/> Reject</button>
                           </>
                         )}
                         {apt.status === 'Approved' && (
                            <button onClick={() => initiateCompletion(apt)} className="px-3 py-1 bg-slate-900 text-white rounded text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm">Mark Completed & Bill</button>
                         )}
                       </div>
                     </div>
                   ))
                 )}
               </div>
            </div>
          </div>

          {/* Right Column: Clinical Actions */}
          <div className="lg:col-span-7 bg-white dark:bg-dark-card rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
              <h3 className="font-semibold text-lg flex items-center gap-2"><Activity className="text-primary-500"/> Clinical Actions</h3>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Patient (from active/past appointments)</label>
                <select 
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 font-medium"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                >
                  <option value="">-- Choose Patient --</option>
                  {uniquePatients().map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              {selectedPatientId ? (
                <>
                  <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
                    <button onClick={() => setActiveClinicalTab('record')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeClinicalTab === 'record' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Add Medical Record</button>
                    <button onClick={() => setActiveClinicalTab('prescription')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeClinicalTab === 'prescription' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Generate Prescription</button>
                  </div>

                  {activeClinicalTab === 'record' && (
                    <form onSubmit={submitMedicalRecord} className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Diagnosis</label>
                        <input type="text" required value={recordForm.diagnosis} onChange={e => setRecordForm({...recordForm, diagnosis: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" placeholder="e.g. Acute Bronchitis" />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Treatment Plan</label>
                        <textarea required rows="2" value={recordForm.treatment} onChange={e => setRecordForm({...recordForm, treatment: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 resize-none"></textarea>
                      </div>
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Clinical Notes (Optional)</label>
                        <textarea rows="2" value={recordForm.notes} onChange={e => setRecordForm({...recordForm, notes: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 resize-none"></textarea>
                      </div>
                      <button type="submit" className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded-lg text-sm font-medium w-full transition-colors shadow-sm">Save Medical Record</button>
                    </form>
                  )}

                  {activeClinicalTab === 'prescription' && (
                    <form onSubmit={submitPrescription} className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                      <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm flex items-center gap-2"><Pill size={16}/> Medications</h4>
                          <button type="button" onClick={() => setMedications([...medications, { name: '', dosage: '', duration: '', instructions: '' }])} className="text-xs text-primary-600 font-medium hover:underline">+ Add Med</button>
                        </div>
                        {medications.map((med, index) => (
                          <div key={index} className="grid grid-cols-12 gap-3 pb-4 border-b border-slate-200 dark:border-slate-700 last:border-0 last:pb-0">
                            <div className="col-span-12 sm:col-span-4">
                              <input type="text" required placeholder="Name (e.g. Amoxicillin)" value={med.name} onChange={e => { const newMeds = [...medications]; newMeds[index].name = e.target.value; setMedications(newMeds); }} className="w-full px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
                            </div>
                            <div className="col-span-6 sm:col-span-3">
                              <input type="text" required placeholder="Dosage (e.g. 500mg)" value={med.dosage} onChange={e => { const newMeds = [...medications]; newMeds[index].dosage = e.target.value; setMedications(newMeds); }} className="w-full px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
                            </div>
                            <div className="col-span-6 sm:col-span-3">
                              <input type="text" required placeholder="Duration (e.g. 7 Days)" value={med.duration} onChange={e => { const newMeds = [...medications]; newMeds[index].duration = e.target.value; setMedications(newMeds); }} className="w-full px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
                            </div>
                            <div className="col-span-10 sm:col-span-11">
                              <input type="text" required placeholder="Instructions (e.g. Twice daily after food)" value={med.instructions} onChange={e => { const newMeds = [...medications]; newMeds[index].instructions = e.target.value; setMedications(newMeds); }} className="w-full px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
                            </div>
                            <div className="col-span-2 sm:col-span-1 flex items-end justify-center">
                              {medications.length > 1 && (
                                <button type="button" onClick={() => setMedications(medications.filter((_, i) => i !== index))} className="p-1 text-red-500 hover:bg-red-50 rounded"><XCircle size={16}/></button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Additional Advice / Notes</label>
                        <textarea rows="2" value={prescriptionForm.notes} onChange={e => setPrescriptionForm({...prescriptionForm, notes: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 resize-none"></textarea>
                      </div>
                      <button type="submit" className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded-lg text-sm font-medium w-full flex justify-center items-center gap-2 transition-colors shadow-sm"><Pill size={16} /> Generate Prescription</button>
                    </form>
                  )}
                </>
              ) : (
                <div className="text-center p-8 text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
                  <Activity size={48} className="opacity-30 mb-4" />
                  <p>Select a patient to access clinical tools.</p>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
