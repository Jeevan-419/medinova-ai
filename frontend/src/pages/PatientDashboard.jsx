import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, CalendarPlus, Clock, XCircle, Activity, Pill, CreditCard, CheckCircle, ScanLine, Upload, Loader2, FileImage, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PatientDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  
  const [bookingForm, setBookingForm] = useState({ doctorId: '', date: '', time: '', reasonForVisit: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [activeTab, setActiveTab] = useState('appointments'); // appointments, records, prescriptions, billing

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');

  // Prescription Reader state
  const [rxFile, setRxFile] = useState(null);
  const [rxPreview, setRxPreview] = useState(null);
  const [rxAnalysis, setRxAnalysis] = useState('');
  const [rxLoading, setRxLoading] = useState(false);
  const [rxError, setRxError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docRes, apptRes, recRes, presRes, invRes] = await Promise.all([
        axios.get('/appointments/doctors'),
        axios.get('/appointments'),
        axios.get('/clinical/records'),
        axios.get('/clinical/prescriptions'),
        axios.get('/billing/invoices')
      ]);
      setDoctors(docRes.data.data);
      setAppointments(apptRes.data.data);
      setRecords(recRes.data.data);
      setPrescriptions(presRes.data.data);
      setInvoices(invRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/appointments', bookingForm);
      setMessage({ text: 'Appointment booked successfully!', type: 'success' });
      setBookingForm({ doctorId: '', date: '', time: '', reasonForVisit: '' });
      fetchData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to book appointment', type: 'error' });
    }
  };

  const handleCancel = async (id) => {
    try {
      await axios.put(`/appointments/${id}/status`, { status: 'Cancelled' });
      setMessage({ text: 'Appointment cancelled.', type: 'success' });
      fetchData();
    } catch (err) {
      setMessage({ text: 'Failed to cancel appointment', type: 'error' });
    }
  };

  const initiatePayment = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    setPaymentMethod('');
    setShowPaymentModal(true);
  };

  const confirmPayment = async () => {
    if(!paymentMethod) return setMessage({text: 'Please select a payment method', type: 'error'});
    try {
      await axios.post(`/billing/pay/${selectedInvoiceId}`);
      setMessage({ text: `Payment successful via ${paymentMethod}!`, type: 'success' });
      setShowPaymentModal(false);
      setSelectedInvoiceId(null);
      fetchData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Payment failed', type: 'error' });
    }
  };

  const handleRxFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setRxFile(file);
    setRxAnalysis('');
    setRxError('');
    const reader = new FileReader();
    reader.onloadend = () => setRxPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAnalyzePrescription = async () => {
    if (!rxFile) return;
    setRxLoading(true);
    setRxAnalysis('');
    setRxError('');
    try {
      const formData = new FormData();
      formData.append('prescription', rxFile);
      const res = await axios.post('/prescription-reader/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setRxAnalysis(res.data.data.analysis);
    } catch (err) {
      setRxError(err.response?.data?.message || 'Failed to analyze. Please try again with a clearer image.');
    } finally {
      setRxLoading(false);
    }
  };

  const resetRxReader = () => {
    setRxFile(null);
    setRxPreview(null);
    setRxAnalysis('');
    setRxError('');
  };

  // Convert markdown-like text to formatted JSX
  const renderAnalysis = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h3 key={i} className="text-base font-bold text-slate-800 dark:text-white mt-4 mb-1">{line.replace('## ', '')}</h3>;
      if (line.startsWith('# ')) return <h2 key={i} className="text-lg font-bold text-primary-600 dark:text-primary-400 mt-5 mb-2">{line.replace('# ', '')}</h2>;
      if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold text-slate-800 dark:text-slate-200 mt-3">{line.replace(/\*\*/g, '')}</p>;
      if (line.startsWith('- ')) return <li key={i} className="text-sm text-slate-700 dark:text-slate-300 ml-4 list-disc">{line.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '$1')}</li>;
      if (line.startsWith('* ')) return <li key={i} className="text-sm text-slate-700 dark:text-slate-300 ml-4 list-disc">{line.replace('* ', '').replace(/\*\*(.*?)\*\*/g, '$1')}</li>;
      if (line.match(/^\d+\./)) return <li key={i} className="text-sm text-slate-700 dark:text-slate-300 ml-4 list-decimal">{line.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1')}</li>;
      if (line.trim() === '') return <div key={i} className="h-1" />;
      return <p key={i} className="text-sm text-slate-700 dark:text-slate-300">{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
    });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30';
      case 'Pending': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/30';
      case 'Rejected': return 'text-red-600 bg-red-50 dark:bg-red-900/30';
      case 'Cancelled': return 'text-slate-500 bg-slate-100 dark:bg-slate-800';
      default: return 'text-slate-600 bg-slate-50 dark:bg-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg p-4 md:p-8">
      
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Select Payment Method</h3>
            <div className="space-y-3 mb-6">
              {['UPI', 'Google Pay', 'PhonePe', 'Credit / Debit Card'].map(method => (
                <label key={method} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${paymentMethod === method ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                  <input type="radio" name="paymentMethod" value={method} checked={paymentMethod === method} onChange={(e) => setPaymentMethod(e.target.value)} className="text-primary-600 focus:ring-primary-500 w-4 h-4" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">{method}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowPaymentModal(false)} className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">Cancel</button>
              <button onClick={confirmPayment} disabled={!paymentMethod} className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors">Confirm Payment</button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 bg-white dark:bg-dark-card p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-primary-100 dark:bg-primary-900 p-2 rounded-full text-primary-600">
              <User size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">Patient Portal</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user?.name}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-slate-600 hover:text-red-500 transition-colors">
            <LogOut size={20} /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl mb-6 flex justify-between items-center ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage({text:'', type:''})}><XCircle size={18}/></button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Section */}
          <div className="lg:col-span-1 bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 h-fit">
            <div className="flex items-center gap-2 mb-6">
              <CalendarPlus className="text-primary-500" />
              <h3 className="font-semibold text-lg">Book Appointment</h3>
            </div>
            
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Doctor</label>
                <select required value={bookingForm.doctorId} onChange={(e) => setBookingForm({...bookingForm, doctorId: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 text-sm">
                  <option value="">-- Select --</option>
                  {doctors.map(doc => <option key={doc._id} value={doc._id}>Dr. {doc.name} ({doc.specialization})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input type="date" required value={bookingForm.date} onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Time</label>
                  <select required value={bookingForm.time} onChange={(e) => setBookingForm({...bookingForm, time: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm">
                    <option value="">-- Select --</option>
                    {bookingForm.doctorId && doctors.find(d => d._id === bookingForm.doctorId)?.availableSlots?.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason</label>
                <textarea required rows="2" value={bookingForm.reasonForVisit} onChange={(e) => setBookingForm({...bookingForm, reasonForVisit: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm resize-none" placeholder="Symptoms..."></textarea>
              </div>

              <button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white py-2 rounded-lg text-sm font-medium transition-colors">Request</button>
            </form>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            
            {/* Tabs */}
            <div className="flex bg-white dark:bg-dark-card rounded-xl p-1 shadow-sm border border-slate-100 dark:border-slate-800 flex-wrap">
              <button onClick={() => setActiveTab('appointments')} className={`flex-1 min-w-[100px] py-2 px-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'appointments' ? 'bg-primary-50 text-primary-600 dark:bg-slate-800 dark:text-primary-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                <Clock size={16} /> Appointments
              </button>
              <button onClick={() => setActiveTab('records')} className={`flex-1 min-w-[100px] py-2 px-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'records' ? 'bg-primary-50 text-primary-600 dark:bg-slate-800 dark:text-primary-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                <Activity size={16} /> History
              </button>
              <button onClick={() => setActiveTab('prescriptions')} className={`flex-1 min-w-[100px] py-2 px-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'prescriptions' ? 'bg-primary-50 text-primary-600 dark:bg-slate-800 dark:text-primary-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                <Pill size={16} /> Scripts
              </button>
              <button onClick={() => setActiveTab('billing')} className={`flex-1 min-w-[100px] py-2 px-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'billing' ? 'bg-primary-50 text-primary-600 dark:bg-slate-800 dark:text-primary-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                <CreditCard size={16} /> Billing
              </button>
              <button onClick={() => setActiveTab('rxreader')} className={`flex-1 min-w-[100px] py-2 px-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'rxreader' ? 'bg-violet-50 text-violet-600 dark:bg-slate-800 dark:text-violet-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                <ScanLine size={16} /> Rx Reader
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden min-h-[400px]">
               
               {activeTab === 'appointments' && (
                 appointments.length === 0 ? (
                   <div className="p-8 text-center text-slate-500 h-full flex flex-col items-center justify-center">
                     <CalendarPlus size={48} className="text-slate-300 mb-4" />
                     <p>No appointments scheduled.</p>
                   </div>
                 ) : (
                   <div className="divide-y divide-slate-100 dark:divide-slate-800">
                     {appointments.map(apt => (
                       <div key={apt._id} className="p-5 flex flex-col sm:flex-row justify-between gap-4">
                         <div>
                           <h4 className="font-semibold">Dr. {apt.doctor?.name} <span className="text-xs font-normal text-slate-500">({apt.doctor?.specialization})</span></h4>
                           <div className="flex items-center gap-2 mt-1 text-sm text-slate-600 dark:text-slate-400">
                             <span className="font-medium">{formatDate(apt.date)}</span> at <span className="font-medium">{apt.time}</span>
                           </div>
                           <p className="text-sm mt-2">Reason: {apt.reasonForVisit}</p>
                         </div>
                         <div className="flex flex-col items-start sm:items-end gap-2">
                           <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>{apt.status}</span>
                           {['Pending', 'Approved'].includes(apt.status) && (
                             <button onClick={() => handleCancel(apt._id)} className="text-xs text-red-500 hover:underline mt-2">Cancel Appointment</button>
                           )}
                         </div>
                       </div>
                     ))}
                   </div>
                 )
               )}

               {activeTab === 'records' && (
                 records.length === 0 ? (
                   <div className="p-8 text-center text-slate-500 h-full flex flex-col items-center justify-center">
                     <Activity size={48} className="text-slate-300 mb-4" />
                     <p>No medical records found.</p>
                   </div>
                 ) : (
                   <div className="divide-y divide-slate-100 dark:divide-slate-800 p-4 space-y-4">
                     {records.slice().reverse().map(rec => (
                       <div key={rec._id} className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-lg border border-slate-100 dark:border-slate-800">
                         <div className="flex justify-between items-start mb-4">
                           <div>
                             <h4 className="font-bold text-lg text-primary-600">{rec.diagnosis}</h4>
                             <p className="text-sm text-slate-500">Diagnosed by Dr. {rec.doctor?.name}</p>
                           </div>
                           <span className="text-xs text-slate-400">{formatDate(rec.createdAt)}</span>
                         </div>
                         <div className="space-y-3">
                           <div>
                             <h5 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Treatment Plan</h5>
                             <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{rec.treatment}</p>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 )
               )}

               {activeTab === 'prescriptions' && (
                 prescriptions.length === 0 ? (
                   <div className="p-8 text-center text-slate-500 h-full flex flex-col items-center justify-center">
                     <Pill size={48} className="text-slate-300 mb-4" />
                     <p>No prescriptions found.</p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 gap-4 p-4">
                     {prescriptions.slice().reverse().map(rx => (
                       <div key={rx._id} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                         <div className="bg-slate-100 dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                           <div className="flex items-center gap-2">
                             <Pill className="text-emerald-500" size={20} />
                             <span className="font-bold">Prescription Ticket</span>
                           </div>
                           <div className="text-right">
                             <p className="text-xs font-medium">Dr. {rx.doctor?.name}</p>
                             <p className="text-xs text-slate-500">{formatDate(rx.createdAt)}</p>
                           </div>
                         </div>
                         <div className="p-4 bg-white dark:bg-dark-card">
                           <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                             {rx.medications.map((med, idx) => (
                               <li key={idx} className="py-3">
                                 <p className="font-bold">{med.name} <span className="font-normal text-slate-500 text-sm ml-2">{med.dosage}</span></p>
                                 <p className="text-sm text-slate-600">{med.instructions} • {med.duration}</p>
                               </li>
                             ))}
                           </ul>
                         </div>
                       </div>
                     ))}
                   </div>
                 )
               )}

               {activeTab === 'billing' && (
                 invoices.length === 0 ? (
                   <div className="p-8 text-center text-slate-500 h-full flex flex-col items-center justify-center">
                     <CreditCard size={48} className="text-slate-300 mb-4" />
                     <p>You have no invoices.</p>
                   </div>
                 ) : (
                   <div className="p-4 space-y-4">
                     {invoices.slice().reverse().map(inv => (
                       <div key={inv._id} className={`p-5 rounded-xl border flex flex-col sm:flex-row justify-between items-center gap-4 ${inv.status === 'Paid' ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-200 bg-white dark:bg-slate-800'}`}>
                         <div>
                           <div className="flex items-center gap-2 mb-1">
                             <h4 className="font-bold text-lg">₹{inv.amount.toFixed(2)}</h4>
                             <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{inv.status}</span>
                           </div>
                           <p className="font-medium text-slate-700 dark:text-slate-300">{inv.description}</p>
                           <p className="text-sm text-slate-500">Dr. {inv.doctor?.name} • {formatDate(inv.createdAt)}</p>
                         </div>
                         
                         <div>
                           {inv.status === 'Pending' ? (
                             <button onClick={() => initiatePayment(inv._id)} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm">
                               <CreditCard size={18} /> Pay Now
                             </button>
                           ) : (
                             <div className="flex items-center gap-2 text-emerald-600 font-medium px-4 py-2">
                               <CheckCircle size={20} /> Paid
                             </div>
                           )}
                         </div>
                       </div>
                     ))}
                   </div>
                 )
               )}

               {activeTab === 'rxreader' && (
                 <div className="p-5">
                   <div className="flex items-center gap-3 mb-5">
                     <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg text-violet-600 dark:text-violet-400">
                       <ScanLine size={22} />
                     </div>
                     <div>
                       <h3 className="font-bold text-slate-800 dark:text-white">AI Prescription Reader</h3>
                       <p className="text-xs text-slate-500">Upload a handwritten prescription image to get a clear, readable version</p>
                     </div>
                   </div>
                   {!rxAnalysis ? (
                     <div className="space-y-4">
                       <label className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${rxPreview ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/10 p-3' : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/10 p-10'}`}>
                         {rxPreview ? (
                           <div className="w-full">
                             <img src={rxPreview} alt="Prescription preview" className="w-full max-h-72 object-contain rounded-lg" />
                             <p className="text-center text-xs text-violet-600 font-medium mt-2">{rxFile?.name}</p>
                           </div>
                         ) : (
                           <div className="flex flex-col items-center gap-2 text-slate-500">
                             <FileImage size={40} className="text-slate-300" />
                             <p className="font-semibold text-sm">Click or drag & drop prescription image</p>
                             <p className="text-xs">JPG, PNG, WEBP up to 10MB</p>
                           </div>
                         )}
                         <input type="file" accept="image/*" onChange={handleRxFileChange} className="hidden" />
                       </label>
                       {rxError && (
                         <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 text-sm">{rxError}</div>
                       )}
                       <div className="flex gap-3">
                         {rxFile && (
                           <button onClick={resetRxReader} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors">
                             <RefreshCw size={14} /> Reset
                           </button>
                         )}
                         <button onClick={handleAnalyzePrescription} disabled={!rxFile || rxLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors">
                           {rxLoading ? (<><Loader2 size={16} className="animate-spin" /> Analyzing with AI...</>) : (<><Upload size={16} /> Analyze Prescription</>)}
                         </button>
                       </div>
                       {rxLoading && (
                         <div className="p-4 bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-800 rounded-xl">
                           <div className="flex items-center gap-3">
                             <Loader2 size={20} className="text-violet-500 animate-spin flex-shrink-0" />
                             <div>
                               <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">AI is reading your prescription...</p>
                               <p className="text-xs text-violet-500 mt-0.5">This may take 5–15 seconds</p>
                             </div>
                           </div>
                           <div className="mt-3 bg-violet-200 dark:bg-violet-800 rounded-full h-1.5 overflow-hidden">
                             <div className="h-full bg-violet-500 rounded-full animate-pulse w-2/3"></div>
                           </div>
                         </div>
                       )}
                     </div>
                   ) : (
                     <div className="space-y-4">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <CheckCircle size={18} className="text-emerald-500" />
                           <span className="text-sm font-semibold text-emerald-600">Analysis Complete</span>
                         </div>
                         <button onClick={resetRxReader} className="flex items-center gap-1.5 text-xs text-violet-600 font-medium px-3 py-1.5 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors">
                           <RefreshCw size={12} /> Scan Another
                         </button>
                       </div>
                       {rxPreview && (
                         <div className="flex gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                           <img src={rxPreview} alt="Original prescription" className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
                           <div>
                             <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Original Image</p>
                             <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">{rxFile?.name}</p>
                             <p className="text-xs text-slate-400 mt-0.5">{(rxFile?.size / 1024).toFixed(1)} KB</p>
                           </div>
                         </div>
                       )}
                       <div className="bg-white dark:bg-slate-900 border border-violet-200 dark:border-violet-800 rounded-xl p-5 shadow-sm">
                         <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                           <ScanLine size={16} className="text-violet-500" />
                           <h4 className="font-bold text-slate-800 dark:text-white text-sm">Prescription Analysis</h4>
                           <span className="ml-auto text-xs bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full font-medium">Powered by Gemini AI</span>
                         </div>
                         <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
                           {renderAnalysis(rxAnalysis)}
                         </div>
                       </div>
                       <p className="text-xs text-slate-400 text-center">⚠️ This is an AI-generated interpretation. Always consult your doctor for medical decisions.</p>
                     </div>
                   )}
                 </div>
               )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
