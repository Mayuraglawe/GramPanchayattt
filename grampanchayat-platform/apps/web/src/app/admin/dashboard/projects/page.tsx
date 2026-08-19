'use client';

import React, { useState, useEffect } from 'react';

interface ProgressUpdate {
  id: string;
  note: string;
  progress_pct: number;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  name_mr: string;
  description?: string;
  category: string;
  budget_allocated: number;
  budget_spent: number;
  contractor_name?: string;
  contractor_phone?: string;
  start_date: string;
  end_date?: string;
  status: string;
  ward_no?: number;
  tender_number?: string;
  progress_updates: ProgressUpdate[];
}

const STATUS_COLORS: Record<string, string> = {
  PLANNED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-amber-100 text-amber-800',
  COMPLETED: 'bg-green-100 text-green-800',
  ON_HOLD: 'bg-gray-100 text-gray-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function AdminProjectsDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Create form fields
  const [name, setName] = useState('');
  const [nameMr, setNameMr] = useState('');
  const [category, setCategory] = useState('ROAD');
  const [budgetAllocated, setBudgetAllocated] = useState('');
  const [contractorName, setContractorName] = useState('');
  const [contractorPhone, setContractorPhone] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [wardNo, setWardNo] = useState('');
  const [tenderNo, setTenderNo] = useState('');

  // Progress update fields
  const [progressNote, setProgressNote] = useState('');
  const [progressPct, setProgressPct] = useState('');
  const [progressLoading, setProgressLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/projects');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, name_mr: nameMr, category,
          budget_allocated: budgetAllocated,
          contractor_name: contractorName,
          contractor_phone: contractorPhone,
          start_date: startDate,
          end_date: endDate || null,
          ward_no: wardNo || null,
          tender_number: tenderNo || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProjects([data, ...projects]);
      setSuccess('Project created successfully!');
      setShowCreateForm(false);
      setName(''); setNameMr(''); setBudgetAllocated(''); setContractorName('');
      setContractorPhone(''); setStartDate(''); setEndDate(''); setWardNo(''); setTenderNo('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    setProgressLoading(true);
    try {
      const res = await fetch(`/api/admin/projects/${selectedProject.id}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: progressNote, progress_pct: progressPct }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Update project status in list
      const pct = parseInt(progressPct);
      setProjects(prev => prev.map(p => p.id === selectedProject.id ? {
        ...p,
        status: pct >= 100 ? 'COMPLETED' : pct > 0 ? 'IN_PROGRESS' : p.status,
        progress_updates: [data, ...p.progress_updates],
      } : p));
      setSuccess(`Progress update added: ${progressPct}% complete`);
      setProgressNote('');
      setProgressPct('');
      setSelectedProject(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add update');
    } finally {
      setProgressLoading(false);
    }
  };

  const handleDelete = async (id: string, projectName: string) => {
    if (!confirm(`Delete "${projectName}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete');
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting project');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#018749]">Project & Works Tracker</h1>
          <p className="text-sm text-gray-500 mt-1">Track construction projects, infrastructure works, and their progress.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchProjects} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-xl text-sm transition-all">🔄 Refresh</button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-[#018749] hover:bg-[#006400] text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all shadow-sm"
          >
            {showCreateForm ? '✕ Cancel' : '+ New Project'}
          </button>
        </div>
      </div>

      {(error || success) && (
        <div className={`p-4 rounded-xl text-sm font-semibold border ${error ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
          {error || success}
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-2xl border border-[#018749]/40 shadow-md">
          <h2 className="text-lg font-bold text-gray-800 mb-5">New Infrastructure Project</h2>
          <form onSubmit={handleCreateProject} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600">Project Name (English)</label>
              <input required value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#018749]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Project Name (Marathi)</label>
              <input required value={nameMr} onChange={e => setNameMr(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#018749]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#018749]">
                <option value="ROAD">Road Construction</option>
                <option value="WATER">Water Supply</option>
                <option value="DRAINAGE">Drainage</option>
                <option value="BUILDING">Building/Infrastructure</option>
                <option value="ELECTRICITY">Electricity</option>
                <option value="SANITATION">Sanitation</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Budget Allocated (₹)</label>
              <input required type="number" value={budgetAllocated} onChange={e => setBudgetAllocated(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#018749]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Contractor Name</label>
              <input value={contractorName} onChange={e => setContractorName(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#018749]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Contractor Phone</label>
              <input value={contractorPhone} onChange={e => setContractorPhone(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#018749]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Start Date</label>
              <input required type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#018749]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Expected End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#018749]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Ward No.</label>
              <input type="number" value={wardNo} onChange={e => setWardNo(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#018749]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Tender Number</label>
              <input value={tenderNo} onChange={e => setTenderNo(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#018749]" />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={formLoading} className="w-full bg-[#018749] hover:bg-[#006400] text-white font-bold py-3 rounded-lg transition-colors text-sm disabled:opacity-50">
                {formLoading ? 'Creating...' : '🏗️ Create Project'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Progress Update Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="font-bold text-lg text-gray-800 mb-1">Add Progress Update</h3>
            <p className="text-sm text-gray-500 mb-4">{selectedProject.name}</p>
            <form onSubmit={handleAddProgress} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600">Progress (%)</label>
                <input required type="number" min={0} max={100} value={progressPct} onChange={e => setProgressPct(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#018749]"
                  placeholder="e.g. 40" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Update Note</label>
                <textarea required rows={3} value={progressNote} onChange={e => setProgressNote(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#018749] resize-none"
                  placeholder="e.g. Foundation work completed, columns poured..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setSelectedProject(null)} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={progressLoading} className="flex-1 bg-[#018749] hover:bg-[#006400] text-white font-bold py-2.5 rounded-lg text-sm disabled:opacity-50">
                  {progressLoading ? 'Saving...' : 'Save Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 animate-pulse">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-gray-200 text-gray-400 font-semibold">
          No projects found. Create your first one!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((p) => {
            const latestProgress = p.progress_updates?.[0]?.progress_pct ?? 0;
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-all">
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono text-[#018749] font-bold uppercase">{p.category}</span>
                    <h3 className="font-bold text-gray-900 mt-0.5 leading-tight">{p.name}</h3>
                    <p className="text-xs text-gray-500">{p.name_mr}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase whitespace-nowrap ${STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-700'}`}>
                    {p.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-[10px] text-gray-500 mb-1 font-semibold">
                    <span>Progress</span>
                    <span>{latestProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${latestProgress >= 100 ? 'bg-green-500' : latestProgress > 50 ? 'bg-[#018749]' : 'bg-amber-400'}`}
                      style={{ width: `${latestProgress}%` }}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 border-t border-gray-100 pt-3">
                  <div><span className="block font-semibold text-[10px] uppercase text-gray-400">Budget</span>₹{Number(p.budget_allocated).toLocaleString()}</div>
                  {p.ward_no && <div><span className="block font-semibold text-[10px] uppercase text-gray-400">Ward</span>{p.ward_no}</div>}
                  {p.contractor_name && <div><span className="block font-semibold text-[10px] uppercase text-gray-400">Contractor</span>{p.contractor_name}</div>}
                  <div><span className="block font-semibold text-[10px] uppercase text-gray-400">Start</span>{new Date(p.start_date).toLocaleDateString()}</div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1 border-t border-gray-100">
                  <button
                    onClick={() => setSelectedProject(p)}
                    className="flex-1 bg-[#018749]/10 hover:bg-[#018749]/20 text-[#018749] font-semibold py-2 rounded-lg text-xs transition"
                  >
                    📊 Update Progress
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    disabled={deletingId === p.id}
                    className="px-3 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 rounded-lg text-xs transition disabled:opacity-40"
                  >
                    🗑
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
