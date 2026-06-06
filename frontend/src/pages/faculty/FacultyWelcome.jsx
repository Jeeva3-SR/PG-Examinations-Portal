import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FacultyWelcome = () => {
  const navigate = useNavigate();
  const facultyData = JSON.parse(localStorage.getItem('loggedInFaculty') || '{}');

  useEffect(() => {
    // Redirect to login if no faculty data
    if (!facultyData.facultyId) {
      navigate('/faculty/login');
    }
  }, [navigate, facultyData]);

  const handleGoBack = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('loggedInFaculty');
    navigate('/');
  };

  const dashboardFeatures = [
    {
      title: 'Course Management',
      description: 'View your assigned courses and their schedules',
      icon: '📚',
    },
    {
      title: 'Question Papers',
      description: 'Download QP orders and upload question papers',
      icon: '📄',
    },
    {
      title: 'Invigilation Duties',
      description: 'Check your invigilation schedule and hall assignments',
      icon: '👥',
    },
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-[#e0e7ff] via-[#f0f4f8] to-[#cfe2ff] relative overflow-hidden py-8">
      {/* Decorative background shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full opacity-30 blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#005A9C] rounded-full opacity-20 blur-3xl -z-10 animate-pulse" />
      <div className="w-full max-w-5xl mx-auto space-y-10 z-10">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="backdrop-blur-xl bg-white/70 shadow-2xl rounded-3xl px-10 py-12 w-full mx-auto border border-blue-100"
        >
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <h1 className="text-4xl font-extrabold text-[#005A9C] text-center md:text-left" style={{ fontFamily: 'Inter, sans-serif' }}>
              Welcome, {facultyData.name}!
            </h1>
            <button
              onClick={handleGoBack}
              className="px-4 py-2 rounded-lg bg-white shadow hover:bg-blue-50 text-[#005A9C] font-medium transition-colors duration-200 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              ← Back
            </button>
          </div>
          <p className="text-xl text-gray-600 text-center md:text-left" style={{ fontFamily: 'Inter, sans-serif' }}>
            Welcome to your Faculty Dashboard. Here you can manage all your academic responsibilities and duties.
          </p>
        </motion.div>

        {/* Quick Overview Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
          className="backdrop-blur-xl bg-white/70 shadow-2xl rounded-3xl px-10 py-12 w-full mx-auto border border-blue-100"
        >
          <h2 className="text-2xl font-bold text-[#005A9C] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>Dashboard Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5, ease: 'easeOut' }}
                className="p-6 border rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all flex flex-col items-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-[#005A9C] mb-2 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FacultyWelcome;