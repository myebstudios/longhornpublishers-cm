export const adminPages = [
  { section: 'dashboard', label: 'Overview', href: '/admin/', group: 'Workspace', icon: 'layout-dashboard' },
  { section: 'inbox', label: 'Inbox', href: '/admin/inbox/', group: 'Workspace', icon: 'inbox' },
  { section: 'homepage', label: 'Homepage', href: '/admin/homepage/', group: 'Website', icon: 'house' },
  { section: 'about', label: 'About us', href: '/admin/about/', group: 'Website', icon: 'building-2' },
  { section: 'services', label: 'Services & process', href: '/admin/services/', group: 'Website', icon: 'layers' },
  { section: 'why', label: 'Why choose us', href: '/admin/why-choose-us/', group: 'Website', icon: 'badge-check' },
  { section: 'catalogue', label: 'Catalogue', href: '/admin/catalogue/', group: 'Content', icon: 'book-open' },
  { section: 'subjects', label: 'Subjects', href: '/admin/subjects/', group: 'Content', icon: 'tags' },
  { section: 'news', label: 'News & updates', href: '/admin/news/', group: 'Content', icon: 'newspaper' },
  { section: 'contact', label: 'Contact', href: '/admin/contact/', group: 'Settings', icon: 'map-pin' },
  { section: 'legal', label: 'Legal pages', href: '/admin/legal-pages/', group: 'Settings', icon: 'file-text' },
  { section: 'settings', label: 'Site settings', href: '/admin/site-settings/', group: 'Account', icon: 'settings' },
] as const;
