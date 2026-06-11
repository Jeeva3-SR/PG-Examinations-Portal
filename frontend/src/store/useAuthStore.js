import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  role: null,
  loading: true,

  hydrate: () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    let user = null;
    const raw = localStorage.getItem('userData');
    if (raw) {
      try { user = JSON.parse(raw); } catch {}
    }
    set({ user, token, role, loading: false });
  },

  login: (user, token, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userData', JSON.stringify(user));
    set({ user, token, role });
  },

  logout: () => {
    localStorage.clear();
    set({ user: null, token: null, role: null });
  },

  updateUser: (user) => {
    localStorage.setItem('userData', JSON.stringify(user));
    set({ user });
  },
}));

export default useAuthStore;
