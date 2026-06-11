import React, { useState, useRef } from 'react';
import api from '../lib/api';

const TimetableUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop().toLowerCase();
      if (ext !== 'xlsx' && ext !== 'csv') {
        setError('Please upload only .xlsx or .csv files');
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size should not exceed 5MB');
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      setFile(selectedFile);
      setSuccess('');
      setError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/api/sessions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000, // 30 second timeout
      });
      setSuccess(`Timetable uploaded successfully! ${response.data.count} sessions processed.`);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error('Upload error:', err);
      let errorMessage = 'Upload failed. Please check your file format.';
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = err.response.data.error || err.response.data.message || errorMessage;
        console.error('Server error details:', err.response.data.details);
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const ext = droppedFile.name.split('.').pop().toLowerCase();
      if (ext !== 'xlsx' && ext !== 'csv') {
        setError('Please upload only .xlsx or .csv files');
        return;
      }
      if (droppedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size should not exceed 5MB');
        return;
      }
      setFile(droppedFile);
      setSuccess('');
      setError('');
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
      
      <form onSubmit={handleUpload} className="space-y-4">
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
              accept=".xlsx,.csv"
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

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={!file || loading}
            className={`px-4 py-2 rounded-lg text-white font-medium ${
              !file || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              'Upload Timetable'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TimetableUpload; 