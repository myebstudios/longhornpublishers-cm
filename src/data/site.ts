/** Contact details — single source of truth. */
export const CONTACT = {
  addressLines: ['Total École de police, Tsinga', 'Yaoundé, Cameroon'],
  phones: ['+237 672 49 10 93', '+237 657 51 92 03'],
  // Confirmed final by client, 2026-09-14
  email: 'longhorncameroon@longhornpublishers.com',
} as const;

export type Discipline = 'editorial' | 'creative' | 'production';

export interface Service {
  id: string;
  icon: string;
  discipline: Discipline;
  en: { name: string; short: string; body: string[] };
  fr: { name: string; short: string; body: string[] };
}

export const SERVICES: Service[] = [
  {
    id: 'editing', icon: 'pen', discipline: 'editorial',
    en: {
      name: 'Editing',
      short: 'Language accuracy, clarity, flow and readability.',
      body: [
        "Our editorial process spans different levels of editing, improving a manuscript's quality and usability without losing the author's intended message.",
      ],
    },
    fr: {
      name: 'Révision',
      short: 'Précision linguistique, clarté, fluidité et lisibilité.',
      body: [
        'Notre processus éditorial couvre différents niveaux de révision, améliorant la qualité et la lisibilité d’un manuscrit sans perdre le message visé par l’auteur.',
      ],
    },
  },
  {
    id: 'proofreading', icon: 'check', discipline: 'editorial',
    en: {
      name: 'Proofreading',
      short: 'The final gate before anything goes to print.',
      body: [
        'The last check before print: grammar, spelling, punctuation, consistency of style and terminology, running heads, captions, cross-references, and typographic detail such as bad breaks and widows.',
        'Handled as a distinct stage by someone who did not do the editing — a second pair of eyes, by design.',
      ],
    },
    fr: {
      name: 'Correction d’épreuves',
      short: 'Le dernier contrôle avant l’impression.',
      body: [
        'L’ultime vérification avant impression : grammaire, orthographe, ponctuation, cohérence du style et de la terminologie, titres courants, légendes, renvois, et détails typographiques tels que les coupures fautives et les lignes creuses.',
        'Cette étape distincte est confiée à une personne qui n’a pas assuré la révision — un second regard, par principe.',
      ],
    },
  },
  {
    id: 'translation', icon: 'globe', discipline: 'editorial',
    en: {
      name: 'Translation',
      short: 'English ↔ French and French ↔ English.',
      body: [
        'Our translation service supports organisations and content owners that need materials adapted between English and French, particularly where content must function effectively within bilingual educational and professional environments.',
        'Our focus is not merely word-for-word conversion. It is about producing content that is clear, appropriate and fit for its intended audience.',
      ],
    },
    fr: {
      name: 'Traduction',
      short: 'Anglais ↔ Français et Français ↔ Anglais.',
      body: [
        'Notre service de traduction accompagne les organisations et les détenteurs de contenus qui ont besoin d’adapter des documents entre l’anglais et le français, particulièrement lorsque les contenus doivent fonctionner efficacement dans des environnements éducatifs et professionnels bilingues.',
        'Notre démarche ne se résume pas à une simple conversion mot à mot. Il s’agit de produire un contenu clair, approprié et adapté à son public cible.',
      ],
    },
  },
  {
    id: 'designing', icon: 'layout', discipline: 'creative',
    en: {
      name: 'Designing',
      short: 'Covers, interiors, typesetting and layout.',
      body: [
        'Cover design, interior layout, typesetting and grid systems built for the way the material is actually used — a textbook read at a desk has different demands from a report read on screen.',
        'Delivered as print-ready files, with the layout held consistent across both language editions.',
      ],
    },
    fr: {
      name: 'Conception graphique',
      short: 'Couvertures, intérieurs, composition et mise en page.',
      body: [
        'Conception de couverture, mise en page intérieure, composition et systèmes de grilles pensés pour l’usage réel du support — un manuel lu à une table n’a pas les mêmes exigences qu’un rapport lu à l’écran.',
        'Livraison en fichiers prêts pour l’impression, avec une mise en page cohérente entre les deux éditions linguistiques.',
      ],
    },
  },
  {
    id: 'illustration', icon: 'brush', discipline: 'creative',
    en: {
      name: 'Illustration',
      short: 'Original artwork, diagrams and visual explanation.',
      body: [
        'Original artwork, character work, maps, diagrams and technical illustration — commissioned rather than licensed from a stock library, so the imagery belongs to the title.',
        'Cultural relevance is treated as an editorial requirement: learners should recognise the people, places and situations they are looking at.',
      ],
    },
    fr: {
      name: 'Illustration',
      short: 'Illustrations originales, schémas et explication visuelle.',
      body: [
        'Illustrations originales, personnages, cartes, schémas et illustration technique — commandés plutôt que tirés d’une banque d’images, afin que l’iconographie appartienne à l’ouvrage.',
        'La pertinence culturelle est traitée comme une exigence éditoriale : les élèves doivent reconnaître les personnes, les lieux et les situations qu’ils regardent.',
      ],
    },
  },
  {
    id: 'printing', icon: 'print', discipline: 'production',
    en: {
      name: 'Printing',
      short: 'Production, finishing and delivery at volume.',
      body: [
        'Print production, binding and finishing at the volumes an institutional rollout requires, with stock specification and proofing agreed before the run.',
      ],
    },
    fr: {
      name: 'Impression',
      short: 'Production, façonnage et livraison en volume.',
      body: [
        'Production, reliure et façonnage aux volumes qu’exige un déploiement institutionnel, avec spécification du papier et bon à tirer validés avant le lancement.',
      ],
    },
  },
];

export interface Step { num: string; en: { title: string; body: string }; fr: { title: string; body: string }; }

export const PROCESS: Step[] = [
  { num: '01',
    en: { title: 'Consultation', body: 'Scope, audience, curriculum requirements, languages and budget mapped before anything is quoted.' },
    fr: { title: 'Consultation', body: 'Périmètre, public, exigences du programme, langues et budget définis avant toute proposition chiffrée.' } },
  { num: '02',
    en: { title: 'Planning', body: 'Schedule, milestones and team allocation agreed in writing, with both language tracks planned in parallel.' },
    fr: { title: 'Planification', body: 'Calendrier, jalons et affectation des équipes convenus par écrit, les deux versions linguistiques planifiées en parallèle.' } },
  { num: '03',
    en: { title: 'Execution', body: 'Editorial, design and illustration run against the agreed brief, with progress visible at each milestone.' },
    fr: { title: 'Exécution', body: 'Révision, conception et illustration menées selon le cahier des charges, avec un suivi visible à chaque jalon.' } },
  { num: '04',
    en: { title: 'Quality Review', body: 'Proofreading, factual verification and curriculum alignment. This stage can and does block a release.' },
    fr: { title: 'Contrôle qualité', body: 'Correction d’épreuves, vérification des faits et conformité au programme. Cette étape peut bloquer — et bloque — une parution.' } },
  { num: '05',
    en: { title: 'Delivery', body: 'Print, finishing and distribution to the schedule set at planning — plus files archived for future editions.' },
    fr: { title: 'Livraison', body: 'Impression, façonnage et distribution selon le calendrier fixé — et archivage des fichiers pour les éditions futures.' } },
];
