import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const email = localStorage.getItem('user_email') || 'supervisor@visionguard.com';
    const fullName = localStorage.getItem('user_name') || 'Safety Supervisor';
    const role = localStorage.getItem('user_role') || 'Supervisor';
    return { email, fullName, role };
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || 'mock-supervisor-token';
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      localStorage.setItem('token', 'mock-supervisor-token');
      localStorage.setItem('user_email', 'supervisor@visionguard.com');
      localStorage.setItem('user_name', 'Safety Supervisor');
      localStorage.setItem('user_role', 'Supervisor');
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    // Standard OAuth2 form data
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.detail || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user_email', data.email);
    localStorage.setItem('user_name', data.full_name);
    localStorage.setItem('user_role', data.role);

    setToken(data.access_token);
    setUser({
      email: data.email,
      fullName: data.full_name,
      role: data.role
    });
    
    return data;
  };

  const register = async (email, password, fullName, role = 'Operator') => {
    const response = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
        role,
        is_active: true
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.detail || 'Registration failed');
    }

    return await response.json();
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role');
    setToken(null);
    setUser(null);
  };

  const checkPermission = (allowedRoles) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, checkPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
