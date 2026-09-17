/**
 * Shape of a locale content dictionary.
 * en.ts and fr.ts must both satisfy this, so a missing French string
 * is a build-time type error rather than a blank space on the live site.
 */
export interface Titled {
  eyebrow?: string;
  titleLead: string;
  titleAccent: string;
  lede?: string;
  button?: string;
  link?: string;
}

export interface Card {
  icon?: string;
  title: string;
  body: string;
  tags?: string[];
}

export interface Content {
  htmlLang: string;
  localeName: string;
  brand: { name: string; sub: string };

  nav: {
    home: string; about: string; services: string; catalogue: string;
    why: string; contact: string; news: string;
    menu: string; primaryNav: string; getInTouch: string; language: string; skip: string;
  };

  meta: Record<'home' | 'about' | 'services' | 'catalogue' | 'why' | 'contact' | 'news' | 'privacy' | 'terms',
    { title: string; description: string }>;

  legal: {
    lastUpdatedLabel: string;
    lastUpdatedValue: string;
    privacy: {
      title: string;
      heading: string;
      intro: string;
      sections: Array<{ title: string; content: string }>;
    };
    terms: {
      title: string;
      heading: string;
      intro: string;
      sections: Array<{ title: string; content: string }>;
    };
  };

  common: {
    partnerWithUs: string; exploreServices: string; learnMore: string; readArticle: string;
    loadMore: string; browseCatalogue: string; viewAllNews: string; requestTitle: string;
    startConversation: string; prev: string; next: string;
    titles: string; articles: string; all: string;
  };

  home: {
    hero: {
      eyebrowStat: string; eyebrowStatSuffix: string; badgeNumber: string; tags: string[];
      titleLead: string; titleAccent: string; lede: string;
      stats: { num: string; label: string }[];
    };
    trust: string[];
    whoWeAre: Titled & { body: string[]; imgAlt: string };
    services: Titled;
    cataloguePreview: Titled;
    endToEnd: Titled & { cards: Card[] };
    process: Titled;
    news: Titled;
    cta: Titled;
  };

  about: {
    hero: Titled;
    heritage: Titled & { body: string[]; imgAlt: string };
    identity: Titled & { items: Card[] };
    team: Titled & { items: Card[] };
    quality: Titled & { body: string[]; imgAlt: string };
    cta: Titled;
  };

  services: {
    hero: Titled;
    overview: Titled;
    process: Titled;
    cta: Titled;
    discussPrefix: string;
  };

  catalogue: {
    hero: Titled;
    filters: { title: string; level: string; subject: string; language: string; search: string; searchPlaceholder: string };
    levels: { primary: string; secondary: string };
    subjects: Record<'maths' | 'english' | 'french' | 'science' | 'social', string>;
    languages: { en: string; fr: string };
    /** Shown when the active filters match nothing. */
    empty: { message: string; reset: string };
    /** Shown when the CMS has no published titles at all. */
    unpublished: { heading: string; body: string; cta: string };
    cta: Titled;
  };

  why: {
    hero: Titled;
    pillars: (Titled & { body: string[]; imgAlt: string; tags?: string[] })[];
    bilingualSlider: {
      eyebrow: string;
      titleLead: string;
      titleAccent: string;
      bookTitle: string;
      hint: string;
      enLabel: string;
      frLabel: string;
      ariaLabel: string;
    };
    compare: Titled & {
      bad: { title: string; body: string };
      good: { title: string; body: string };
    };
    cta: Titled;
  };

  contact: {
    hero: Titled;
    directEyebrow: string; directTitleLead: string; directTitleAccent: string;
    labels: { office: string; telephone: string; email: string; hours: string };
    hours: string;
    form: {
      eyebrow: string; title: string;
      name: string; organisation: string; email: string; phone: string;
      projectType: string; projectTypePlaceholder: string; projectTypes: string[];
      languages: string; languagesPlaceholder: string; languageOptions: string[];
      stage: string; stageOptions: string[];
      message: string; messagePlaceholder: string;
      submit: string; success: string; error: string;
    };
    addressLine: string;
    directions: string;
  };

  news: {
    hero: Titled;
    filterLabel: string;
    categories: Record<'company' | 'titles' | 'partnerships' | 'events', string>;
    /** Shown until the admin panel has published its first article. */
    empty: { heading: string; body: string; cta: string };
  };

  footer: {
    blurb: string; explore: string; services: string; getInTouch: string;
    newsletter: string; subscribe: string; rights: string; privacy: string; terms: string;
  };
}
