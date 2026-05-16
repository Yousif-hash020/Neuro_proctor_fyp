import React, { useEffect, useMemo, useState } from 'react';
import { Users, Search, Plus, Trash2, Pencil, ToggleLeft, ToggleRight, X } from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', studentId: '' });

  const [editStudent, setEditStudent] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', studentId: '', isActive: true, password: '' });

  const token = useMemo(() => localStorage.getItem('token'), []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`http://localhost:5000/api/admin/students?search=${encodeURIComponent(search)}&status=${status}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(data.data || []);
    } catch (err) {
      console.error('Failed to load students', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/students', createForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowCreate(false);
      setCreateForm({ name: '', email: '', password: '', studentId: '' });
      await fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Create student failed');
    }
  };

  const openEdit = (s) => {
    setEditStudent(s);
    setEditForm({
      name: s.name || '',
      email: s.email || '',
      studentId: s.studentId || '',
      isActive: s.isActive !== false,
      password: '',
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/admin/students/${editStudent._id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditStudent(null);
      await fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Delete student \"${s.name}\"?`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/students/${s._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const toggleActive = async (s) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/students/${s._id}`, { isActive: !s.isActive }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <Users className="w-6 h-6 text-white/70" /> Student Management
          </h1>
          <p className="text-xs text-gray-400 tracking-[0.2em] uppercase mt-1">Create, search, edit, and manage student records</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="glass-button px-4 py-2 flex items-center justify-center text-white bg-blue-600/20 border-blue-500/50 hover:bg-blue-600/30 text-xs tracking-widest uppercase font-bold gap-2">
          <Plus className="w-4 h-4" /> New Student
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap shrink-0">
        <div className="relative glass-panel rounded-xl overflow-hidden p-0 border-white/10 flex items-center">
          <Search className="w-4 h-4 text-gray-500 ml-3 absolute" />
          <input
            type="text"
            placeholder="Search name/email/studentId..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchStudents()}
            className="bg-transparent border-none py-2 pl-9 pr-4 text-xs tracking-widest text-white focus:ring-0 focus:outline-none w-64 font-mono placeholder:text-gray-600"
          />
        </div>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="bg-black border border-white/20 text-white text-[10px] tracking-widest uppercase font-bold clip-chamfer px-4 py-2 focus:outline-none appearance-none cursor-pointer hover:bg-white/5"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button onClick={fetchStudents} className="px-4 py-2 border border-white/10 text-white/50 hover:text-white hover:bg-white/5 text-[10px] uppercase tracking-widest clip-chamfer">
          Refresh
        </button>
      </div>

      <div className="flex-1 glass-panel overflow-hidden flex flex-col border-white/5">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20 shrink-0">
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/70">Registered Students</h2>
          <span className="text-[9px] text-white/40 font-mono uppercase tracking-widest">{students.length} total</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && <p className="text-white/30 font-mono text-xs uppercase tracking-widest animate-pulse">Loading students...</p>}
          {!loading && students.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-white/20 font-mono text-[10px] uppercase tracking-widest gap-2">
              No students found
            </div>
          )}

          {students.map((s) => (
            <div key={s._id} className="flex items-start justify-between p-4 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors clip-chamfer">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-[11px] font-bold text-white uppercase tracking-widest">{s.name}</span>
                  <span className={clsx(
                    "text-[9px] px-2 py-0.5 border uppercase tracking-widest font-mono clip-chamfer",
                    s.isActive ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-red-500/30 text-red-400 bg-red-500/10"
                  )}>
                    {s.isActive ? 'active' : 'inactive'}
                  </span>
                </div>
                <div className="mt-2 text-[10px] text-white/50 font-mono uppercase tracking-widest space-y-1">
                  <div>Email: <span className="text-white/70">{s.email}</span></div>
                  <div>StudentID: <span className="text-white/70">{s.studentId || '—'}</span></div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleActive(s)} title="Activate/Deactivate" className="p-2 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white clip-chamfer">
                  {s.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(s)} title="Edit" className="p-2 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white clip-chamfer">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(s)} title="Delete" className="p-2 border border-red-500/20 text-red-400/70 hover:bg-red-500/10 hover:text-red-400 clip-chamfer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg p-6 border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-white/70">Create Student</h3>
              <button onClick={() => setShowCreate(false)} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              {[
                { key: 'name', label: 'Name', type: 'text' },
                { key: 'email', label: 'Email', type: 'email' },
                { key: 'studentId', label: 'Student ID', type: 'text' },
                { key: 'password', label: 'Password', type: 'password' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-white/60 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={createForm[f.key]}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    required={f.key !== 'studentId'}
                    className="w-full bg-black/50 border border-white/20 clip-chamfer py-3 px-4 text-[11px] tracking-widest text-white focus:outline-none focus:border-white transition-all font-mono"
                  />
                </div>
              ))}
              <button type="submit" className="glass-button px-6 py-3 text-white bg-blue-600/20 border-blue-500/50 hover:bg-blue-600/30 text-[10px] tracking-widest uppercase font-bold">
                Create
              </button>
            </form>
          </div>
        </div>
      )}

      {editStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg p-6 border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-white/70">Edit Student</h3>
              <button onClick={() => setEditStudent(null)} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-3">
              {[
                { key: 'name', label: 'Name', type: 'text' },
                { key: 'email', label: 'Email', type: 'email' },
                { key: 'studentId', label: 'Student ID', type: 'text' },
                { key: 'password', label: 'Reset Password (optional)', type: 'password', required: false },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-white/60 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={editForm[f.key]}
                    onChange={(e) => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    required={f.required !== false && f.key !== 'password'}
                    className="w-full bg-black/50 border border-white/20 clip-chamfer py-3 px-4 text-[11px] tracking-widest text-white focus:outline-none focus:border-white transition-all font-mono"
                  />
                </div>
              ))}
              <div className="flex items-center justify-between border border-white/10 bg-white/5 clip-chamfer px-4 py-3">
                <span className="text-[10px] uppercase tracking-widest text-white/60 font-mono">Active</span>
                <button
                  type="button"
                  onClick={() => setEditForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                  className="text-white/60 hover:text-white"
                >
                  {editForm.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </div>
              <button type="submit" className="glass-button px-6 py-3 text-white bg-blue-600/20 border-blue-500/50 hover:bg-blue-600/30 text-[10px] tracking-widest uppercase font-bold">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;

