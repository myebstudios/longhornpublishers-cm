import type { Content } from './types';

/**
 * French content. Translated, not transposed — per the brand's own positioning
 * on localisation (see Docs/marketing_content_outline.md).
 * Pending native-speaker review before launch.
 */
export const fr: Content = {
  htmlLang: 'fr',
  localeName: 'Français',
  brand: { name: 'Longhorn', sub: 'Publishers Cameroun' },

  nav: {
    home: 'Accueil',
    about: 'À propos',
    services: 'Services d’édition',
    catalogue: 'Catalogue',
    why: 'Pourquoi nous choisir',
    contact: 'Nous contacter',
    news: 'Actualités',
    menu: 'Menu',
    primaryNav: 'Navigation principale',
    getInTouch: 'Nous contacter',
    language: 'Langue',
    skip: 'Aller au contenu',
  },

  meta: {
    home: {
      title: 'Longhorn Publishers Cameroun — Services d’édition professionnels',
      description:
        'Services d’édition de bout en bout à Yaoundé : révision, correction, traduction, conception, illustration et impression, en anglais et en français.',
    },
    about: {
      title: 'À propos — Longhorn Publishers Cameroun',
      description:
        'Notre héritage, notre raison d’être, notre vision, notre mission et nos valeurs, ainsi que les équipes qui portent notre travail.',
    },
    services: {
      title: 'Services d’édition — Longhorn Publishers Cameroun',
      description:
        'Révision, correction d’épreuves, traduction, conception, illustration et impression, ainsi que notre processus en cinq étapes.',
    },
    catalogue: {
      title: 'Catalogue — Longhorn Publishers Cameroun',
      description:
        'Manuels du primaire et du secondaire conformes aux programmes nationaux du Cameroun et de la RDC, en anglais et en français.',
    },
    why: {
      title: 'Pourquoi nous choisir — Longhorn Publishers Cameroun',
      description:
        'Présence locale, expertise régionale, engagement qualité sans compromis et véritable capacité bilingue.',
    },
    contact: {
      title: 'Nous contacter — Longhorn Publishers Cameroun',
      description:
        'Parlons de votre projet éditorial, graphique ou d’impression. Tsinga, Yaoundé.',
    },
    news: {
      title: 'Actualités — Longhorn Publishers Cameroun',
      description: 'Actualités de l’entreprise, nouveaux titres, partenariats et événements.',
    },
    privacy: {
      title: 'Politique de confidentialité — Longhorn Publishers Cameroun',
      description: 'Comment Longhorn Publishers Cameroun Ltd collecte, utilise et protège les données personnelles.',
    },
    terms: {
      title: 'Conditions d’utilisation — Longhorn Publishers Cameroun',
      description: 'Les conditions régissant l’utilisation du site de Longhorn Publishers Cameroun.',
    },
  },

  legal: {
    lastUpdatedLabel: 'Dernière mise à jour',
    lastUpdatedValue: 'Septembre 2026',
    privacy: {
      title: 'Politique de confidentialité — Longhorn Publishers Cameroun',
      heading: 'Politique de confidentialité',
      intro:
        'Cette politique de confidentialité explique comment Longhorn Publishers Cameroun Ltd collecte, utilise et protège les informations personnelles transmises via les formulaires de notre site web.',
      sections: [
        {
          title: '1. Informations collectées',
          content:
            'Nous collectons les données personnelles que vous fournissez volontairement en remplissant nos formulaires sur ce site. Cela comprend votre nom, organisation, adresse e-mail, numéro de téléphone et détails de votre projet soumis via notre formulaire de Contact, ainsi que votre adresse e-mail lors de l’inscription à nos actualités éditoriales.',
        },
        {
          title: '2. Utilisation de vos informations',
          content:
            'Les données collectées sont utilisées exclusivement pour répondre à vos demandes de renseignements ou de devis d’édition, et pour vous adresser des mises à jour institutionnelles ou actualités. Nous ne vendons, ne louons et ne partageons vos données personnelles avec aucun tiers à des fins commerciales.',
        },
        {
          title: '3. Transmission et conservation des données',
          content:
            'Les formulaires sont transmis de manière sécurisée via Netlify Forms et acheminés vers le personnel habilité de Longhorn Publishers Cameroun Ltd à notre bureau de Yaoundé. Les données sont conservées uniquement le temps nécessaire au traitement de votre demande et à la gestion de nos échanges professionnels.',
        },
        {
          title: '4. Cookies et préférences de navigation',
          content:
            'Notre site web utilise les fonctionnalités de stockage du navigateur uniquement pour mémoriser votre langue d’affichage préférée (anglais ou français). Aucun cookie publicitaire tiers ou script de suivi comportemental n’est déposé.',
        },
        {
          title: '5. Vos droits et contacts',
          content:
            'Vous pouvez à tout moment demander l’accès, la rectification ou la suppression de vos données personnelles en contactant notre bureau de Yaoundé à longhorncameroon@longhornpublishers.com ou par téléphone au +(237) 672 49 10 93 / +(237) 657 51 92 03.',
        },
      ],
    },
    terms: {
      title: 'Conditions d’utilisation — Longhorn Publishers Cameroun',
      heading: 'Conditions d’utilisation',
      intro:
        'Ces conditions d’utilisation régissent votre accès et votre utilisation du site web de Longhorn Publishers Cameroun Ltd.',
      sections: [
        {
          title: '1. Acceptation des conditions',
          content:
            'En accédant à ce site web et en l’utilisant, vous acceptez d’être lié par les présentes conditions d’utilisation. Si vous n’acceptez pas ces conditions, veuillez ne pas utiliser ce site.',
        },
        {
          title: '2. Droits de propriété intellectuelle',
          content:
            'L’ensemble des contenus de ce site web (textes, graphismes, couvertures d’ouvrages, mises en page, logos et marques) est la propriété de Longhorn Publishers Cameroun Ltd ou de Longhorn Publishers PLC. Toute reproduction ou distribution non autorisée est strictement interdite.',
        },
        {
          title: '3. Contenus du site et offres de services',
          content:
            'Les fiches du catalogue, les descriptions de programmes et les détails des services présentés sur ce site le sont à titre informatif. Les contrats d’édition et commandes d’ouvrages font l’objet de conventions écrites distinctes.',
        },
        {
          title: '4. Utilisation acceptable',
          content:
            'Vous vous engagez à utiliser nos formulaires uniquement pour des demandes légitimes. La soumission de fausses informations, de spams commercial non sollicité ou de code malveillant est strictement interdite.',
        },
        {
          title: '5. Loi applicable et contact',
          content:
            'Ces conditions sont régies par les lois de la République du Cameroun. Pour toute question concernant ces conditions, contactez Longhorn Publishers Cameroun Ltd, Total École de police, Tsinga, Yaoundé, Cameroun.',
        },
      ],
    },
  },

  common: {
    partnerWithUs: 'Devenir partenaire',
    exploreServices: 'Découvrir nos services',
    learnMore: 'En savoir plus',
    readArticle: 'Lire l’article',
    loadMore: 'Afficher plus',
    browseCatalogue: 'Parcourir le catalogue',
    viewAllNews: 'Toutes les actualités',
    requestTitle: 'Demander ce titre',
    startConversation: 'Démarrer la conversation',
    prev: 'Précédent',
    next: 'Suivant',
    titles: 'titres',
    articles: 'articles',
    all: 'Tous',
  },

  home: {
    hero: {
      eyebrowStat: 'Six décennies',
      eyebrowStatSuffix: 'd’édition à travers l’Afrique',
      badgeNumber: '60',
      tags: ['Éditorial', 'Création', 'Production'],
      titleLead: 'Services d’édition professionnels,',
      titleAccent: 'du début à la fin',
      lede:
        'Révision, correction d’épreuves, traduction, conception, illustration et impression — livrés en deux langues depuis Yaoundé pour les éditeurs, institutions et organisations du Cameroun et de la RDC.',
      stats: [
        { num: '2', label: 'Marchés desservis — Cameroun et RDC' },
        { num: 'EN / FR', label: 'Chaque titre, dans les deux langues' },
      ],
    },
    trust: [
      'Soutenu par Longhorn Publishers PLC',
      'Conforme aux programmes nationaux',
      'Entièrement bilingue anglais et français',
      'Un seul partenaire, du manuscrit à la livraison',
    ],
    whoWeAre: {
      eyebrow: 'Qui nous sommes',
      titleLead: 'Ancrés au Cameroun,',
      titleAccent: 'forts de six décennies',
      body: [
        'Longhorn Publishers Cameroun Ltd est la filiale pour l’Afrique centrale de Longhorn Publishers PLC — une maison d’édition forte de soixante ans d’expérience dans la création de contenus éducatifs et généralistes sur le continent.',
        'Depuis notre bureau de Tsinga, à Yaoundé, nous sommes créateurs de contenus et fournisseurs de solutions éditoriales : une équipe éditoriale, créative et de production travaillant dans les deux langues officielles, assez proche du marché pour en saisir les nuances culturelles.',
      ],
      link: 'En savoir plus sur nous',
      imgAlt: 'L’équipe de Longhorn Publishers Cameroun',
    },
    services: {
      eyebrow: 'Nos services',
      titleLead: 'Tout ce dont un manuscrit a besoin,',
      titleAccent: 'sous un même toit',
      lede: 'Plus besoin de jongler entre réviseurs, graphistes et imprimeurs — nous menons le projet de bout en bout.',
    },
    cataloguePreview: {
      eyebrow: 'Catalogue',
      titleLead: 'Des manuels pour le',
      titleAccent: 'primaire et le secondaire',
      lede: 'Des titres conformes aux programmes nationaux du Cameroun et de la RDC, publiés dans les deux langues.',
    },
    endToEnd: {
      eyebrow: 'Un seul partenaire',
      titleLead: 'Un seul partenaire,',
      titleAccent: 'de bout en bout',
      lede: 'La plupart des projets d’édition s’enlisent dans les transitions. Nous les supprimons.',
      cards: [
        {
          title: 'Fini le jonglage entre prestataires',
          body: 'Un seul contrat, une seule équipe et un seul interlocuteur responsable, du manuscrit au stock livré.',
        },
        {
          title: 'Bilingue par défaut',
          body: 'L’anglais et le français ne sont ni une réflexion après coup ni une ligne supplémentaire au devis — les deux versions avancent ensemble.',
        },
        {
          title: 'Une qualité tenue de bout en bout',
          body: 'Un processus en cinq étapes, avec une phase de contrôle dédiée avant toute impression.',
        },
      ],
    },
    process: {
      eyebrow: 'Notre processus',
      titleLead: 'Notre méthode,',
      titleAccent: 'du début à la fin',
      lede: 'Cinq étapes, chacune avec un responsable désigné et une validation avant de passer à la suivante.',
      link: 'Voir le processus complet',
    },
    testimonials: {
      eyebrow: 'Retours clients',
      titleLead: 'Ce que nos partenaires',
      titleAccent: 'nous disent',
      note: 'Citations fictives — à remplacer par des témoignages clients validés avant le lancement.',
      items: [
        {
          quote: 'Avoir l’éditorial et l’impression dans le même bâtiment nous a fait gagner près de trois semaines sur le calendrier.',
          initials: 'AM',
          name: 'Nom à confirmer',
          role: 'Éditeur scolaire, Yaoundé',
        },
        {
          quote: 'L’édition française se lisait comme si elle avait été écrite en français, et non traduite. C’est plus rare que cela ne devrait l’être.',
          initials: 'NK',
          name: 'Nom à confirmer',
          role: 'Responsable de programme, ONG',
        },
        {
          quote: 'Ils ont relevé des détails du programme qui nous avaient échappé. C’est précisément ce qu’un simple imprimeur ne peut pas apporter.',
          initials: 'SE',
          name: 'Nom à confirmer',
          role: 'Chef de département',
        },
      ],
    },
    news: {
      eyebrow: 'Dernières actualités',
      titleLead: 'Les actualités de',
      titleAccent: 'Longhorn Cameroun',
    },
    cta: {
      eyebrow: 'Travaillons ensemble',
      titleLead: 'Un manuscrit, un cahier des charges,',
      titleAccent: 'ou simplement une échéance ?',
      lede: 'Indiquez-nous le périmètre et les langues souhaitées. Nous reviendrons vers vous avec un plan et un calendrier.',
      button: 'Démarrer la conversation',
    },
  },

  about: {
    hero: {
      eyebrow: 'À propos',
      titleLead: 'Soixante ans d’édition,',
      titleAccent: 'enracinés à Yaoundé',
      lede: 'Une maison d’édition d’Afrique centrale portée par un groupe continental et guidée par l’instinct d’une équipe locale.',
    },
    heritage: {
      eyebrow: 'Héritage et présence locale',
      titleLead: 'L’appui d’un groupe continental,',
      titleAccent: 'le discernement local',
      body: [
        'Longhorn Publishers Cameroun Ltd est une filiale de Longhorn Publishers PLC, un groupe fort de près de six décennies d’expérience dans l’édition d’ouvrages éducatifs et généralistes à travers l’Afrique.',
        'Cet héritage nous apporte des exigences éditoriales, une capacité de production et des relations institutionnelles qu’un nouvel entrant ne peut tout simplement pas réunir. Ce que nous y ajoutons, c’est la proximité : une équipe basée à Tsinga, à Yaoundé, immergée quotidiennement dans le contexte éducatif camerounais et congolais, dans les deux langues officielles.',
        'Nous nous définissons comme créateurs de contenus et fournisseurs de solutions éditoriales — nous produisons le contenu et nous pilotons le processus qui le met entre les mains des élèves.',
      ],
      link: 'Pourquoi nos partenaires nous choisissent',
      imgAlt: 'Longhorn Publishers Cameroun en consultation client, Yaoundé',
    },
    identity: {
      eyebrow: 'Notre identité',
      titleLead: 'Ce que nous sommes',
      titleAccent: 'venus accomplir',
      items: [
        { icon: 'heart', title: 'Raison d’être', body: 'Élargir les esprits — créer des contenus qui rendent l’apprentissage accessible, exact et pertinent en Afrique centrale.' },
        { icon: 'eye', title: 'Vision', body: 'Devenir le partenaire éditorial de référence au Cameroun et en RDC pour les institutions qui refusent tout compromis sur la qualité.' },
        { icon: 'target', title: 'Mission', body: 'Assurer une édition de bout en bout — éditoriale, créative et production — en deux langues, dans les délais et à un prix juste.' },
        { icon: 'shield', title: 'Valeurs', body: 'Qualité, pertinence culturelle, souplesse et responsabilité — à chaque étape, et pas seulement à la validation finale.' },
      ],
    },
    team: {
      eyebrow: 'Notre équipe et nos capacités',
      titleLead: 'Trois métiers,',
      titleAccent: 'un seul flux de travail',
      lede: 'Assez souples pour nous adapter à des exigences qui évoluent en cours de projet — ce qui, sur de vrais calendriers d’édition, est la règle plutôt que l’exception.',
      items: [
        {
          icon: 'pen',
          title: 'Équipe éditoriale',
          body: 'Réviseurs, correcteurs et traducteurs travaillant en anglais et en français, avec des spécialistes par matière pour les contenus conformes aux programmes.',
          tags: ['Révision', 'Correction', 'Traduction'],
        },
        {
          icon: 'brush',
          title: 'Équipe création et production',
          body: 'Graphistes, illustrateurs et metteurs en page qui conduisent un manuscrit jusqu’aux fichiers prêts pour l’impression.',
          tags: ['Conception', 'Illustration', 'Impression'],
        },
        {
          icon: 'users',
          title: 'Gestion de projet',
          body: 'Un responsable désigné par projet, garant du calendrier, des deux versions linguistiques et de la relation client de bout en bout.',
          tags: ['Planification', 'Points de contrôle', 'Reporting'],
        },
      ],
    },
    quality: {
      eyebrow: 'Engagement qualité',
      titleLead: 'Des exigences qui',
      titleAccent: 'résistent à l’échéance',
      body: [
        'Chaque projet passe par une phase de contrôle qualité dédiée avant d’être envoyé à l’impression — correction d’épreuves, vérification des faits et conformité au programme, contrôlées au regard du cahier des charges validé lors de la consultation.',
        'La pertinence culturelle fait partie de ce contrôle, et non d’une attention accessoire : illustrations, noms, exemples et contextes sont revus afin que les élèves se reconnaissent dans le matériel.',
      ],
      button: 'Voir notre processus',
      imgAlt: 'Ouvrages finis préparés pour la distribution',
    },
    cta: {
      eyebrow: 'Travaillons ensemble',
      titleLead: 'Prêt à parler',
      titleAccent: 'de votre projet ?',
      lede: 'Indiquez-nous le périmètre et les langues souhaitées.',
      button: 'Nous contacter',
    },
  },

  services: {
    hero: {
      eyebrow: 'Services d’édition',
      titleLead: 'Du manuscrit',
      titleAccent: 'à l’œuvre achevée',
      lede: 'Six services répartis sur trois métiers — éditorial, création et production — disponibles séparément ou dans le cadre d’une prestation intégrée.',
      button: 'Demander un devis',
      link: 'Aller au processus',
    },
    overview: {
      eyebrow: 'En bref',
      titleLead: 'Trois métiers,',
      titleAccent: 'six services',
    },
    process: {
      eyebrow: 'Notre processus',
      titleLead: 'Cinq étapes,',
      titleAccent: 'chacune validée',
      lede: 'Rien ne passe à l’étape suivante tant que l’étape en cours n’est pas validée. Plus lent à promettre, plus rapide à livrer.',
    },
    cta: {
      eyebrow: 'Travaillons ensemble',
      titleLead: 'Dites-nous à quelle étape',
      titleAccent: 'vous en êtes',
      lede: 'Qu’il s’agisse d’un manuscrit brut ou d’un fichier prêt à imprimer nécessitant un second avis, commencez par une consultation.',
      button: 'Réserver une consultation',
    },
    discussPrefix: 'Discuter d’un projet de',
  },

  catalogue: {
    hero: {
      eyebrow: 'Catalogue',
      titleLead: 'Nos supports',
      titleAccent: 'pédagogiques',
      lede: 'Des titres du primaire et du secondaire conformes aux programmes nationaux du Cameroun et de la RDC — publiés en anglais et en français.',
    },
    filters: { level: 'Niveau', subject: 'Matière', language: 'Langue' },
    levels: { primary: 'Primaire', secondary: 'Secondaire' },
    subjects: {
      maths: 'Mathématiques',
      english: 'Anglais',
      french: 'Français',
      science: 'Sciences',
      social: 'Sciences sociales',
    },
    languages: { en: 'Anglais', fr: 'Français' },
    empty: { message: 'Aucun matériel pédagogique ne correspond aux filtres sélectionnés.', reset: 'Réinitialiser les filtres' },
    unpublished: {
      heading: 'Catalogue bientôt disponible',
      body: 'Nos premiers titres sont en cours de préparation. Indiquez-nous le programme, le niveau et les langues dont vous avez besoin et nous vous répondrons directement.',
      cta: 'Demander un titre',
    },
    cta: {
      eyebrow: 'Vous ne trouvez pas ?',
      titleLead: 'Besoin d’un titre',
      titleAccent: 'qui n’existe pas encore ?',
      lede: 'Nous publions sur cahier des charges autant que depuis notre catalogue. Indiquez-nous le programme, le niveau et les langues.',
      button: 'Demander un titre',
    },
  },

  why: {
    hero: {
      eyebrow: 'Pourquoi nous choisir',
      titleLead: 'Les arguments pour',
      titleAccent: 'un partenaire unique',
      lede: 'Trois éléments distinguent un partenaire éditorial d’un simple imprimeur. Voici notre position sur chacun.',
    },
    pillars: [
      {
        eyebrow: '01 — Présence locale, expertise régionale',
        titleLead: 'Proches du marché,',
        titleAccent: 'pas seulement de la carte',
        body: [
          'Notre équipe est à Tsinga, Yaoundé. Cela signifie des visites sur site, des relectures en personne et un calendrier qui suit les réalités locales plutôt que l’agenda d’un siège lointain.',
          'Cela signifie aussi une connaissance pratique des programmes nationaux camerounais et congolais — leur structure, leur terminologie et les attentes en matière d’agrément — plutôt qu’un modèle éducatif africain générique.',
        ],
        imgAlt: 'Des lecteurs échangeant autour d’un ouvrage Longhorn',
      },
      {
        eyebrow: '02 — Engagement qualité',
        titleLead: 'Une phase de contrôle qui',
        titleAccent: 'bloque réellement',
        body: [
          'Le contrôle qualité est la quatrième des cinq étapes, et il a autorité pour empêcher un projet de partir à l’impression. Correction d’épreuves, vérification des faits et conformité au programme sont contrôlées au regard du cahier des charges initial.',
          'Adossé à six décennies d’exigences éditoriales de groupe — un processus hérité, non improvisé.',
        ],
        imgAlt: 'Contrôle final d’un tirage imprimé',
        tags: ['Révision structurelle', 'Révision de style', 'Correction', 'Contrôle programme', 'Bon à tirer'],
      },
      {
        eyebrow: '03 — Capacité bilingue et pertinence culturelle',
        titleLead: 'Deux langues,',
        titleAccent: 'une seule exigence',
        body: [
          'Dans un pays bilingue, une édition française qui sent la traduction est un handicap. Nos traducteurs évoluent quotidiennement dans le contexte éducatif et localisent plutôt qu’ils ne transposent — exemples, noms, monnaie, expressions et registre de classe sont tous adaptés.',
          'Les deux versions linguistiques sont planifiées ensemble dès le premier jour : aucune ne devient l’édition secondaire livrée en retard.',
        ],
        imgAlt: 'Les éditions anglaise et française d’un même titre côte à côte',
      },
    ],
    compare: {
      eyebrow: 'La différence',
      titleLead: 'Prestation intégrée contre',
      titleAccent: 'prestation morcelée',
      bad: {
        title: 'Travailler avec des prestataires séparés',
        body: 'L’éditorial, la conception et l’impression suivent chacun un cahier des charges différent. Les transitions font perdre le contexte. Personne ne porte le calendrier, et quand l’édition française prend du retard, personne n’en répond.',
      },
      good: {
        title: 'Travailler avec Longhorn Cameroun',
        body: 'Un seul cahier des charges, un seul chef de projet, un seul calendrier couvrant les deux langues, et un point de contrôle qualité à franchir avant impression. En cas de retard, vous n’avez qu’un seul numéro à appeler.',
      },
    },
    cta: {
      eyebrow: 'Travaillons ensemble',
      titleLead: 'Mettez-nous à l’épreuve',
      titleAccent: 'sur un vrai projet',
      lede: 'Envoyez-nous le périmètre. Nous reviendrons avec un plan, un calendrier et un prix.',
      button: 'Devenir partenaire',
    },
  },

  contact: {
    hero: {
      eyebrow: 'Nous contacter',
      titleLead: 'Travaillons',
      titleAccent: 'ensemble',
      lede: 'Indiquez-nous le périmètre, le niveau et les langues. Nous reviendrons avec un plan, un calendrier et un prix.',
    },
    directEyebrow: 'Contact direct',
    directTitleLead: 'Joindre le',
    directTitleAccent: 'bureau de Yaoundé',
    labels: {
      office: 'Bureau',
      telephone: 'Téléphone',
      email: 'Courriel',
      hours: 'Horaires',
    },
    hours: 'Du lundi au vendredi',
    form: {
      eyebrow: 'Demande de projet',
      title: 'Démarrer la conversation',
      name: 'Nom complet',
      organisation: 'Organisation',
      email: 'Courriel',
      phone: 'Téléphone',
      projectType: 'Type de projet',
      projectTypePlaceholder: 'Choisissez un type de projet…',
      projectTypes: [
        'Support pédagogique',
        'Ressource de formation',
        'Rapport ou publication',
        'Traduction uniquement',
        'Conception ou illustration uniquement',
        'Impression uniquement',
        'Autre',
      ],
      languages: 'Langues requises',
      languagesPlaceholder: 'Choisissez…',
      languageOptions: ['Anglais uniquement', 'Français uniquement', 'Anglais et français'],
      stage: 'Étape actuelle',
      stageOptions: [
        'Idée ou cahier des charges uniquement',
        'Manuscrit provisoire',
        'Manuscrit révisé',
        'Mis en page et prêt à imprimer',
      ],
      message: 'Parlez-nous de votre projet',
      messagePlaceholder: 'Périmètre, niveau, programme, volumes et échéance éventuelle.',
      submit: 'Envoyer la demande',
      success: 'Merci — votre demande a bien été reçue. Nous vous répondrons sous peu.',
      error: 'Une erreur est survenue. Merci de réessayer ou de nous écrire directement.',
    },
    addressLine: 'Longhorn Publishers Cameroun Ltd — Yaoundé, Cameroun',
    directions: 'Obtenir l’itinéraire',
  },

  news: {
    hero: {
      eyebrow: 'Actualités',
      titleLead: 'Ce qui se passe',
      titleAccent: 'chez Longhorn Cameroun',
      lede: 'Actualités de l’entreprise, nouveaux titres, partenariats et événements.',
    },
    filterLabel: 'Catégorie',
    categories: {
      company: 'Actualités de l’entreprise',
      titles: 'Nouveaux titres',
      partnerships: 'Partenariats',
      events: 'Événements',
    },
    empty: {
      heading: 'Restez informé',
      body: 'Nous préparons les prochaines actualités, parutions et informations de partenariat. Pour toute demande immédiate, notre équipe est à votre écoute.',
      cta: 'Nous contacter',
    },
  },

  footer: {
    blurb:
      'Créateurs de contenus et fournisseurs de solutions éditoriales pour l’Afrique centrale — des services d’édition de bout en bout, du manuscrit au livre imprimé, en anglais et en français.',
    explore: 'Explorer',
    services: 'Services',
    getInTouch: 'Nous contacter',
    newsletter: 'Votre courriel pour nos actualités',
    subscribe: 'S’abonner',
    rights: '© 2026 Longhorn Publishers Cameroun Ltd — filiale de Longhorn Publishers PLC.',
    privacy: 'Politique de confidentialité',
    terms: 'Conditions d’utilisation',
  },
};
