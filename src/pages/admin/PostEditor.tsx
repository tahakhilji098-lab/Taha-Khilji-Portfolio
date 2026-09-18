import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { getSupabase } from '../../lib/supabase';

const MAX_META_TITLE = 60;
const MAX_META_DESC = 160;

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

marked.setOptions({ breaks: true, gfm: true });

export default function PostEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [loadingPost, setLoadingPost] = useState(isEdit);

  // Auto-fill SEO defaults
  const effectiveMetaTitle = metaTitle || title;
  const effectiveMetaDesc = metaDesc || excerpt;

  // Slug auto-generation
  useEffect(() => {
    if (!slugManuallyEdited) {
      setSlug(generateSlug(title));
    }
  }, [title, slugManuallyEdited]);

  // Load existing post
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const sb = getSupabase();
        const { data, error } = await sb.from('blog_posts').select('*').eq('id', id).single();
        if (error) throw error;
        if (data) {
          setTitle(data.title ?? '');
          setSlug(data.slug ?? '');
          setSlugManuallyEdited(true);
          setExcerpt(data.excerpt ?? '');
          setContent(data.content ?? '');
          setCoverUrl(data.cover_image_url ?? '');
          setMetaTitle(data.meta_title ?? '');
          setMetaDesc(data.meta_description ?? '');
          setPublished(data.published ?? false);
        }
      } catch (err: any) {
        console.error(err);
        navigate('/admin/blog', { replace: true });
      } finally {
        setLoadingPost(false);
      }
    })();
  }, [id, navigate]);

  // Image upload
  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const sb = getSupabase();
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `blog/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: uploadErr } = await sb.storage.from('blog-images').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (uploadErr) throw uploadErr;
      const { data: urlData } = sb.storage.from('blog-images').getPublicUrl(path);
      setCoverUrl(urlData.publicUrl);
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  // Save
  const handleSave = async (publishNow: boolean) => {
    if (!title.trim()) { alert('Title is required.'); return; }
    if (!slug.trim()) { alert('Slug is required.'); return; }

    setSaving(true);
    try {
      const sb = getSupabase();
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim(),
        content,
        cover_image_url: coverUrl,
        meta_title: effectiveMetaTitle.trim(),
        meta_description: effectiveMetaDesc.trim(),
        published: publishNow,
        updated_at: new Date().toISOString(),
      };

      if (isEdit && id) {
        const { error } = await sb.from('blog_posts').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await sb.from('blog_posts').insert({ ...payload, created_at: new Date().toISOString() });
        if (error) throw error;
      }

      setToast(publishNow ? 'Post published!' : 'Draft saved!');
      setTimeout(() => navigate('/admin/blog'), 1000);
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const renderedHtml = useMemo(() => {
    try {
      const raw = marked.parse(content || '') as string;
      return DOMPurify.sanitize(raw, { ADD_TAGS: ['iframe'] });
    }
    catch { return '<p style="color:#f87171">Invalid markdown</p>'; }
  }, [content]);

  if (loadingPost) {
    return <div style={s.loading}>Loading post…</div>;
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={s.toast}>{toast}</div>
      )}

      {/* Header row */}
      <div style={s.topBar}>
        <div>
          <h1 style={s.heading}>{isEdit ? 'Edit Post' : 'New Post'}</h1>
        </div>
        <div style={s.topActions}>
          <button style={s.saveBtn} disabled={saving} onClick={() => handleSave(false)}>
            Save Draft
          </button>
          <button style={s.publishBtn} disabled={saving} onClick={() => handleSave(true)}>
            {published ? 'Update & Publish' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Title */}
      <label style={s.label}>
        <span style={s.labelText}>Title</span>
        <input
          style={s.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My new blog post"
        />
      </label>

      {/* Slug */}
      <label style={s.label}>
        <span style={s.labelText}>Slug</span>
        <div style={s.slugWrap}>
          <span style={s.slugPrefix}>/blog/</span>
          <input
            style={{ ...s.input, ...s.slugInput }}
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugManuallyEdited(true);
            }}
            placeholder="my-new-blog-post"
          />
        </div>
      </label>

      {/* Cover image */}
      <div style={s.label}>
        <span style={s.labelText}>Cover Image</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        {coverUrl ? (
          <div className="admin-cover-wrap" style={s.coverPreview}>
            <img src={coverUrl} alt="Cover preview" style={s.coverImg} />
            <div className="admin-cover-overlay" style={s.coverOverlay}>
              <button style={s.coverReplace} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? 'Uploading…' : 'Replace'}
              </button>
              <button style={s.coverRemove} onClick={() => setCoverUrl('')} disabled={uploading}>
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            style={s.uploadBtn}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : 'Upload cover image'}
          </button>
        )}
      </div>

      {/* Excerpt */}
      <label style={s.label}>
        <span style={s.labelText}>Excerpt</span>
        <textarea
          style={{ ...s.input, ...s.textareaShort }}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="A short summary for post previews…"
        />
      </label>

      {/* Content: markdown + preview */}
      <div style={s.label}>
        <span style={s.labelText}>Content (Markdown)</span>
        <div style={s.editorRow}>
          <textarea
            style={{ ...s.input, ...s.textareaTall, flex: 1 }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="# Hello world&#10;&#10;Write your post in markdown…"
          />
          <div
            className="blog-content"
            style={s.preview}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        </div>
      </div>

      {/* Meta title */}
      <label style={s.label}>
        <span style={s.labelText}>Meta Title</span>
        <input
          style={s.input}
          value={metaTitle}
          onChange={(e) => setMetaTitle(e.target.value)}
          placeholder={title || 'SEO title'}
        />
        <span style={{
          ...s.charCount,
          color: effectiveMetaTitle.length > MAX_META_TITLE ? '#f87171' : undefined,
        }}>
          {effectiveMetaTitle.length}/{MAX_META_TITLE}
        </span>
      </label>

      {/* Meta description */}
      <label style={s.label}>
        <span style={s.labelText}>Meta Description</span>
        <textarea
          style={{ ...s.input, ...s.textareaShort }}
          value={metaDesc}
          onChange={(e) => setMetaDesc(e.target.value)}
          placeholder={excerpt || 'SEO description'}
        />
        <span style={{
          ...s.charCount,
          color: effectiveMetaDesc.length > MAX_META_DESC ? '#f87171' : undefined,
        }}>
          {effectiveMetaDesc.length}/{MAX_META_DESC}
        </span>
      </label>

      {/* Published toggle */}
      <div style={s.toggleRow}>
        <span style={s.labelText}>Published</span>
        <button
          style={published ? s.toggleOn : s.toggleOff}
          onClick={() => setPublished(!published)}
          type="button"
        >
          <span style={{
            ...s.toggleDot,
            transform: published ? 'translateX(20px)' : 'translateX(2px)',
          }} />
        </button>
      </div>

      {/* Bottom save actions */}
      <div style={{ ...s.topActions, marginTop: 32, marginBottom: 64 }}>
        <button style={s.saveBtn} disabled={saving} onClick={() => handleSave(false)}>
          Save Draft
        </button>
        <button style={s.publishBtn} disabled={saving} onClick={() => handleSave(true)}>
          {published ? 'Update & Publish' : 'Publish'}
        </button>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  loading: { padding: 48, color: '#7c8aa8', fontSize: 14 },
  toast: {
    position: 'fixed', top: 24, right: 24, zIndex: 9999, padding: '12px 22px',
    borderRadius: 8, background: '#166534', color: '#4ade80', fontSize: 13, fontWeight: 600,
    border: '1px solid rgba(74, 222, 128, 0.3)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
  },
  topBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28,
  },
  heading: { margin: 0, fontSize: 22, fontWeight: 600, color: '#f0f4ff' },
  topActions: { display: 'flex', gap: 10 },
  saveBtn: {
    padding: '9px 20px', borderRadius: 7,
    border: '1px solid rgba(100, 160, 240, 0.18)', background: 'rgba(14, 22, 42, 0.6)',
    color: '#94a3b8', fontSize: 13, fontWeight: 500, cursor: 'pointer',
  },
  publishBtn: {
    padding: '9px 20px', borderRadius: 7, border: 'none',
    background: '#267dff', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  label: { display: 'flex', flexDirection: 'column' as const, gap: 6, marginBottom: 20 },
  labelText: { fontSize: 12, fontWeight: 600, color: '#7c8aa8', textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
  input: {
    padding: '10px 14px', borderRadius: 7,
    border: '1px solid rgba(100, 160, 240, 0.12)', background: 'rgba(6, 12, 28, 0.7)',
    color: '#e2e8f0', fontSize: 14, outline: 'none', fontFamily: 'inherit',
  },
  slugWrap: { display: 'flex', alignItems: 'center' },
  slugPrefix: {
    padding: '10px 12px', borderRadius: '7px 0 0 7px',
    border: '1px solid rgba(100, 160, 240, 0.12)', borderRight: 'none',
    background: 'rgba(14, 22, 42, 0.8)', color: '#5a6a84', fontSize: 14,
  },
  slugInput: { borderRadius: '0 7px 7px 0', fontFamily: 'monospace' },
  textareaShort: { resize: 'vertical' as const, minHeight: 72, lineHeight: 1.5 },
  textareaTall: { resize: 'vertical' as const, minHeight: 360, lineHeight: 1.6, fontFamily: 'monospace' },
  uploadBtn: {
    padding: '32px 20px', borderRadius: 7, cursor: 'pointer',
    border: '2px dashed rgba(100, 160, 240, 0.18)', background: 'rgba(6, 12, 28, 0.4)',
    color: '#7c8aa8', fontSize: 13, textAlign: 'center' as const,
  },
  coverPreview: { position: 'relative' as const, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(100, 160, 240, 0.1)' },
  coverImg: { width: '100%', height: 220, objectFit: 'cover' as const, display: 'block' },
  coverOverlay: {
    position: 'absolute', inset: 0, display: 'flex', gap: 10, alignItems: 'center',
    justifyContent: 'center', background: 'rgba(0,0,0,0.5)', opacity: 0, transition: 'opacity 200ms',
  },
  coverReplace: {
    padding: '7px 16px', borderRadius: 6, border: 'none',
    background: '#267dff', color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer',
  },
  coverRemove: {
    padding: '7px 16px', borderRadius: 6,
    border: '1px solid rgba(248, 113, 113, 0.3)', background: 'rgba(0,0,0,0.4)',
    color: '#f87171', fontSize: 12, fontWeight: 500, cursor: 'pointer',
  },
  editorRow: { display: 'flex', gap: 12 },
  preview: {
    flex: 1, padding: '14px 18px', borderRadius: 7, overflow: 'auto',
    border: '1px solid rgba(100, 160, 240, 0.08)', background: 'rgba(6, 12, 28, 0.5)',
    color: '#c8d2e0', fontSize: 14, lineHeight: 1.6, minHeight: 360,
  },
  charCount: { fontSize: 12, color: '#5a6a84' },
  toggleRow: {
    display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20,
  },
  toggleOn: {
    width: 44, height: 24, borderRadius: 12, padding: 0, border: 'none',
    background: '#267dff', cursor: 'pointer', position: 'relative' as const,
  },
  toggleOff: {
    width: 44, height: 24, borderRadius: 12, padding: 0,
    border: '1px solid rgba(100, 160, 240, 0.2)', background: 'rgba(14, 22, 42, 0.6)',
    cursor: 'pointer', position: 'relative' as const,
  },
  toggleDot: {
    position: 'absolute', top: 2, left: 0, width: 18, height: 18, borderRadius: 9,
    background: '#fff', transition: 'transform 180ms ease',
  },
};
