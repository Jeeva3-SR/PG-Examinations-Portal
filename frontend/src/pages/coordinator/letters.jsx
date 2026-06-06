import { motion } from 'framer-motion';
import Sidebar from '../../components/layouts/PageLayout';
import coordinatorSidebarMenu from '../../data/sidebarMenu';

return (
  <Sidebar menuItems={coordinatorSidebarMenu} theme="bg-white text-gray-900" activeClass="bg-blue-100 text-blue-700">
    <div className="min-h-screen bg-gradient-to-tr from-slate-100 to-blue-50 font-sans text-base transition-colors duration-500">
      <div className="max-w-6xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-white shadow-xl rounded-2xl p-6 mb-8 transition-all duration-500 hover:shadow-2xl"
        >
          <motion.h1
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-3xl font-bold mb-6"
          >
            Letters
          </motion.h1>
          {/* ...existing content... */}
        </motion.div>
      </div>
    </div>
  </Sidebar>
); 