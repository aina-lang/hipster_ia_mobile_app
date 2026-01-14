export interface WorkflowQuestion {
  id: string;
  label: string;
  type: 'choice' | 'text' | 'number' | 'multichoice';
  placeholder?: string;
  options?: string[];
}

export const WORKFLOWS: Record<string, Record<string, WorkflowQuestion[]>> = {
  Coiffeur: {
    'Post Instagram (Image + Texte)': [
      {
        id: 'style',
        label: 'Style du post',
        type: 'choice',
        options: ['Coupe homme', 'Coupe femme', 'Avant-Après', 'Salon', 'Équipe'],
      },
      {
        id: 'tone',
        label: 'Ton du texte',
        type: 'choice',
        options: ['Professionnel', 'Fun', 'Luxe', 'Minimaliste'],
      },
    ],
    'Fiche tarifaire (PDF / Image)': [
      {
        id: 'model',
        label: 'Modèle',
        type: 'choice',
        options: ['Moderne', 'Minimaliste', 'Luxe', 'Coloré'],
      },
      {
        id: 'target',
        label: 'Cible',
        type: 'choice',
        options: ['Homme', 'Femme', 'Enfant', 'Mixte'],
      },
      {
        id: 'services',
        label: 'Services inclus',
        type: 'text',
        placeholder: 'Ex: Coupe, Couleur, Brushing...',
      },
    ],
    'Affiche promo -20%': [
      {
        id: 'discount',
        label: 'Type de réduction',
        type: 'choice',
        options: ['-20%', '-30%', 'Offre spéciale'],
      },
      {
        id: 'service',
        label: 'Service concerné',
        type: 'choice',
        options: ['Coupe', 'Couleur', 'Soin', 'Tout le salon'],
      },
      {
        id: 'vibes',
        label: 'Ambiance visuelle',
        type: 'choice',
        options: ['Épuré', 'Vibrant', 'Dark', 'Pastel'],
      },
    ],
    'Bio Instagram': [
      {
        id: 'style',
        label: 'Style',
        type: 'choice',
        options: ['Professionnel', 'Amical', 'Créatif', 'Luxe'],
      },
      {
        id: 'specialty',
        label: 'Spécialité (Optionnel)',
        type: 'text',
        placeholder: 'Ex: Coloriste, Barbier...',
      },
    ],
  },
  Restaurant: {
    'Menu complet (PDF / DOCX)': [
      {
        id: 'model',
        label: 'Modèle',
        type: 'choice',
        options: ['Classique', 'Chic', 'Bistro', 'Moderne'],
      },
      {
        id: 'dishes',
        label: 'Entrées / Plats / Desserts',
        type: 'text',
        placeholder: 'Listez vos plats principaux...',
      },
    ],
    'Post “Plat du jour”': [
      {
        id: 'style',
        label: 'Style photo',
        type: 'choice',
        options: ['Réaliste', 'Stylisé', 'Appétissant', 'Gourmet'],
      },
      {
        id: 'dish',
        label: 'Plat du jour',
        type: 'text',
        placeholder: 'Ex: Burger Maison...',
      },
      {
        id: 'tone',
        label: 'Ton',
        type: 'choice',
        options: ['Court', 'Gourmand', 'Humoristique'],
      },
    ],
    'Flyer promotionnel': [
      {
        id: 'promo',
        label: 'Promotion',
        type: 'choice',
        options: ['-10%', '-20%', 'Livraison offerte', 'Menu spécial'],
      },
      {
        id: 'ambiance',
        label: 'Ambiance',
        type: 'choice',
        options: ['Colorée', 'Chic', 'Fast-food', 'Pizzeria', 'Sushi'],
      },
    ],
    'Description Maps / Uber': [
      {
        id: 'type',
        label: 'Type d\'établissement',
        type: 'choice',
        options: ['Restaurant', 'Food truck', 'Brunch', 'Café'],
      },
      {
        id: 'tone',
        label: 'Ton',
        type: 'choice',
        options: ['Accueillant', 'Dynamique', 'Sérieux'],
      },
      {
        id: 'specialty',
        label: 'Spécialité',
        type: 'text',
        placeholder: 'Ex: Cuisine Italienne...',
      },
    ],
  },
  Boutique: {
    'Fiche produit': [
      {
        id: 'category',
        label: 'Catégorie',
        type: 'choice',
        options: ['Vêtements', 'Accessoires', 'Maison', 'Beauté'],
      },
      {
        id: 'name',
        label: 'Nom du produit',
        type: 'text',
        placeholder: 'Ex: Robe d\'été fleurie',
      },
      {
        id: 'highlights',
        label: 'Points forts',
        type: 'choice',
        options: ['Qualité', 'Matériaux', 'Confort', 'Promo'],
      },
    ],
    'Post Instagram produit': [
      {
        id: 'visual',
        label: 'Style visuel',
        type: 'choice',
        options: ['Minimaliste', 'Lifestyle', 'Studio', 'Nature'],
      },
      {
        id: 'tone',
        label: 'Ton du texte',
        type: 'choice',
        options: ['Vendeur', 'Inspirant', 'Informatif'],
      },
    ],
    'Flyer soldes / promo': [
      {
        id: 'discount',
        label: 'Réduction',
        type: 'choice',
        options: ['-30%', '-50%', '-70%', 'Soldes'],
      },
      {
        id: 'theme',
        label: 'Thème visuel',
        type: 'choice',
        options: ['Flashy', 'Élégant', 'Urgent'],
      },
      {
        id: 'collection',
        label: 'Collection',
        type: 'text',
        placeholder: 'Ex: Hiver 2024',
      },
    ],
    'Message WhatsApp vente': [
      {
        id: 'goal',
        label: 'Objectif',
        type: 'choice',
        options: ['Lancer promo', 'Solder stock', 'Relancer client'],
      },
      {
        id: 'tone',
        label: 'Ton',
        type: 'choice',
        options: ['Direct', 'Amical', 'Exclusif'],
      },
    ],
  },
  Créateur: {
    'Idée + Script vidéo': [
      {
        id: 'platform',
        label: 'Plateforme',
        type: 'choice',
        options: ['TikTok', 'Instagram Reels', 'YouTube Shorts'],
      },
      {
        id: 'type',
        label: 'Type de vidéo',
        type: 'choice',
        options: ['Facecam', 'POV', 'Tendance', 'Tutoriel'],
      },
      {
        id: 'subject',
        label: 'Sujet',
        type: 'text',
        placeholder: 'De quoi voulez-vous parler ?',
      },
    ],
    'Miniature YouTube': [
      {
        id: 'style',
        label: 'Style',
        type: 'choice',
        options: ['Théâtre / Drama', 'Coloré / Kids', 'Minimal / Tech', 'Pro / Business'],
      },
      {
        id: 'title',
        label: 'Titre de la vidéo',
        type: 'text',
        placeholder: 'Titre accrocheur...',
      },
      {
        id: 'emotion',
        label: 'Émotion',
        type: 'choice',
        options: ['Surprise', 'Joie', 'Sérieux', 'Peur'],
      },
    ],
    'Post carrousel Insta': [
      {
        id: 'theme',
        label: 'Thème',
        type: 'choice',
        options: ['Tips / Astuces', 'Storytelling', 'Avant-Après', 'Guide'],
      },
      {
        id: 'subject',
        label: 'Sujet',
        type: 'text',
        placeholder: 'Ex: 5 conseils pour...',
      },
      {
        id: 'style',
        label: 'Style graphique',
        type: 'choice',
        options: ['Modern', 'Retro', 'Corporate'],
      },
    ],
    'Description YT / TikTok': [
      {
        id: 'platform',
        label: 'Plateforme',
        type: 'choice',
        options: ['YouTube', 'TikTok', 'Instagram'],
      },
      {
        id: 'subject',
        label: 'Sujet',
        type: 'text',
        placeholder: 'Sujet de la vidéo...',
      },
      {
        id: 'tone',
        label: 'Ton',
        type: 'choice',
        options: ['Engageant', 'SEO', 'Mystérieux'],
      },
    ],
  },
  Artisan: {
    'Idées & Inspirations': [
      {
        id: 'domain',
        label: 'Domaine',
        type: 'choice',
        options: ['Menuiserie', 'Plomberie', 'Électricité', 'Décoration', 'Jardin'],
      },
      {
        id: 'goal',
        label: 'Objectif',
        type: 'choice',
        options: ['Post Instagram', 'Projet client', 'Création perso'],
      },
    ],
    'Tutoriels & Guides': [
      {
        id: 'type',
        label: 'Type de tutoriel',
        type: 'choice',
        options: ['Réparation', 'Construction', 'Entretien'],
      },
      {
        id: 'subject',
        label: 'Objet / Sujet',
        type: 'text',
        placeholder: 'Ex: Changer un joint...',
      },
    ],
    'Marketing & Com': [
      {
        id: 'goal',
        label: 'Objectif',
        type: 'choice',
        options: ['Gagner clients', 'Présenter service', 'Fidéliser'],
      },
      {
        id: 'format',
        label: 'Format',
        type: 'choice',
        options: ['Flyer', 'Post Réseaux', 'Message'],
      },
    ],
    'Conseils Pro': [
      {
        id: 'problem',
        label: 'Problème client',
        type: 'text',
        placeholder: 'Ex: Humidité mur...',
      },
      {
        id: 'domain',
        label: 'Domaine',
        type: 'choice',
        options: ['Bâtiment', 'Rénovation', 'Dépannage'],
      },
    ],
    'Modèles & Plans': [
      {
        id: 'type',
        label: 'Type de plan',
        type: 'choice',
        options: ['Esquisse', 'Plan coté', '3D (visuel)'],
      },
      {
        id: 'format',
        label: 'Format',
        type: 'choice',
        options: ['A4', 'Carré', 'Paysage'],
      },
    ],
    'Estimation': [
      {
        id: 'service',
        label: 'Service demandé',
        type: 'text',
        placeholder: 'Ex: Rénovation SDB',
      },
      {
        id: 'materials',
        label: 'Matériaux',
        type: 'text',
        placeholder: 'Ex: Carrelage, Douche...',
      },
      {
        id: 'finish',
        label: 'Niveau de finition',
        type: 'choice',
        options: ['Standard', 'Premium', 'Luxe'],
      },
    ],
  },
  'Service local': {
    'Flyer local': [
      {
        id: 'service',
        label: 'Type de service',
        type: 'text',
        placeholder: 'Ex: Ménage, Jardinage...',
      },
      {
        id: 'vibes',
        label: 'Ambiance',
        type: 'choice',
        options: ['Propre', 'Nature', 'Confiance'],
      },
      {
        id: 'promo',
        label: 'Promo (Optionnel)',
        type: 'text',
        placeholder: '-10% première prestation...',
      },
    ],
    'Message WhatsApp pro': [
      {
        id: 'goal',
        label: 'Objectif',
        type: 'choice',
        options: ['Prise de contact', 'Relance', 'Info pratique'],
      },
      {
        id: 'tone',
        label: 'Ton',
        type: 'choice',
        options: ['Courtois', 'Direct', 'Chaleureux'],
      },
      {
        id: 'info',
        label: 'Info clé',
        type: 'text',
        placeholder: 'Ex: Dispo semaine prochaine...',
      },
    ],
    'Petite affiche / tarifs': [
      {
        id: 'model',
        label: 'Modèle',
        type: 'choice',
        options: ['Liste simple', 'Tableau', 'Visuel'],
      },
      {
        id: 'rates',
        label: 'Tarifs',
        type: 'text',
        placeholder: 'Ex: 20€/h...',
      },
    ],
    'Description Google Maps': [
      {
        id: 'service',
        label: 'Type de service',
        type: 'text',
        placeholder: 'Ex: Plombier...',
      },
      {
        id: 'specialty',
        label: 'Spécialité',
        type: 'text',
        placeholder: 'Ex: Urgence 24/7',
      },
      {
        id: 'tone',
        label: 'Ton',
        type: 'choice',
        options: ['Professionnel', 'Local', 'Expert'],
      },
    ],
  },
};
