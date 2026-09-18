import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabase } from '../../lib/supabase';
import {
  sectionCard, table as ts, badges, btn, R,
  searchWrap, searchInput, pageHeader, pageTitle, pageSub,
  emptyState, modal,
} from './adminStyles';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  cover_image_url: string | null;
  updated_at: string;
}

export default function BlogList() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<BlogPost | null>(null);
  const [search, setSearch] = useState('');

  const fetchPosts = useCallback(async () => {
    try {
      const sb = getSupabase();
      const { data, error } = await sb
        .from('blog_posts')
        .select('id, title, slug, published, cover_image_url, updated_at')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setPosts(data ?? []);
    } catch (err: any) {
      console.error('Failed to fetch blog posts:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const filtered = useMemo(() => {
    if (!search.trim()) return posts;
    const q = search.toLowerCase();
    return posts.filter(p => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
  }, [posts, search]);

  const handleDelete = async (post: BlogPost) => {
    setDeleting(post.id);
    try {
      const sb = getSupabase();
      const { error } = await sb.from('blog_posts').delete().eq('id', post.id);
      if (error) throw error;
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      setConfirmDelete(null);
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) {
    return <div style={{ padding: 48, color: '#7c8aa8', fontSize: 14 }}>Loading posts…</div>;
  }

  return (
    <div>
      <div style={pageHeader}>
        <div>
          <h1 style={pageTitle}>Blog</h1>
          <p style={pageSub}>{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
        </div>
        <button style={btn.primary} onClick={() => navigate('/admin/blog/new')}>+ New Post</button>
      </div>

      {/* Search */}
      {posts.length > 0 && (
        <div style={{ ...searchWrap, marginBottom: 16, maxWidth: 360 }}>
          <span style={{ color: '#5a6a84', fontSize: 14, marginRight: 6 }}>🔍</span>
          <input
            style={searchInput}
            placeholder="Search posts…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#5a6a84', fontSize: 18, cursor: 'pointer', padding: '0 2px', lineHeight: 1 }}>×</button>
          )}
        </div>
      )}

      {posts.length === 0 ? (
        <div style={emptyState}>
          <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600, color: '#e2e8f0' }}>No blog posts yet</p>
          <p style={{ margin: '0 0 20px', fontSize: 13, color: '#7c8aa8' }}>Create your first post to get started.</p>
          <button style={btn.primary} onClick={() => navigate('/admin/blog/new')}>+ New Post</button>
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
                <th style={{ ...ts.th, width: 56 }}></th>
                <th style={ts.th}>Title</th>
                <th style={ts.th}>Status</th>
                <th style={ts.th}>Updated</th>
                <th style={{ ...ts.th, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => (
                <tr
                  key={post.id}
                  style={ts.tr}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(100,160,240,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={ts.td}>
                    {post.cover_image_url ? (
                      <img src={post.cover_image_url} alt="" style={{ width: 40, height: 40, borderRadius: R.sm, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: R.sm, background: 'rgba(14,22,42,0.6)', border: '1px solid rgba(100,160,240,0.08)' }} />
                    )}
                  </td>
                  <td style={ts.td}>
                    <span style={{ fontWeight: 500, color: '#e2e8f0' }}>{post.title}</span>
                    <span style={{ marginLeft: 8, fontSize: 12, color: '#5a6a84' }}>/{post.slug}</span>
                  </td>
                  <td style={ts.td}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                      ...(post.published ? { color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' } : { color: '#94a3b8', background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.15)' }),
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: 3, background: post.published ? '#4ade80' : '#94a3b8', flexShrink: 0 }} />
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td style={ts.td}>{formatDate(post.updated_at)}</td>
                  <td style={{ ...ts.td, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ ...btn.icon, textDecoration: 'none' }}
                        title="View live"
                      >👁</a>
                      <button style={btn.ghost} onClick={() => navigate(`/admin/blog/edit/${post.id}`)}>Edit</button>
                      <button style={btn.danger} disabled={deleting === post.id} onClick={() => setConfirmDelete(post)}>
                        {deleting === post.id ? '…' : 'Delete'}
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
            <h3 style={{ margin: '0 0 10px', fontSize: 17, fontWeight: 600, color: '#f0f4ff' }}>Delete post?</h3>
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
