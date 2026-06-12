import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import useAuthStore from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  FileText, 
  Eye, 
  X, 
  BookOpen, 
  Clock, 
  AlertCircle, 
  FolderOpen 
} from 'lucide-react';

const QPOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coordinator, setCoordinator] = useState({ name: '', designation: '' });
  
  // Control States for the Advanced PDF Viewer Modal
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [activeCourseCode, setActiveCourseCode] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCoordinator = async () => {
      try {
        const res = await api.get('/api/coordinator');
        if (res.data) {
          setCoordinator({ name: res.data.name, designation: res.data.designation });
        }
      } catch (err) {
        setCoordinator({ name: 'Dr. C. Valliyammai', designation: 'Professor, Chief Superintendent (P.G. Examinations)' });
      }
    };

    const fetchOrders = async () => {
      try {
        const facultyId = useAuthStore.getState().user?.facultyId;
        if (!facultyId) {
          navigate('/faculty/login');
          return;
        }

        const response = await api.get(`/api/qporders/${facultyId}`);
        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch QP Orders');
        setLoading(false);
      }
    };

    fetchCoordinator();
    fetchOrders();
  }, [navigate]);

  // Core Document Generator Engine matching your exact PDF layout
  const generatePdfBlobUrl = (order) => {
    const doc = new jsPDF();
    const { 
      facultyName, courseCode, courseName, specialization, 
      regulation, examMonth, lastDateToSubmit, type, status 
    } = order;

    doc.setFont('times', 'normal');

    // Headers & Institutional Titles
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
      body: [['M.E.', specialization, '3 Hrs.', '100', regulation || '2023']],
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
    const bodyText2 = `You are requested to prepare the question paper with required number of copies, securely sealed in a cover, along with two additional copies placed in a separate sealed cover, and hand over both the covers to ${coordinator.name}, ${coordinator.designation}, in the Department of Computer Science and Engineering.`;
    const bodyText3 = `Your kind cooperation is requested for the smooth and successful conduct of examination as per schedule.`;
    
    let finalY = doc.lastAutoTable.finalY;
    doc.setFontSize(11);
    doc.text(bodyText2, 14, finalY + 12, { maxWidth: 180 });
    doc.text(bodyText3, 14, finalY + 38, { maxWidth: 180 });

    // ========================================================
    // COMPACT GOVERNMENT STYLE DIGITAL VERIFICATION BOX
    // ========================================================
    const boxWidth = 54;
    const boxHeight = 15;
    const boxX = 14;
    const boxY = finalY + 55;

    if (status === 'Approved') {
      doc.setDrawColor(16, 185, 129); // Emerald Green
      doc.setFillColor(240, 253, 250); // Light Mint background
      doc.setLineWidth(0.2);
      doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 1, 1, 'FD');

      // Draw Checkmark using clean vector paths
      doc.setDrawColor(5, 150, 105);
      doc.setLineWidth(0.6);
      doc.line(boxX + 3, boxY + 7.5, boxX + 4.5, boxY + 9.5); 
      doc.line(boxX + 4.5, boxY + 9.5, boxX + 7.5, boxY + 5.5); 

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

      // Question Mark Symbol
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

    doc.setTextColor(0, 0, 0);
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.text('Head of the department', 185, finalY + 70, { align: 'right' });

    // Output raw asset streaming blob targets
    return doc.output('bloburl');
  };

  const handleOpenViewer = (order) => {
    const url = generatePdfBlobUrl(order);
    setPreviewPdfUrl(url);
    setActiveCourseCode(order.courseCode || 'Document');
  };

  const handleCloseViewer = () => {
    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl); // Free memory spaces safely
    }
    setPreviewPdfUrl(null);
    setActiveCourseCode('');
  };

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
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Actions</th>
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
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => handleOpenViewer(order)}
                        className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-indigo-100 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-600 hover:text-white transition shadow-2xs font-bold text-xs"
                      >
                        <Eye size={13} /> <span>View Pdf</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* COMPACT INTERACTIVE PDF STREAM PORTAL VIEW OVERLAY       */}
      {/* ======================================================== */}
      <AnimatePresence>
        {previewPdfUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            
            {/* Backdrop Blur Mask */}
            <m.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseViewer}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Main Centered Box Panel */}
            <m.div 
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', duration: 0.35 }}
              className="relative w-full max-w-4xl bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col h-[85vh] text-slate-800 z-10"
            >
              {/* Header Module Toolbar controls */}
              <div className="p-4 border-b border-slate-200 bg-white sticky top-0 flex items-center justify-between z-10 shadow-xs">
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

            </m.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default QPOrders;