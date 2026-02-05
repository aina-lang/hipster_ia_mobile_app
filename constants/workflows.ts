export interface WorkflowQuestion {
  id: string;
  label: string;
  type: 'choice' | 'text' | 'number' | 'multichoice';
  placeholder?: string;
  options?: string[];
}

// Generic workflow definitions for all job types
export const GENERIC_WORKFLOWS: Record<string, WorkflowQuestion[]> = {
  'Réseaux sociaux (image/texte)': [
    {
      id: 'platform',
      label: 'Plateforme principale',
      type: 'choice',
      options: ['Instagram', 'Facebook', 'LinkedIn', 'TikTok'],
    },
    {
      id: 'tone',
      label: 'Ton du post',
      type: 'choice',
      options: ['Professionnel', 'Décontracté', 'Inspirant', 'Humoristique'],
    },
  ],
  'Site internet / SEO (texte)': [
    {
      id: 'section',
      label: 'Section du site',
      type: 'choice',
      options: [
        "Page d'accueil",
        'À propos',
        'Services',
        'Produits',
        'Portfolio',
        'Blog',
        'Contact',
        'FAQ',
        'Témoignages',
      ],
    },
    {
      id: 'tone',
      label: 'Ton du texte',
      type: 'choice',
      options: ['Expert', 'Accueillant', 'Persuasif', 'Informatif'],
    },
  ],
  'Flyers (image)': [
    {
      id: 'type',
      label: 'Type de support',
      type: 'choice',
      options: ['Flyer', 'Affiche', 'Carte de visite', 'Coupon de réduction', 'Menu'],
    },
    {
      id: 'style',
      label: 'Style visuel',
      type: 'choice',
      options: ['Moderne', 'Minimaliste', 'Luxe', 'Flashy', 'Vintage', 'Élégant'],
    },
    {
      id: 'promotion',
      label: 'Offre / Promotion',
      type: 'choice',
      options: [
        'Aucune',
        'Réduction (%)',
        'Offre Spéciale',
        'Événement',
        'Nouveau Produit',
        'Ouverture',
      ],
    },
    {
      id: 'tone',
      label: 'Ton du texte',
      type: 'choice',
      options: ['Accrocheur', 'Professionnel', 'Inspirant', 'Urgent', 'Informatif'],
    },
  ],
  'Email / Newsletter (texte)': [
    {
      id: 'frequency',
      label: 'Fréquence',
      type: 'choice',
      options: ['Hebdomadaire', 'Bimensuelle', 'Mensuelle', 'Ponctuelle'],
    },
    {
      id: 'goal',
      label: 'Objectif',
      type: 'choice',
      options: ['Informer', 'Promouvoir', 'Fidéliser', 'Annoncer'],
    },
    {
      id: 'tone',
      label: 'Ton',
      type: 'choice',
      options: ['Professionnel', 'Amical', 'Inspirant', 'Urgent'],
    },
    {
      id: 'cta',
      label: "Appel à l'action souhaité",
      type: 'text',
      placeholder: 'Ex: Découvrir la collection, Réserver maintenant...',
    },
  ],
  'script vidéo (texte)': [
    {
      id: 'platform',
      label: 'Plateforme',
      type: 'choice',
      options: ['TikTok', 'Instagram Reels', 'YouTube Shorts', 'YouTube', 'LinkedIn'],
    },
    {
      id: 'type',
      label: 'Type de vidéo',
      type: 'choice',
      options: ['Facecam', 'POV', 'Tendance', 'Tutoriel', 'Vlog', 'Interview'],
    },
    {
      id: 'subject',
      label: 'Sujet',
      type: 'text',
      placeholder: 'De quoi voulez-vous parler ?',
    },
  ],
  'miniatures (image)': [
    {
      id: 'style',
      label: 'Style',
      type: 'choice',
      options: ['Théâtre / Drama', 'Coloré / Kids', 'Minimal / Tech', 'Pro / Business', 'Gaming'],
    },
    {
      id: 'title',
      label: 'Titre de la vidéo',
      type: 'text',
      placeholder: 'Titre accrocheur...',
    },
    {
      id: 'emotion',
      label: 'Émotion dominante',
      type: 'choice',
      options: ['Surprise', 'Joie', 'Sérieux', 'Peur', 'Curiosité'],
    },
  ],
};

