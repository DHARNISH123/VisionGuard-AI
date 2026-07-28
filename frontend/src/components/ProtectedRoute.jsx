import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login but save the current path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User does not have the required role
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center dark:bg-slate-950">
        <div className="mb-4 rounded-full bg-red-100 p-4 text-red-600 dark:bg-red-900/30 dark:text-red-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-12 w-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Access Denied</h1>
        <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
          Your account role (<span className="font-semibold text-brand-500">{user.role}</span>) does not have sufficient permissions to view this page.
        </p>
        <button 
          onClick={() => window.history.back()}
          className="mt-6 rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-brand-600 active:scale-95"
        >
          Go Back
        </button>
      </div>
    );
  }

  return children;
};
