// Shared sidebar menu for coordinator pages

const coordinatorSidebarMenu = [
  { path: '/dashboard', label: 'Dashboard', icon: <span className="mr-2">🏠</span> },
  { path: '/sessions', label: 'Sessions', icon: <span className="mr-2">📅</span> },
  { path: '/student-input', label: 'Student Input', icon: <span className="mr-2">👨‍🎓</span> },
  { path: '/assign-qpsetter', label: 'Assign QP Setter', icon: <span className="mr-2">📝</span> },
  { path: '/dashboard/seating-arrangement', label: 'Seating Arrangement', icon: <span className="mr-2">🪑</span> },
  { path: '/duties', label: 'Duties', icon: <span className="mr-2">📋</span> },
  { path: '/claims', label: 'Claims', icon: <span className="mr-2">💰</span> },
  { path: '/letters', label: 'Letters', icon: <span className="mr-2">✉️</span> },
  { path: '/coordinator/reset-password', label: 'Coordinator Reset Password', icon: <span className="mr-2">🔑</span> },
  { path: '/logout', label: 'Logout', icon: <span className="mr-2">🚪</span> },
];

export default coordinatorSidebarMenu; 