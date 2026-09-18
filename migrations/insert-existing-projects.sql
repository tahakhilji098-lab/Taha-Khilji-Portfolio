-- =============================================================
-- MIGRATION: Insert original hardcoded projects into projects table
-- Run this ONCE in the Supabase SQL Editor.
-- =============================================================

INSERT INTO projects (title, slug, category, description, cover_image_url, gallery_urls, meta_title, meta_description, published, display_order, created_at, updated_at)

VALUES
  -- 1. Aureli (Brand Identity)
  (
    'Aureli',
    'aureli-brand-identity',
    'Brand Identity',
    'A complete visual identity and stationery system for Aureli, marrying Swiss grid discipline with tactile foil stamping and custom serif typography.',
    '/images/work/work-01-aureli-brand-identity.png',
    ARRAY[
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      '/images/work/work-01-aureli-brand-identity.png',
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
    ],
    'Aureli — Luxury Brand Identity & Stationery System | Taha Khilji',
    'A complete visual identity and stationery system for Aureli, combining Swiss grid discipline with tactile foil stamping and custom serif typography.',
    true,
    1,
    '2025-01-01T00:00:00Z',
    '2025-01-01T00:00:00Z'
  ),

  -- 2. Noma Studio (Social Media Design)
  (
    'Noma Studio',
    'noma-social-campaign',
    'Social Media Design',
    'An expressive social media campaign and paper-tear poster series exploring kinetic typography, vibrant ultramarine blues, and street art textures.',
    '/images/work/work-02-noma-social-campaign.png',
    ARRAY[
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80'
    ],
    'Noma Studio — Social Media Campaign & Art Direction | Taha Khilji',
    'An expressive social media campaign and paper-tear poster series exploring kinetic typography, vibrant ultramarine blues, and street art textures.',
    true,
    2,
    '2025-02-01T00:00:00Z',
    '2025-02-01T00:00:00Z'
  ),

  -- 3. Vertex (Packaging)
  (
    'Vertex',
    'vertex-adaptogen-packaging',
    'Packaging',
    'Bespoke packaging design and label architecture for a daily focus adaptogen blend utilizing soft-touch matte black boxes and stainless tumblers.',
    '/images/work/work-03-vertex-packaging.png',
    ARRAY[
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
      '/images/work/work-03-vertex-packaging.png',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80'
    ],
    'Vertex — Matte Black Adaptogen Packaging Design | Taha Khilji',
    'Bespoke packaging design and label architecture for a daily focus adaptogen blend with soft-touch matte black boxes and stainless tumblers.',
    true,
    3,
    '2024-06-01T00:00:00Z',
    '2024-06-01T00:00:00Z'
  ),

  -- 4. Mono (Editorial)
  (
    'Mono',
    'mono-editorial-poster',
    'Editorial',
    'An editorial publication and poster series documenting brutalist monoliths across Europe with minimalist typography and stark monochrome photography.',
    '/images/work/work-04-mono-editorial.png',
    ARRAY[
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80'
    ],
    'Mono — Limited Edition Architectural Poster Series | Taha Khilji',
    'An editorial publication and poster series documenting brutalist monoliths across Europe with minimalist typography and stark monochrome photography.',
    true,
    4,
    '2024-03-01T00:00:00Z',
    '2024-03-01T00:00:00Z'
  ),

  -- 5. Northline (Website UI Design)
  (
    'Northline',
    'northline-digital-experience',
    'Website UI Design',
    'A dark-mode digital platform and UI design system built for an architectural collective, featuring immersive editorial layouts and micro-interactions.',
    '/images/work/work-05-northline-website.png',
    ARRAY[
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'
    ],
    'Northline — Bespoke Web Experience & UI Design System | Taha Khilji',
    'A dark-mode digital platform and UI design system for an architectural collective, featuring immersive editorial layouts and micro-interactions.',
    true,
    5,
    '2025-01-15T00:00:00Z',
    '2025-01-15T00:00:00Z'
  ),

  -- 6. Clarity (Advertising)
  (
    'Clarity',
    'clarity-outdoor-advertising',
    'Advertising',
    'A high-impact urban billboard and outdoor advertising campaign with minimalist messaging that cuts through city noise.',
    '/images/work/work-06-clarity-advertising.png',
    ARRAY[
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80'
    ],
    'Clarity — Out-of-Home Advertising Campaign & Billboard System | Taha Khilji',
    'A high-impact urban billboard and outdoor advertising campaign with minimalist messaging that cuts through city noise.',
    true,
    6,
    '2024-09-01T00:00:00Z',
    '2024-09-01T00:00:00Z'
  );
