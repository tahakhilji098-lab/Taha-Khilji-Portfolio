import React from 'react';

interface PersonSeoProps {
  name?: string;
  jobTitle?: string;
  description?: string;
  url?: string;
  sameAs?: string[];
}

export function PersonJsonLd({
  name = 'Taha Khilji',
  jobTitle = 'Senior Graphic Designer & Art Director',
  description = 'Crafting bold visual identities, precision editorial layouts & scalable brand systems.',
  url = 'https://tahakhilji.com',
  sameAs = [],
}: PersonSeoProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name,
    jobTitle,
    description,
    url,
    sameAs,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

interface ArticleSeoProps {
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  authorName?: string;
  url?: string;
}

export function ArticleJsonLd({
  headline,
  description,
  datePublished,
  dateModified,
  image,
  authorName = 'Taha Khilji',
  url,
}: ArticleSeoProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    datePublished,
    dateModified: dateModified || datePublished,
    image: image || '/images/og-default.jpg',
    author: { '@type': 'Person', name: authorName },
    ...(url ? { mainEntityOfPage: url } : {}),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

interface CreativeWorkSeoProps {
  name: string;
  description: string;
  dateCreated?: string;
  image?: string;
  authorName?: string;
  url?: string;
}

export function CreativeWorkJsonLd({
  name,
  description,
  dateCreated,
  image,
  authorName = 'Taha Khilji',
  url,
}: CreativeWorkSeoProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name,
    description,
    dateCreated,
    image: image || '/images/og-default.jpg',
    author: { '@type': 'Person', name: authorName },
    ...(url ? { url } : {}),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
