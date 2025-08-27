import { create } from 'zustand';

interface LogoutModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useLogoutModal = create<LogoutModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));
