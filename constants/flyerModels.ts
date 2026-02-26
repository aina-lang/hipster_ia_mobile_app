import {
  Sparkles,
  Palette,
  Gem,
  Music,
  Briefcase,
  Dumbbell,
  History,
  Leaf,
  Eye,
  PenTool,
} from 'lucide-react-native';

import modern_img from '../assets/modernetypo.jpg';
import colorful_img from '../assets/social.jpeg';
import elegant_img from '../assets/flyer.jpeg';
import festive_img from '../assets/illus3.jpeg';
import pro_img from '../assets/ordi_blanc_bg.jpeg';
import sport_img from '../assets/illus2.jpeg';
import nature_img from '../assets/bg.jpeg';
import classic_img from '../assets/bg-onboarding.jpeg';
import impact_img from '../assets/site-web.jpeg';
import creative_img from '../assets/illus4.jpeg';
import typo_img from '../assets/modernetypo.jpg';
import neon_img from '../assets/moderneneon.jpg';
import gradient_img from '../assets/gradient.jpg';
import dark_img from '../assets/illus1.jpeg';

export const FLYER_CATEGORIES = [
  {
    id: 'modern',
    label: 'STYLES MODERNES',
    icon: Sparkles,
    image: modern_img,
    models: [
      { label: 'Moderne minimaliste', image: creative_img },
      { label: 'Moderne géométrique' },
      { label: 'Moderne dégradé (gradient)', image: gradient_img },
      { label: 'Moderne typographie bold', image: typo_img },
      { label: 'Moderne fond sombre', image: dark_img },
      { label: 'Moderne flat design' },
      { label: 'Moderne glassmorphism' },
      { label: 'Moderne néon', image: neon_img },
    ],
  },
  {
    id: 'colorful',
    label: 'STYLES COLORÉS / FUN',
    icon: Palette,
    image: colorful_img,
    models: [
      'Coloré vibrant',
      'Pastel doux',
      'Cartoon',
      'Pop art',
      'Fun enfants',
      'Confettis',
      'Festival couleurs',
      'Abstrait artistique',
    ],
  },
  {
    id: 'elegant',
    label: 'STYLES ÉLÉGANTS / LUXE',
    icon: Gem,
    image: elegant_img,
    models: [
      { label: 'Noir & Or', image: elegant_img },
      { label: 'Blanc & Or' },
      { label: 'Élégant minimal' },
      { label: 'Luxe premium' },
      { label: 'Classique chic' },
      { label: 'Royal (violet/or)' },
      { label: 'Doré brillant' },
      { label: 'Soirée glamour' },
    ],
  },
  {
    id: 'festive',
    label: 'STYLES FESTIFS / SOIRÉE',
    icon: Music,
    image: festive_img,
    models: [
      { label: 'DJ Party', image: festive_img },
      { label: 'Clubbing' },
      { label: 'Neon night' },
      { label: 'Glow party' },
      { label: 'Urban street' },
      { label: 'Hip-hop' },
      { label: 'Afro vibe' },
      { label: 'Tropical party' },
      { label: 'Beach party' },
      { label: 'Sunset vibe' },
    ],
  },
  {
    id: 'professional',
    label: 'STYLES PROFESSIONNELS',
    icon: Briefcase,
    image: pro_img,
    models: [
      { label: 'Corporate clean', image: pro_img },
      { label: 'Conférence pro' },
      { label: 'Business formel' },
      { label: 'Tech digital' },
      { label: 'Startup moderne', image: pro_img },
      { label: 'Minimal corporate' },
      { label: 'LinkedIn style' },
      { label: 'Webinaire professionnel' },
    ],
  },
  {
    id: 'sport',
    label: 'STYLES SPORTIFS',
    icon: Dumbbell,
    image: sport_img,
    models: [
      'Dynamique rouge/noir',
      'Explosion énergie',
      'Fitness impact',
      'Sport compétition',
      'Tournoi officiel',
      'Street sport',
      'Performance extrême',
    ],
  },
  {
    id: 'classic',
    label: 'STYLES CLASSIQUES',
    icon: History,
    image: classic_img,
    models: [
      'Classique traditionnel',
      'Vintage',
      'Rétro années 80',
      'Rétro années 90',
      'Old school',
      'Papier texturé',
      'Style affiche ancienne',
    ],
  },
  {
    id: 'nature',
    label: 'STYLES NATURE',
    icon: Leaf,
    image: nature_img,
    models: [
      'Nature verte',
      'Floral élégant',
      'Tropical jungle',
      'Éco / bio',
      'Bohème',
      'Minimal naturel',
      'Rustique bois',
    ],
  },
  {
    id: 'impact',
    label: 'STYLES VISUELS IMPACT',
    icon: Eye,
    image: impact_img,
    models: [
      { label: 'Photo centrale dominante', image: festive_img },
      { label: 'Image plein écran' },
      { label: 'Poster cinéma' },
      { label: 'Affiche dramatique' },
      { label: 'Fond flou artistique' },
      { label: 'Double exposition' },
      { label: 'Collage moderne' },
    ],
  },
  {
    id: 'creative',
    label: 'STYLES CRÉATIFS',
    icon: PenTool,
    image: creative_img,
    models: [
      'Asymétrique',
      'Layout split (2 colonnes)',
      'Typographie géante',
      'Encadré central',
      'Cercle dominant',
      'Diagonal dynamique',
      'Bloc moderne',
      'Style magazine',
    ],
  },
];
