import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSupabase } from '../../lib/supabase';

const MAX_META_TITLE = 60;
const MAX_META_DESC = 160;
const CATEGORIES = ['Brand Identity', 'Editorial', 'Packaging', 'Digital & Motion', 'Visual Systems', 'Social Media Design', 'Website UI Design', 'Advertising'];

function generateSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

export default function ProjectEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [published, setPublished] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [loadingProject, setLoadingProject] = useState(isEdit);

  const effectiveMetaTitle = metaTitle || title;
  const effectiveMetaDesc = metaDesc || description.slice(0, 160);

  useEffect(() => {
    if (!slugManuallyEdited) setSlug(generateSlug(title));
  }, [title, slugManuallyEdited]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const sb = getSupabase();
        const { data, error } = await sb.from('projects').select('*').eq('id', id).single();
        if (error) throw error;
        if (data) {
          setTitle(data.title ?? '');
          setSlug(data.slug ?? '');
          setSlugManuallyEdited(true);
          setCategory(data.category ?? '');
          setDescription(data.description ?? '');
          setCoverUrl(data.cover_image_url ?? '');
          setGalleryUrls(data.gallery_urls ?? []);
          setMetaTitle(data.meta_title ?? '');
          setMetaDesc(data.meta_description ?? '');
          setPublished(data.published ?? false);
          setDisplayOrder(data.display_order ?? 0);
        }
      } catch (err: any) {
        console.error(err);
        navigate('/admin/projects', { replace: true });
      } finally {
        setLoadingProject(false);
      }
    })();
  }, [id, navigate]);

  const uploadImage = useCallback(async (file: File, bucket: string): Promise<string | null> => {
    const sb = getSupabase();
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${bucket}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await sb.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: false });
    if (error) throw error;
    const { data } = sb.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }, []);

  const handleCoverUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, 'project-images');
      if (url) setCoverUrl(url);
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  }, [uploadImage]);

  const handleGalleryUpload = useCallback(async (files: FileList) => {
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        const url = await uploadImage(file, 'project-images');
        if (url) urls.push(url);
      }
      setGalleryUrls((prev) => [...prev, ...urls]);
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  }, [uploadImage]);

  const removeGalleryImage = (idx: number) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveGalleryImage = (idx: number, direction: 'up' | 'down') => {
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= galleryUrls.length) return;
    const updated = [...galleryUrls];
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    setGalleryUrls(updated);
  };

  const handleSave = async (publishNow: boolean) => {
    if (!title.trim()) { alert('Title is required.'); return; }
    if (!slug.trim()) { alert('Slug is required.'); return; }
    setSaving(true);
    try {
      const sb = getSupabase();
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        category: category.trim(),
        description,
        cover_image_url: coverUrl,
        gallery_urls: galleryUrls,
        meta_title: effectiveMetaTitle.trim(),
        meta_description: effectiveMetaDesc.trim(),
        published: publishNow,
        display_order: displayOrder,
        updated_at: new Date().toISOString(),
      };
      if (isEdit && id) {
        const { error } = await sb.from('projects').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await sb.from('projects').insert({ ...payload, created_at: new Date().toISOString() });
        if (error) throw error;
      }
      setToast(publishNow ? 'Project published!' : 'Draft saved!');
      setTimeout(() => navigate('/admin/projects'), 1000);
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loadingProject) return <div style={st.loading}>Loading project…</div>;

  return (
    <div>
      {toast && <div style={st.toast}>{toast}</div>}

      <div style={st.topBar}>
        <h1 style={st.heading}>{isEdit ? 'Edit Project' : 'New Project'}</h1>
        <div style={st.topActions}>
          <button style={st.saveBtn} disabled={saving} onClick={() => handleSave(false)}>Save Draft</button>
          <button style={st.publishBtn} disabled={saving} onClick={() => handleSave(true)}>
            {published ? 'Update & Publish' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Title */}
      <label style={st.label}>
        <span style={st.labelText}>Title</span>
        <input style={st.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My new project" />
      </label>

      {/* Slug */}
      <label style={st.label}>
        <span style={st.labelText}>Slug</span>
        <div style={st.slugWrap}>
          <span style={st.slugPrefix}>/work/</span>
          <input style={{ ...st.input, ...st.slugInput }} value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugManuallyEdited(true); }}
            placeholder="my-new-project" />
        </div>
      </label>

      {/* Category */}
      <label style={st.label}>
        <span style={st.labelText}>Category</span>
        <input style={st.input} value={category} onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Brand Identity" list="category-list" />
        <datalist id="category-list">
          {CATEGORIES.map((c) => <option key={c} value={c} />)}
        </datalist>
      </label>

      {/* Description */}
      <label style={st.label}>
        <span style={st.labelText}>Description</span>
        <textarea style={{ ...st.input, ...st.textarea }} value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the project…" />
      </label>

      {/* Cover image */}
      <div style={st.label}>
        <span style={st.labelText}>Cover Image</span>
        <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])} />
        {coverUrl ? (
          <div style={st.coverPreview}>
            <img src={coverUrl} alt="" style={st.coverImg} />
            <div style={st.coverOverlay}>
              <button style={st.coverBtn} onClick={() => coverInputRef.current?.click()} disabled={uploading}>
                {uploading ? '…' : 'Replace'}
              </button>
              <button style={st.coverBtn} onClick={() => setCoverUrl('')} disabled={uploading}>Remove</button>
            </div>
          </div>
        ) : (
          <button style={st.uploadBtn} onClick={() => coverInputRef.current?.click()} disabled={uploading}>
            {uploading ? 'Uploading…' : 'Upload cover image'}
          </button>
        )}
      </div>

      {/* Gallery */}
      <div style={st.label}>
        <span style={st.labelText}>Gallery Images</span>
        <input ref={galleryInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
          onChange={(e) => e.target.files && handleGalleryUpload(e.target.files)} />
        {galleryUrls.length > 0 && (
          <div style={st.galleryGrid}>
            {galleryUrls.map((url, idx) => (
              <div key={idx} style={st.galleryItem}>
                <img src={url} alt="" style={st.galleryImg} />
                <div style={st.galleryActions}>
                  <button style={st.galleryArrow} disabled={idx === 0} onClick={() => moveGalleryImage(idx, 'up')} title="Move left">◀</button>
                  <button style={st.galleryArrow} disabled={idx === galleryUrls.length - 1} onClick={() => moveGalleryImage(idx, 'down')} title="Move right">▶</button>
                  <button style={st.galleryRemove} onClick={() => removeGalleryImage(idx)} title="Remove">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <button style={st.uploadBtn} onClick={() => galleryInputRef.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading…' : `Add images${galleryUrls.length > 0 ? ` (${galleryUrls.length} total)` : ''}`}
        </button>
      </div>

      {/* Display order */}
      <label style={st.label}>
        <span style={st.labelText}>Display Order</span>
        <input style={{ ...st.input, width: 100 }} type="number" value={displayOrder}
          onChange={(e) => setDisplayOrder(Number(e.target.value))} min={0} />
      </label>

      {/* Meta title */}
      <label style={st.label}>
        <span style={st.labelText}>Meta Title</span>
        <input style={st.input} value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder={title || 'SEO title'} />
        <span style={{ ...st.charCount, color: effectiveMetaTitle.length > MAX_META_TITLE ? '#f87171' : undefined }}>
          {effectiveMetaTitle.length}/{MAX_META_TITLE}
        </span>
      </label>

      {/* Meta description */}
      <label style={st.label}>
        <span style={st.labelText}>Meta Description</span>
        <textarea style={{ ...st.input, minHeight: 64 }} value={metaDesc}
          onChange={(e) => setMetaDesc(e.target.value)} placeholder={description.slice(0, 160) || 'SEO description'} />
        <span style={{ ...st.charCount, color: effectiveMetaDesc.length > MAX_META_DESC ? '#f87171' : undefined }}>
          {effectiveMetaDesc.length}/{MAX_META_DESC}
        </span>
      </label>

      {/* Published toggle */}
      <div style={st.toggleRow}>
        <span style={st.labelText}>Published</span>
        <button style={published ? st.toggleOn : st.toggleOff} onClick={() => setPublished(!published)} type="button">
          <span style={{ ...st.toggleDot, transform: published ? 'translateX(20px)' : 'translateX(2px)' }} />
        </button>
      </div>

      {/* Bottom save */}
      <div style={{ ...st.topActions, marginTop: 32, marginBottom: 64 }}>
        <button style={st.saveBtn} disabled={saving} onClick={() => handleSave(false)}>Save Draft</button>
        <button style={st.publishBtn} disabled={saving} onClick={() => handleSave(true)}>
          {published ? 'Update & Publish' : 'Publish'}
        </button>
      </div>
    </div>
  );
}

const st: Record<string, React.CSSProperties> = {
  loading: { padding: 48, color: '#7c8aa8', fontSize: 14 },
  toast: {
    position: 'fixed', top: 24, right: 24, zIndex: 9999, padding: '12px 22px',
    borderRadius: 8, background: '#166534', color: '#4ade80', fontSize: 13, fontWeight: 600,
    border: '1px solid rgba(74, 222, 128, 0.3)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
  },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
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
  textarea: { resize: 'vertical' as const, minHeight: 120, lineHeight: 1.5 },
  uploadBtn: {
    padding: '28px 20px', borderRadius: 7, cursor: 'pointer',
    border: '2px dashed rgba(100, 160, 240, 0.18)', background: 'rgba(6, 12, 28, 0.4)',
    color: '#7c8aa8', fontSize: 13, textAlign: 'center' as const,
  },
  coverPreview: { position: 'relative' as const, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(100, 160, 240, 0.1)' },
  coverImg: { width: '100%', height: 220, objectFit: 'cover' as const, display: 'block' },
  coverOverlay: {
    position: 'absolute', inset: 0, display: 'flex', gap: 10, alignItems: 'center',
    justifyContent: 'center', background: 'rgba(0,0,0,0.5)',
  },
  coverBtn: {
    padding: '7px 16px', borderRadius: 6, border: 'none',
    background: '#267dff', color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer',
  },
  galleryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 12 },
  galleryItem: { position: 'relative' as const, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(100, 160, 240, 0.1)' },
  galleryImg: { width: '100%', height: 120, objectFit: 'cover' as const, display: 'block' },
  galleryActions: {
    position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex',
    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
  },
  galleryArrow: {
    flex: 1, padding: '6px 0', border: 'none', background: 'transparent',
    color: '#94a3b8', fontSize: 10, cursor: 'pointer', textAlign: 'center' as const,
  },
  galleryRemove: {
    padding: '6px 10px', border: 'none', background: 'transparent',
    color: '#f87171', fontSize: 12, cursor: 'pointer',
  },
  charCount: { fontSize: 12, color: '#5a6a84' },
  toggleRow: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 },
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
