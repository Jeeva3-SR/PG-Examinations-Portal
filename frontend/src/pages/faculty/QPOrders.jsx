import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import useAuthStore from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  AlertCircle, 
  FolderOpen 
} from 'lucide-react';

const QPOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const facultyId = useAuthStore.getState().user?.facultyId;
        if (!facultyId) {
          navigate('/faculty/login');
          return;
        }

        const response = await api.get(`/api/qporders/${facultyId}`);
        setOrders(response.data);
        setLoading(false); // Fixed from loading(false)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch QP Orders');
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-2 max-w-xl mx-auto text-left">
        <AlertCircle size={16} /> <span className="text-sm font-medium">{error}</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 text-left relative">
      
      {/* Top Main Section Header Module */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assigned Question Paper Orders</h1>
        <p className="text-slate-500 text-sm mt-0.5">Review validation data logs and access real-time system documents.</p>
      </div>

      {/* Main Core Records Card Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm font-medium flex flex-col items-center gap-2">
              <FolderOpen size={24} className="text-slate-300" />
              <span>No active question paper orders assigned to your profile.</span>
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Course Details</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Exam Variant</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Issued Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/40 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-mono text-xs font-bold mt-0.5 flex-shrink-0">
                          <BookOpen size={14} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 font-mono">{order.courseCode}</div>
                          <div className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">{order.courseName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-[10px] font-mono font-black tracking-wider px-2.5 py-0.5 rounded-full border ${
                        order.type?.toLowerCase() === 'regular' 
                          ? 'bg-blue-50 text-blue-700 border-blue-100' 
                          : 'bg-purple-50 text-purple-700 border-purple-100'
                      }`}>
                        {order.type ? order.type.toUpperCase() : 'REGULAR'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5 text-slate-600 text-sm">
                        <Clock size={13} className="text-slate-400" />
                        <span>{order.generatedAt ? new Date(order.generatedAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};

export default QPOrders;