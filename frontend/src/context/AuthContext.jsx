import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const email = localStorage.getItem("user_email");
    const fullName = localStorage.getItem("user_name");
    const role = localStorage.getItem("user_role");

    return email
      ? {
          email,
          fullName,
          role,
        }
      : null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Login failed");
    }

    const data = await response.json();

    console.log("JWT:", data.access_token);

    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user_email", data.email);
    localStorage.setItem("user_name", data.full_name);
    localStorage.setItem("user_role", data.role);

    setToken(data.access_token);

    setUser({
      email: data.email,
      fullName: data.full_name,
      role: data.role,
    });

    return data;
  };

  const register = async (email, password, fullName, role = "Operator") => {
    const response = await fetch(`${API_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
        role,
        is_active: true,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Registration failed");
    }

    return await response.json();
  };

  const logout = () => {
    localStorage.clear();

    setToken(null);
    setUser(null);

    window.location.href = "/login";
  };

  const checkPermission = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        checkPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);