import { Sparkles, Palette, Flame, Moon, Sun, Gem, LucideIcon } from 'lucide-react-native';
import modern_img from '../assets/modernetypo.jpg';
import colorful_img from '../assets/social.jpeg';
import elegant_img from '../assets/flyer.jpeg';
import festive_img from '../assets/illus3.jpeg';
import pro_img from '../assets/ordi_blanc_bg.jpeg';
import classic_img from '../assets/bg-onboarding.jpeg';
import impact_img from '../assets/site-web.jpeg';
import creative_img from '../assets/illus4.jpeg';

/**
 * Mapping des assets locaux pour les catégories chargées depuis l'API.
 * L'API renvoie des identifiants (ex: 'Moon', 'Sun') qui sont mappés ici.
 */
export const FLYER_ASSET_MAP: Record<string, { icon: LucideIcon; image: any }> = {
  Moon: { icon: Moon, image: elegant_img },
  Sun: { icon: Sun, image: classic_img },
  Sparkles: { icon: Sparkles, image: modern_img },
  Palette: { icon: Palette, image: colorful_img },
  Flame: { icon: Flame, image: festive_img },
  Gem: { icon: Gem, image: creative_img },
};

/**
 * Helper pour obtenir l'icône et l'image d'une catégorie.
 * Priorise les données de l'API si elles sont présentes, sinon utilise le mapping local.
 */
export const getFlyerCategoryAssets = (id: string, iconId?: string) => {
  const local = FLYER_ASSET_MAP[iconId || ''] || FLYER_ASSET_MAP['Moon'];
  return local;
};

// Types conservés pour le typage du frontend
export interface VariantStructure {
  subject: any;
  subjectSize: 'hero' | 'large' | 'medium' | 'small' | 'none';
  title: any;
  banner: any;
  particles: any;
  decorations: any[];
  background: any;
  colorFilter: any;
  typography: any;
  frame: any;
}

export interface Variant {
  label: string;
  structure: VariantStructure;
}

export interface FlyerModel {
  label: string;
  image?: any;
  variants: Variant[];
}

export interface FlyerCategory {
  id: string;
  label: string;
  icon: any;
  image: any;
  models: FlyerModel[];
}

export const FLYER_CATEGORIES: FlyerCategory[] = [];
