/** Client-approved service categories. Publishing capabilities stay in the CMS. */
export const OFFERINGS = [
  { id: 'publishing', icon: 'pen', en: 'Publishing', fr: 'Édition', comingSoon: false },
  { id: 'tertiary', icon: 'book', en: 'Tertiary', fr: 'Enseignement supérieur', comingSoon: false },
  { id: 'cambridge', icon: 'globe', en: 'Cambridge', fr: 'Cambridge', comingSoon: false },
  { id: 'reference', icon: 'book', en: 'Reference books (Bibles, Law Africa)', fr: 'Ouvrages de référence (Bibles, Law Africa)', comingSoon: false },
  // LoHo = e-learning (client, 2026-09-29). Summary grounded in Longhorn's official
  // products page ("eLearning platform with interactive educational content"); no
  // Kenya-only claims (CBC/KICD curriculum, Elimu Pepe, live availability).
  {
    id: 'loho', icon: 'book', en: 'LoHo e-learning', fr: 'LoHo, apprentissage en ligne', comingSoon: true,
    summary: {
      en: 'An e-learning platform with interactive educational content.',
      fr: 'Une plateforme d’apprentissage en ligne aux contenus éducatifs interactifs.',
    },
  },
  { id: 'emarketing', icon: 'globe', en: 'E-Marketing', fr: 'E-Marketing', comingSoon: true },
] as const;
