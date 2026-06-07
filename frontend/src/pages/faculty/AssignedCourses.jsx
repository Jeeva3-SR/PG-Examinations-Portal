import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AssignedCourses = () => {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // 1. Fetch values safely from local storage
        const loggedInFaculty = localStorage.getItem('loggedInFaculty');
        const token = localStorage.getItem('token'); 

        if (!loggedInFaculty) {
          setError('User profile session data missing. Please try logging in again.');
          setLoading(false);
          return;
        }

        const facultyInfo = JSON.parse(loggedInFaculty);

        // 2. Safeguard checking if the faculty has any course assignments attached to their user document
        if (!facultyInfo || !facultyInfo.course) {
          setError('No assigned courses found on your profile profile metrics.');
          setLoading(false);
          return;
        }

        // Handle course as string or array seamlessly
        const courseNames = Array.isArray(facultyInfo.course) 
          ? facultyInfo.course 
          : [facultyInfo.course];

        // 3. Request centrally with absolute path context and proper validation header tokens attached
        const response = await axios.get('/api/sessions', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // 🛡️ SECURES ROUTE REQUEST AGAINST BACKEND MIDDLWARE
          }
        });
        console.log('API Response:', response);
        if (response.data && response.data.length > 0) {
          // Find the first session with a matching course name matching profile arrays
          const courseSession = response.data.find(session => 
            courseNames.includes(session.courseName)
          );
          
          if (courseSession) {
            setCourseData({
              courseName: courseSession.courseName,
              courseCode: courseSession.courseCode
            });
          } else {
            setError('Your assigned course was not found in the active master examination sessions registry.');
          }
        } else {
          setError('No active master examination sessions are currently listed in the registry.');
        }
        setLoading(false);
      } catch (err) {
        console.error('API Error:', err);
        if (err.response) {
          setError(err.response.data.error || 'Failed to fetch course data from secure infrastructure.');
        } else if (err.request) {
          setError('No connection response received from the server api. Please verify backend state.');
        } else {
          setError('Failed to configure secure authentication request pipelines.');
        }
        setLoading(false);
      }
    };

    fetchCourseData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl max-w-2xl mx-auto text-left flex items-start space-x-2 font-medium" role="alert">
        <svg className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span>{error}</span>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="bg-amber-50 border border-amber-100 text-amber-800 px-4 py-3 rounded-xl max-w-2xl mx-auto text-left flex items-start space-x-2 font-medium" role="alert">
        <svg className="w-5 h-5 flex-shrink-0 text-amber-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span>No Course Assigned matching current session registry states.</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 animate-fadeIn text-left space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Your Assigned Course</h2>
        <p className="text-xs text-slate-400 mt-0.5">Below are the authenticated catalog tracking variables matching your current terminal profile.</p>
      </div>

      <div className="overflow-hidden border border-slate-100 rounded-xl bg-slate-50/50">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="text-left py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Course Name</th>
              <th scope="col" className="text-left py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Course Code</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            <tr className="hover:bg-slate-50/40 transition-colors">
              <td className="py-4 px-6 text-sm font-semibold text-slate-800">{courseData.courseName}</td>
              <td className="py-4 px-6 text-sm font-mono text-indigo-600 bg-indigo-50/10 font-bold max-w-max rounded-md px-2 py-0.5 border border-indigo-50">{courseData.courseCode}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssignedCourses;