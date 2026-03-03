// ──────────────────────────────────────────────────────────────────────────────
// VISUAL ARCHITECTURES - Directions Artistiques
// ──────────────────────────────────────────────────────────────────────────────

// Import images
import fashionImg from '../assets/premierCard.jpeg';
import streetSaleImg from '../assets/deuxiemeCard.jpeg';
import magazineCoverImg from '../assets/TroisiemeCard.jpeg';
import editorialMotionImg from '../assets/quatriemeCard.jpeg';
import prestigeImg from '../assets/bw5.jpeg';
import signatureSplash from '../assets/signatureSplash.jpeg';
import editionnalGrid from '../assets/editionnalGrid.jpeg';

export interface VisualArchitecture {
  id: string;
  label: string;
  description: string;
  subtitle?: string;
  image: any;
  color: string;
  type: 'FASHION_VERTICAL' | 'MAGAZINE_COVER_POSTER' | 'MAGAZINE' | 'EDITORIAL';
}

export const VISUAL_ARCHITECTURES: VisualArchitecture[] = [
  {
    id: 'fashion-vertical-impact',
    label: 'FASHION VERTICAL IMPACT',
    description: 'Poster moderne & mode',
    subtitle: 'Portrait cinématique avec typographie élancée',
    image: fashionImg,
    color: '#FF6B9D',
    type: 'FASHION_VERTICAL',
  },
  {
    id: 'magazine-cover-poster',
    label: 'MAGAZINE COVER POSTER',
    description: 'Couverture magazine premium',
    subtitle: 'Poster éditorial monochrome avec sujet centré',
    image: streetSaleImg,
    color: '#FF1744',
    type: 'MAGAZINE_COVER_POSTER',
  },
  {
    id: 'impact-commercial',
    label: 'IMPACT COMMERCIAL',
    description: 'Impact commercial',
    subtitle: 'Affiche publicitaire percutante',
    image: magazineCoverImg,
    color: '#1A73E8',
    type: 'MAGAZINE',
  },
  {
    id: 'editorial-motion',
    label: 'EDITORIAL MOTION',
    description: 'Effet premium fashion',
    subtitle: 'Cinéma de mode haute couture',
    image: editorialMotionImg,
    color: '#FF9800',
    type: 'EDITORIAL',
  },
  {
    id: 'editorial-black-white',
    label: 'PRESTIGE',
    description: 'Noir & blanc luxe',
    subtitle: 'qualité premium',
    image: prestigeImg,
    color: '#FF9800',
    type: 'EDITORIAL',
  },
{
  id: 'signature-splash',
  label: 'SIGNATURE SPLASH',
  description: 'Effet splash éditorial premium',
  subtitle: 'Motion design avec impact cinématique',
  image: signatureSplash,
  color: '#FF9800',
  type: 'EDITORIAL',
},
{
  id: 'editorial-grid',
  label: 'EDITORIAL GRID',
  description: 'Architecture grille éditorial',
  subtitle: 'Design modulaire avec composition en grille',
  image: editionnalGrid,
  color: '#FF9800',
  type: 'EDITORIAL',
},
];

export const getArchitectureById = (id: string): VisualArchitecture | undefined => {
  return VISUAL_ARCHITECTURES.find((arch) => arch.id === id);
};

export const getArchitecturesByType = (type: VisualArchitecture['type']): VisualArchitecture[] => {
  return VISUAL_ARCHITECTURES.filter((arch) => arch.type === type);
};
