import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));
      fetchUserDetails(token);
    }
    setLoading(false);
  }, []);

  const fetchUserDetails = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/admin/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const details = await response.json();
        setUserDetails(details);
      } else {
        // If the endpoint doesn't exist or fails, just log it and continue
        console.log('Admin user details endpoint not available or user not authorized');
      }
    } catch (error) {
      // Don't let this block the login flow
      console.log('Could not fetch additional user details:', error.message);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: email,
          password: password
        }).toString(),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();

      // Store token
      localStorage.setItem('token', data.access_token);

      // Fetch user details from /auth/me
      const meResponse = await fetch('http://localhost:8000/auth/me', {
        headers: {
          'Authorization': `Bearer ${data.access_token}`
        }
      });

      if (!meResponse.ok) {
        throw new Error('Failed to fetch user details');
      }

      const userData = await meResponse.json();
      console.log('User data from /auth/me:', userData);

      // Store user info
      const userInfo = {
        email: userData.email,
        role: userData.role,
        org_id: userData.org_id,
        user_id: userData.id,
        name: userData.name
      };
      localStorage.setItem('user', JSON.stringify(userInfo));
      setUser(userInfo);

      // Fetch additional user details if needed
      await fetchUserDetails(data.access_token);

      // Navigate based on role
      console.log('Navigating based on role:', userData.role);
      navigateByRole(userData.role);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const navigateByRole = (role) => {
    switch(role) {
      case 'super_admin':
      case 'org_admin':
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'team_lead':
        navigate('/team/dashboard');
        break;
      case 'researcher':
        navigate('/research/projects');
        break;
      case 'analyst':
        navigate('/quant/dashboard');
        break;
      case 'client':
        navigate('/client/dashboard');
        break;
      default:
        navigate('/projects');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setUserDetails(null);
    navigate('/login');
  };

  const hasPermission = (permission) => {
    if (!userDetails) return false;

    // Super admin has all permissions
    if (user?.role === 'super_admin') return true;

    // Check specific permissions
    switch(permission) {
      case 'manage_users':
        return userDetails.can_manage_users || user?.role === 'org_admin';
      case 'create_projects':
        return userDetails.can_create_projects || ['org_admin', 'team_lead'].includes(user?.role);
      case 'export_data':
        return userDetails.can_export_data !== false;
      case 'delete_content':
        return userDetails.can_delete_content === true;
      default:
        return false;
    }
  };

  const getTeamName = () => {
    if (!userDetails?.team) return 'No Team';

    const teamNames = {
      'qual': 'Qualitative',
      'quant': 'Quantitative',
      'data_processing': 'Data Processing',
      'qc': 'Quality Control',
      'field': 'Field Operations',
      'pm': 'Project Management',
      'client': 'Client'
    };

    return teamNames[userDetails.team] || userDetails.team;
  };

  return (
    <AuthContext.Provider value={{
      user,
      userDetails,
      loading,
      login,
      logout,
      hasPermission,
      getTeamName
    }}>
      {children}
    </AuthContext.Provider>
  );
};