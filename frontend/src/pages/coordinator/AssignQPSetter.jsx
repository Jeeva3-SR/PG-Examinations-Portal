import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { m, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BookOpen, User, Eye, X, FileText, AlertCircle } from 'lucide-react';

const AssignQPSetter = () => {
  const [courses, setCourses] = useState([]);
  const [allFaculty, setAllFaculty] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAssigned, setIsAssigned] = useState(false);
  const [assignedRows, setAssignedRows] = useState(() => {
    const saved = sessionStorage.getItem('assignedRows');
    return saved ? JSON.parse(saved) : [];
  });
  const [generatingRow, setGeneratingRow] = useState(null);
  const [qpOrders, setQpOrders] = useState([]);

  // States for PDF Modal view context
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);

  // Fetch courses and faculty on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, facultyRes, qpRes] = await Promise.all([
          api.get('/api/courses'),
          api.get('/api/faculty'),
          api.get('/api/qporders'),
        ]);
        setCourses(coursesRes.data);
        setAllFaculty(facultyRes.data);
        setQpOrders(qpRes.data);
      } catch (error) {
        setError('Error fetching master logs configuration data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Show all faculty when subject is selected
  useEffect(() => {
    if (!selectedSubject) {
      setFaculty([]);
      return;
    }
    setFaculty(allFaculty);
  }, [selectedSubject, allFaculty]);

  const handleAssign = async () => {
    if (!selectedSubject || !selectedFaculty) {
      setError('Please select both subject and faculty');
      return;
    }

    try {
      const selectedFacultyData = faculty.find(f => f.facultyId === selectedFaculty);
      await api.post('/api/assigned-qpsetters', {
        subject: selectedSubject,
        facultyId: selectedFacultyData.facultyId,
        facultyName: selectedFacultyData.name
      });
      const selectedCourse = courses.find(c => c.courseName === selectedSubject);
      setSuccess('Faculty assigned successfully');
      setIsAssigned(false);
      setAssignedRows(prev => [
        ...prev,
        {
          courseName: selectedSubject,
          courseCode: selectedCourse?.courseCode || '',
          facultyName: selectedFacultyData.name,
          facultyId: selectedFacultyData.facultyId,
          generatedType: null
        }
      ]);
      setSelectedSubject('');
      setSelectedFaculty('');
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Error assigning faculty');
      setSuccess('');
      setIsAssigned(false);
    }
  };

  const handleGenerateOrder = async (type, rowIdx) => {
    const row = assignedRows[rowIdx];
    if (!row.courseName || !row.facultyId) {
      setError('Missing course or faculty parameters');
      return;
    }
    setGeneratingRow(rowIdx);
    try {
      setError('');
      setSuccess('');
      await api.post('/api/qporders/generate', {
        facultyId: row.facultyId,
        courseCode: row.courseCode,
        courseName: row.courseName,
        type
      });
      setSuccess(`Successfully generated ${type} QP Order`);
      setAssignedRows(prev => prev.map((r, i) =>
        i === rowIdx ? { ...r, generatedType: type } : r
      ));
      setGeneratingRow(null);
      
      const qpRes = await api.get('/api/qporders');
      setQpOrders(qpRes.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to generate QP Order');
      setGeneratingRow(null);
    }
  };

  // Requested Strict Institutional Document Generator Engine
  const generatePdfBlobUrl = (row, orderDetail) => {
    const doc = new jsPDF();
    
    const facultyName = row.facultyName || 'Assigned Faculty';
    const courseCode = row.courseCode || 'N/A';
    const courseName = row.courseName || 'Unnamed Subject';
    const specialization = orderDetail?.specialization || 'CSE';
    const regulation = orderDetail?.regulation || '2023';
    const examMonth = orderDetail?.examMonth || 'JUNE 2026';
    const lastDateToSubmit = orderDetail?.lastDateToSubmit || new Date();
    const type = orderDetail?.type || row.generatedType || 'regular';

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

    doc.setTextColor(0, 0, 0);
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.text('Head of the department', 185, finalY + 65, { align: 'right' });

    return doc.output('bloburl');
  };

  const handleOpenViewer = (row) => {
    const qpOrder = getQpOrderForRow(row);
    const url = generatePdfBlobUrl(row, qpOrder);
    setPreviewPdfUrl(url);
  };

  const handleCloseViewer = () => {
    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl);
    }
    setPreviewPdfUrl(null);
  };

  useEffect(() => {
    setIsAssigned(false);
  }, [selectedSubject, selectedFaculty]);

  useEffect(() => {
    sessionStorage.setItem('assignedRows', JSON.stringify(assignedRows));
  }, [assignedRows]);

  const getQpOrderForRow = (row) => {
    return qpOrders.find(
      (order) =>
        order.facultyId === row.facultyId &&
        order.courseName === row.courseName
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 text-left relative">
      <m.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 mb-8 transition-all duration-300 hover:shadow-md"
      >
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
          Assign QP Setters
        </h1>
        <p className="text-xs text-slate-400 mb-6">Allocate courses to department faculties and initialize structured authorization workflows.</p>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2 mb-4">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2 mb-4">
            <span>✅ {success}</span>
          </div>
        )}

        <div className="space-y-5">
          {/* Subject Dropdown */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
              Select Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all"
              disabled={isAssigned}
            >
              <option value="">Select a subject</option>
              {courses.map((c) => (
                <option key={c._id} value={c.courseName}>
                  {c.courseCode} - {c.courseName}
                </option>
              ))}
            </select>
          </div>

          {/* Faculty Dropdown */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
              Select Faculty
            </label>
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="w-full px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all"
              disabled={!selectedSubject || isAssigned}
            >
              <option value="">Select a faculty member</option>
              {faculty.map((f) => (
                <option key={f.facultyId} value={f.facultyId}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            <button
              onClick={handleAssign}
              disabled={!selectedSubject || !selectedFaculty}
              className={`w-full px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all shadow-sm ${
                !selectedSubject || !selectedFaculty
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10'
              }`}
            >
              Assign Faculty Member
            </button>
          </div>

          {/* Assigned QP Setters Table */}
          {assignedRows.length > 0 && (
            <div className="mt-10 pt-4 border-t border-slate-100">
              <h2 className="text-base font-bold text-slate-900 tracking-tight mb-4">Active Workspace Assignments</h2>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left table-fixed">
                    <colgroup>
                      <col style={{ width: '42%' }} />
                      <col style={{ width: '28%' }} />
                      <col style={{ width: '30%' }} />
                    </colgroup>
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/60">
                        <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Course Matrix Details</th>
                        <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Assigned Faculty</th>
                        <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {assignedRows.map((row, idx) => {
                        const qpOrder = getQpOrderForRow(row);
                        return (
                          <tr key={row._id || `assigned-${row.courseName}-${idx}`} className="hover:bg-slate-50/40 transition-colors duration-150">
                            <td className="px-6 py-4">
                              <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-mono text-xs font-bold mt-0.5 flex-shrink-0">
                                  <BookOpen size={14} />
                                </div>
                                <div>
                                  <span className="inline-block text-[10px] font-mono font-black tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 mb-1">
                                    {row.courseCode}
                                  </span>
                                  <div className="font-bold text-slate-900 line-clamp-1">{row.courseName}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2.5">
                                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                                  <User size={11} />
                                </div>
                                <span className="font-semibold text-slate-700 truncate">{row.facultyName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2">
                                {qpOrder && qpOrder.type ? (
                                  <span className="text-[10px] font-mono font-black tracking-wider px-2.5 py-1 rounded-lg border bg-slate-50 text-slate-600 border-slate-200 uppercase">
                                    letter Generated
                                  </span>
                                ) : row.generatedType ? (
                                  <span className="text-[10px] font-mono font-black tracking-wider px-2.5 py-1 rounded-lg border bg-slate-50 text-slate-600 border-slate-200 uppercase">
                                    {row.generatedType} Document Generated
                                  </span>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleGenerateOrder('regular', idx)}
                                      disabled={generatingRow === idx}
                                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 text-[11px] transition shadow-xs shadow-emerald-600/10"
                                    >
                                      Generate Regular
                                    </button>
                                    <button
                                      onClick={() => handleGenerateOrder('arrear', idx)}
                                      disabled={generatingRow === idx}
                                      className="px-2.5 py-1.5 rounded-lg bg-amber-500 text-white font-bold hover:bg-amber-600 text-[11px] transition shadow-xs shadow-amber-500/10"
                                    >
                                      Generate Arrear
                                    </button>
                                  </>
                                )}

                                {/* View PDF Action Element Block */}
                                {(qpOrder || row.generatedType) && (
                                  <button
                                    onClick={() => handleOpenViewer(row)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-indigo-100 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-600 hover:text-white transition font-bold text-[11px]"
                                  >
                                    <Eye size={12} /> <span>View PDF</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </m.div>

      {/* PDF Frame Modal Viewer Stage */}
      <AnimatePresence>
        {previewPdfUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <m.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseViewer}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <m.div 
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', duration: 0.35 }}
              className="relative w-full max-w-4xl bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col h-[85vh] text-slate-800 z-10"
            >
              <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2 text-indigo-600">
                  <FileText size={15} />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800">Question Paper Order</span>
                </div>
                <button
                  onClick={handleCloseViewer}
                  className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 transition"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex-1 w-full bg-slate-100">
                <iframe
                  src={previewPdfUrl}
                  title="PDF Assignment Viewer Portal"
                  className="w-full h-full border-none rounded-b-2xl"
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

export default AssignQPSetter;