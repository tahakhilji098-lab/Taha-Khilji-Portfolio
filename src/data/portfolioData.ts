import { Project, Service, ProcessStep, Testimonial, AwardItem } from '../types';
import tahaPortrait from '../assets/images/taha.png';
import brandMockup from '../assets/images/brand_mockup_1785252185476.jpg';
import packagingMockup from '../assets/images/packaging_mockup_1785252204708.jpg';

export const TAHA_INFO = {
  name: 'Taha Khilji',
  role: 'Senior Graphic Designer & Art Director',
  tagline: 'Crafting Bold Visual Identities, Precision Editorial Layouts & Scalable Brand Systems.',
  shortBio: 'Independent graphic designer with over 8 years of experience helping ambitious brands, culture-makers, and emerging startups stand out through typography-first brand identity and visual hierarchy.',
  location: 'Lahore, PK • Available Worldwide',
  email: 'taha.khilji.design@gmail.com',
  phone: '+92 300 123 4567',
  availability: 'Available for Q3/Q4 Brand & Design Commissions',
  avatar: tahaPortrait,
  stats: [
    { label: 'Years Experience', value: '8+' },
    { label: 'Projects Completed', value: '140+' },
    { label: 'Design Awards', value: '12' },
    { label: 'Client Retention', value: '98%' },
  ],
  socials: [
    { name: 'Behance', url: 'https://behance.net', icon: 'FolderKanban' },
    { name: 'Dribbble', url: 'https://dribbble.net', icon: 'Dribbble' },
    { name: 'LinkedIn', url: 'https://linkedin.com', icon: 'Linkedin' },
    { name: 'Instagram', url: 'https://instagram.com', icon: 'Instagram' },
  ],
};

