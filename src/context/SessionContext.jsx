import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SessionContext = createContext();

const socket = io('http://localhost:5000', { autoConnect: false });

export const SessionProvider = ({ children }) => {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get('http://localhost:5000/api/sessions', config);
      setSessions(data.data);
      const active = data.data.find(s => s.status === 'active');
      setActiveSession(active || null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Socket.IO: listen for scheduler-triggered status changes ───────────────
  useEffect(() => {
    if (!user) return;

    socket.connect();

    socket.on('session_status_changed', ({ session }) => {
      setSessions(prev => prev.map(s => s._id === session._id ? session : s));
      if (session.status === 'active') {
        setActiveSession(session);
      } else if (session.status === 'completed') {
        setActiveSession(prev => (prev && prev._id === session._id ? null : prev));
      }
    });

    return () => {
      socket.off('session_status_changed');
      socket.disconnect();
    };
  }, [user]);
  // ────────────────────────────────────────────────────────────────────────────

  const createSession = async (title, startTime, endTime, assignedCameras) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.post('http://localhost:5000/api/sessions', {
        title, startTime, endTime, assignedCameras
      }, config);
      setSessions(prev => [data.data, ...prev]);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const updateSession = async (id, fields) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.put(`http://localhost:5000/api/sessions/${id}`, fields, config);
      setSessions(prev => prev.map(s => s._id === id ? data.data : s));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const deleteSession = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5000/api/sessions/${id}`, config);
      setSessions(prev => prev.filter(s => s._id !== id));
      setActiveSession(prev => (prev && prev._id === id ? null : prev));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const updateSessionStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.put(`http://localhost:5000/api/sessions/${id}/status`, { status }, config);
      setSessions(prev => prev.map(s => s._id === id ? data.data : s));
      if (status === 'active') {
        setActiveSession(data.data);
      } else if (activeSession && activeSession._id === id) {
        setActiveSession(null);
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  useEffect(() => {
    if (user) fetchSessions();
  }, [user]);

  return (
    <SessionContext.Provider value={{
      sessions,
      activeSession,
      loading,
      error,
      fetchSessions,
      createSession,
      updateSession,
      deleteSession,
      updateSessionStatus
    }}>
      {children}
    </SessionContext.Provider>
  );
};
