/**
 * Auth ViewModel
 * Manages authentication state and logic for login/register
 */

import { useState, useContext } from 'react';
import { AuthContext } from '../../Context/AuthContext';

export const useAuthViewModel = () => {
  const { login, register, loading } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login form state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  // Validation
  const validateLogin = () => {
    if (!loginForm.email.trim()) return 'Email is required';
    if (!loginForm.password) return 'Password is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginForm.email)) return 'Please enter a valid email';
    return null;
  };

  const validateRegister = () => {
    if (!registerForm.fullName.trim()) return 'Full name is required';
    if (!registerForm.username.trim()) return 'Username is required';
    if (registerForm.username.length < 3) return 'Username must be at least 3 characters';
    if (!registerForm.email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerForm.email)) return 'Please enter a valid email';
    if (!registerForm.password) return 'Password is required';
    if (registerForm.password.length < 6) return 'Password must be at least 6 characters';
    if (registerForm.password !== registerForm.confirmPassword) return 'Passwords do not match';
    return null;
  };

  // Handlers
  const handleLoginChange = (field, value) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleRegisterChange = (field, value) => {
    setRegisterForm(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    const validationError = validateLogin();
    if (validationError) { setError(validationError); return; }

    setSubmitting(true);
    setError('');

    try {
      const result = await login(loginForm.email, loginForm.password);
      if (!result?.success) {
        setError(result?.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    const validationError = validateRegister();
    if (validationError) { setError(validationError); return; }

    setSubmitting(true);
    setError('');

    try {
      const result = await register({
        fullName: registerForm.fullName,
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password
      });
      if (!result?.success) {
        setError(result?.message || 'Registration failed. Please try again.');
      } else {
        setSuccess('Account created successfully!');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
  };

  return {
    activeTab,
    loginForm,
    registerForm,
    submitting,
    error,
    success,
    showPassword,
    loading,
    handleLoginChange,
    handleRegisterChange,
    handleLogin,
    handleRegister,
    switchTab,
    setShowPassword,
  };
};