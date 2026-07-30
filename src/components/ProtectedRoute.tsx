import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { wallet } = useWallet();
  const location = useLocation();

  if (!wallet.connected) {
    return <Navigate to="/" state={{ from: location.pathname }} replace />;
  }

  return children;
};
