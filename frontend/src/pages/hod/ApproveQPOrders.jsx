import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  User, 
  AlertCircle, 
  XCircle, 
  Eye, 
  Check, 
  X,
  FolderOpen,
  FileText
} from 'lucide-react';

const ApproveQPOrders = () => {
  const [orders, setOrders] = useState([]);
  const [assignedQPSetters, setAssignedQPSetters] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState('');

  // Control States for the Advanced PDF Viewer Modal Popup
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ordersRes, settersRes] = await Promise.all([
          axios.get('/api/qporders'),
          axios.get('/api/assigned-qpsetters').catch(() => ({ data: [] }))
        ]);
        
        setOrders(ordersRes.data);
        setAssignedQPSetters(settersRes.data);
        setError(null);
      } catch (err) {
        console.error('Error loading master logs:', err);
        setError('Failed to fetch operational configurations from the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrders(orders.map(order => order._id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  // High-fidelity jsPDF Document compiler with safe string encoding values
// High-fidelity jsPDF Document compiler with safe string encoding values
  const generatePdfBlobUrl = (order) => {
    const doc = new jsPDF();
    const courseData = order.courseCode || {};
    
    const facultyName = order.facultyName || 'Assigned Faculty';
    const courseCode = courseData.courseCode || order.courseCode || 'N/A';
    const courseName = courseData.courseName || order.courseName || 'Unnamed Subject';
    const specialization = order.specialization || 'CSE';
    const regulation = order.regulation || '2023';
    const examMonth = order.examMonth || 'JUNE 2026';
    const lastDateToSubmit = order.lastDateToSubmit || new Date();
    const type = order.type || 'regular';

    doc.setFont('times', 'normal');

    // Headers & Institutional Headings
    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    doc.text('DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING', 105, 18, { align: 'center' });
    doc.text('COLLEGE OF ENGINEERING, GUINDY CAMPUS', 105, 25, { align: 'center' });
    doc.text('ANNA UNIVERSITY:: CHENNAI - 600 025.', 105, 32, { align: 'center' });
    doc.setFontSize(11);
    doc.text(`PG (FT) & Ph.D ${type.toUpperCase()} EXAMINATIONS – ${examMonth.toUpperCase()}`, 105, 42, { align: 'center' });

    doc.setFont('times', 'normal');
    doc.text(`Date: ${new Date().toLocaleDateString('en-GB').replace(/\//g, '.')}`, 185, 52, { align: 'right' });

    doc.text('To', 14, 62);
    doc.setFont('times', 'bold');
    doc.text(facultyName, 24, 72);
    doc.setFont('times', 'normal');
    doc.text('Department of Computer Science and Engineering,', 24, 79);
    doc.text('CEG Campus,', 24, 86);
    doc.text('Anna University, Chennai 600 025.', 24, 93);

    doc.text('Sir/Madam,', 14, 105);
    doc.setFont('times', 'bold');
    doc.text('Sub:', 25, 115);
    doc.setFont('times', 'normal');
    doc.text(`PG (FT) – ${type.charAt(0).toUpperCase() + type.slice(1)} Examination ${examMonth.toUpperCase()} – Appointment of`, 35, 115);
    doc.text('Question Paper Setter – Reg.', 35, 122);

    const bodyText1 = `It is informed that, you are appointed as Question Paper Setter for the Examinations to be held in ${examMonth.toUpperCase()} for the subject whose details are given below:`;
    doc.text(bodyText1, 14, 135, { maxWidth: 180 });

    // Table 1: Course Criteria
    autoTable(doc, {
      startY: 145,
      theme: 'grid',
      styles: { lineColor: [0,0,0], lineWidth: 0.1, fontSize: 10, cellPadding: 2, font: 'times' },
      head: [['DEGREE', 'BRANCH', 'DURATION', 'MAX. MARKS', 'REGULATION']],
      body: [['M.E.', specialization, '3 Hrs.', '100', regulation]],
      headStyles: { fillColor: [230,230,230], textColor: [0,0,0], fontStyle: 'bold', halign: 'center' },
      bodyStyles: { halign: 'center' },
    });
    
    // Table 2: Allocation Matrix
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 5,
      theme: 'grid',
      styles: { lineColor: [0,0,0], lineWidth: 0.1, font: 'times' },
      head: [['Sl.No', 'Subject Code and Subject Title', type.toLowerCase() === 'regular' ? 'Last Date to submit the Question Paper' : 'Total copies / Last Submission Date']],
      body: [[
        '1.', 
        `${courseCode} - ${courseName}`, 
        type.toLowerCase() === 'regular' 
          ? new Date(lastDateToSubmit).toLocaleDateString('en-GB').replace(/\//g, '.')
          : `50 Copies / ${new Date(lastDateToSubmit).toLocaleDateString('en-GB').replace(/\//g, '.')}`
      ]],
      headStyles: { fillColor: [230,230,230], textColor: [0,0,0], fontStyle: 'bold', halign: 'center', fontSize: 10 },
      bodyStyles: { halign: 'center', fontSize: 10 },
    });

    // Closures
    const bodyText2 = `You are requested to prepare the question paper with required number of copies, securely sealed in a cover, along with two additional copies placed in a separate sealed cover, and hand over both the covers to Dr. C. Valliyammai, Professor, Chief Superintendent (P.G. Examinations), in the Department of Computer Science and Engineering.`;
    const bodyText3 = `Your kind cooperation is requested for the smooth and successful conduct of examination as per schedule.`;
    
    let finalY = doc.lastAutoTable.finalY;
    doc.setFontSize(11);
    doc.text(bodyText2, 14, finalY + 12, { maxWidth: 180 });
    doc.text(bodyText3, 14, finalY + 38, { maxWidth: 180 });

    // ========================================================
    // COMPACT GOVERNMENT STYLE DIGITAL VERIFICATION BOX (FIXED)
    // ========================================================
    const boxWidth = 54;
    const boxHeight = 15;
    const boxX = 14;
    const boxY = finalY + 55;

    if (order.status === 'Approved') {
      doc.setDrawColor(16, 185, 129); // Emerald Green
      doc.setFillColor(240, 253, 250); // Light Mint background
      doc.setLineWidth(0.2);
      doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 1, 1, 'FD');

      // FIXED: Draw Checkmark using vector path lines to prevent character corruption
      doc.setDrawColor(5, 150, 105);
      doc.setLineWidth(0.6);
      doc.line(boxX + 3, boxY + 7.5, boxX + 4.5, boxY + 9.5); // Short downward stroke
      doc.line(boxX + 4.5, boxY + 9.5, boxX + 7.5, boxY + 5.5); // Long upward stroke

      // Metadata Text
      doc.setFont('times', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text('Digitally Approved & Verified by', boxX + 10, boxY + 6);
      doc.setFont('times', 'bold');
      doc.text('Head of the Department, CSE', boxX + 10, boxY + 10);
    } else {
      doc.setDrawColor(217, 119, 6); // Amber Gold
      doc.setFillColor(255, 251, 235); // Amber tint background
      doc.setLineWidth(0.2);
      doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 1, 1, 'FD');

      // Question Mark (Safe standard character)
      doc.setFont('times', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(217, 119, 6);
      doc.text('?', boxX + 4, boxY + 8.5);

      // Metadata Text
      doc.setFont('times', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text('Pending Verification:', boxX + 10, boxY + 6);
      doc.setFont('times', 'italic');
      doc.setTextColor(100, 116, 139);
      doc.text('Awaiting HOD Digital Clearance', boxX + 10, boxY + 10);
    }

    // Reset baseline styling colors
    doc.setTextColor(0, 0, 0);
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.text('Head of the department', 185, finalY + 70, { align: 'right' });

    return doc.output('bloburl');
  };

  const handleOpenViewer = (order) => {
    const url = generatePdfBlobUrl(order);
    setPreviewPdfUrl(url);
    setActiveOrder(order);
  };

  const handleCloseViewer = () => {
    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl);
    }
    setPreviewPdfUrl(null);
    setActiveOrder(null);
  };

  const handleUpdateStatus = async (orderId, targetStatus) => {
    try {
      const response = await axios.patch(`/api/qporders/${orderId}/status`, {
        status: targetStatus
      });
      
      const updatedData = response.data;
      setOrders(prev => prev.map(order => (order._id === orderId ? updatedData : order)));
      
      // Fluid update layout adjustments if looking at an active frame modal
      if (activeOrder && activeOrder._id === orderId) {
        const nextUrl = generatePdfBlobUrl(updatedData);
        if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl);
        setPreviewPdfUrl(nextUrl);
        setActiveOrder(updatedData);
      }
      
      showToast(`✅ Order status updated to ${targetStatus}`);
    } catch (err) {
      console.error(err);
      showToast('❌ Failed to update status parameters');
    }
  };

  const handleBulkAction = async (targetStatus) => {
    if (selectedOrders.length === 0) return;
    try {
      await axios.post('/api/qporders/bulk-status', {
        orderIds: selectedOrders,
        status: targetStatus
      });
      setOrders(prev =>
        prev.map(order => selectedOrders.includes(order._id) ? { ...order, status: targetStatus } : order)
      );
      setSelectedOrders([]);
      showToast(`⚡ Batch process set to ${targetStatus}`);
    } catch (err) {
      console.error(err);
      showToast('❌ Bulk operation failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-2 max-w-xl mx-auto">
        <AlertCircle size={16} /> <span className="text-sm font-medium">{error}</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left relative">
      
      {/* Toast Notification Bar */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }} 
            animate={{ opacity: 1, y: 0, x: '-50%' }} 
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-4 left-1/2 z-50 bg-slate-900 border border-slate-800 text-slate-100 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold tracking-wide"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Module */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Question Paper Authorizations</h1>
          <p className="text-slate-500 text-sm mt-0.5">Review validation criteria, verify layouts, and manage system assignments.</p>
        </div>

        {selectedOrders.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 bg-slate-100 border border-slate-200 p-1.5 rounded-xl self-start sm:self-auto"
          >
            <span className="text-xs font-bold px-2 text-slate-500 font-mono">{selectedOrders.length} Chosen</span>
            <button
              onClick={() => handleBulkAction('Approved')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-2 rounded-lg transition-all flex items-center gap-1 shadow-xs"
            >
              <Check size={13} /> Approve
            </button>
            <button
              onClick={() => handleBulkAction('Rejected')}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3 py-2 rounded-lg transition-all flex items-center gap-1 shadow-xs"
            >
              <X size={13} /> Reject
            </button>
          </motion.div>
        )}
      </div>

      {/* Records Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm font-medium flex flex-col items-center gap-2">
              <FolderOpen size={24} className="text-slate-300" />
              <span>No registered question paper records found inside operational database.</span>
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60">
                  <th className="w-12 px-6 py-4">
                    <input
                      type="checkbox"
                      className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-4 h-4 cursor-pointer"
                      onChange={handleSelectAll}
                      checked={selectedOrders.length === orders.length && orders.length > 0}
                    />
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Subject Details</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Assigned Faculty</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Exam Type</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Authorization State</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const courseData = order.courseCode || {};
                  const isApproved = order.status === 'Approved';
                  const isRejected = order.status === 'Rejected';
                  const isChecked = selectedOrders.includes(order._id);
                  const backupAssignment = assignedQPSetters.find(a => a.subject === (courseData.courseName || order.courseName));

                  return (
                    <motion.tr 
                      key={order._id} 
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`transition-colors duration-150 ${isChecked ? 'bg-indigo-50/30' : 'hover:bg-slate-50/50'}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-4 h-4 cursor-pointer"
                          checked={isChecked}
                          onChange={() => handleSelectOrder(order._id)}
                        />
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-mono text-xs font-bold mt-0.5 flex-shrink-0">
                            <BookOpen size={14} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 font-mono">
                              {courseData.courseCode || order.courseCode || 'N/A'}
                            </div>
                            <div className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
                              {courseData.courseName || order.courseName || 'Unnamed Subject Frame'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                            <User size={12} />
                          </div>
                          <span className="text-sm font-semibold text-slate-700">
                            {order.facultyName || (backupAssignment ? backupAssignment.facultyName : `ID: ${order.facultyId || '—'}`)}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-[10px] font-mono font-black tracking-wider px-2 py-0.5 rounded-full border ${
                          order.type === 'regular' 
                            ? 'bg-blue-50 text-blue-700 border-blue-100' 
                            : 'bg-purple-50 text-purple-700 border-purple-100'
                        }`}>
                          {order.type ? order.type.toUpperCase() : 'REGULAR'}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <CheckCircle2 size={12} />
                            <span>Approved</span>
                          </span>
                        ) : isRejected ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100">
                            <XCircle size={12} />
                            <span>Rejected</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100 animate-pulse">
                            <Clock size={12} />
                            <span>{order.status || 'Pending'}</span>
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenViewer(order)}
                            title="Open Real-time PDF Workspace"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-indigo-100 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-600 hover:text-white transition shadow-2xs font-bold text-xs"
                          >
                            <Eye size={13} /> <span>View PDF</span>
                          </button>

                          {!isApproved && !isRejected ? (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(order._id, 'Approved')}
                                className="p-1.5 rounded-lg border border-emerald-200 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-600 hover:text-white transition-all active:scale-95"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(order._id, 'Rejected')}
                                className="p-1.5 rounded-lg border border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                              >
                                <X size={14} />
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] font-bold text-slate-400 px-1 select-none font-mono">Locked</span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* COMPACT CENTERED MODAL POPUP VIEWPORT                    */}
      {/* ======================================================== */}
      <AnimatePresence>
        {previewPdfUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            
            {/* Soft Backdrop Overlay Mask */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseViewer}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Main Centered Document Frame */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', duration: 0.35 }}
              className="relative w-full max-w-4xl bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col h-[85vh] text-slate-800 z-10"
            >
              {/* Header Interface Controls Bar */}
              <div className="p-5 border-b border-slate-200 bg-white sticky top-0 flex items-center justify-between z-10 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                    <FileText size={16} />
                  </div>
              
                </div>
                
                <button
                  onClick={handleCloseViewer}
                  className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Responsive Embedded IFrame Viewer Canvas Area */}
              <div className="flex-1 w-full bg-slate-100 relative">
                <iframe
                  src={previewPdfUrl}
                  title="PDF Document Viewport Stage"
                  className="w-full h-full border-none rounded-b-xl"
                  type="application/pdf"
                />
              </div>

              {/* Action operations strip if order is currently pending verification */}
              {activeOrder && activeOrder.status !== 'Approved' && activeOrder.status !== 'Rejected' && (
                <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-end gap-2 shadow-xs">
                  <button
                    onClick={() => { handleUpdateStatus(activeOrder._id, 'Rejected'); }}
                    className="bg-white hover:bg-slate-50 text-rose-600 border border-slate-200 font-semibold text-xs px-4 py-2 rounded-xl transition shadow-2xs"
                  >
                    Deny Authorization
                  </button>
                  <button
                    onClick={() => { handleUpdateStatus(activeOrder._id, 'Approved'); }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition shadow-md shadow-indigo-600/10"
                  >
                    Grant Clearance
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ApproveQPOrders;