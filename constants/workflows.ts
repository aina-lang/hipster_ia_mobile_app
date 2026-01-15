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
  'Flyers / Affiches (texte)': [
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

export const WORKFLOWS: Record<string, Record<string, WorkflowQuestion[]>> = {
  Coiffeur: { ...GENERIC_WORKFLOWS },
  Restaurant: { ...GENERIC_WORKFLOWS },
  Boutique: { ...GENERIC_WORKFLOWS },
  Créateur: { ...GENERIC_WORKFLOWS }, // Generic ones also available or specifically Creator ones?
  Artisan: { ...GENERIC_WORKFLOWS },
  'Service local': { ...GENERIC_WORKFLOWS },
};
