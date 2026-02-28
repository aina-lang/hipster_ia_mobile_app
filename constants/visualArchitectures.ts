// ──────────────────────────────────────────────────────────────────────────────
// VISUAL ARCHITECTURES - Directions Artistiques
// ──────────────────────────────────────────────────────────────────────────────

// Import images
import fashionImg from '../assets/WhatsApp Image 2026-02-27 at 10.27.50.jpeg';
import streetSaleImg from '../assets/WhatsApp Image 2026-02-27 at 10.27.50 (1).jpeg';
import magazineCoverImg from '../assets/WhatsApp Image 2026-02-27 at 10.27.50 (2).jpeg';
import editorialMotionImg from '../assets/quatriemeCard.jpeg';

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
];

export const getArchitectureById = (id: string): VisualArchitecture | undefined => {
  return VISUAL_ARCHITECTURES.find((arch) => arch.id === id);
};

export const getArchitecturesByType = (type: VisualArchitecture['type']): VisualArchitecture[] => {
  return VISUAL_ARCHITECTURES.filter((arch) => arch.type === type);
};