export const PROJECTS: Project[] = [
  {
    id: 'aureli-brand-identity',
    title: 'Aureli',
    subtitle: 'Luxury brand identity & stationery system',
    category: 'Brand Identity',
    year: '2025',
    client: 'Aureli Atelier',
    thumbnail: '/images/work/work-01-aureli-brand-identity.png',
    description: 'A complete visual identity and stationery system for Aureli, marrying Swiss grid discipline with tactile foil stamping and custom serif typography.',
    deliverables: ['Logo & Mark System', 'Brand Guidelines (120p)', 'Gold Foil Stationery', 'Custom Logotype'],
    challenge: 'Aureli needed a brand system that communicated bespoke heritage while remaining modern and legible across digital touchpoints.',
    solution: 'Designed a custom serif logotype paired with a strict modular grid and tactile charcoal paper stock.',
    role: 'Lead Designer & Art Director',
    services: ['Brand Strategy', 'Identity Design', 'Art Direction'],
    outcome: 'A refined visual system combining tactile black materials, elegant typography and restrained gold detailing.',
    featured: true,
    galleryImages: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      brandMockup,
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'noma-social-campaign',
    title: 'Noma Studio',
    subtitle: 'Dynamic social media design & campaign art direction',
    category: 'Social Media Design',
    year: '2025',
    client: 'Noma Creative Collective',
    thumbnail: '/images/work/work-02-noma-social-campaign.png',
    description: 'An expressive social media campaign and paper-tear poster series exploring kinetic typography, vibrant ultramarine blues, and street art textures.',
    deliverables: ['Social Campaign Templates', 'Instagram Motion Stories', 'Event Posters', 'Typography System'],
    challenge: 'Creating a high-octane social design language that cuts through crowded feeds while maintaining brand consistency.',
    solution: 'Engineered a high-contrast palette of electric cobalt blue, distressed paper textures, and heavy display type.',
    role: 'Campaign Art Director',
    services: ['Campaign Concept', 'Typography', 'Social Art Direction'],
    outcome: 'A bold editorial campaign system using expressive typography, cobalt color and physical poster textures.',
    featured: true,
    galleryImages: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'vertex-adaptogen-packaging',
    title: 'Vertex',
    subtitle: 'Matte black adaptogen packaging & structural design',
    category: 'Packaging',
    year: '2024',
    client: 'Vertex Wellness Co.',
    thumbnail: '/images/work/work-03-vertex-packaging.png',
    description: 'Bespoke packaging design and label architecture for a daily focus adaptogen blend utilizing soft-touch matte black boxes and stainless tumblers.',
    deliverables: ['Outer Carton Dielines', 'Bottle & Capsule Labels', 'Foil Stamping Dies', 'Unboxing Experience'],
    challenge: 'Standing out in a saturated wellness market while ensuring 100% recyclable material specifications.',
    solution: 'Utilized ultra-clean technical hierarchy on soft-touch black board with geometric silver hot foil accent.',
    role: 'Packaging Designer',
    services: ['Packaging System', 'Visual Identity', 'Product Presentation'],
    outcome: 'A technical premium packaging system built around black materials, precision and electric-blue details.',
    featured: true,
    galleryImages: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
      packagingMockup,
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'mono-editorial-poster',
    title: 'Mono',
    subtitle: 'Limited edition architectural poster series & editorial layout',
    category: 'Editorial',
    year: '2024',
    client: 'Mono Architectural Press',
    thumbnail: '/images/work/work-04-mono-editorial.png',
    description: 'An editorial publication and poster series documenting brutalist monoliths across Europe with minimalist typography and stark monochrome photography.',
    deliverables: ['Editorial Multi-column Grid', 'Poster Series (12 Layouts)', 'Type Hierarchy Rules', 'Pre-Press File Prep'],
    challenge: 'Balancing image density with serene white space to embody minimalist architectural philosophy.',
    solution: 'Designed an asymmetric 6-column grid system paired with understated serif headlines.',
    role: 'Editorial Designer',
    services: ['Publication Design', 'Typography', 'Grid System'],
    outcome: 'A minimal modernist publication exploring architectural form, proportion and negative space.',
    featured: true,
    galleryImages: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'northline-digital-experience',
    title: 'Northline',
    subtitle: 'Bespoke web experience & UI design system',
    category: 'Website UI Design',
    year: '2025',
    client: 'Northline Studio',
    thumbnail: '/images/work/work-05-northline-website.png',
    description: 'A dark-mode digital platform and UI design system built for an architectural collective, featuring immersive editorial layouts and micro-interactions.',
    deliverables: ['UI/UX Wireframes', 'Design System Library', 'Desktop & Mobile Layouts', 'Interactive Prototypes'],
    challenge: 'Translating physical architectural space into a smooth, responsive web layout.',
    solution: 'Crafted a fluid dark mode grid with spacious margins, subtle border rules, and crisp typography.',
    role: 'UX/UI Designer',
    services: ['UX/UI', 'Responsive Design', 'Digital Art Direction'],
    outcome: 'A cinematic digital experience combining architectural imagery, editorial typography and a restrained dark interface.',
    featured: true,
    galleryImages: [
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'clarity-outdoor-advertising',
    title: 'Clarity',
    subtitle: 'Out-of-home advertising campaign & billboard system',
    category: 'Advertising',
    year: '2024',
    client: 'Clarity App',
    thumbnail: '/images/work/work-06-clarity-advertising.png',
    description: 'A high-impact urban billboard and outdoor advertising campaign with minimalist messaging that cuts through city noise.',
    deliverables: ['Large Format Billboards', 'Transit Stop Media', 'Digital Out-of-Home Graphics', 'Campaign Guidelines'],
    challenge: 'Communicating a complex digital wellness message in under 3 seconds to moving pedestrians and commuters.',
    solution: 'Paired oversized serif typography with ethereal imagery and hyper-focused messaging: "See what matters. Cut the rest."',
    role: 'Advertising Art Director',
    services: ['Campaign Concept', 'Visual Direction', 'Outdoor Advertising'],
    outcome: 'A conceptual campaign using monochrome portraiture, architecture and visual simplicity to communicate focus.',
    featured: true,
    galleryImages: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80'
    ]
  }
];

