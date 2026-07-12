import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute component - stubs auth check and allows navigation.
 * A teammate building the Auth module will plug in the actual authentication hook here.
 */
export default function ProtectedRoute({ children }) {
  // Stubbing authenticated user as true
  const isAuthenticated = true;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
