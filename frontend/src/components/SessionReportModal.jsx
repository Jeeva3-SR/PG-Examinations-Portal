import React, { useRef, useState, useMemo } from 'react';
import html2pdf from 'html2pdf.js';
import { useReactToPrint } from 'react-to-print';
import api from '../lib/api';
import useAuthStore from '../store/useAuthStore';

const REPORT_STATUS_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'completed', label: 'Completed' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'cancelled', label: 'Cancelled' },
];

const toDateInputValue = (isoDate) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const getTodayKey = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

const getDisplayStatus = (session) => {
  if (session.displayStatus) return session.displayStatus;
  if (session.status === 'cancelled') return 'cancelled';
  if (session.rescheduleType === 'prepone' || session.rescheduleType === 'postpone') return 'rescheduled';
  const sessionKey = toDateInputValue(session.date);
  const todayKey = getTodayKey();
  if (sessionKey && sessionKey < todayKey) return 'completed';
  return 'active';
};

const getStatusLabel = (session) => {
  const status = getDisplayStatus(session);
  if (status === 'cancelled') return 'Cancelled';
  if (status === 'rescheduled') return 'Postponed/Pre-poned';
  if (status === 'completed') return 'Completed';
  return 'Scheduled';
};

const formatReportDate = (isoDate) => {
  if (!isoDate) return '';
  return new Date(isoDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC',
  });
};

