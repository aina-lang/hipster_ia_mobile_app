/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TYPES — Structure de layout fixe pour chaque variant
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * subject       → position du sujet (personne / objet / produit)
 * subjectSize   → taille du sujet dans la composition
 * title         → position du bloc titre principal
 * banner        → style + position de la bannière infos (date, lieu…)
 * particles     → effet décoratif volumétrique
 * decorations   → éléments graphiques fixes additionnels
 * background    → traitement du fond
 * colorFilter   → filtre appliqué sur le sujet
 * typography    → style typographique dominant
 * frame         → encadrement / bordure
 */

export type SubjectPos =
  | 'center' // centré au milieu
  | 'center-bottom' // centré, ancré en bas
  | 'bleed-left' // déborde sur la gauche
  | 'bleed-right' // déborde sur la droite
  | 'full-bleed' // remplit toute la surface
  | 'top-center' // centré en haut
  | 'bottom-left' // coin bas gauche
  | 'bottom-right' // coin bas droit
  | 'none'; // pas de sujet

export type TitlePos =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'over-subject'
  | 'split-vertical';

export type BannerStyle =
  | 'strip-top' // bande pleine en haut
  | 'strip-bottom' // bande pleine en bas
  | 'strip-left' // bande verticale gauche
  | 'strip-right' // bande verticale droite
  | 'badge-circle' // badge rond
  | 'badge-pill' // badge arrondi horizontal
  | 'tag-corner' // étiquette coin haut-gauche
  | 'block-solid' // bloc rectangulaire
  | 'diagonal-cut' // découpe diagonale
  | 'none';

export type Particle =
  | 'confetti' // confettis colorés
  | 'stars' // étoiles / paillettes
  | 'sparks' // étincelles dorées
  | 'bokeh' // points lumineux flous
  | 'dust' // poussière / grains
  | 'geometric-shapes' // formes géométriques flottantes
  | 'dots-grid' // grille de points
  | 'lines-diagonal' // lignes diagonales
  | 'petals' // pétales de fleurs
  | 'bubbles' // bulles
  | 'snowflakes' // flocons
  | 'glitch-lines' // lignes de glitch
  | 'noise-grain' // grain photographique
  | 'none';

export type Decoration =
  | 'white-city-silhouette' // silhouette de ville blanche en bas
  | 'corner-marks' // marques de coin (repères imprimerie)
  | 'diagonal-stripe' // bande diagonale décorative
  | 'halftone-overlay' // trame demi-teinte
  | 'scanlines' // lignes de scan
  | 'ink-splatter' // éclaboussure d'encre
  | 'geometric-border' // bordure géométrique intérieure
  | 'floral-ornament' // ornement floral
  | 'grid-overlay' // grille superposée
  | 'wave-bottom' // vague en bas
  | 'arch-frame' // arche encadrante
  | 'torn-edge' // bord déchiré
  | 'foil-texture' // texture dorée / métallisée
  | 'neon-glow-outline' // contour lumineux néon
  | 'watermark-pattern' // motif en filigrane
  | 'ribbon-seal'
  | 'noise-grain'
  | 'glitch-lines' // ruban / sceau
  | 'none';

export type Background =
  | 'solid-dark' // fond uni sombre
  | 'solid-light' // fond uni clair
  | 'solid-color' // fond uni coloré
  | 'gradient-radial' // dégradé circulaire
  | 'gradient-linear' // dégradé linéaire
  | 'gradient-mesh' // dégradé maillé multicolore
  | 'texture-paper' // texture papier
  | 'texture-grain' // texture grain
  | 'texture-marble' // texture marbre
  | 'texture-fabric' // texture tissu / velours
  | 'photo-blur' // photo floutée
  | 'photo-overlay' // photo avec calque coloré
  | 'pattern-geometric' // motif géométrique répété
  | 'pattern-halftone'; // motif tramé

export type ColorFilter =
  | 'none' // aucun filtre
  | 'duotone' // bichromie
  | 'bw' // noir et blanc
  | 'sepia' // sépia
  | 'neon-wash' // lavage néon
  | 'color-pop' // couleurs ressortantes
  | 'matte' // mat / désaturé
  | 'vivid' // saturé / vif
  | 'faded'; // passé / vintage

export type Typography =
  | 'oversized-display' // énorme, déborde parfois du cadre
  | 'serif-editorial' // serif grand, élégant
  | 'sans-bold' // sans-serif gras
  | 'condensed-stack' // condensé empilé sur plusieurs lignes
  | 'script-hand' // manuscrit / cursive
  | 'mono-tech' // monospace technique
  | 'mixed-scale' // mix grandes et petites tailles
  | 'outlined' // lettres en contour uniquement
  | 'minimal-label'; // petit, très discret

export type Frame =
  | 'none'
  | 'thin-border' // fine bordure intérieure
  | 'thick-border' // bordure épaisse
  | 'double-border' // double bordure
  | 'corner-brackets' // crochets de coin
  | 'full-arch' // arche complète en haut
  | 'diagonal-split' // split diagonal
  | 'circle-crop' // recadrage circulaire
  | 'torn-edge'; // bord déchiré

