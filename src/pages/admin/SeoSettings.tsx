import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getSupabase } from '../../lib/supabase';
import {
  sectionCard, btn, R, input, pageHeader, pageTitle, pageSub, loading as loadingStyle,
} from './adminStyles';

const MAX_META_TITLE = 60;
const MAX_META_DESC = 160;

interface SeoPage {
  path: string;
  label: string;
  configured: boolean;
  meta_title: string;
  meta_description: string;
  og_image_url: string;
}

const STATIC_PAGES: { path: string; label: string }[] = [
  { path: '/', label: 'Home' },
  { path: '/work', label: 'Work' },
  { path: '/services', label: 'Services' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
  { path: '/blog', label: 'Blog' },
];

const DEFAULTS: Record<string, { title: string; description: string }> = {
  '/': { title: 'Taha Khilji — Senior Graphic Designer & Art Director', description: 'Crafting bold visual identities, precision editorial layouts & scalable brand systems. Available for Q3/Q4 brand & design commissions.' },
  '/work': { title: 'Selected Work — Taha Khilji', description: 'Selected identities, campaigns and digital experiences by Taha Khilji.' },
  '/services': { title: 'Services — Taha Khilji', description: 'Brand identity, packaging, editorial, advertising, and website design services.' },
  '/about': { title: 'About — Taha Khilji', description: 'Independent graphic designer with 8+ years of experience helping brands stand out.' },
  '/contact': { title: 'Contact — Taha Khilji', description: 'Get in touch for brand & design commissions.' },
  '/blog': { title: 'Blog — Taha Khilji', description: 'Thoughts on design, code, and craft.' },
};

export default function SeoSettings() {
  const [pages, setPages] = useState<SeoPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SeoPage | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const ogInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const fetchPages = useCallback(async () => {
    try {
      const sb = getSupabase();
      const { data: existing } = await sb
        .from('seo_settings')
        .select('page_path, meta_title, meta_description, og_image_url');
      const existingMap = new Map<string, any>((existing ?? []).map((r: any) => [r.page_path, r]));
      const result: SeoPage[] = STATIC_PAGES.map((p) => {
        const row = existingMap.get(p.path);
        return {
          path: p.path, label: p.label, configured: Boolean(row),
          meta_title: row?.meta_title || DEFAULTS[p.path]?.title || '',
          meta_description: row?.meta_description || DEFAULTS[p.path]?.description || '',
          og_image_url: row?.og_image_url || '',
        };
      });
      setPages(result);
    } catch (err: any) {
      console.error('Failed to fetch SEO settings:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const handleOgUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const sb = getSupabase();
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `seo/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await sb.storage.from('seo-images').upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data } = sb.storage.from('seo-images').getPublicUrl(path);
      if (editing) setEditing({ ...editing, og_image_url: data.publicUrl });
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  }, [editing]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const sb = getSupabase();
      const { error } = await sb.from('seo_settings').upsert({
        page_path: editing.path, meta_title: editing.meta_title.trim(),
        meta_description: editing.meta_description.trim(), og_image_url: editing.og_image_url,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'page_path' });
      if (error) throw error;
      setToast('SEO settings saved!');
      setPages((prev) => prev.map((p) =>
        p.path === editing.path ? { ...p, configured: true, meta_title: editing.meta_title, meta_description: editing.meta_description, og_image_url: editing.og_image_url } : p
      ));
      setTimeout(() => { setToast(''); setEditing(null); }, 1200);
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={loadingStyle}>Loading SEO settings…</div>;

  return (
    <div>
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999, padding: '12px 22px',
          borderRadius: R.md, background: '#166534', color: '#4ade80', fontSize: 13, fontWeight: 600,
          border: '1px solid rgba(74, 222, 128, 0.3)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}>{toast}</div>
      )}

      {editing ? (
        <div>
          <div style={{ ...pageHeader, alignItems: 'flex-start' }}>
            <div>
              <button style={{ padding: 0, border: 'none', background: 'none', color: '#5a6a84', fontSize: 13, cursor: 'pointer', marginBottom: 12, display: 'block' }} onClick={() => setEditing(null)}>← Back to list</button>
              <h1 style={pageTitle}>SEO — {editing.label}</h1>
              <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: R.sm, fontSize: 12, fontFamily: 'monospace', color: '#5a6a84', background: 'rgba(14,22,42,0.6)', border: '1px solid rgba(100,160,240,0.08)', marginTop: 6 }}>{editing.path}</span>
            </div>
            <button style={btn.primary} disabled={saving} onClick={handleSave}>{saving ? 'Saving…' : 'Save'}</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#7c8aa8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Meta Title</label>
            <input style={input} value={editing.meta_title} onChange={(e) => setEditing({ ...editing, meta_title: e.target.value })} placeholder={DEFAULTS[editing.path]?.title || ''} />
            <span style={{ fontSize: 12, color: editing.meta_title.length > MAX_META_TITLE ? '#f87171' : '#5a6a84' }}>{editing.meta_title.length}/{MAX_META_TITLE}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#7c8aa8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Meta Description</label>
            <textarea style={{ ...input, minHeight: 80, resize: 'vertical' }} value={editing.meta_description} onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })} placeholder={DEFAULTS[editing.path]?.description || ''} />
            <span style={{ fontSize: 12, color: editing.meta_description.length > MAX_META_DESC ? '#f87171' : '#5a6a84' }}>{editing.meta_description.length}/{MAX_META_DESC}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#7c8aa8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OG Image</label>
            <input ref={ogInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && handleOgUpload(e.target.files[0])} />
            {editing.og_image_url ? (
              <div style={{ position: 'relative', borderRadius: R.md, overflow: 'hidden', border: '1px solid rgba(100,160,240,0.1)', maxWidth: 480 }}>
                <img src={editing.og_image_url} alt="" style={{ width: '100%', display: 'block', maxHeight: 240, objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
                  <button style={{ ...btn.primary, padding: '7px 16px', borderRadius: R.sm }} onClick={() => ogInputRef.current?.click()} disabled={uploading}>{uploading ? '…' : 'Replace'}</button>
                  <button style={{ ...btn.ghost, padding: '7px 16px', borderRadius: R.sm }} onClick={() => setEditing({ ...editing, og_image_url: '' })} disabled={uploading}>Remove</button>
                </div>
              </div>
            ) : (
              <button style={{ padding: '28px 20px', borderRadius: R.md, cursor: 'pointer', border: '2px dashed rgba(100, 160, 240, 0.18)', background: 'rgba(6, 12, 28, 0.4)', color: '#7c8aa8', fontSize: 13, textAlign: 'center' }} onClick={() => ogInputRef.current?.click()} disabled={uploading}>
                {uploading ? 'Uploading…' : 'Upload OG image (1200×630 recommended)'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <h1 style={pageTitle}>SEO Settings</h1>
          <p style={{ ...pageSub, marginBottom: 28 }}>Configure meta tags and OG images for each page.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {pages.map((page) => (
              <button
                key={page.path}
                onClick={() => setEditing(page)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '16px 20px', borderRadius: R.lg, border: 'none', textAlign: 'left',
                  width: '100%', cursor: 'pointer',
                  background: 'rgba(14, 22, 42, 0.5)',
                  borderLeft: page.configured ? '3px solid #4ade80' : '3px solid rgba(148,163,184,0.2)',
                  backgroundImage: 'linear-gradient(rgba(14,22,42,0.5), rgba(14,22,42,0.5))',
                  transition: 'background 150ms',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(100,160,240,0.05)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(14,22,42,0.5)')}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 15, fontWeight: 500, color: '#e2e8f0' }}>{page.label}</span>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#5a6a84' }}>{page.path}</span>
                </div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                  ...(page.configured
                    ? { color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }
                    : { color: '#94a3b8', background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.15)' }),
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: page.configured ? '#4ade80' : '#94a3b8', flexShrink: 0 }} />
                  {page.configured ? 'Configured' : 'Using default'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