const formatTimestamp = () => new Date().toLocaleString('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

const checkboxCell = (checked) => (
  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{checked ? '☑' : '☐'}</span>
);

const filterSessionsForReport = (sessions, filterMode, statusFilter, dateFrom, dateTo) => {
  const todayKey = getTodayKey();

  return sessions.filter((session) => {
    if (filterMode === 'dateRange') {
      const key = toDateInputValue(session.date);
      if (!key) return false;
      if (dateFrom && key < dateFrom) return false;
      if (dateTo && key > dateTo) return false;
      return true;
    }

    const status = getDisplayStatus(session);
    const sessionKey = toDateInputValue(session.date);

    switch (statusFilter) {
      case 'completed':
        return status !== 'cancelled' && sessionKey && sessionKey < todayKey;
      case 'scheduled':
        return status !== 'cancelled' && sessionKey && sessionKey >= todayKey;
      case 'cancelled':
        return status === 'cancelled';
      case 'all':
      default:
        return true;
    }
  });
};

const SessionReportDocument = ({
  sessions,
  assignmentData,
  generatedByEmail,
  generatedAt,
  filterLabel,
}) => {
  const studentSessionIds = new Set(
    (assignmentData?.studentBySessionId || []).map((item) => item.sessionId)
  );
  const studentKeys = new Set(
    (assignmentData?.studentByKey || []).map((item) => item.key)
  );
  const dutySlots = new Set(assignmentData?.dutySlots || []);
  const seatingKeys = new Set(assignmentData?.seatingKeys || []);

  const rows = sessions.map((session, index) => {
    const dateKey = toDateInputValue(session.date);
    const sessionKey = `${dateKey}|${session.session}|${session.courseCode}`;
    const dutyKey = `${dateKey}|${session.session}`;
    const hasStudents = studentSessionIds.has(session._id)
      || studentKeys.has(sessionKey);
    const hasInvigilators = dutySlots.has(dutyKey);
    const hasSeating = seatingKeys.has(sessionKey);

    return {
      index: index + 1,
      session,
      hasStudents,
      hasInvigilators,
      hasSeating,
    };
  });

  return (
    <div
      className="session-report-document bg-white text-black p-8"
      style={{ fontFamily: 'Arial, Helvetica, sans-serif', width: '100%', maxWidth: '1100px', margin: '0 auto' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '12px' }}>
        <img src="/logo/aulogo.png" alt="Anna University" style={{ height: '72px', width: 'auto', objectFit: 'contain' }} />
        <div style={{ textAlign: 'center', flex: 1, padding: '0 16px' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '0.5px' }}>ANNA UNIVERSITY</div>
          <div style={{ fontSize: '16px', marginTop: '4px' }}>Chennai</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '12px', textDecoration: 'underline' }}>Report of Session</div>
          <div style={{ fontSize: '13px', marginTop: '8px' }}>{filterLabel}</div>
        </div>
        <img src="/logo/ceglogo.png" alt="CEG" style={{ height: '72px', width: 'auto', objectFit: 'contain' }} />
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginTop: '8px' }}>
        <thead>
          <tr>
            {['S.No', 'Date', 'Day', 'Session', 'Department', 'Course Code', 'Course Name', 'Specialization', 'Status', 'Students', 'Invigilators', 'Seating'].map((heading) => (
              <th
                key={heading}
                style={{
                  border: '1px solid #000',
                  padding: '6px 4px',
                  backgroundColor: '#f3f4f6',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={12} style={{ border: '1px solid #000', padding: '16px', textAlign: 'center' }}>
                No sessions found for the selected filter.
              </td>
            </tr>
          ) : (
            rows.map(({ index, session, hasStudents, hasInvigilators, hasSeating }) => (
              <tr key={session._id}>
                <td style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center' }}>{index}</td>
                <td style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center' }}>{formatReportDate(session.date)}</td>
                <td style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center' }}>{session.day}</td>
                <td style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center' }}>{session.session}</td>
                <td style={{ border: '1px solid #000', padding: '5px 4px' }}>{session.department || '—'}</td>
                <td style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center' }}>{session.courseCode}</td>
                <td style={{ border: '1px solid #000', padding: '5px 4px' }}>{session.courseName}</td>
                <td style={{ border: '1px solid #000', padding: '5px 4px' }}>{session.specialization}</td>
                <td style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center' }}>{getStatusLabel(session)}</td>
                <td style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center' }}>{checkboxCell(hasStudents)}</td>
                <td style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center' }}>{checkboxCell(hasInvigilators)}</td>
                <td style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center' }}>{checkboxCell(hasSeating)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div style={{ marginTop: '24px', borderTop: '1px solid #000', paddingTop: '12px', fontSize: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontWeight: 'bold' }}>Generated by:</div>
            <div>{generatedByEmail || '—'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold' }}>Report generated on:</div>
            <div>{generatedAt}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SessionReportModal = ({ isOpen, onClose, sessions }) => {
  const reportRef = useRef(null);
  const user = useAuthStore((state) => state.user);
  const [filterMode, setFilterMode] = useState('status');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [step, setStep] = useState('options');
  const [loading, setLoading] = useState(false);
  const [assignmentData, setAssignmentData] = useState(null);
  const [generatedAt, setGeneratedAt] = useState('');
  const [error, setError] = useState('');

  const generatedByEmail = user?.email || '';

  const filteredSessions = useMemo(
    () => filterSessionsForReport(sessions, filterMode, statusFilter, dateFrom, dateTo),
    [sessions, filterMode, statusFilter, dateFrom, dateTo]
  );

  const filterLabel = useMemo(() => {
    if (filterMode === 'dateRange') {
      if (dateFrom && dateTo) return `Date range: ${dateFrom} to ${dateTo}`;
      if (dateFrom) return `From date: ${dateFrom}`;
      if (dateTo) return `Up to date: ${dateTo}`;
      return 'Date range: All dates';
    }
    const option = REPORT_STATUS_OPTIONS.find((item) => item.id === statusFilter);
    return `Filter: ${option?.label || 'All'} sessions`;
  }, [filterMode, statusFilter, dateFrom, dateTo]);

  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: 'Report of Session',
    pageStyle: '@page { size: A4 landscape; margin: 12mm; }',
  });

  const prepareReport = async () => {
    if (filterMode === 'dateRange' && dateFrom && dateTo && dateFrom > dateTo) {
      setError('From date cannot be later than To date.');
      return false;
    }

    setLoading(true);
    setError('');
    try {
      try {
        const assignmentsRes = await api.get('/api/sessions/report/assignments');
        setAssignmentData(assignmentsRes.data);
      } catch (assignmentsErr) {
        setAssignmentData({
          studentBySessionId: [],
          studentByKey: [],
          dutySlots: [],
          seatingKeys: [],
        });
        setError('Assignment status could not be loaded. Report will show unchecked boxes for Students/Invigilators/Seating.');
        console.warn('Assignment data unavailable for report:', assignmentsErr);
      }

      setGeneratedAt(formatTimestamp());
      setStep('preview');
      return true;
    } catch (err) {
      setError('Failed to prepare report data. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    await prepareReport();
  };

  const handleDownloadPdf = async () => {
    if (step !== 'preview') {
      const ok = await prepareReport();
      if (!ok) return;
      setTimeout(() => downloadPdf(), 300);
      return;
    }
    downloadPdf();
  };

  const downloadPdf = () => {
    if (!reportRef.current) return;
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Session-Report-${new Date().toISOString().slice(0, 10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
    };
    html2pdf().from(reportRef.current).set(opt).save();
  };

  const handleClose = () => {
    setStep('options');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-2xl w-full ${step === 'preview' ? 'max-w-6xl max-h-[95vh] overflow-y-auto' : 'max-w-lg'} p-6`}>
        {step === 'options' && (
          <>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Print / PDF — Report of Session</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Filter by</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      checked={filterMode === 'status'}
                      onChange={() => setFilterMode('status')}
                    />
                    Status
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      checked={filterMode === 'dateRange'}
                      onChange={() => setFilterMode('dateRange')}
                    />
                    Date range
                  </label>
                </div>
              </div>

              {filterMode === 'status' ? (
                <div className="grid grid-cols-2 gap-2">
                  {REPORT_STATUS_OPTIONS.map((option) => (
                    <label key={option.id} className="flex items-center gap-2 text-sm p-2 border rounded-md">
                      <input
                        type="radio"
                        name="reportStatus"
                        checked={statusFilter === option.id}
                        onChange={() => setStatusFilter(option.id)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-600">From date</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">To date</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md text-sm"
                    />
                  </div>
                </div>
              )}

              <p className="text-sm text-slate-600">
                {filteredSessions.length} session(s) will be included in the report.
              </p>

              {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={handleClose} className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900">Cancel</button>
              <button
                type="button"
                onClick={handlePreview}
                disabled={loading || filteredSessions.length === 0}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Preparing...' : 'Preview Report'}
              </button>
            </div>
          </>
        )}

        {step === 'preview' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Report Preview</h3>
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep('options')} className="px-3 py-1.5 text-sm border rounded-md">Back</button>
                <button type="button" onClick={handlePrint} className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Print</button>
                <button type="button" onClick={handleDownloadPdf} className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">Download PDF</button>
                <button type="button" onClick={handleClose} className="px-3 py-1.5 text-sm text-gray-700">Close</button>
              </div>
            </div>

            <div ref={reportRef} className="overflow-x-auto border rounded-lg p-2 bg-gray-50">
              <SessionReportDocument
                sessions={filteredSessions}
                assignmentData={assignmentData}
                generatedByEmail={generatedByEmail}
                generatedAt={generatedAt}
                filterLabel={filterLabel}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SessionReportModal;
