export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: 'Brand Identity' | 'Editorial' | 'Packaging' | 'Digital & Motion' | 'Visual Systems' | 'Social Media Design' | 'Website UI Design' | 'Advertising' | string;
  year: string;
  client: string;
  thumbnail: string;
  description: string;
  deliverables: string[];
  challenge?: string;
  solution?: string;
  featured?: boolean;
  galleryImages?: string[];
  role?: string;
  services?: string[];
  outcome?: string;
}

export interface Service {
  id: string;
  number: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  deliverables: string[];
  iconName: string;
  highlight?: string;
  imagePreview?: string;
  description?: string;
  image?: string;
  alt?: string;
  imagePosition?: string;
}

export interface ProcessStep {
  stepNumber: string;
  title: string;
  tagline: string;
  description: string;
  details: string[];
}

export interface Testimonial {
  id: string;
  quote: string;
  excerpt?: string;
  authorName: string;
  authorRole: string;
  companyName: string;
  avatarUrl?: string;
  rating: number;
  projectTag: string;
}

export interface SkillItem {
  category: string;
  skills: string[];
}

export interface AwardItem {
  year: string;
  title: string;
  organization: string;
  project: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  serviceNeeded: string;
  budgetRange: string;
  message: string;
}
