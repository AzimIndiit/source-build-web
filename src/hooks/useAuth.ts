import useAuthStore from '@/stores/authStore';

export function useAuth() {
  const { user, setUser ,isLoading, isAuthenticated, login, signup, logout, updateUser, checkAuth } =
    useAuthStore();

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    setUser,
    updateUser,
    checkAuth,
  };
}
