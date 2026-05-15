import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CreditCard, FileText, Download, CheckCircle, Clock } from 'lucide-react';

const Billing = () => {
  const { token } = useContext(AuthContext);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await axios.get('/billing/invoices', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInvoices(res.data.data);
      } catch (error) {
        console.error('Failed to fetch invoices:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [token]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-2">Billing & Invoices</h1>
          <p className="text-slate-500">Manage patient billing, payments, and financial records.</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-md shadow-primary-500/20 transition-all hover:-translate-y-0.5 flex items-center gap-2">
          <FileText size={18} /> Create Invoice
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Invoice ID</th>
                <th className="p-4 font-semibold">Patient</th>
                <th className="p-4 font-semibold">Description</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-500">Loading invoices...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-500">No invoices generated yet.</td></tr>
              ) : (
                invoices.map((invoice) => (
                  <motion.tr key={invoice._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-sm font-medium text-slate-500">
                      #{invoice._id.substring(0, 8).toUpperCase()}
                      <div className="text-xs text-slate-400 mt-1">{new Date(invoice.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-800">{invoice.patient?.name || 'Unknown'}</td>
                    <td className="p-4 text-sm text-slate-600">{invoice.description}</td>
                    <td className="p-4 font-bold text-slate-800">{formatCurrency(invoice.amount)}</td>
                    <td className="p-4">
                      {invoice.status === 'Paid' ? (
                        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1 w-max">
                          <CheckCircle size={12}/> Paid
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1 w-max">
                          <Clock size={12}/> Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Download PDF">
                        <Download size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="View Details">
                        <FileText size={18} />
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

export default Billing;
