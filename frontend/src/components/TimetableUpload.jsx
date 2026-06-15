import React, { useState, useRef } from 'react';
import api from '../lib/api';

const ACCEPTED_EXTENSIONS = ['xlsx', 'xls', 'csv'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const emptySession = () => ({
  date: '',
  day: '',
  session: 'FN',
  courseCode: '',
  courseName: '',
  specialization: '',
  department: '',
  needsReview: true,
});

const toDateInputValue = (isoDate) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const TimetableUpload = ({ onUploadSuccess, departmentOptions = [] }) => {
  const [file, setFile] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [previewSessions, setPreviewSessions] = useState([]);
  const [extractedCourses, setExtractedCourses] = useState([]);
  const [sourceType, setSourceType] = useState('');
  const fileInputRef = useRef(null);

  const resetPreview = () => {
    setPreviewSessions([]);
    setExtractedCourses([]);
    setSourceType('');
  };

  const validateFile = (selectedFile) => {
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setError('Please upload only .xlsx or .csv files');
      return false;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File size should not exceed 5MB');
      return false;
    }
    return true;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    if (!validateFile(selectedFile)) {
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setFile(selectedFile);
    setSuccess('');
    setError('');
    resetPreview();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;
    if (!validateFile(droppedFile)) return;
    setFile(droppedFile);
    setSuccess('');
    setError('');
    resetPreview();
  };

  const handleExtract = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setSuccess('');
    setError('');
    resetPreview();

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/api/sessions/upload/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });

      const sessions = (response.data.sessions || []).map((session) => ({
        ...session,
        date: toDateInputValue(session.date),
        department: session.department || '',
        needsReview: session.needsReview || !session.courseCode || !session.courseName || !session.department,
      }));

      setPreviewSessions(sessions);
      setExtractedCourses(response.data.extractedCourses || []);
      setSourceType(response.data.sourceType || '');
      setSuccess(
        `Extracted ${response.data.count} session(s) from ${response.data.sourceType || 'file'}. Review below and edit if needed before committing.`
      );
    } catch (err) {
      const errorMessage = err.response?.data?.error
        || err.response?.data?.message
        || (err.request ? 'No response from server. Please try again.' : 'Extraction failed. Please check your file format.');
      setError(errorMessage);
      if (err.response?.data?.extractedCourses) {
        setExtractedCourses(err.response.data.extractedCourses);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSessionChange = (index, field, value) => {
    setPreviewSessions((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
        needsReview: field === 'courseCode' || field === 'courseName'
          ? !value || !updated[index][field === 'courseCode' ? 'courseName' : 'courseCode']
          : updated[index].needsReview,
      };
      if (['courseCode', 'courseName', 'department'].includes(field)) {
        const row = updated[index];
        updated[index].needsReview = !row.courseCode?.trim() || !row.courseName?.trim() || !row.department?.trim();
      }
      return updated;
    });
  };

  const handleAddRow = () => {
    setPreviewSessions((prev) => [...prev, emptySession()]);
  };

  const handleRemoveRow = (index) => {
    setPreviewSessions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCommit = async () => {
    if (previewSessions.length === 0) {
      setError('No sessions to commit. Extract a timetable first.');
      return;
    }

    const invalid = previewSessions.find(
      (s) => !s.date || !s.session || !s.courseCode?.trim() || !s.courseName?.trim() || !s.specialization?.trim() || !s.department?.trim()
    );
    if (invalid) {
      setError('Please fill in date, session, course code, course name, specialization, and department for all rows before committing.');
      return;
    }

    const seen = new Set();
    const duplicateRow = previewSessions.find((session) => {
      const key = `${session.date}|${session.session}|${session.courseCode.trim().toUpperCase()}|${session.department.trim()}`;
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    });
    if (duplicateRow) {
      setError('This session entity is already present in the list. Same date, session slot, department, and course code cannot be duplicated.');
      return;
    }

    setCommitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = previewSessions.map((session) => ({
        date: new Date(session.date).toISOString(),
        day: session.day || new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }),
        session: session.session,
        courseCode: session.courseCode.trim().toUpperCase(),
        courseName: session.courseName.trim(),
        specialization: session.specialization.trim(),
        department: session.department.trim(),
      }));

      const response = await api.post('/api/sessions/upload/commit', { sessions: payload });
      setSuccess(`Timetable committed successfully! ${response.data.count} sessions saved.`);
      setFile(null);
      setPreviewSessions([]);
      setExtractedCourses([]);
      setSourceType('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to commit timetable. Please review your entries.');
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Timetable</h3>
        <p className="text-sm text-gray-600 mb-4">
          Supported formats: .xlsx, .csv (max 5MB)
        </p>
      </div>

      <form onSubmit={handleExtract} className="space-y-4">
        <div
          className="flex items-center justify-center w-full"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">XLSX or CSV</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {file && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Selected file: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          </div>
        )}

        {error && (
          <div className="text-center">
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
          </div>
        )}

        {success && (
          <div className="text-center">
            <p className="text-sm text-green-600 bg-green-50 p-2 rounded">{success}</p>
          </div>
        )}

        <div className="flex justify-center gap-3">
          <button
            type="submit"
            disabled={!file || loading}
            className={`px-4 py-2 rounded-lg text-white font-medium ${
              !file || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Extracting...' : 'Extract Timetable'}
          </button>
        </div>
      </form>

      {extractedCourses.length > 0 && (
        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <h4 className="text-md font-semibold text-slate-900 mb-3">
            Extracted Course Codes {sourceType && <span className="text-sm font-normal text-slate-500">(from {sourceType})</span>}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {extractedCourses.map((course) => (
              <div
                key={course.courseCode}
                className={`p-3 rounded-md border ${
                  course.extracted ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'
                }`}
              >
                <p className="text-sm font-medium text-slate-900">{course.courseCode}</p>
                <p className="text-sm text-slate-700 mt-1">
                  {course.courseName || 'Course name not detected — edit in table below'}
                </p>
                <p className={`text-xs mt-1 ${course.extracted ? 'text-green-700' : 'text-amber-700'}`}>
                  {course.extracted ? 'Extracted successfully' : 'Needs manual review'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {previewSessions.length > 0 && (
        <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-slate-900">Review & Edit Before Commit</h4>
            <button
              type="button"
              onClick={handleAddRow}
              className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-slate-800"
            >
              + Add Row
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-2 py-2 text-left">Date</th>
                  <th className="px-2 py-2 text-left">Day</th>
                  <th className="px-2 py-2 text-left">Session</th>
                  <th className="px-2 py-2 text-left">Department</th>
                  <th className="px-2 py-2 text-left">Course Code</th>
                  <th className="px-2 py-2 text-left">Course Name</th>
                  <th className="px-2 py-2 text-left">Specialization</th>
                  <th className="px-2 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {previewSessions.map((session, index) => (
                  <tr
                    key={`preview-${index}`}
                    className={session.needsReview ? 'bg-amber-50' : 'bg-white'}
                  >
                    <td className="px-2 py-2">
                      <input
                        type="date"
                        value={session.date}
                        onChange={(e) => handleSessionChange(index, 'date', e.target.value)}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={session.day}
                        onChange={(e) => handleSessionChange(index, 'day', e.target.value)}
                        className="w-full p-1 border rounded"
                        placeholder="Wednesday"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <select
                        value={session.session}
                        onChange={(e) => handleSessionChange(index, 'session', e.target.value)}
                        className="w-full p-1 border rounded"
                      >
                        <option value="FN">FN</option>
                        <option value="AN">AN</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <select
                        value={session.department}
                        onChange={(e) => handleSessionChange(index, 'department', e.target.value)}
                        className="w-full p-1 border rounded"
                      >
                        <option value="">Select Department</option>
                        {departmentOptions.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={session.courseCode}
                        onChange={(e) => handleSessionChange(index, 'courseCode', e.target.value)}
                        className="w-full p-1 border rounded"
                        placeholder="CS101"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={session.courseName}
                        onChange={(e) => handleSessionChange(index, 'courseName', e.target.value)}
                        className="w-full p-1 border rounded"
                        placeholder="Course name"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={session.specialization}
                        onChange={(e) => handleSessionChange(index, 'specialization', e.target.value)}
                        className="w-full p-1 border rounded"
                        placeholder="Specialization"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(index)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-amber-700 mt-3">
            Rows highlighted in amber need course code, name, or department review before commit.
          </p>

          <div className="flex justify-center mt-4">
            <button
              type="button"
              onClick={handleCommit}
              disabled={committing}
              className={`px-5 py-2 rounded-lg text-white font-medium ${
                committing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {committing ? 'Committing...' : 'Commit to Database'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableUpload;
