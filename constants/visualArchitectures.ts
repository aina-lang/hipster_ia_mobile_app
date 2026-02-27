// ──────────────────────────────────────────────────────────────────────────────
// VISUAL ARCHITECTURES - Directions Artistiques
// ──────────────────────────────────────────────────────────────────────────────

import { 
  Sparkles, 
  Zap, 
  Eye, 
  Palette, 
  Type, 
  Crown,
  LucideIcon,
} from 'lucide-react-native';

// Import images
import fashionImg from '../assets/WhatsApp Image 2026-02-27 at 10.27.50.jpeg';
import streetSaleImg from '../assets/WhatsApp Image 2026-02-27 at 10.27.50 (1).jpeg';
import magazineCoverImg from '../assets/WhatsApp Image 2026-02-27 at 10.27.50 (2).jpeg';
import editorialMotionImg from '../assets/WhatsApp Image 2026-02-27 at 10.27.51.jpeg';
import splitTypoImg from '../assets/WhatsApp Image 2026-02-27 at 10.36.13.jpeg';
import luxurySerieImg from '../assets/WhatsApp Image 2026-02-27 at 10.27.51 (2).jpeg';

export interface VisualArchitecture {
  id: string;
  label: string;
  description: string;
  subtitle?: string;
  image: any;
  icon: LucideIcon;
  color: string;
  type: 'FASHION_VERTICAL' | 'STREET_SALE' | 'MAGAZINE' | 'EDITORIAL' | 'SPLIT_TYPO' | 'LUXURY';
}

export const VISUAL_ARCHITECTURES: VisualArchitecture[] = [
  {
    id: 'fashion-vertical-impact',
    label: 'FASHION VERTICAL IMPACT',
    description: 'Poster moderne & mode',
    subtitle: 'Portrait cinématique avec typographie élancée',
    image: fashionImg,
    icon: Sparkles,
    color: '#FF6B9D',
    type: 'FASHION_VERTICAL',
  },
  {
    id: 'street-sale',
    label: 'STREET SALE',
    description: 'Impact commercial',
    subtitle: 'Affiche urbaine avec couleurs éclatantes',
    image: streetSaleImg,
    icon: Zap,
    color: '#FF1744',
    type: 'STREET_SALE',
  },
  {
    id: 'magazine-cover',
    label: 'MAGAZINE COVER',
    description: 'Couverture éditoriale',
    subtitle: 'Style éditorial sophistiqué',
    image: magazineCoverImg,
    icon: Eye,
    color: '#1A73E8',
    type: 'MAGAZINE',
  },
  {
    id: 'editorial-motion',
    label: 'EDITORIAL MOTION',
    description: 'Effet premium fashion',
    subtitle: 'Cinéma de mode haute couture',
    image: editorialMotionImg,
    icon: Palette,
    color: '#FF9800',
    type: 'EDITORIAL',
  },
  {
    id: 'split-typo',
    label: 'SPLIT TYPO',
    description: 'Design graphique bold',
    subtitle: 'Typographie fragmentée et moderne',
    image: splitTypoImg,
    icon: Type,
    color: '#00BCD4',
    type: 'SPLIT_TYPO',
  },
  {
    id: 'luxury-serie',
    label: 'LUXURY SERIE',
    description: 'Événement & collection',
    subtitle: 'Luxe raffiné et minimaliste',
    image: luxurySerieImg,
    icon: Crown,
    color: '#D4AF37',
    type: 'LUXURY',
  },
];

export const getArchitectureById = (id: string): VisualArchitecture | undefined => {
  return VISUAL_ARCHITECTURES.find((arch) => arch.id === id);
};

export const getArchitecturesByType = (type: VisualArchitecture['type']): VisualArchitecture[] => {
  return VISUAL_ARCHITECTURES.filter((arch) => arch.type === type);
};
