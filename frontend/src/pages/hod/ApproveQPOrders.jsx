import React, { useState } from 'react';
import { CheckCircle2, Clock, BookOpen, User } from 'lucide-react';

const ApproveQPOrders = () => {
  const [orders, setOrders] = useState([
    {
      id: 1,
      subjectCode: 'CS501',
      subjectName: 'Advanced Data Structures',
      facultyName: 'Dr. John Smith',
      status: 'Pending'
    },
    {
      id: 2,
      subjectCode: 'CS502',
      subjectName: 'Machine Learning',
      facultyName: 'Dr. Sarah Johnson',
      status: 'Pending'
    },
    {
      id: 3,
      subjectCode: 'CS503',
      subjectName: 'Cloud Computing',
      facultyName: 'Dr. Michael Brown',
      status: 'Pending'
    },
    {
      id: 4,
      subjectCode: 'CS504',
      subjectName: 'Big Data Analytics',
      facultyName: 'Dr. Emily Davis',
      status: 'Pending'
    }
  ]);

  const handleApprove = (orderId) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: 'Approved' }
        : order
    ));
  };

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      {/* Dynamic Module Section Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Question Paper Authorizations</h1>
        <p className="text-sm text-slate-500 mt-1">Review, validate, and issue official question paper compilation clearances for department courses.</p>
      </div>

      {/* Main Core Records Card Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Subject Details</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Assigned Faculty</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Authorization State</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/60 transition-colors duration-150">
                  {/* Subject Code & Name details */}
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-mono text-xs font-bold mt-0.5">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 font-mono">{order.subjectCode}</div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">{order.subjectName}</div>
                      </div>
                    </div>
                  </td>

                  {/* Faculty Assignment Meta Details */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{order.facultyName}</span>
                    </div>
                  </td>

                  {/* Clean Operational Pill Badges */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.status === 'Approved' ? (
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Clearance Issued</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100 animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Awaiting Action</span>
                      </span>
                    )}
                  </td>

                  {/* Interactive Commit Triggers */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {order.status === 'Pending' ? (
                      <button
                        onClick={() => handleApprove(order.id)}
                        className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm border border-indigo-100 active:scale-[0.97]"
                      >
                        Authorize Order
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400 pr-2">Logs Dispatched</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApproveQPOrders;