import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabase } from '../../lib/supabase';
import {
  sectionCard, table as ts, btn, R,
  searchWrap, searchInput, pageHeader, pageTitle, pageSub,
  emptyState, modal,
} from './adminStyles';

interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  published: boolean;
  display_order: number;
  cover_image_url: string;
}

export default function ProjectList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Project | null>(null);
  const [search, setSearch] = useState('');

  const fetchProjects = useCallback(async () => {
    try {
      const sb = getSupabase();
      const { data, error } = await sb
        .from('projects')
        .select('id, title, slug, category, published, display_order, cover_image_url')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProjects(data ?? []);
    } catch (err: any) {
      console.error('Failed to fetch projects:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const filtered = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.toLowerCase();
    return projects.filter(p => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [projects, search]);

  const handleDelete = async (project: Project) => {
    setDeleting(project.id);
    try {
      const sb = getSupabase();
      const { error } = await sb.from('projects').delete().eq('id', project.id);
      if (error) throw error;
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      setConfirmDelete(null);
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    } finally {
      setDeleting(null);
    }
  };

  const moveProject = async (project: Project, direction: 'up' | 'down') => {
    const idx = projects.findIndex((p) => p.id === project.id);
    if (idx === -1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= projects.length) return;

    const updated = [...projects];
    const tempOrder = updated[idx].display_order;
    updated[idx].display_order = updated[swapIdx].display_order;
    updated[swapIdx].display_order = tempOrder;
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    setProjects(updated);

    try {
      const sb = getSupabase();
      await sb.from('projects').update({ display_order: updated[idx].display_order }).eq('id', updated[idx].id);
      await sb.from('projects').update({ display_order: updated[swapIdx].display_order }).eq('id', updated[swapIdx].id);
    } catch (err: any) {
      console.error('Reorder failed:', err.message);
      fetchProjects();
    }
  };

  if (loading) return <div style={{ padding: 48, color: '#7c8aa8', fontSize: 14 }}>Loading projects…</div>;

  return (
    <div>
      <div style={pageHeader}>
        <div>
          <h1 style={pageTitle}>Projects</h1>
          <p style={pageSub}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button style={btn.primary} onClick={() => navigate('/admin/projects/new')}>+ New Project</button>
      </div>

      {projects.length > 0 && (
        <div style={{ ...searchWrap, marginBottom: 16, maxWidth: 360 }}>
          <span style={{ color: '#5a6a84', fontSize: 14, marginRight: 6 }}>🔍</span>
          <input style={searchInput} placeholder="Search projects…" value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#5a6a84', fontSize: 18, cursor: 'pointer', padding: '0 2px', lineHeight: 1 }}>×</button>}
        </div>
      )}

      {projects.length === 0 ? (
        <div style={emptyState}>
          <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600, color: '#e2e8f0' }}>No projects yet</p>
          <p style={{ margin: '0 0 20px', fontSize: 13, color: '#7c8aa8' }}>Add your first project to get started.</p>
          <button style={btn.primary} onClick={() => navigate('/admin/projects/new')}>+ New Project</button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={emptyState}>
          <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600, color: '#e2e8f0' }}>No matches</p>
          <p style={{ margin: 0, fontSize: 13, color: '#7c8aa8' }}>Try a different search term.</p>
        </div>
      ) : (
        <div style={ts.wrap}>
          <table style={ts.table}>
            <thead>
              <tr>
                <th style={{ ...ts.th, width: 40 }}></th>
                <th style={{ ...ts.th, width: 56 }}></th>
                <th style={ts.th}>Title</th>
                <th style={ts.th}>Category</th>
                <th style={ts.th}>Status</th>
                <th style={ts.th}>Order</th>
                <th style={{ ...ts.th, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((project, idx) => (
                <tr
                  key={project.id}
                  style={ts.tr}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(100,160,240,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={ts.td}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <button
                        style={{ ...btn.icon, width: 24, height: 18, fontSize: 9, opacity: idx === 0 ? 0.25 : 1 }}
                        disabled={idx === 0}
                        onClick={() => moveProject(project, 'up')}
                        title="Move up"
                      >▲</button>
                      <button
                        style={{ ...btn.icon, width: 24, height: 18, fontSize: 9, opacity: idx === filtered.length - 1 ? 0.25 : 1 }}
                        disabled={idx === filtered.length - 1}
                        onClick={() => moveProject(project, 'down')}
                        title="Move down"
                      >▼</button>
                    </div>
                  </td>
                  <td style={ts.td}>
                    {project.cover_image_url ? (
                      <img src={project.cover_image_url} alt="" style={{ width: 40, height: 40, borderRadius: R.sm, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: R.sm, background: 'rgba(14,22,42,0.6)', border: '1px solid rgba(100,160,240,0.08)' }} />
                    )}
                  </td>
                  <td style={ts.td}>
                    <span style={{ fontWeight: 500, color: '#e2e8f0' }}>{project.title}</span>
                    <span style={{ marginLeft: 8, fontSize: 12, color: '#5a6a84' }}>/{project.slug}</span>
                  </td>
                  <td style={ts.td}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: R.sm, fontSize: 12, fontWeight: 500, color: '#93c5fd', background: 'rgba(147,197,253,0.08)', border: '1px solid rgba(147,197,253,0.15)' }}>{project.category}</span>
                  </td>
                  <td style={ts.td}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                      ...(project.published ? { color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' } : { color: '#94a3b8', background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.15)' }),
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: 3, background: project.published ? '#4ade80' : '#94a3b8', flexShrink: 0 }} />
                      {project.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td style={ts.td}>{project.display_order}</td>
                  <td style={{ ...ts.td, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <a
                        href={`/work/${project.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ ...btn.icon, textDecoration: 'none' }}
                        title="View live"
                      >👁</a>
                      <button style={btn.ghost} onClick={() => navigate(`/admin/projects/edit/${project.id}`)}>Edit</button>
                      <button style={btn.danger} disabled={deleting === project.id} onClick={() => setConfirmDelete(project)}>
                        {deleting === project.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmDelete && (
        <div style={modal.backdrop} onClick={() => setConfirmDelete(null)}>
          <div style={modal.content} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 10px', fontSize: 17, fontWeight: 600, color: '#f0f4ff' }}>Delete project?</h3>
            <p style={{ margin: 0, fontSize: 14, color: '#94a3b8', lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>"{confirmDelete.title}"</strong>? This can't be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button style={btn.ghost} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button
                style={{ ...btn.danger, padding: '8px 18px', borderRadius: R.md, background: '#dc2626', color: '#fff', border: 'none' }}
                disabled={deleting === confirmDelete.id}
                onClick={() => handleDelete(confirmDelete)}
              >
                {deleting === confirmDelete.id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