export const COIFFEUR_WORKFLOWS: Record<string, WorkflowQuestion[]> = {
  ...GENERIC_WORKFLOWS,
  'Flyers (image)': [
    {
      id: 'service',
      label: 'Service à mettre en avant',
      type: 'choice',
      options: [
        'Coiffure Homme',
        'Coiffure Femme',
        'Coloration / Balayage',
        'Barbe / Grooming',
        'Soins Capillaires',
      ],
    },
    ...GENERIC_WORKFLOWS['Flyers (image)'],
  ],
};

export const RESTAURANT_WORKFLOWS: Record<string, WorkflowQuestion[]> = {
  ...GENERIC_WORKFLOWS,
  'Flyers (image)': [
    {
      id: 'cuisine',
      label: 'Type de cuisine',
      type: 'choice',
      options: [
        'Traditionnelle',
        'Gastronomique',
        'Fast-food / Burger',
        'Italienne / Pizza',
        'Asiatique',
        'Végétarienne',
      ],
    },
    {
      id: 'event',
      label: 'Événement spécifique',
      type: 'choice',
      options: ['Aucun', 'Nouveau Menu', 'Brunch du Dimanche', 'Soirée Thématique', 'Happy Hour'],
    },
    ...GENERIC_WORKFLOWS['Flyers (image)'],
  ],
};

export const BOUTIQUE_WORKFLOWS: Record<string, WorkflowQuestion[]> = {
  ...GENERIC_WORKFLOWS,
  'Flyers (image)': [
    {
      id: 'category',
      label: 'Catégorie de produits',
      type: 'choice',
      options: [
        'Vêtements / Mode',
        'Accessoires / Bijoux',
        'Cosmétiques / Beauté',
        'Décoration Maison',
        'Électronique',
      ],
    },
    {
      id: 'target',
      label: 'Public cible',
      type: 'choice',
      options: ['Tout public', 'Femmes', 'Hommes', 'Enfants / Bébés', 'Jeunes adultes'],
    },
    ...GENERIC_WORKFLOWS['Flyers (image)'],
  ],
};

export const ARTISAN_WORKFLOWS: Record<string, WorkflowQuestion[]> = {
  ...GENERIC_WORKFLOWS,
  'Flyers (image)': [
    {
      id: 'trade',
      label: 'Votre spécialité',
      type: 'choice',
      options: [
        'Menuiserie',
        'Plomberie',
        'Électricité',
        'Peinture',
        'Maçonnerie',
        'Jardinage / Paysagisme',
      ],
    },
    {
      id: 'offer',
      label: "Type d'offre",
      type: 'choice',
      options: ['Devis Gratuit', 'Dépannage Urgent', 'Rénovation Complète', 'Entretien Annuel'],
    },
    ...GENERIC_WORKFLOWS['Flyers (image)'],
  ],
};

export const SERVICE_LOCAL_WORKFLOWS: Record<string, WorkflowQuestion[]> = {
  ...GENERIC_WORKFLOWS,
  'Flyers (image)': [
    {
      id: 'service_type',
      label: 'Type de service',
      type: 'choice',
      options: [
        'Nettoyage / Ménage',
        "Garde d'enfants",
        'Aide aux seniors',
        'Cours particuliers',
        'Livraison',
      ],
    },
    ...GENERIC_WORKFLOWS['Flyers (image)'],
  ],
};

export const WORKFLOWS: Record<string, Record<string, WorkflowQuestion[]>> = {
  Coiffeur: COIFFEUR_WORKFLOWS,
  Restaurant: RESTAURANT_WORKFLOWS,
  Boutique: BOUTIQUE_WORKFLOWS,
  Créateur: { ...GENERIC_WORKFLOWS },
  Artisan: ARTISAN_WORKFLOWS,
  'Service local': SERVICE_LOCAL_WORKFLOWS,
  Autre: { ...GENERIC_WORKFLOWS },
};
