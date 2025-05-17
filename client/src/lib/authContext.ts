import { createContext, useContext } from 'react';
import { User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true
});

export const AuthProvider = AuthContext.Provider;

export function useAuth() {
  return useContext(AuthContext);
}
