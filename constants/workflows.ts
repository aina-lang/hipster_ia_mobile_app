export interface WorkflowQuestion {
  id: string;
  label: string;
  type: 'choice' | 'text' | 'number' | 'multichoice';
  placeholder?: string;
  options?: string[];
}

const COMMON_FUNCTIONS: Record<string, WorkflowQuestion[]> = {
  'Contenu réseaux': [
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
  'Visuel publicitaire': [
    {
      id: 'style',
      label: 'Vibe visuelle',
      type: 'choice',
      options: ['Moderne', 'Minimaliste', 'Luxe', 'Flashy', 'Élégant'],
    },
    {
      id: 'promotion',
      label: 'Type de communication',
      type: 'choice',
      options: ['Promotion', 'Information', 'Événement', 'Nouveau Produit'],
    },
  ],
  'Texte marketing': [
    {
      id: 'target',
      label: 'Public cible',
      type: 'choice',
      options: ['Tout public', 'Professionnels', 'Particuliers', 'Jeunes'],
    },
    {
      id: 'tone',
      label: 'Ton du texte',
      type: 'choice',
      options: ['Persuasif', 'Informatif', 'Amical', 'Urgent'],
    },
  ],
  'Page web / SEO': [
    {
      id: 'section',
      label: 'Section du site',
      type: 'choice',
      options: ["Page d'accueil", 'Services', 'Blog', 'À propos'],
    },
    {
      id: 'tone',
      label: 'Ton du texte',
      type: 'choice',
      options: ['Expert', 'Accueillant', 'Persuasif', 'Informatif'],
    },
  ],
  Email: [
    {
      id: 'goal',
      label: 'Objectif',
      type: 'choice',
      options: ['Informer', 'Promouvoir', 'Fidéliser', 'Annoncer'],
    },
    {
      id: 'tone',
      label: 'Ton souhaité',
      type: 'choice',
      options: ['Professionnel', 'Amical', 'Relancé', 'Urgent'],
    },
  ],
};

export const WORKFLOWS: Record<string, Record<string, WorkflowQuestion[]>> = {
  'Coiffure & Esthétique': { ...COMMON_FUNCTIONS },
  'Restaurant / Bar': { ...COMMON_FUNCTIONS },
  'Commerce / Boutique': { ...COMMON_FUNCTIONS },
  'Artisans du bâtiment': { ...COMMON_FUNCTIONS },
  'Service local': { ...COMMON_FUNCTIONS },
  'Profession libérale': { ...COMMON_FUNCTIONS },
  'Bien-être / Santé alternative': { ...COMMON_FUNCTIONS },
  Autre: { ...COMMON_FUNCTIONS },
};
