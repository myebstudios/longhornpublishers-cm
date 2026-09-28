/** Client-approved service categories. Publishing capabilities stay in the CMS. */
export const OFFERINGS = [
  { id: 'publishing', icon: 'pen', en: 'Publishing', fr: 'Édition', comingSoon: false },
  { id: 'tertiary', icon: 'book', en: 'Tertiary', fr: 'Enseignement supérieur', comingSoon: false },
  { id: 'cambridge', icon: 'globe', en: 'Cambridge', fr: 'Cambridge', comingSoon: false },
  { id: 'reference', icon: 'book', en: 'Reference books (Bibles, Law Africa)', fr: 'Ouvrages de référence (Bibles, Law Africa)', comingSoon: false },
  { id: 'loho', icon: 'book', en: 'LoHo', fr: 'LoHo', comingSoon: true },
  { id: 'emarketing', icon: 'globe', en: 'E-Marketing', fr: 'E-Marketing', comingSoon: true },
] as const;
