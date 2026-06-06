import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AssignedCourses = () => {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // Check if faculty is logged in
        const loggedInFaculty = localStorage.getItem('loggedInFaculty');
        console.log('Logged in faculty data:', loggedInFaculty); // Debug log

        if (!loggedInFaculty) {
          navigate('/faculty/login');
          return;
        }

        const facultyInfo = JSON.parse(loggedInFaculty);
        console.log('Parsed faculty info:', facultyInfo); // Debug log

        // Handle course as string or array
        const courseNames = Array.isArray(facultyInfo.course) ? facultyInfo.course : [facultyInfo.course];
        if (!courseNames[0]) {
          setError('No course assigned to faculty');
          setLoading(false);
          return;
        }

        // Fetch all sessions
        const response = await axios.get(`http://localhost:5000/api/sessions`, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        console.log('API Response:', response.data); // Debug log
        
        if (response.data && response.data.length > 0) {
          // Find the first session with a matching course name
          const courseSession = response.data.find(session => 
            courseNames.includes(session.courseName)
          );
          
          if (courseSession) {
            setCourseData({
              courseName: courseSession.courseName,
              courseCode: courseSession.courseCode
            });
          } else {
            setError('Course not found in sessions list');
          }
        } else {
          setError('Course not found in sessions list');
        }
        setLoading(false);
      } catch (err) {
        console.error('API Error:', err); // Debug log
        if (err.response) {
          console.error('Error response:', err.response.data);
          console.error('Error status:', err.response.status);
          setError(err.response.data.error || 'Failed to fetch course data');
        } else if (err.request) {
          console.error('No response received:', err.request);
          setError('No response from server. Please check if the server is running.');
        } else {
          console.error('Error setting up request:', err.message);
          setError('Failed to make request. Please try again later.');
        }
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">No Course Found</strong>
        <span className="block sm:inline"> Course not found in sessions list.</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Your Assigned Course</h2>
      <div className="bg-gray-50 rounded-lg p-6">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Course Name</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Course Code</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-3 px-4 text-gray-600">{courseData.courseName}</td>
              <td className="py-3 px-4 text-gray-600">{courseData.courseCode}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssignedCourses; 