export interface VariantStructure {
  subject: SubjectPos;
  subjectSize: 'hero' | 'large' | 'medium' | 'small' | 'none';
  title: TitlePos;
  banner: BannerStyle;
  particles: Particle;
  decorations: Decoration[];
  background: Background;
  colorFilter: ColorFilter;
  typography: Typography;
  frame: Frame;
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

// ─────────────────────────────────────────────────────────────────────────────

import { Sparkles, Palette, Flame, Moon, Sun, Gem, LucideIcon } from 'lucide-react-native';
import modern_img from '../assets/modernetypo.jpg';
import colorful_img from '../assets/social.jpeg';
import elegant_img from '../assets/flyer.jpeg';
import festive_img from '../assets/illus3.jpeg';
import pro_img from '../assets/ordi_blanc_bg.jpeg';
import sport_img from '../assets/illus2.jpeg';
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

export const FLYER_CATEGORIES: FlyerCategory[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 1 · SOMBRE & LUXE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'dark',
    label: 'SOMBRE & LUXE',
    icon: Moon,
    image: elegant_img,
    models: [
      {
        label: 'Noir & Or',
        image: elegant_img,
        variants: [
          {
            label: 'Noir & Or – Sobre & Raffiné',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'strip-bottom',
              particles: 'sparks',
              decorations: ['corner-marks', 'foil-texture'],
              background: 'solid-dark',
              colorFilter: 'matte',
              typography: 'serif-editorial',
              frame: 'thin-border',
            },
          },
          {
            label: 'Noir & Or – Festif & Brillant',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'badge-circle',
              particles: 'sparks',
              decorations: ['foil-texture', 'diagonal-stripe'],
              background: 'gradient-radial',
              colorFilter: 'vivid',
              typography: 'oversized-display',
              frame: 'double-border',
            },
          },
          {
            label: 'Noir & Or – Corporate',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'large',
              title: 'center-left',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['corner-marks', 'geometric-border'],
              background: 'solid-dark',
              colorFilter: 'duotone',
              typography: 'sans-bold',
              frame: 'corner-brackets',
            },
          },
          {
            label: 'Noir & Or – Romantique',
            structure: {
              subject: 'center',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-pill',
              particles: 'petals',
              decorations: ['floral-ornament', 'foil-texture'],
              background: 'gradient-radial',
              colorFilter: 'matte',
              typography: 'script-hand',
              frame: 'full-arch',
            },
          },
        ],
      },

      {
        label: 'Minuit Premium',
        image: elegant_img,
        variants: [
          {
            label: 'Minuit Premium – Sobre',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'large',
              title: 'center-left',
              banner: 'strip-top',
              particles: 'bokeh',
              decorations: ['corner-marks'],
              background: 'gradient-linear',
              colorFilter: 'matte',
              typography: 'serif-editorial',
              frame: 'thin-border',
            },
          },
          {
            label: 'Minuit Premium – Festif',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'badge-circle',
              particles: 'stars',
              decorations: ['foil-texture', 'neon-glow-outline'],
              background: 'gradient-mesh',
              colorFilter: 'vivid',
              typography: 'oversized-display',
              frame: 'double-border',
            },
          },
          {
            label: 'Minuit Premium – Cérémoniel',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'strip-bottom',
              particles: 'sparks',
              decorations: ['ribbon-seal', 'floral-ornament'],
              background: 'solid-dark',
              colorFilter: 'duotone',
              typography: 'serif-editorial',
              frame: 'full-arch',
            },
          },
        ],
      },

      {
        label: 'Élégance Sombre',
        image: elegant_img,
        variants: [
          {
            label: 'Élégance Sombre – Minimaliste',
            structure: {
              subject: 'center',
              subjectSize: 'medium',
              title: 'top-left',
              banner: 'none',
              particles: 'none',
              decorations: ['corner-marks'],
              background: 'solid-dark',
              colorFilter: 'bw',
              typography: 'minimal-label',
              frame: 'thin-border',
            },
          },
          {
            label: 'Élégance Sombre – Texturé',
            structure: {
              subject: 'bleed-left',
              subjectSize: 'large',
              title: 'center-right',
              banner: 'strip-right',
              particles: 'noise-grain',
              decorations: ['watermark-pattern'],
              background: 'texture-fabric',
              colorFilter: 'matte',
              typography: 'serif-editorial',
              frame: 'none',
            },
          },
          {
            label: 'Élégance Sombre – Floral',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-pill',
              particles: 'petals',
              decorations: ['floral-ornament', 'geometric-border'],
              background: 'gradient-radial',
              colorFilter: 'color-pop',
              typography: 'script-hand',
              frame: 'full-arch',
            },
          },
        ],
      },

      {
        label: 'Néon Sombre',
        image: festive_img,
        variants: [
          {
            label: 'Néon Sombre – Rose & Noir',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'strip-top',
              particles: 'sparks',
              decorations: ['neon-glow-outline', 'white-city-silhouette'],
              background: 'solid-dark',
              colorFilter: 'neon-wash',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
          {
            label: 'Néon Sombre – Vert & Noir',
            structure: {
              subject: 'bleed-left',
              subjectSize: 'large',
              title: 'center-right',
              banner: 'strip-right',
              particles: 'glitch-lines',
              decorations: ['neon-glow-outline', 'scanlines'],
              background: 'solid-dark',
              colorFilter: 'neon-wash',
              typography: 'mono-tech',
              frame: 'corner-brackets',
            },
          },
          {
            label: 'Néon Sombre – Multi-Néon',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'split-vertical',
              banner: 'diagonal-cut',
              particles: 'glitch-lines',
              decorations: ['neon-glow-outline', 'scanlines', 'grid-overlay'],
              background: 'solid-dark',
              colorFilter: 'neon-wash',
              typography: 'condensed-stack',
              frame: 'diagonal-split',
            },
          },
          {
            label: 'Néon Sombre – Cyber Violet',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-pill',
              particles: 'bokeh',
              decorations: ['neon-glow-outline', 'grid-overlay'],
              background: 'gradient-radial',
              colorFilter: 'neon-wash',
              typography: 'sans-bold',
              frame: 'thin-border',
            },
          },
        ],
      },

      {
        label: 'Lueur Cyber',
        image: festive_img,
        variants: [
          {
            label: 'Lueur Cyber – Violet',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'top-left',
              banner: 'strip-top',
              particles: 'glitch-lines',
              decorations: ['neon-glow-outline', 'grid-overlay', 'scanlines'],
              background: 'gradient-mesh',
              colorFilter: 'neon-wash',
              typography: 'mono-tech',
              frame: 'corner-brackets',
            },
          },
          {
            label: 'Lueur Cyber – Cyan',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'large',
              title: 'center-left',
              banner: 'strip-left',
              particles: 'geometric-shapes',
              decorations: ['neon-glow-outline', 'grid-overlay'],
              background: 'solid-dark',
              colorFilter: 'neon-wash',
              typography: 'condensed-stack',
              frame: 'diagonal-split',
            },
          },
          {
            label: 'Lueur Cyber – Rouge',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'diagonal-cut',
              particles: 'glitch-lines',
              decorations: ['scanlines', 'white-city-silhouette'],
              background: 'solid-dark',
              colorFilter: 'duotone',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
        ],
      },

      {
        label: 'Violet Électrique',
        image: modern_img,
        variants: [
          {
            label: 'Violet Électrique – Intense',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'strip-top',
              particles: 'sparks',
              decorations: ['neon-glow-outline'],
              background: 'gradient-radial',
              colorFilter: 'neon-wash',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
          {
            label: 'Violet Électrique – Dégradé Rose',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-pill',
              particles: 'bokeh',
              decorations: ['foil-texture'],
              background: 'gradient-mesh',
              colorFilter: 'vivid',
              typography: 'sans-bold',
              frame: 'thin-border',
            },
          },
          {
            label: 'Violet Électrique – Sombre',
            structure: {
              subject: 'bleed-left',
              subjectSize: 'large',
              title: 'center-right',
              banner: 'strip-right',
              particles: 'geometric-shapes',
              decorations: ['neon-glow-outline', 'grid-overlay'],
              background: 'solid-dark',
              colorFilter: 'neon-wash',
              typography: 'condensed-stack',
              frame: 'corner-brackets',
            },
          },
        ],
      },

      {
        label: 'Cyan Néon',
        image: modern_img,
        variants: [
          {
            label: 'Cyan Néon – Pur',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'strip-top',
              particles: 'glitch-lines',
              decorations: ['neon-glow-outline', 'white-city-silhouette'],
              background: 'solid-dark',
              colorFilter: 'neon-wash',
              typography: 'mono-tech',
              frame: 'none',
            },
          },
          {
            label: 'Cyan Néon – Dégradé Bleu',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'large',
              title: 'center-left',
              banner: 'badge-pill',
              particles: 'bokeh',
              decorations: ['grid-overlay'],
              background: 'gradient-linear',
              colorFilter: 'neon-wash',
              typography: 'sans-bold',
              frame: 'thin-border',
            },
          },
          {
            label: 'Cyan Néon – Techno',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-left',
              banner: 'diagonal-cut',
              particles: 'geometric-shapes',
              decorations: ['scanlines', 'grid-overlay', 'neon-glow-outline'],
              background: 'gradient-mesh',
              colorFilter: 'duotone',
              typography: 'condensed-stack',
              frame: 'diagonal-split',
            },
          },
        ],
      },

      {
        label: 'Grille Futuriste',
        image: modern_img,
        variants: [
          {
            label: 'Grille Futuriste – Minimaliste',
            structure: {
              subject: 'center',
              subjectSize: 'medium',
              title: 'top-left',
              banner: 'strip-top',
              particles: 'dots-grid',
              decorations: ['grid-overlay', 'corner-marks'],
              background: 'pattern-geometric',
              colorFilter: 'bw',
              typography: 'mono-tech',
              frame: 'corner-brackets',
            },
          },
          {
            label: 'Grille Futuriste – Dense',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'large',
              title: 'split-vertical',
              banner: 'strip-left',
              particles: 'lines-diagonal',
              decorations: ['grid-overlay', 'scanlines'],
              background: 'solid-dark',
              colorFilter: 'duotone',
              typography: 'condensed-stack',
              frame: 'diagonal-split',
            },
          },
          {
            label: 'Grille Futuriste – Holographique',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'diagonal-cut',
              particles: 'geometric-shapes',
              decorations: ['neon-glow-outline', 'grid-overlay', 'foil-texture'],
              background: 'gradient-mesh',
              colorFilter: 'neon-wash',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
        ],
      },

      {
        label: 'Velours Profond',
        image: elegant_img,
        variants: [
          {
            label: 'Velours Profond – Bordeaux',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'strip-bottom',
              particles: 'petals',
              decorations: ['floral-ornament', 'ribbon-seal'],
              background: 'texture-fabric',
              colorFilter: 'matte',
              typography: 'serif-editorial',
              frame: 'full-arch',
            },
          },
          {
            label: 'Velours Profond – Bleu Nuit',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'large',
              title: 'center-left',
              banner: 'strip-top',
              particles: 'stars',
              decorations: ['corner-marks', 'watermark-pattern'],
              background: 'gradient-radial',
              colorFilter: 'duotone',
              typography: 'serif-editorial',
              frame: 'double-border',
            },
          },
          {
            label: 'Velours Profond – Vert Forêt',
            structure: {
              subject: 'center',
              subjectSize: 'large',
              title: 'top-left',
              banner: 'badge-pill',
              particles: 'petals',
              decorations: ['floral-ornament'],
              background: 'texture-fabric',
              colorFilter: 'matte',
              typography: 'script-hand',
              frame: 'thin-border',
            },
          },
        ],
      },

      {
        label: 'Noir & Argent',
        image: elegant_img,
        variants: [
          {
            label: 'Noir & Argent – Épuré',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-left',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['corner-marks'],
              background: 'solid-dark',
              colorFilter: 'bw',
              typography: 'sans-bold',
              frame: 'corner-brackets',
            },
          },
          {
            label: 'Noir & Argent – Métal Brillant',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'hero',
              title: 'center-left',
              banner: 'badge-pill',
              particles: 'sparks',
              decorations: ['foil-texture', 'neon-glow-outline'],
              background: 'gradient-linear',
              colorFilter: 'duotone',
              typography: 'oversized-display',
              frame: 'diagonal-split',
            },
          },
          {
            label: 'Noir & Argent – Luxe Moderne',
            structure: {
              subject: 'center',
              subjectSize: 'large',
              title: 'bottom-center',
              banner: 'strip-bottom',
              particles: 'geometric-shapes',
              decorations: ['geometric-border', 'foil-texture'],
              background: 'gradient-mesh',
              colorFilter: 'matte',
              typography: 'condensed-stack',
              frame: 'thin-border',
            },
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2 · CLAIR & ÉPURÉ
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'light',
    label: 'CLAIR & ÉPURÉ',
    icon: Sun,
    image: classic_img,
    models: [
      {
        label: 'Blanc Pur',
        image: classic_img,
        variants: [
          {
            label: 'Blanc Pur – Ultra Minimaliste',
            structure: {
              subject: 'center',
              subjectSize: 'medium',
              title: 'top-center',
              banner: 'none',
              particles: 'none',
              decorations: ['corner-marks'],
              background: 'solid-light',
              colorFilter: 'none',
              typography: 'minimal-label',
              frame: 'thin-border',
            },
          },
          {
            label: 'Blanc Pur – Avec Accent Sombre',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'large',
              title: 'center-left',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['corner-marks', 'geometric-border'],
              background: 'solid-light',
              colorFilter: 'bw',
              typography: 'sans-bold',
              frame: 'corner-brackets',
            },
          },
          {
            label: 'Blanc Pur – Avec Accent Doré',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'strip-bottom',
              particles: 'sparks',
              decorations: ['foil-texture', 'corner-marks'],
              background: 'solid-light',
              colorFilter: 'none',
              typography: 'serif-editorial',
              frame: 'thin-border',
            },
          },
        ],
      },

      {
        label: 'Minimaliste Doux',
        image: classic_img,
        variants: [
          {
            label: 'Minimaliste Doux – Sobre',
            structure: {
              subject: 'center',
              subjectSize: 'medium',
              title: 'top-left',
              banner: 'none',
              particles: 'none',
              decorations: ['corner-marks'],
              background: 'solid-light',
              colorFilter: 'none',
              typography: 'minimal-label',
              frame: 'thin-border',
            },
          },
          {
            label: 'Minimaliste Doux – Festif',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-pill',
              particles: 'confetti',
              decorations: ['corner-marks'],
              background: 'gradient-linear',
              colorFilter: 'none',
              typography: 'sans-bold',
              frame: 'thin-border',
            },
          },
          {
            label: 'Minimaliste Doux – Professionnel',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'large',
              title: 'center-left',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['geometric-border'],
              background: 'solid-light',
              colorFilter: 'none',
              typography: 'serif-editorial',
              frame: 'corner-brackets',
            },
          },
          {
            label: 'Minimaliste Doux – Poétique',
            structure: {
              subject: 'center',
              subjectSize: 'medium',
              title: 'bottom-center',
              banner: 'badge-pill',
              particles: 'petals',
              decorations: ['floral-ornament'],
              background: 'gradient-radial',
              colorFilter: 'faded',
              typography: 'script-hand',
              frame: 'full-arch',
            },
          },
        ],
      },

      {
        label: 'Ivoire & Sable',
        image: classic_img,
        variants: [
          {
            label: 'Ivoire & Sable – Champêtre',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'strip-bottom',
              particles: 'petals',
              decorations: ['floral-ornament', 'geometric-border'],
              background: 'texture-paper',
              colorFilter: 'faded',
              typography: 'script-hand',
              frame: 'thin-border',
            },
          },
          {
            label: 'Ivoire & Sable – Mariage',
            structure: {
              subject: 'center',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-pill',
              particles: 'petals',
              decorations: ['floral-ornament', 'ribbon-seal'],
              background: 'texture-paper',
              colorFilter: 'sepia',
              typography: 'script-hand',
              frame: 'full-arch',
            },
          },
          {
            label: 'Ivoire & Sable – Corporate',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'medium',
              title: 'center-left',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['corner-marks'],
              background: 'texture-paper',
              colorFilter: 'none',
              typography: 'serif-editorial',
              frame: 'corner-brackets',
            },
          },
        ],
      },

      {
        label: 'Pastel Tendre',
        image: colorful_img,
        variants: [
          {
            label: 'Pastel Tendre – Anniversaire',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'badge-circle',
              particles: 'confetti',
              decorations: ['corner-marks'],
              background: 'gradient-radial',
              colorFilter: 'vivid',
              typography: 'sans-bold',
              frame: 'thin-border',
            },
          },
          {
            label: 'Pastel Tendre – Baby Shower',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-pill',
              particles: 'bubbles',
              decorations: ['floral-ornament'],
              background: 'gradient-linear',
              colorFilter: 'none',
              typography: 'script-hand',
              frame: 'full-arch',
            },
          },
          {
            label: 'Pastel Tendre – Mariage',
            structure: {
              subject: 'center',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'strip-bottom',
              particles: 'petals',
              decorations: ['floral-ornament', 'ribbon-seal'],
              background: 'gradient-mesh',
              colorFilter: 'faded',
              typography: 'script-hand',
              frame: 'full-arch',
            },
          },
          {
            label: 'Pastel Tendre – Printemps',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'large',
              title: 'center-left',
              banner: 'badge-pill',
              particles: 'petals',
              decorations: ['floral-ornament'],
              background: 'gradient-radial',
              colorFilter: 'vivid',
              typography: 'script-hand',
              frame: 'thin-border',
            },
          },
        ],
      },

      {
        label: 'Rose Poudré',
        image: colorful_img,
        variants: [
          {
            label: 'Rose Poudré – Doux',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-pill',
              particles: 'petals',
              decorations: ['floral-ornament'],
              background: 'gradient-radial',
              colorFilter: 'faded',
              typography: 'script-hand',
              frame: 'thin-border',
            },
          },
          {
            label: 'Rose Poudré – Glamour',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'strip-top',
              particles: 'sparks',
              decorations: ['foil-texture', 'neon-glow-outline'],
              background: 'gradient-mesh',
              colorFilter: 'vivid',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
          {
            label: 'Rose Poudré – Luxe',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'large',
              title: 'center-left',
              banner: 'strip-top',
              particles: 'bokeh',
              decorations: ['foil-texture', 'corner-marks'],
              background: 'gradient-linear',
              colorFilter: 'matte',
              typography: 'serif-editorial',
              frame: 'double-border',
            },
          },
        ],
      },

      {
        label: 'Crème & Or',
        image: elegant_img,
        variants: [
          {
            label: 'Crème & Or – Élégant',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'strip-bottom',
              particles: 'sparks',
              decorations: ['foil-texture', 'corner-marks'],
              background: 'texture-paper',
              colorFilter: 'sepia',
              typography: 'serif-editorial',
              frame: 'double-border',
            },
          },
          {
            label: 'Crème & Or – Mariage',
            structure: {
              subject: 'center',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-pill',
              particles: 'petals',
              decorations: ['floral-ornament', 'ribbon-seal', 'foil-texture'],
              background: 'texture-paper',
              colorFilter: 'sepia',
              typography: 'script-hand',
              frame: 'full-arch',
            },
          },
          {
            label: 'Crème & Or – Anniversaire Luxe',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'badge-circle',
              particles: 'sparks',
              decorations: ['foil-texture', 'ribbon-seal'],
              background: 'gradient-radial',
              colorFilter: 'matte',
              typography: 'serif-editorial',
              frame: 'full-arch',
            },
          },
        ],
      },

      {
        label: 'Bleu Ciel',
        image: colorful_img,
        variants: [
          {
            label: 'Bleu Ciel – Frais',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-pill',
              particles: 'bubbles',
              decorations: ['wave-bottom'],
              background: 'gradient-linear',
              colorFilter: 'vivid',
              typography: 'sans-bold',
              frame: 'thin-border',
            },
          },
          {
            label: 'Bleu Ciel – Corporate',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'large',
              title: 'center-left',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['geometric-border', 'corner-marks'],
              background: 'solid-light',
              colorFilter: 'none',
              typography: 'serif-editorial',
              frame: 'corner-brackets',
            },
          },
          {
            label: 'Bleu Ciel – Estival',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'strip-top',
              particles: 'bokeh',
              decorations: ['wave-bottom'],
              background: 'gradient-radial',
              colorFilter: 'vivid',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
        ],
      },

      {
        label: 'Vert Menthe',
        image: colorful_img,
        variants: [
          {
            label: 'Vert Menthe – Nature',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-pill',
              particles: 'petals',
              decorations: ['floral-ornament', 'wave-bottom'],
              background: 'gradient-radial',
              colorFilter: 'vivid',
              typography: 'script-hand',
              frame: 'full-arch',
            },
          },
          {
            label: 'Vert Menthe – Moderne',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'large',
              title: 'center-left',
              banner: 'strip-top',
              particles: 'geometric-shapes',
              decorations: ['corner-marks'],
              background: 'solid-light',
              colorFilter: 'none',
              typography: 'sans-bold',
              frame: 'thin-border',
            },
          },
          {
            label: 'Vert Menthe – Bio & Naturel',
            structure: {
              subject: 'center',
              subjectSize: 'medium',
              title: 'top-center',
              banner: 'badge-pill',
              particles: 'petals',
              decorations: ['floral-ornament'],
              background: 'texture-paper',
              colorFilter: 'faded',
              typography: 'script-hand',
              frame: 'thin-border',
            },
          },
        ],
      },

      {
        label: 'Trait Fin',
        image: classic_img,
        variants: [
          {
            label: 'Trait Fin – Géométrique',
            structure: {
              subject: 'center',
              subjectSize: 'medium',
              title: 'top-left',
              banner: 'none',
              particles: 'geometric-shapes',
              decorations: ['geometric-border', 'corner-marks'],
              background: 'solid-light',
              colorFilter: 'none',
              typography: 'minimal-label',
              frame: 'double-border',
            },
          },
          {
            label: 'Trait Fin – Floral',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-pill',
              particles: 'petals',
              decorations: ['floral-ornament'],
              background: 'solid-light',
              colorFilter: 'none',
              typography: 'script-hand',
              frame: 'thin-border',
            },
          },
          {
            label: 'Trait Fin – Typographique',
            structure: {
              subject: 'none',
              subjectSize: 'none',
              title: 'center',
              banner: 'strip-bottom',
              particles: 'lines-diagonal',
              decorations: ['corner-marks'],
              background: 'solid-light',
              colorFilter: 'none',
              typography: 'oversized-display',
              frame: 'thin-border',
            },
          },
        ],
      },

      {
        label: 'Espace Blanc',
        image: classic_img,
        variants: [
          {
            label: 'Espace Blanc – Éditorial',
            structure: {
              subject: 'bleed-left',
              subjectSize: 'large',
              title: 'center-right',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['corner-marks'],
              background: 'solid-light',
              colorFilter: 'bw',
              typography: 'serif-editorial',
              frame: 'none',
            },
          },
          {
            label: 'Espace Blanc – Galerie',
            structure: {
              subject: 'center',
              subjectSize: 'large',
              title: 'bottom-left',
              banner: 'strip-bottom',
              particles: 'none',
              decorations: ['none'],
              background: 'solid-light',
              colorFilter: 'none',
              typography: 'minimal-label',
              frame: 'thin-border',
            },
          },
          {
            label: 'Espace Blanc – Luxe',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'none',
              particles: 'sparks',
              decorations: ['foil-texture', 'corner-marks'],
              background: 'solid-light',
              colorFilter: 'none',
              typography: 'serif-editorial',
              frame: 'double-border',
            },
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3 · BOLD & IMPACT
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'bold',
    label: 'BOLD & IMPACT',
    icon: Flame,
    image: impact_img,
    models: [
      {
        label: 'Style Brutaliste',
        image: impact_img,
        variants: [
          {
            label: 'Brutaliste – Brut & Cru',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'top-left',
              banner: 'strip-left',
              particles: 'dust',
              decorations: ['white-city-silhouette'],
              background: 'solid-light',
              colorFilter: 'none',
              typography: 'oversized-display',
              frame: 'thick-border',
            },
          },
          {
            label: 'Brutaliste – Coloré',
            structure: {
              subject: 'center',
              subjectSize: 'large',
              title: 'top-left',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['diagonal-stripe', 'halftone-overlay'],
              background: 'solid-color',
              colorFilter: 'none',
              typography: 'oversized-display',
              frame: 'thick-border',
            },
          },
          {
            label: 'Brutaliste – Typographique',
            structure: {
              subject: 'none',
              subjectSize: 'none',
              title: 'center',
              banner: 'strip-bottom',
              particles: 'lines-diagonal',
              decorations: ['corner-marks'],
              background: 'solid-light',
              colorFilter: 'none',
              typography: 'condensed-stack',
              frame: 'thick-border',
            },
          },
          {
            label: 'Brutaliste – Sombre',
            structure: {
              subject: 'bleed-left',
              subjectSize: 'large',
              title: 'center-right',
              banner: 'strip-right',
              particles: 'dust',
              decorations: ['scanlines', 'noise-grain'],
              background: 'solid-dark',
              colorFilter: 'bw',
              typography: 'oversized-display',
              frame: 'thick-border',
            },
          },
        ],
      },

      {
        label: 'Rouge Total',
        image: impact_img,
        variants: [
          {
            label: 'Rouge Total – Plein',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['white-city-silhouette'],
              background: 'solid-color',
              colorFilter: 'duotone',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
          {
            label: 'Rouge Total – Avec Blanc',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'large',
              title: 'center-left',
              banner: 'strip-left',
              particles: 'none',
              decorations: ['diagonal-stripe', 'white-city-silhouette'],
              background: 'solid-color',
              colorFilter: 'bw',
              typography: 'condensed-stack',
              frame: 'diagonal-split',
            },
          },
          {
            label: 'Rouge Total – Dégradé',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'strip-top',
              particles: 'sparks',
              decorations: ['none'],
              background: 'gradient-linear',
              colorFilter: 'vivid',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
          {
            label: 'Rouge Total – Sombre',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'split-vertical',
              banner: 'diagonal-cut',
              particles: 'sparks',
              decorations: ['white-city-silhouette', 'diagonal-stripe'],
              background: 'gradient-radial',
              colorFilter: 'duotone',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
        ],
      },

      {
        label: 'Jaune Électrique',
        image: impact_img,
        variants: [
          {
            label: 'Jaune Électrique – Pur',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['white-city-silhouette'],
              background: 'solid-color',
              colorFilter: 'duotone',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
          {
            label: 'Jaune Électrique – Noir & Jaune',
            structure: {
              subject: 'bleed-left',
              subjectSize: 'large',
              title: 'center-right',
              banner: 'strip-right',
              particles: 'none',
              decorations: ['diagonal-stripe'],
              background: 'solid-dark',
              colorFilter: 'duotone',
              typography: 'condensed-stack',
              frame: 'diagonal-split',
            },
          },
          {
            label: 'Jaune Électrique – Flashy',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'top-center',
              banner: 'badge-circle',
              particles: 'sparks',
              decorations: ['halftone-overlay'],
              background: 'solid-color',
              colorFilter: 'vivid',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
        ],
      },

      {
        label: 'Contraste Noir/Blanc',
        image: impact_img,
        variants: [
          {
            label: 'Contraste N/B – Fond Blanc',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['none'],
              background: 'solid-light',
              colorFilter: 'bw',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
          {
            label: 'Contraste N/B – Fond Noir',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['none'],
              background: 'solid-dark',
              colorFilter: 'bw',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
          {
            label: 'Contraste N/B – Inversé',
            structure: {
              subject: 'bleed-left',
              subjectSize: 'large',
              title: 'center-right',
              banner: 'strip-right',
              particles: 'none',
              decorations: ['diagonal-stripe'],
              background: 'solid-dark',
              colorFilter: 'bw',
              typography: 'condensed-stack',
              frame: 'diagonal-split',
            },
          },
        ],
      },

      {
        label: 'Grande Typographie',
        image: modern_img,
        variants: [
          {
            label: 'Grande Typo – Serif',
            structure: {
              subject: 'none',
              subjectSize: 'none',
              title: 'center',
              banner: 'strip-bottom',
              particles: 'none',
              decorations: ['corner-marks'],
              background: 'solid-light',
              colorFilter: 'none',
              typography: 'serif-editorial',
              frame: 'thin-border',
            },
          },
          {
            label: 'Grande Typo – Sans-Serif',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'medium',
              title: 'center-left',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['geometric-border'],
              background: 'gradient-linear',
              colorFilter: 'none',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
          {
            label: 'Grande Typo – Condensé',
            structure: {
              subject: 'none',
              subjectSize: 'none',
              title: 'split-vertical',
              banner: 'strip-bottom',
              particles: 'lines-diagonal',
              decorations: ['diagonal-stripe'],
              background: 'solid-dark',
              colorFilter: 'none',
              typography: 'condensed-stack',
              frame: 'none',
            },
          },
        ],
      },

      {
        label: 'Titre Géant',
        image: pro_img,
        variants: [
          {
            label: 'Titre Géant – Fond Uni',
            structure: {
              subject: 'none',
              subjectSize: 'none',
              title: 'center',
              banner: 'strip-bottom',
              particles: 'none',
              decorations: ['none'],
              background: 'solid-color',
              colorFilter: 'none',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
          {
            label: 'Titre Géant – Fond Photo',
            structure: {
              subject: 'full-bleed',
              subjectSize: 'hero',
              title: 'center',
              banner: 'strip-bottom',
              particles: 'none',
              decorations: ['none'],
              background: 'photo-overlay',
              colorFilter: 'matte',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
          {
            label: 'Titre Géant – Contour',
            structure: {
              subject: 'none',
              subjectSize: 'none',
              title: 'center',
              banner: 'strip-bottom',
              particles: 'none',
              decorations: ['none'],
              background: 'solid-dark',
              colorFilter: 'none',
              typography: 'outlined',
              frame: 'none',
            },
          },
        ],
      },

      {
        label: 'Typo Empilée',
        image: modern_img,
        variants: [
          {
            label: 'Typo Empilée – Mono Couleur',
            structure: {
              subject: 'none',
              subjectSize: 'none',
              title: 'center',
              banner: 'strip-bottom',
              particles: 'none',
              decorations: ['none'],
              background: 'solid-color',
              colorFilter: 'none',
              typography: 'condensed-stack',
              frame: 'none',
            },
          },
          {
            label: 'Typo Empilée – Multicolore',
            structure: {
              subject: 'none',
              subjectSize: 'none',
              title: 'center',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['geometric-border'],
              background: 'gradient-mesh',
              colorFilter: 'none',
              typography: 'condensed-stack',
              frame: 'none',
            },
          },
          {
            label: 'Typo Empilée – Mixte Tailles',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'medium',
              title: 'center-left',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['diagonal-stripe'],
              background: 'solid-dark',
              colorFilter: 'bw',
              typography: 'mixed-scale',
              frame: 'none',
            },
          },
        ],
      },

      {
        label: 'Orange Brûlé',
        image: impact_img,
        variants: [
          {
            label: 'Orange Brûlé – Chaud',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'strip-top',
              particles: 'sparks',
              decorations: ['white-city-silhouette'],
              background: 'gradient-radial',
              colorFilter: 'vivid',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
          {
            label: 'Orange Brûlé – Sombre',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'strip-top',
              particles: 'dust',
              decorations: ['white-city-silhouette', 'noise-grain'],
              background: 'gradient-linear',
              colorFilter: 'duotone',
              typography: 'sans-bold',
              frame: 'none',
            },
          },
          {
            label: 'Orange Brûlé – Dégradé Rouge',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'large',
              title: 'center-left',
              banner: 'strip-left',
              particles: 'sparks',
              decorations: ['diagonal-stripe'],
              background: 'gradient-mesh',
              colorFilter: 'vivid',
              typography: 'condensed-stack',
              frame: 'none',
            },
          },
        ],
      },

      {
        label: 'Serif Audacieux',
        image: pro_img,
        variants: [
          {
            label: 'Serif Audacieux – Classique',
            structure: {
              subject: 'bleed-left',
              subjectSize: 'large',
              title: 'center-right',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['corner-marks'],
              background: 'solid-light',
              colorFilter: 'bw',
              typography: 'serif-editorial',
              frame: 'corner-brackets',
            },
          },
          {
            label: 'Serif Audacieux – Moderne',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'strip-bottom',
              particles: 'none',
              decorations: ['geometric-border'],
              background: 'gradient-linear',
              colorFilter: 'none',
              typography: 'serif-editorial',
              frame: 'thin-border',
            },
          },
          {
            label: 'Serif Audacieux – Condensé',
            structure: {
              subject: 'none',
              subjectSize: 'none',
              title: 'center',
              banner: 'strip-bottom',
              particles: 'none',
              decorations: ['diagonal-stripe'],
              background: 'solid-dark',
              colorFilter: 'none',
              typography: 'serif-editorial',
              frame: 'thick-border',
            },
          },
        ],
      },

      {
        label: 'Mono Déclaratif',
        image: pro_img,
        variants: [
          {
            label: 'Mono Déclaratif – Sombre',
            structure: {
              subject: 'none',
              subjectSize: 'none',
              title: 'center',
              banner: 'strip-bottom',
              particles: 'none',
              decorations: ['corner-marks'],
              background: 'solid-dark',
              colorFilter: 'none',
              typography: 'mono-tech',
              frame: 'corner-brackets',
            },
          },
          {
            label: 'Mono Déclaratif – Clair',
            structure: {
              subject: 'none',
              subjectSize: 'none',
              title: 'center',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['corner-marks'],
              background: 'solid-light',
              colorFilter: 'none',
              typography: 'mono-tech',
              frame: 'thin-border',
            },
          },
          {
            label: 'Mono Déclaratif – Coloré',
            structure: {
              subject: 'none',
              subjectSize: 'none',
              title: 'center',
              banner: 'strip-bottom',
              particles: 'dots-grid',
              decorations: ['geometric-border'],
              background: 'solid-color',
              colorFilter: 'none',
              typography: 'mono-tech',
              frame: 'corner-brackets',
            },
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4 · COLORÉ & FESTIF
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'colorful',
    label: 'COLORÉ & FESTIF',
    icon: Sparkles,
    image: colorful_img,
    models: [
      {
        label: 'Confettis Pop',
        image: colorful_img,
        variants: [
          {
            label: 'Confettis Pop – Enfant',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'badge-circle',
              particles: 'confetti',
              decorations: ['corner-marks'],
              background: 'gradient-radial',
              colorFilter: 'vivid',
              typography: 'sans-bold',
              frame: 'thin-border',
            },
          },
          {
            label: 'Confettis Pop – Adulte',
            structure: {
              subject: 'center',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-pill',
              particles: 'confetti',
              decorations: ['none'],
              background: 'gradient-mesh',
              colorFilter: 'vivid',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
          {
            label: 'Confettis Pop – Luxe',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'strip-bottom',
              particles: 'sparks',
              decorations: ['foil-texture', 'ribbon-seal'],
              background: 'gradient-radial',
              colorFilter: 'matte',
              typography: 'serif-editorial',
              frame: 'double-border',
            },
          },
          {
            label: 'Confettis Pop – Sobre',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'large',
              title: 'center-left',
              banner: 'badge-pill',
              particles: 'confetti',
              decorations: ['corner-marks'],
              background: 'solid-light',
              colorFilter: 'none',
              typography: 'sans-bold',
              frame: 'thin-border',
            },
          },
        ],
      },

      {
        label: 'Dégradé Festif',
        image: festive_img,
        variants: [
          {
            label: 'Dégradé Festif – Rose / Violet',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'strip-top',
              particles: 'sparks',
              decorations: ['none'],
              background: 'gradient-mesh',
              colorFilter: 'vivid',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
          {
            label: 'Dégradé Festif – Orange / Rouge',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-pill',
              particles: 'sparks',
              decorations: ['wave-bottom'],
              background: 'gradient-linear',
              colorFilter: 'vivid',
              typography: 'sans-bold',
              frame: 'none',
            },
          },
          {
            label: 'Dégradé Festif – Bleu / Cyan',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'large',
              title: 'center-left',
              banner: 'strip-top',
              particles: 'bokeh',
              decorations: ['none'],
              background: 'gradient-linear',
              colorFilter: 'vivid',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
          {
            label: 'Dégradé Festif – Arc-en-ciel',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'badge-circle',
              particles: 'confetti',
              decorations: ['none'],
              background: 'gradient-mesh',
              colorFilter: 'vivid',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
        ],
      },

      {
        label: 'Ambiance Tropicale',
        image: colorful_img,
        variants: [
          {
            label: 'Tropicale – Plage & Soleil',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-pill',
              particles: 'bokeh',
              decorations: ['wave-bottom', 'floral-ornament'],
              background: 'gradient-radial',
              colorFilter: 'vivid',
              typography: 'sans-bold',
              frame: 'thin-border',
            },
          },
          {
            label: 'Tropicale – Jungle & Vert',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'strip-top',
              particles: 'petals',
              decorations: ['floral-ornament'],
              background: 'gradient-mesh',
              colorFilter: 'vivid',
              typography: 'serif-editorial',
              frame: 'none',
            },
          },
          {
            label: 'Tropicale – Sunset',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'strip-top',
              particles: 'bokeh',
              decorations: ['wave-bottom'],
              background: 'gradient-linear',
              colorFilter: 'vivid',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
          {
            label: 'Tropicale – Néon',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'strip-top',
              particles: 'sparks',
              decorations: ['neon-glow-outline', 'white-city-silhouette'],
              background: 'solid-dark',
              colorFilter: 'neon-wash',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
        ],
      },

      {
        label: 'Éclat Arc-en-ciel',
        image: colorful_img,
        variants: [
          {
            label: 'Arc-en-ciel – Vif',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'strip-top',
              particles: 'confetti',
              decorations: ['none'],
              background: 'gradient-mesh',
              colorFilter: 'vivid',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
          {
            label: 'Arc-en-ciel – Pastel',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-pill',
              particles: 'bubbles',
              decorations: ['floral-ornament'],
              background: 'gradient-linear',
              colorFilter: 'faded',
              typography: 'script-hand',
              frame: 'thin-border',
            },
          },
          {
            label: 'Arc-en-ciel – Dégradé',
            structure: {
              subject: 'bleed-left',
              subjectSize: 'large',
              title: 'center-right',
              banner: 'strip-right',
              particles: 'confetti',
              decorations: ['diagonal-stripe'],
              background: 'gradient-mesh',
              colorFilter: 'vivid',
              typography: 'condensed-stack',
              frame: 'none',
            },
          },
        ],
      },

      {
        label: 'Coucher de Soleil',
        image: festive_img,
        variants: [
          {
            label: 'Coucher de Soleil – Chaud',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'strip-top',
              particles: 'bokeh',
              decorations: ['wave-bottom', 'white-city-silhouette'],
              background: 'gradient-radial',
              colorFilter: 'vivid',
              typography: 'serif-editorial',
              frame: 'none',
            },
          },
          {
            label: 'Coucher de Soleil – Mer',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'badge-pill',
              particles: 'bokeh',
              decorations: ['wave-bottom'],
              background: 'gradient-linear',
              colorFilter: 'vivid',
              typography: 'script-hand',
              frame: 'none',
            },
          },
          {
            label: 'Coucher de Soleil – Urbain',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-left',
              banner: 'strip-top',
              particles: 'dust',
              decorations: ['white-city-silhouette'],
              background: 'gradient-radial',
              colorFilter: 'matte',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
        ],
      },

      {
        label: 'Aurore',
        image: modern_img,
        variants: [
          {
            label: 'Aurore – Boréale',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-pill',
              particles: 'bokeh',
              decorations: ['none'],
              background: 'gradient-mesh',
              colorFilter: 'vivid',
              typography: 'sans-bold',
              frame: 'none',
            },
          },
          {
            label: 'Aurore – Rose',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'strip-top',
              particles: 'bokeh',
              decorations: ['foil-texture'],
              background: 'gradient-radial',
              colorFilter: 'faded',
              typography: 'script-hand',
              frame: 'thin-border',
            },
          },
          {
            label: 'Aurore – Bleu Nuit',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-pill',
              particles: 'stars',
              decorations: ['none'],
              background: 'gradient-mesh',
              colorFilter: 'matte',
              typography: 'serif-editorial',
              frame: 'none',
            },
          },
        ],
      },

      {
        label: 'Bichromie',
        image: sport_img,
        variants: [
          {
            label: 'Bichromie – Rouge & Noir',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'large',
              title: 'center-left',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['diagonal-stripe'],
              background: 'solid-color',
              colorFilter: 'duotone',
              typography: 'condensed-stack',
              frame: 'diagonal-split',
            },
          },
          {
            label: 'Bichromie – Bleu & Jaune',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['diagonal-stripe'],
              background: 'solid-color',
              colorFilter: 'duotone',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
          {
            label: 'Bichromie – Violet & Orange',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-circle',
              particles: 'none',
              decorations: ['halftone-overlay'],
              background: 'gradient-linear',
              colorFilter: 'duotone',
              typography: 'condensed-stack',
              frame: 'none',
            },
          },
          {
            label: 'Bichromie – Vert & Blanc',
            structure: {
              subject: 'bleed-left',
              subjectSize: 'large',
              title: 'center-right',
              banner: 'strip-right',
              particles: 'none',
              decorations: ['geometric-border'],
              background: 'solid-color',
              colorFilter: 'duotone',
              typography: 'sans-bold',
              frame: 'corner-brackets',
            },
          },
        ],
      },

      {
        label: 'Couleurs Bonbon',
        image: colorful_img,
        variants: [
          {
            label: 'Bonbon – Rose & Bleu',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-pill',
              particles: 'bubbles',
              decorations: ['wave-bottom'],
              background: 'gradient-linear',
              colorFilter: 'vivid',
              typography: 'script-hand',
              frame: 'thin-border',
            },
          },
          {
            label: 'Bonbon – Jaune & Violet',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'strip-top',
              particles: 'confetti',
              decorations: ['none'],
              background: 'gradient-mesh',
              colorFilter: 'vivid',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
          {
            label: 'Bonbon – Multicolore',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-circle',
              particles: 'confetti',
              decorations: ['none'],
              background: 'gradient-mesh',
              colorFilter: 'vivid',
              typography: 'sans-bold',
              frame: 'none',
            },
          },
        ],
      },

      {
        label: 'Mélange Vibrant',
        image: colorful_img,
        variants: [
          {
            label: 'Vibrant – Explosion',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'badge-circle',
              particles: 'confetti',
              decorations: ['ink-splatter'],
              background: 'gradient-mesh',
              colorFilter: 'vivid',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
          {
            label: 'Vibrant – Fluide',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-pill',
              particles: 'bokeh',
              decorations: ['wave-bottom'],
              background: 'gradient-mesh',
              colorFilter: 'vivid',
              typography: 'script-hand',
              frame: 'none',
            },
          },
          {
            label: 'Vibrant – Géométrique',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'large',
              title: 'center-left',
              banner: 'strip-top',
              particles: 'geometric-shapes',
              decorations: ['diagonal-stripe'],
              background: 'gradient-mesh',
              colorFilter: 'vivid',
              typography: 'condensed-stack',
              frame: 'none',
            },
          },
        ],
      },

      {
        label: 'Blocs de Couleurs',
        image: colorful_img,
        variants: [
          {
            label: 'Blocs – Primaires',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['diagonal-stripe'],
              background: 'pattern-geometric',
              colorFilter: 'vivid',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
          {
            label: 'Blocs – Pastels',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-pill',
              particles: 'none',
              decorations: ['geometric-border'],
              background: 'pattern-geometric',
              colorFilter: 'faded',
              typography: 'sans-bold',
              frame: 'thin-border',
            },
          },
          {
            label: 'Blocs – Contraste',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'large',
              title: 'center-left',
              banner: 'strip-left',
              particles: 'none',
              decorations: ['diagonal-stripe'],
              background: 'solid-dark',
              colorFilter: 'duotone',
              typography: 'condensed-stack',
              frame: 'diagonal-split',
            },
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5 · CLASSIQUE & FORMEL
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'classic',
    label: 'CLASSIQUE & FORMEL',
    icon: Gem,
    image: pro_img,
    models: [
      {
        label: 'Corporate Épuré',
        image: pro_img,
        variants: [
          {
            label: 'Corporate – Sobre & Professionnel',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'large',
              title: 'center-left',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['corner-marks', 'geometric-border'],
              background: 'solid-light',
              colorFilter: 'none',
              typography: 'serif-editorial',
              frame: 'corner-brackets',
            },
          },
          {
            label: 'Corporate – Moderne & Aéré',
            structure: {
              subject: 'center',
              subjectSize: 'medium',
              title: 'top-center',
              banner: 'strip-bottom',
              particles: 'none',
              decorations: ['geometric-border'],
              background: 'solid-light',
              colorFilter: 'none',
              typography: 'sans-bold',
              frame: 'thin-border',
            },
          },
          {
            label: 'Corporate – Institutionnel',
            structure: {
              subject: 'none',
              subjectSize: 'none',
              title: 'center',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['corner-marks', 'ribbon-seal'],
              background: 'solid-light',
              colorFilter: 'none',
              typography: 'serif-editorial',
              frame: 'double-border',
            },
          },
        ],
      },

      {
        label: 'Formel Business',
        image: pro_img,
        variants: [
          {
            label: 'Business – Bleu & Blanc',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'large',
              title: 'center-left',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['geometric-border', 'corner-marks'],
              background: 'solid-light',
              colorFilter: 'none',
              typography: 'sans-bold',
              frame: 'corner-brackets',
            },
          },
          {
            label: 'Business – Gris & Noir',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-left',
              banner: 'strip-bottom',
              particles: 'none',
              decorations: ['corner-marks'],
              background: 'solid-dark',
              colorFilter: 'bw',
              typography: 'condensed-stack',
              frame: 'thin-border',
            },
          },
          {
            label: 'Business – Marine & Or',
            structure: {
              subject: 'bleed-left',
              subjectSize: 'large',
              title: 'center-right',
              banner: 'strip-right',
              particles: 'none',
              decorations: ['foil-texture', 'corner-marks'],
              background: 'solid-dark',
              colorFilter: 'duotone',
              typography: 'serif-editorial',
              frame: 'double-border',
            },
          },
          {
            label: 'Business – Sobre & Dense',
            structure: {
              subject: 'none',
              subjectSize: 'none',
              title: 'center',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['geometric-border', 'watermark-pattern'],
              background: 'solid-light',
              colorFilter: 'none',
              typography: 'minimal-label',
              frame: 'thin-border',
            },
          },
        ],
      },

      {
        label: 'Art Déco',
        image: elegant_img,
        variants: [
          {
            label: 'Art Déco – Or & Noir',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'strip-bottom',
              particles: 'geometric-shapes',
              decorations: ['foil-texture', 'geometric-border', 'corner-marks'],
              background: 'solid-dark',
              colorFilter: 'duotone',
              typography: 'serif-editorial',
              frame: 'double-border',
            },
          },
          {
            label: 'Art Déco – Blanc & Or',
            structure: {
              subject: 'center',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'strip-bottom',
              particles: 'geometric-shapes',
              decorations: ['foil-texture', 'geometric-border'],
              background: 'solid-light',
              colorFilter: 'none',
              typography: 'serif-editorial',
              frame: 'double-border',
            },
          },
          {
            label: 'Art Déco – Coloré',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'strip-top',
              particles: 'geometric-shapes',
              decorations: ['geometric-border', 'diagonal-stripe'],
              background: 'gradient-linear',
              colorFilter: 'vivid',
              typography: 'serif-editorial',
              frame: 'thin-border',
            },
          },
        ],
      },

      {
        label: 'Vintage Années 50',
        image: classic_img,
        variants: [
          {
            label: 'Vintage 50s – Américain',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-circle',
              particles: 'stars',
              decorations: ['halftone-overlay', 'diagonal-stripe'],
              background: 'solid-color',
              colorFilter: 'sepia',
              typography: 'condensed-stack',
              frame: 'thick-border',
            },
          },
          {
            label: 'Vintage 50s – Français',
            structure: {
              subject: 'center',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'strip-bottom',
              particles: 'none',
              decorations: ['floral-ornament', 'corner-marks'],
              background: 'texture-paper',
              colorFilter: 'sepia',
              typography: 'serif-editorial',
              frame: 'thin-border',
            },
          },
          {
            label: 'Vintage 50s – Publicitaire',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'large',
              title: 'center-left',
              banner: 'strip-left',
              particles: 'stars',
              decorations: ['halftone-overlay'],
              background: 'solid-color',
              colorFilter: 'duotone',
              typography: 'condensed-stack',
              frame: 'thick-border',
            },
          },
          {
            label: 'Vintage 50s – Sombre',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'strip-top',
              particles: 'dust',
              decorations: ['noise-grain', 'halftone-overlay'],
              background: 'solid-dark',
              colorFilter: 'sepia',
              typography: 'condensed-stack',
              frame: 'none',
            },
          },
        ],
      },

      {
        label: 'Rétro Années 70',
        image: classic_img,
        variants: [
          {
            label: 'Rétro 70s – Chaud & Ocre',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'strip-bottom',
              particles: 'none',
              decorations: ['halftone-overlay', 'wave-bottom'],
              background: 'solid-color',
              colorFilter: 'sepia',
              typography: 'serif-editorial',
              frame: 'thick-border',
            },
          },
          {
            label: 'Rétro 70s – Funk & Coloré',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'badge-circle',
              particles: 'geometric-shapes',
              decorations: ['halftone-overlay'],
              background: 'gradient-mesh',
              colorFilter: 'vivid',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
          {
            label: 'Rétro 70s – Disco',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'top-center',
              banner: 'strip-top',
              particles: 'sparks',
              decorations: ['foil-texture', 'halftone-overlay'],
              background: 'solid-dark',
              colorFilter: 'vivid',
              typography: 'condensed-stack',
              frame: 'none',
            },
          },
        ],
      },

      {
        label: 'Serif Classique',
        image: classic_img,
        variants: [
          {
            label: 'Serif – Fond Blanc',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'strip-bottom',
              particles: 'none',
              decorations: ['corner-marks', 'geometric-border'],
              background: 'solid-light',
              colorFilter: 'none',
              typography: 'serif-editorial',
              frame: 'double-border',
            },
          },
          {
            label: 'Serif – Fond Ivoire',
            structure: {
              subject: 'center',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'strip-bottom',
              particles: 'none',
              decorations: ['floral-ornament', 'corner-marks'],
              background: 'texture-paper',
              colorFilter: 'sepia',
              typography: 'serif-editorial',
              frame: 'thin-border',
            },
          },
          {
            label: 'Serif – Fond Sombre',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'large',
              title: 'center-left',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['corner-marks', 'foil-texture'],
              background: 'solid-dark',
              colorFilter: 'duotone',
              typography: 'serif-editorial',
              frame: 'double-border',
            },
          },
        ],
      },

      {
        label: 'Marine & Blanc',
        image: pro_img,
        variants: [
          {
            label: 'Marine & Blanc – Épuré',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['corner-marks'],
              background: 'solid-light',
              colorFilter: 'none',
              typography: 'serif-editorial',
              frame: 'thin-border',
            },
          },
          {
            label: 'Marine & Blanc – Officiel',
            structure: {
              subject: 'none',
              subjectSize: 'none',
              title: 'center',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['ribbon-seal', 'corner-marks'],
              background: 'solid-light',
              colorFilter: 'none',
              typography: 'serif-editorial',
              frame: 'double-border',
            },
          },
          {
            label: 'Marine & Blanc – Rayé',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'large',
              title: 'center-left',
              banner: 'strip-left',
              particles: 'none',
              decorations: ['diagonal-stripe', 'corner-marks'],
              background: 'pattern-geometric',
              colorFilter: 'none',
              typography: 'sans-bold',
              frame: 'corner-brackets',
            },
          },
        ],
      },

      {
        label: 'Bordeaux & Crème',
        image: elegant_img,
        variants: [
          {
            label: 'Bordeaux & Crème – Mariage',
            structure: {
              subject: 'center',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-pill',
              particles: 'petals',
              decorations: ['floral-ornament', 'ribbon-seal'],
              background: 'texture-paper',
              colorFilter: 'sepia',
              typography: 'script-hand',
              frame: 'full-arch',
            },
          },
          {
            label: 'Bordeaux & Crème – Soirée',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'strip-bottom',
              particles: 'bokeh',
              decorations: ['floral-ornament'],
              background: 'gradient-radial',
              colorFilter: 'matte',
              typography: 'serif-editorial',
              frame: 'thin-border',
            },
          },
          {
            label: 'Bordeaux & Crème – Corporate',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'medium',
              title: 'center-left',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['corner-marks'],
              background: 'texture-paper',
              colorFilter: 'sepia',
              typography: 'serif-editorial',
              frame: 'corner-brackets',
            },
          },
        ],
      },

      {
        label: 'Lettres en Relief',
        image: classic_img,
        variants: [
          {
            label: 'Relief – Doré',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'strip-bottom',
              particles: 'sparks',
              decorations: ['foil-texture', 'corner-marks'],
              background: 'solid-dark',
              colorFilter: 'matte',
              typography: 'serif-editorial',
              frame: 'double-border',
            },
          },
          {
            label: 'Relief – Argenté',
            structure: {
              subject: 'center',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'strip-bottom',
              particles: 'sparks',
              decorations: ['foil-texture', 'geometric-border'],
              background: 'solid-dark',
              colorFilter: 'duotone',
              typography: 'serif-editorial',
              frame: 'thin-border',
            },
          },
          {
            label: 'Relief – Blanc Gaufré',
            structure: {
              subject: 'none',
              subjectSize: 'none',
              title: 'center',
              banner: 'strip-bottom',
              particles: 'none',
              decorations: ['watermark-pattern', 'corner-marks'],
              background: 'solid-light',
              colorFilter: 'none',
              typography: 'serif-editorial',
              frame: 'double-border',
            },
          },
        ],
      },

      {
        label: 'Style Patrimonial',
        image: classic_img,
        variants: [
          {
            label: 'Patrimonial – Sobre',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'medium',
              title: 'top-center',
              banner: 'strip-bottom',
              particles: 'none',
              decorations: ['corner-marks', 'geometric-border'],
              background: 'texture-paper',
              colorFilter: 'sepia',
              typography: 'serif-editorial',
              frame: 'double-border',
            },
          },
          {
            label: 'Patrimonial – Festif',
            structure: {
              subject: 'center',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-circle',
              particles: 'sparks',
              decorations: ['ribbon-seal', 'foil-texture'],
              background: 'gradient-radial',
              colorFilter: 'matte',
              typography: 'serif-editorial',
              frame: 'full-arch',
            },
          },
          {
            label: 'Patrimonial – Luxe',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'strip-bottom',
              particles: 'sparks',
              decorations: ['foil-texture', 'ribbon-seal', 'corner-marks'],
              background: 'solid-dark',
              colorFilter: 'duotone',
              typography: 'serif-editorial',
              frame: 'double-border',
            },
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6 · CRÉATIF & GRAPHIQUE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'creative',
    label: 'CRÉATIF & GRAPHIQUE',
    icon: Palette,
    image: creative_img,
    models: [
      {
        label: 'Double Exposition',
        image: creative_img,
        variants: [
          {
            label: 'Double Exposition – Sombre',
            structure: {
              subject: 'full-bleed',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'strip-top',
              particles: 'bokeh',
              decorations: ['noise-grain'],
              background: 'solid-dark',
              colorFilter: 'duotone',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
          {
            label: 'Double Exposition – Lumineuse',
            structure: {
              subject: 'full-bleed',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'badge-pill',
              particles: 'bokeh',
              decorations: ['none'],
              background: 'solid-light',
              colorFilter: 'color-pop',
              typography: 'sans-bold',
              frame: 'none',
            },
          },
          {
            label: 'Double Exposition – Colorée',
            structure: {
              subject: 'full-bleed',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'strip-top',
              particles: 'bokeh',
              decorations: ['neon-glow-outline'],
              background: 'gradient-mesh',
              colorFilter: 'neon-wash',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
        ],
      },

      {
        label: 'Photo Argentique',
        image: sport_img,
        variants: [
          {
            label: 'Argentique – Noir & Blanc',
            structure: {
              subject: 'full-bleed',
              subjectSize: 'hero',
              title: 'bottom-left',
              banner: 'strip-bottom',
              particles: 'noise-grain',
              decorations: ['none'],
              background: 'photo-overlay',
              colorFilter: 'bw',
              typography: 'minimal-label',
              frame: 'none',
            },
          },
          {
            label: 'Argentique – Sépia',
            structure: {
              subject: 'full-bleed',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'strip-bottom',
              particles: 'noise-grain',
              decorations: ['torn-edge'],
              background: 'photo-overlay',
              colorFilter: 'sepia',
              typography: 'serif-editorial',
              frame: 'thin-border',
            },
          },
          {
            label: 'Argentique – Couleur Fuyante',
            structure: {
              subject: 'full-bleed',
              subjectSize: 'hero',
              title: 'bottom-left',
              banner: 'tag-corner',
              particles: 'noise-grain',
              decorations: ['none'],
              background: 'photo-blur',
              colorFilter: 'faded',
              typography: 'minimal-label',
              frame: 'none',
            },
          },
          {
            label: 'Argentique – Lomographie',
            structure: {
              subject: 'full-bleed',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'strip-bottom',
              particles: 'noise-grain',
              decorations: ['none'],
              background: 'photo-overlay',
              colorFilter: 'color-pop',
              typography: 'minimal-label',
              frame: 'circle-crop',
            },
          },
        ],
      },

      {
        label: 'Verre Givré',
        image: modern_img,
        variants: [
          {
            label: 'Verre Givré – Clair',
            structure: {
              subject: 'center',
              subjectSize: 'large',
              title: 'bottom-center',
              banner: 'badge-pill',
              particles: 'bokeh',
              decorations: ['none'],
              background: 'gradient-radial',
              colorFilter: 'faded',
              typography: 'sans-bold',
              frame: 'thin-border',
            },
          },
          {
            label: 'Verre Givré – Sombre',
            structure: {
              subject: 'center',
              subjectSize: 'large',
              title: 'bottom-center',
              banner: 'badge-pill',
              particles: 'bokeh',
              decorations: ['none'],
              background: 'gradient-mesh',
              colorFilter: 'matte',
              typography: 'sans-bold',
              frame: 'thin-border',
            },
          },
          {
            label: 'Verre Givré – Coloré',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-pill',
              particles: 'bokeh',
              decorations: ['neon-glow-outline'],
              background: 'gradient-mesh',
              colorFilter: 'vivid',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
          {
            label: 'Verre Givré – Luxe',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'large',
              title: 'center-left',
              banner: 'strip-top',
              particles: 'bokeh',
              decorations: ['foil-texture'],
              background: 'gradient-linear',
              colorFilter: 'matte',
              typography: 'serif-editorial',
              frame: 'double-border',
            },
          },
        ],
      },

      {
        label: 'Forme Géométrique',
        image: creative_img,
        variants: [
          {
            label: 'Géométrique – Sobre',
            structure: {
              subject: 'center',
              subjectSize: 'medium',
              title: 'top-left',
              banner: 'none',
              particles: 'geometric-shapes',
              decorations: ['geometric-border', 'corner-marks'],
              background: 'solid-light',
              colorFilter: 'none',
              typography: 'sans-bold',
              frame: 'thin-border',
            },
          },
          {
            label: 'Géométrique – Coloré',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'badge-pill',
              particles: 'geometric-shapes',
              decorations: ['diagonal-stripe'],
              background: 'gradient-mesh',
              colorFilter: 'vivid',
              typography: 'condensed-stack',
              frame: 'none',
            },
          },
          {
            label: 'Géométrique – Sombre',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'large',
              title: 'center-left',
              banner: 'strip-top',
              particles: 'geometric-shapes',
              decorations: ['grid-overlay'],
              background: 'solid-dark',
              colorFilter: 'duotone',
              typography: 'mono-tech',
              frame: 'corner-brackets',
            },
          },
        ],
      },

      {
        label: 'Illustration Plate',
        image: creative_img,
        variants: [
          {
            label: 'Illustration – Personnages',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'badge-pill',
              particles: 'none',
              decorations: ['none'],
              background: 'solid-color',
              colorFilter: 'none',
              typography: 'sans-bold',
              frame: 'thin-border',
            },
          },
          {
            label: 'Illustration – Abstrait',
            structure: {
              subject: 'none',
              subjectSize: 'none',
              title: 'center',
              banner: 'strip-bottom',
              particles: 'geometric-shapes',
              decorations: ['ink-splatter'],
              background: 'gradient-mesh',
              colorFilter: 'none',
              typography: 'sans-bold',
              frame: 'none',
            },
          },
          {
            label: 'Illustration – Urbain',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-left',
              banner: 'strip-top',
              particles: 'dust',
              decorations: ['white-city-silhouette'],
              background: 'gradient-linear',
              colorFilter: 'duotone',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
          {
            label: 'Illustration – Nature',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-pill',
              particles: 'petals',
              decorations: ['floral-ornament', 'wave-bottom'],
              background: 'gradient-radial',
              colorFilter: 'none',
              typography: 'script-hand',
              frame: 'full-arch',
            },
          },
        ],
      },

      {
        label: 'Collage Découpé',
        image: creative_img,
        variants: [
          {
            label: 'Collage – Magazine',
            structure: {
              subject: 'bleed-left',
              subjectSize: 'large',
              title: 'center-right',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['torn-edge', 'corner-marks'],
              background: 'solid-light',
              colorFilter: 'none',
              typography: 'mixed-scale',
              frame: 'none',
            },
          },
          {
            label: 'Collage – Vintage',
            structure: {
              subject: 'center',
              subjectSize: 'large',
              title: 'top-left',
              banner: 'tag-corner',
              particles: 'dust',
              decorations: ['torn-edge', 'noise-grain'],
              background: 'texture-paper',
              colorFilter: 'sepia',
              typography: 'mixed-scale',
              frame: 'torn-edge',
            },
          },
          {
            label: 'Collage – Moderne',
            structure: {
              subject: 'bleed-right',
              subjectSize: 'large',
              title: 'center-left',
              banner: 'strip-top',
              particles: 'geometric-shapes',
              decorations: ['diagonal-stripe'],
              background: 'gradient-mesh',
              colorFilter: 'vivid',
              typography: 'mixed-scale',
              frame: 'diagonal-split',
            },
          },
        ],
      },

      {
        label: 'Grain & Texture',
        image: sport_img,
        variants: [
          {
            label: 'Grain – Vieilli',
            structure: {
              subject: 'center',
              subjectSize: 'large',
              title: 'top-left',
              banner: 'tag-corner',
              particles: 'noise-grain',
              decorations: ['torn-edge'],
              background: 'texture-paper',
              colorFilter: 'sepia',
              typography: 'serif-editorial',
              frame: 'torn-edge',
            },
          },
          {
            label: 'Grain – Urbain',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-left',
              banner: 'strip-top',
              particles: 'dust',
              decorations: ['white-city-silhouette', 'noise-grain'],
              background: 'texture-grain',
              colorFilter: 'bw',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
          {
            label: 'Grain – Vintage',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'strip-top',
              particles: 'dust',
              decorations: ['noise-grain', 'halftone-overlay'],
              background: 'texture-grain',
              colorFilter: 'sepia',
              typography: 'condensed-stack',
              frame: 'thick-border',
            },
          },
        ],
      },

      {
        label: 'Marbre & Pierre',
        image: impact_img,
        variants: [
          {
            label: 'Marbre – Blanc & Or',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'strip-bottom',
              particles: 'sparks',
              decorations: ['foil-texture', 'corner-marks'],
              background: 'texture-marble',
              colorFilter: 'none',
              typography: 'serif-editorial',
              frame: 'double-border',
            },
          },
          {
            label: 'Marbre – Noir & Or',
            structure: {
              subject: 'center',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'strip-bottom',
              particles: 'sparks',
              decorations: ['foil-texture', 'geometric-border'],
              background: 'texture-marble',
              colorFilter: 'duotone',
              typography: 'serif-editorial',
              frame: 'thin-border',
            },
          },
          {
            label: 'Marbre – Coloré',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-pill',
              particles: 'bokeh',
              decorations: ['none'],
              background: 'texture-marble',
              colorFilter: 'vivid',
              typography: 'sans-bold',
              frame: 'thin-border',
            },
          },
        ],
      },

      {
        label: 'Éclaboussure Abstraite',
        image: creative_img,
        variants: [
          {
            label: 'Abstraite – Aquarelle',
            structure: {
              subject: 'center',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-pill',
              particles: 'bokeh',
              decorations: ['ink-splatter'],
              background: 'texture-paper',
              colorFilter: 'faded',
              typography: 'script-hand',
              frame: 'none',
            },
          },
          {
            label: 'Abstraite – Ink & Encre',
            structure: {
              subject: 'center',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'strip-top',
              particles: 'dust',
              decorations: ['ink-splatter', 'noise-grain'],
              background: 'solid-light',
              colorFilter: 'bw',
              typography: 'serif-editorial',
              frame: 'none',
            },
          },
          {
            label: 'Abstraite – Numérique',
            structure: {
              subject: 'none',
              subjectSize: 'none',
              title: 'center',
              banner: 'strip-bottom',
              particles: 'geometric-shapes',
              decorations: ['glitch-lines'],
              background: 'gradient-mesh',
              colorFilter: 'neon-wash',
              typography: 'mono-tech',
              frame: 'none',
            },
          },
          {
            label: 'Abstraite – Peinture',
            structure: {
              subject: 'full-bleed',
              subjectSize: 'hero',
              title: 'bottom-center',
              banner: 'strip-bottom',
              particles: 'bokeh',
              decorations: ['ink-splatter'],
              background: 'gradient-mesh',
              colorFilter: 'vivid',
              typography: 'oversized-display',
              frame: 'none',
            },
          },
        ],
      },

      {
        label: 'Relief Doux',
        image: modern_img,
        variants: [
          {
            label: 'Relief – Clair & Léger',
            structure: {
              subject: 'center',
              subjectSize: 'medium',
              title: 'top-center',
              banner: 'badge-pill',
              particles: 'none',
              decorations: ['corner-marks'],
              background: 'solid-light',
              colorFilter: 'none',
              typography: 'minimal-label',
              frame: 'thin-border',
            },
          },
          {
            label: 'Relief – Sombre & Profond',
            structure: {
              subject: 'center',
              subjectSize: 'large',
              title: 'bottom-center',
              banner: 'strip-top',
              particles: 'none',
              decorations: ['none'],
              background: 'solid-dark',
              colorFilter: 'matte',
              typography: 'sans-bold',
              frame: 'thin-border',
            },
          },
          {
            label: 'Relief – Coloré',
            structure: {
              subject: 'center-bottom',
              subjectSize: 'large',
              title: 'top-center',
              banner: 'badge-pill',
              particles: 'bokeh',
              decorations: ['none'],
              background: 'gradient-radial',
              colorFilter: 'vivid',
              typography: 'sans-bold',
              frame: 'none',
            },
          },
        ],
      },
    ],
  },
];
