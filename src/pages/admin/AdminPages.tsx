import React from 'react';

export default function BlogPlaceholder() {
  return (
    <div>
      <h1 style={styles.heading}>Blog</h1>
      <p style={styles.sub}>Create, edit, and publish blog posts.</p>
      <div style={styles.placeholder}>
        <p>Blog management coming soon.</p>
      </div>
    </div>
  );
}

export function ProjectsPlaceholder() {
  return (
    <div>
      <h1 style={styles.heading}>Projects</h1>
      <p style={styles.sub}>Manage your portfolio projects and gallery images.</p>
      <div style={styles.placeholder}>
        <p>Project management coming soon.</p>
      </div>
    </div>
  );
}

export function SeoPlaceholder() {
  return (
    <div>
      <h1 style={styles.heading}>SEO Settings</h1>
      <p style={styles.sub}>Configure meta titles, descriptions, and OG images per page.</p>
      <div style={styles.placeholder}>
        <p>SEO settings coming soon.</p>
      </div>
    </div>
  );
}

export function LeadsPlaceholder() {
  return (
    <div>
      <h1 style={styles.heading}>Leads</h1>
      <p style={styles.sub}>View and manage contact form submissions.</p>
      <div style={styles.placeholder}>
        <p>Lead management coming soon.</p>
      </div>
    </div>
  );
}

export function AnalyticsPlaceholder() {
  return (
    <div>
      <h1 style={styles.heading}>Analytics</h1>
      <p style={styles.sub}>Basic page view analytics.</p>
      <div style={styles.placeholder}>
        <p>Analytics dashboard coming soon.</p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: { margin: '0 0 4px', fontSize: 22, fontWeight: 600, color: '#f0f4ff' },
  sub: { margin: '0 0 24px', fontSize: 14, color: '#7c8aa8' },
  placeholder: {
    padding: '48px 24px',
    borderRadius: 10,
    background: 'rgba(14, 22, 42, 0.5)',
    border: '1px dashed rgba(100, 160, 240, 0.12)',
    color: '#5a6a84',
    fontSize: 14,
    textAlign: 'center',
  },
};