export const SERVICES: Service[] = [
  {
    id: 'brand-identity',
    number: '01',
    title: 'Brand Identity Design',
    shortDesc: 'Crafting memorable identities that define and differentiate.',
    fullDesc: 'Building holistic visual identities from initial strategy to complete design execution. Includes logo marks, typography systems, color palettes, and comprehensive guidelines.',
    deliverables: [
      'Logo Mark & System Architecture',
      'Comprehensive Brand Guidelines (120p)',
      'Typography Selection & Pairing Rules',
      'Brand Collateral & Stationery Suites'
    ],
    iconName: 'Palette',
    highlight: 'Core Expertise',
    imagePreview: '/images/services/service-01-brand-identity-hover.png',
    description: 'Distinctive identity systems that turn strategy into recognition.',
    image: '/images/services/service-01-brand-identity-hover.png',
    alt: 'Premium cobalt and black brand identity system',
    imagePosition: 'center center'
  },
  {
    id: 'social-media',
    number: '02',
    title: 'Social Media Creatives',
    shortDesc: 'Scroll-stopping visuals that engage and grow your audience.',
    fullDesc: 'High-octane social campaigns, kinetic motion templates, and carousel graphics designed to maximize feed retention and brand authority.',
    deliverables: [
      'Social Campaign Systems & Templates',
      'Kinetic Motion Stories & Reels Assets',
      'High-Impact Feed Carousels',
      'Channel Art & Digital Guidelines'
    ],
    iconName: 'Sparkles',
    imagePreview: '/images/services/service-02-social-media-hover.png',
    description: 'Platform-ready visuals designed to stop, engage and convert.',
    image: '/images/services/service-02-social-media-hover.png',
    alt: 'Cohesive social media campaign displayed across mobile screens',
    imagePosition: 'center center'
  },
  {
    id: 'advertising-design',
    number: '03',
    title: 'Advertising Design',
    shortDesc: 'Bold, persuasive designs that capture attention and drive action.',
    fullDesc: 'High-converting ad creatives across digital billboards, print placements, transit media, and performance marketing channels.',
    deliverables: [
      'Digital & Print Advertising Systems',
      'Large-Format Billboard & Transit Media',
      'Performance Marketing Creatives',
      'Campaign Messaging Architecture'
    ],
    iconName: 'Compass',
    imagePreview: '/images/services/service-03-advertising-hover.png',
    description: 'Campaign visuals engineered to capture attention and inspire action.',
    image: '/images/services/service-03-advertising-hover.png',
    alt: 'Cinematic black performance sneaker advertising concept',
    imagePosition: '54% center'
  },
  {
    id: 'packaging-design',
    number: '04',
    title: 'Packaging Design',
    shortDesc: 'Packaging that protects, communicates, and stands out.',
    fullDesc: 'Shelf-stopping product packaging and tactile unboxing experiences created with meticulous attention to material, finishes, and label hierarchy.',
    deliverables: [
      'Structural Box & Sleeve Packaging',
      'Cosmetics & Beverage Label Systems',
      'Custom Dieline Vectoring & Spot Finishes',
      'Retail Mockups & 3D Render Briefs'
    ],
    iconName: 'Package',
    imagePreview: '/images/services/service-04-packaging-hover.png',
    description: 'Shelf-ready packaging that makes product value tangible.',
    image: '/images/services/service-04-packaging-hover.png',
    alt: 'Premium black and cobalt packaging design system',
    imagePosition: 'center center'
  },
  {
    id: 'website-ui-design',
    number: '05',
    title: 'Website UI Design',
    shortDesc: 'Intuitive, clean interfaces that elevate user experience.',
    fullDesc: 'Bespoke web layouts and digital product design systems built with precision typography, responsive fluid grids, and sleek interaction states.',
    deliverables: [
      'Desktop & Mobile UI/UX Wireframes',
      'Design System Components & Tokens',
      'Interactive Figma Prototypes',
      'Developer Handoff Documentation'
    ],
    iconName: 'Sparkles',
    imagePreview: '/images/services/service-05-website-ui-hover.png',
    description: 'Responsive digital experiences shaped around clarity and conversion.',
    image: '/images/services/service-05-website-ui-hover.png',
    alt: 'Dark premium SaaS dashboard interface',
    imagePosition: 'center center'
  },
  {
    id: 'print-marketing',
    number: '06',
    title: 'Print & Marketing Materials',
    shortDesc: 'High-quality materials that leave a lasting impression.',
    fullDesc: 'Tactile printed collateral from editorial monographs, annual reports, and brochures to trade show exhibition graphics and fine art prints.',
    deliverables: [
      'Editorial Monograph & Book Layouts',
      'Corporate Reports & Pitch Decks',
      'Exhibition Booth & Event Print Systems',
      'Pre-Press & Special Finishes Supervision'
    ],
    iconName: 'BookOpen',
    imagePreview: '/images/services/service-06-print-marketing-hover.png',
    description: 'Tactile brand assets designed to leave a lasting impression.',
    image: '/images/services/service-06-print-marketing-hover.png',
    alt: 'Modern black, cream and cobalt printed collateral',
    imagePosition: 'center center'
  }
];

