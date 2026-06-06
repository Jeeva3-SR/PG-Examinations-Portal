import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Users, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';

const overviewCards = [
  {
    title: 'Pending QP Orders',
    value: 7,
    colorFrom: 'from-blue-50',
    colorTo: 'to-blue-100',
    textColor: 'text-blue-900',
    icon: <ClipboardList className="w-8 h-8 text-blue-500" />,
    labelColor: 'text-blue-600',
  },
  {
    title: 'Faculty Assigned',
    value: 12,
    colorFrom: 'from-green-50',
    colorTo: 'to-green-100',
    textColor: 'text-green-900',
    icon: <Users className="w-8 h-8 text-green-500" />,
    labelColor: 'text-green-600',
  },
  {
    title: 'Sessions Today',
    value: 3,
    colorFrom: 'from-purple-50',
    colorTo: 'to-purple-100',
    textColor: 'text-purple-900',
    icon: <CalendarDays className="w-8 h-8 text-purple-500" />,
    labelColor: 'text-purple-600',
  },
];

const HODWelcome = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-[#e0e7ff] via-[#f0f4f8] to-[#cfe2ff] relative overflow-hidden" style={{ overflow: 'hidden' }}>
      {/* Decorative background shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full opacity-30 blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#005A9C] rounded-full opacity-20 blur-3xl -z-10 animate-pulse" />
      <div className="w-full max-w-3xl mx-auto space-y-10 z-10">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="backdrop-blur-xl bg-white/70 shadow-2xl rounded-3xl px-10 py-12 w-full mx-auto border border-blue-100 flex flex-col items-center"
          style={{ minHeight: '40vh', justifyContent: 'center' }}
        >
          <button
            onClick={handleGoBack}
            className="mb-8 inline-flex items-center px-4 py-2 rounded-lg bg-white shadow hover:bg-blue-50 text-[#005A9C] font-medium transition-colors duration-200 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h2 className="text-3xl font-extrabold text-[#005A9C] mb-4 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
            Welcome, HOD
          </h2>
          <p className="text-gray-600 text-lg mb-2 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
            Manage your department's question paper orders and approvals from here.
          </p>
        </motion.div>
        {/* Dashboard Overview Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
          className="backdrop-blur-xl bg-white/70 shadow-2xl rounded-3xl px-10 py-12 w-full mx-auto border border-blue-100"
        >
          <h3 className="text-2xl font-bold text-[#005A9C] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>Dashboard Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {overviewCards.map((card, idx) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1, duration: 0.5, ease: 'easeOut' }}
                className={`rounded-2xl bg-gradient-to-br ${card.colorFrom} ${card.colorTo} shadow p-6 flex items-center justify-between`}
              >
                <div>
                  <p className={`text-base font-medium ${card.labelColor}`}>{card.title}</p>
                </div>
                {card.icon}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HODWelcome; 