export const PROCESS_STEPS: ProcessStep[] = [
  {
    stepNumber: '01',
    title: 'Discover',
    tagline: 'Uncovering core goals, audience insights, and brand benchmarks.',
    description: 'I learn about your goals, audience, and challenges to uncover insights that shape the right direction.',
    details: [
      'Discovery brief & goal alignment',
      'Market & visual competitor research',
      'Audience mapping & visual direction moodboard'
    ]
  },
  {
    stepNumber: '02',
    title: 'Strategize',
    tagline: 'Defining the creative roadmap and structural framework.',
    description: 'I define the strategy, structure, and creative framework that aligns with your objectives.',
    details: [
      'Positioning & brand architecture',
      'Concept exploration & messaging hierarchy',
      'Visual directions & grid rules'
    ]
  },
  {
    stepNumber: '03',
    title: 'Design',
    tagline: 'Crafting refined, high-impact visual solutions.',
    description: 'I craft refined visual solutions with intention, precision, and a focus on impact.',
    details: [
      'Visual execution & typography pairing',
      'Real-world mockups & asset creation',
      'Feedback integration & detail polish'
    ]
  },
  {
    stepNumber: '04',
    title: 'Deliver',
    tagline: 'Finalizing production-ready master files and guidelines.',
    description: 'I deliver polished, production-ready assets that elevate your brand and drive results.',
    details: [
      'Master vector & raster files',
      'Comprehensive Brand Guidelines handbook',
      'Print & digital asset export handoff'
    ]
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    quote: 'Taha transformed our ideas into a visual identity that feels unmistakably ours. His strategic approach and attention to detail elevated our brand to a whole new tier.',
    excerpt: 'Taha transformed our ideas into a visual identity that feels unmistakably ours.',
    authorName: 'Sarah Malik',
    authorRole: 'Founder & CEO',
    companyName: 'Noma Studio',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    projectTag: 'Brand Identity'
  },
  {
    id: 't2',
    quote: 'Working with Taha Khilji was an effortless masterclass in design. Our organic elixir packaging jumped off retailer shelves immediately after launch.',
    excerpt: 'Working with Taha was an effortless masterclass in design — our packaging jumped off the shelves.',
    authorName: 'Sarah Jenkins',
    authorRole: 'Creative Director',
    companyName: 'Solace Organics UK',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    projectTag: 'Packaging Design'
  },
  {
    id: 't3',
    quote: 'Professional, insanely creative, and exceptionally reliable. Taha handled our 280-page architecture monograph with flawless typographic precision.',
    excerpt: 'Professional, insanely creative, and exceptionally reliable. Our 280-page monograph was flawless.',
    authorName: 'Kenji Takahashi',
    authorRole: 'Managing Director',
    companyName: 'Kanso Press Tokyo',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    projectTag: 'Editorial Layout'
  },
  {
    id: 't4',
    quote: 'Taha transformed our digital presence into a crisp visual system. The level of craft and strategic communication he delivers is truly unmatched.',
    excerpt: 'Taha transformed our digital presence into a crisp visual system. His craft and strategic communication are unmatched.',
    authorName: 'Elias Lindqvist',
    authorRole: 'Co-Founder',
    companyName: 'Aethel Atelier',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    projectTag: 'Website UI Design'
  },
  {
    id: 't5',
    quote: 'The campaign graphics and billboard system Taha designed gave our international summit immediate prestige and record-breaking turnout.',
    excerpt: 'The campaign graphics and billboard system Taha designed gave our summit immediate prestige.',
    authorName: 'Amara Chen',
    authorRole: 'Head of Marketing',
    companyName: 'Vortex Cultural Summit',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    projectTag: 'Advertising & Campaign'
  }
];

export const AWARDS: AwardItem[] = [
  { year: '2025', title: 'Brand Identity of the Year', organization: 'Design Excellence Asia', project: 'Aethel Atelier' },
  { year: '2024', title: 'Best Packaging Gold Award', organization: 'International Package Design Awards', project: 'Solace Organic' },
  { year: '2024', title: 'Editorial Design Selection', organization: 'Typography Annual 65', project: 'KANSO Monograph' },
  { year: '2023', title: 'Environmental Graphics Honors', organization: 'Spatial Design Society', project: 'Lumina Museum' },
];

export const SKILLS_LIST = [
  { category: 'Design Expertise', skills: ['Brand Identity', 'Typography', 'Grid Systems', 'Packaging Design', 'Editorial Layout', 'Art Direction', 'Wayfinding & Signage', 'Motion Graphics'] },
  { category: 'Software & Tools', skills: ['Adobe Illustrator', 'Adobe Photoshop', 'Adobe InDesign', 'Figma', 'Adobe After Effects', 'Cinema 4D', 'Glyphs (Type Design)', 'Midjourney/AI Tools'] },
  { category: 'Print & Production', skills: ['Pre-Press Preparation', 'Color Separation (CMYK/Pantone)', 'Foil & Emboss Dielines', 'Paper Stock Selection', 'Print Supervision'] }
];
