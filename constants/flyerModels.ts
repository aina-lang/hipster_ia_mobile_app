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
  UtensilsCrossed,
  GraduationCap,
  Heart,
  ShoppingBag,
  Home,
  Stethoscope,
  Car,
  Plane,
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

export const FLYER_CATEGORIES = [

  /* ---------------------------------------------------- */
  /*                    ÉVÉNEMENTS                        */
  /* ---------------------------------------------------- */
  {
    id: 'events',
    label: 'ÉVÉNEMENTS & CÉLÉBRATIONS',
    icon: Sparkles,
    image: festive_img,
    models: [
      {
        label: 'Anniversaire',
        image: colorful_img,
        variants: [
          { label: 'Anniversaire – Adulte' },
          { label: 'Anniversaire – Enfant' },
          { label: 'Anniversaire – Jeune (18 ans)' },
          { label: 'Anniversaire – Milestone (30 / 40 / 50 ans)' },
          { label: 'Anniversaire – Thème Fête Tropicale' },
          { label: 'Anniversaire – Thème Fête Costumée' },
          { label: 'Anniversaire – Thème Fête Luxe' },
          { label: 'Anniversaire – Thème Fête Rétro' },
        ],
      },
      {
        label: 'Mariage & Engagement',
        variants: [
          { label: 'Mariage – Faire-part Classique' },
          { label: 'Mariage – Faire-part Élégant' },
          { label: 'Mariage – Faire-part Champêtre' },
          { label: 'Mariage – Faire-part Minimaliste' },
          { label: 'Mariage – Save the Date' },
          { label: 'Mariage – Programme de Cérémonie' },
          { label: 'Fiançailles – Annonce Officielle' },
        ],
      },
      {
        label: 'Naissance & Baptême',
        variants: [
          { label: 'Naissance – Faire-part Naissance' },
          { label: 'Naissance – Baby Shower Féminin' },
          { label: 'Naissance – Baby Shower Masculin' },
          { label: 'Naissance – Baby Shower Neutre' },
          { label: 'Baptême – Invitation Classique' },
          { label: 'Baptême – Invitation Florale' },
          { label: 'Baptême – Invitation Minimaliste' },
        ],
      },
      {
        label: 'Soirée & Réception',
        variants: [
          { label: 'Soirée – Cocktail d\'entreprise' },
          { label: 'Soirée – Soirée Privée' },
          { label: 'Soirée – Soirée de Gala' },
          { label: 'Soirée – Soirée Thématique' },
          { label: 'Soirée – Soirée de Remise de Prix' },
          { label: 'Soirée – Soirée d\'Intégration' },
        ],
      },
      {
        label: 'Spectacle & Gala',
        variants: [
          { label: 'Spectacle – Gala de Danse' },
          { label: 'Spectacle – Représentation Théâtrale' },
          { label: 'Spectacle – Concert Vocal' },
          { label: 'Spectacle – Soirée de Talents' },
          { label: 'Spectacle – Défilé de Mode' },
        ],
      },
      {
        label: 'Fête Scolaire & Kermesse',
        variants: [
          { label: 'Fête – Kermesse Scolaire' },
          { label: 'Fête – Spectacle de Fin d\'Année' },
          { label: 'Fête – Portes Ouvertes Établissement' },
          { label: 'Fête – Journée Solidarité' },
        ],
      },
      {
        label: 'Inauguration & Lancement',
        variants: [
          { label: 'Inauguration – Ouverture Commerciale' },
          { label: 'Inauguration – Lancement de Produit' },
          { label: 'Inauguration – Grand Ouverture' },
          { label: 'Inauguration – Coupure de Ruban' },
        ],
      },
    ],
  },

  /* ---------------------------------------------------- */
  /*                SOIRÉE / FESTIF                       */
  /* ---------------------------------------------------- */
  {
    id: 'party',
    label: 'SOIRÉES & ÉVÉNEMENTS FESTIFS',
    icon: Music,
    image: festive_img,
    models: [
      {
        label: 'Club & Discothèque',
        image: festive_img,
        variants: [
          { label: 'Club – Nuit Électronique' },
          { label: 'Club – Nuit Hip-Hop / RnB' },
          { label: 'Club – Nuit Afrobeats' },
          { label: 'Club – Nuit Reggaeton' },
          { label: 'Club – Nuit House / Techno' },
          { label: 'Club – Nuit Latino' },
          { label: 'Club – Nuit 100% Francophone' },
          { label: 'Club – Nuit Open Format' },
        ],
      },
      {
        label: 'Soirée à Thème',
        variants: [
          { label: 'Thème – Soirée Neon / UV' },
          { label: 'Thème – Soirée Blanche' },
          { label: 'Thème – Soirée Masquée' },
          { label: 'Thème – Soirée Années 80 / 90' },
          { label: 'Thème – Soirée Tropicale' },
          { label: 'Thème – Soirée Carnaval' },
          { label: 'Thème – Soirée Hallowen' },
          { label: 'Thème – Soirée Cinéma' },
        ],
      },
      {
        label: 'Événement Outdoor',
        variants: [
          { label: 'Outdoor – Festival Urbain' },
          { label: 'Outdoor – Beach Party' },
          { label: 'Outdoor – Rooftop Event' },
          { label: 'Outdoor – Fête de Quartier' },
          { label: 'Outdoor – Fête de Village' },
          { label: 'Outdoor – Marché Nocturne' },
        ],
      },
      {
        label: 'Concert & Live',
        variants: [
          { label: 'Concert – Artiste Principal' },
          { label: 'Concert – Plateau Multi-artistes' },
          { label: 'Concert – Showcase Inédit' },
          { label: 'Concert – Jam Session' },
          { label: 'Concert – Soirée Acoustique' },
        ],
      },
      {
        label: 'DJ & Set',
        variants: [
          { label: 'DJ – Résidence Club' },
          { label: 'DJ – Guest DJ Invitation' },
          { label: 'DJ – Battle DJ' },
          { label: 'DJ – Set Outdoor' },
          { label: 'DJ – Soirée Privée DJ' },
        ],
      },
    ],
  },

  /* ---------------------------------------------------- */
  /*                  PROFESSIONNEL                       */
  /* ---------------------------------------------------- */
  {
    id: 'business',
    label: 'PROFESSIONNEL & ENTREPRISE',
    icon: Briefcase,
    image: pro_img,
    models: [
      {
        label: 'Communication Corporate',
        image: pro_img,
        variants: [
          { label: 'Corporate – Présentation Entreprise' },
          { label: 'Corporate – Rapport Annuel' },
          { label: 'Corporate – Plaquette Commerciale' },
          { label: 'Corporate – Brochure Institutionnelle' },
          { label: 'Corporate – Dossier de Presse' },
        ],
      },
      {
        label: 'Conférence & Séminaire',
        variants: [
          { label: 'Conférence – Séminaire d\'Entreprise' },
          { label: 'Conférence – Forum Professionnel' },
          { label: 'Conférence – Table Ronde' },
          { label: 'Conférence – Atelier de Formation' },
          { label: 'Conférence – Webinaire Professionnel' },
          { label: 'Conférence – Summit / Sommet' },
        ],
      },
      {
        label: 'Recrutement & RH',
        variants: [
          { label: 'RH – Offre d\'Emploi' },
          { label: 'RH – Recrutement Cadre' },
          { label: 'RH – Appel à Candidatures' },
          { label: 'RH – Forum de l\'Emploi' },
          { label: 'RH – Stage & Alternance' },
          { label: 'RH – Journée Portes Ouvertes RH' },
        ],
      },
      {
        label: 'Startup & Technologie',
        variants: [
          { label: 'Startup – Présentation Pitch' },
          { label: 'Startup – Lancement Produit Tech' },
          { label: 'Startup – Événement Innovation' },
          { label: 'Startup – Hackathon' },
          { label: 'Startup – Journée Portes Ouvertes' },
        ],
      },
      {
        label: 'Offre & Promotion',
        variants: [
          { label: 'Promo – Soldes & Réductions' },
          { label: 'Promo – Offre Limitée' },
          { label: 'Promo – Catalogue Produits' },
          { label: 'Promo – Bon de Réduction' },
          { label: 'Promo – Pack Spécial' },
        ],
      },
      {
        label: 'Services Artisanaux & PME',
        variants: [
          { label: 'Services – Artisan Général' },
          { label: 'Services – Plomberie & Sanitaire' },
          { label: 'Services – Électricité' },
          { label: 'Services – Menuiserie & Charpente' },
          { label: 'Services – Peinture & Décoration' },
          { label: 'Services – Jardinage & Espaces Verts' },
          { label: 'Services – Nettoyage & Entretien' },
          { label: 'Services – Déménagement' },
          { label: 'Services – Sécurité & Gardiennage' },
          { label: 'Services – Informatique & Réparation' },
        ],
      },
      {
        label: 'Professions Libérales',
        variants: [
          { label: 'Libéral – Cabinet Juridique / Avocat' },
          { label: 'Libéral – Cabinet Comptable / Expert-Comptable' },
          { label: 'Libéral – Cabinet d\'Architecture' },
          { label: 'Libéral – Bureau d\'Études / Ingénierie' },
          { label: 'Libéral – Conseil en Gestion' },
          { label: 'Libéral – Notariat' },
          { label: 'Libéral – Assurance & Courtage' },
          { label: 'Libéral – Agence Communication / Marketing' },
        ],
      },
    ],
  },

  /* ---------------------------------------------------- */
  /*              RESTAURATION & FOOD                     */
  /* ---------------------------------------------------- */
  {
    id: 'restaurant',
    label: 'RESTAURATION & ALIMENTATION',
    icon: UtensilsCrossed,
    image: colorful_img,
    models: [
      {
        label: 'Restaurant Traditionnel',
        variants: [
          { label: 'Restaurant – Menu Gastronomique' },
          { label: 'Restaurant – Menu du Jour' },
          { label: 'Restaurant – Carte des Plats' },
          { label: 'Restaurant – Carte des Desserts' },
          { label: 'Restaurant – Soirée Spéciale' },
          { label: 'Restaurant – Table d\'Hôte' },
        ],
      },
      {
        label: 'Cuisine Rapide & Street Food',
        variants: [
          { label: 'Street Food – Burger & Frites' },
          { label: 'Street Food – Sandwich & Snack' },
          { label: 'Street Food – Tacos & Wraps' },
          { label: 'Street Food – Kebab & Grill' },
          { label: 'Street Food – Food Truck Général' },
          { label: 'Street Food – Crêpes & Gaufres' },
        ],
      },
      {
        label: 'Pizzeria & Italien',
        variants: [
          { label: 'Pizzeria – Menu Pizza' },
          { label: 'Pizzeria – Offre Spéciale' },
          { label: 'Pizzeria – Livraison à Domicile' },
          { label: 'Pizzeria – Pâtes & Risotto' },
        ],
      },
      {
        label: 'Boulangerie & Pâtisserie',
        variants: [
          { label: 'Boulangerie – Carte du Pain' },
          { label: 'Boulangerie – Vitrine Pâtisserie' },
          { label: 'Boulangerie – Viennoiseries & Brioches' },
          { label: 'Boulangerie – Gâteaux Personnalisés' },
          { label: 'Boulangerie – Atelier Pâtisserie' },
        ],
      },
      {
        label: 'Bar, Café & Salon de Thé',
        variants: [
          { label: 'Bar – Carte Cocktails' },
          { label: 'Bar – Happy Hour' },
          { label: 'Bar – Carte des Vins' },
          { label: 'Café – Carte Boissons Chaudes' },
          { label: 'Salon de Thé – Menu Thé & Tisanes' },
          { label: 'Bar Lounge – Événement Privé' },
        ],
      },
      {
        label: 'Traiteur & Événementiel Culinaire',
        variants: [
          { label: 'Traiteur – Buffet Mariage' },
          { label: 'Traiteur – Buffet d\'Entreprise' },
          { label: 'Traiteur – Menu Cocktail Dinatoire' },
          { label: 'Traiteur – Livraison Repas' },
          { label: 'Traiteur – Brunch Event' },
          { label: 'Traiteur – Festival Culinaire' },
        ],
      },
      {
        label: 'Cuisines du Monde',
        variants: [
          { label: 'Cuisine du Monde – Africaine' },
          { label: 'Cuisine du Monde – Asiatique' },
          { label: 'Cuisine du Monde – Orientale' },
          { label: 'Cuisine du Monde – Latino-américaine' },
          { label: 'Cuisine du Monde – Indienne' },
          { label: 'Cuisine du Monde – Méditerranéenne' },
        ],
      },
    ],
  },

  /* ---------------------------------------------------- */
  /*                     SPORTIF                          */
  /* ---------------------------------------------------- */
  {
    id: 'sport',
    label: 'SPORT & ACTIVITÉ PHYSIQUE',
    icon: Dumbbell,
    image: sport_img,
    models: [
      {
        label: 'Compétition & Tournoi',
        variants: [
          { label: 'Tournoi – Football' },
          { label: 'Tournoi – Basketball' },
          { label: 'Tournoi – Volleyball' },
          { label: 'Tournoi – Tennis' },
          { label: 'Tournoi – Sport de Combat' },
          { label: 'Tournoi – Sport Collectif Général' },
          { label: 'Compétition – Athlétisme' },
          { label: 'Compétition – Natation' },
        ],
      },
      {
        label: 'Salle de Sport & Fitness',
        variants: [
          { label: 'Fitness – Abonnement Salle' },
          { label: 'Fitness – Programme Musculation' },
          { label: 'Fitness – Cours Collectifs' },
          { label: 'Fitness – Offre Découverte' },
          { label: 'Fitness – Défi 30 jours' },
        ],
      },
      {
        label: 'Coaching & Personal Training',
        variants: [
          { label: 'Coaching – Coaching Individuel' },
          { label: 'Coaching – Coaching Sportif Groupe' },
          { label: 'Coaching – Programme Perte de Poids' },
          { label: 'Coaching – Programme Prise de Masse' },
          { label: 'Coaching – Préparation Physique' },
        ],
      },
      {
        label: 'Arts Martiaux & Combat',
        variants: [
          { label: 'Combat – Boxe Anglaise' },
          { label: 'Combat – Boxe Française / Savate' },
          { label: 'Combat – Muay Thaï / Kickboxing' },
          { label: 'Combat – Judo' },
          { label: 'Combat – Karaté' },
          { label: 'Combat – MMA' },
          { label: 'Combat – Lutte' },
          { label: 'Combat – Taekwondo' },
        ],
      },
      {
        label: 'Danse & Activités Rythmiques',
        variants: [
          { label: 'Danse – Cours de Danse Généraliste' },
          { label: 'Danse – Zumba & Fitness Danse' },
          { label: 'Danse – Danse Africaine' },
          { label: 'Danse – Danse Classique / Ballet' },
          { label: 'Danse – Hip-Hop & Street Dance' },
          { label: 'Danse – Salsa & Danses Latines' },
          { label: 'Danse – Gala & Spectacle de Danse' },
        ],
      },
      {
        label: 'Sport Outdoor & Nature',
        variants: [
          { label: 'Outdoor – Trail & Running' },
          { label: 'Outdoor – Cyclisme & VTT' },
          { label: 'Outdoor – Randonnée' },
          { label: 'Outdoor – Sports Nautiques' },
          { label: 'Outdoor – Escalade' },
        ],
      },
      {
        label: 'Sport Scolaire & Jeunesse',
        variants: [
          { label: 'Scolaire – Olympiades Scolaires' },
          { label: 'Scolaire – Cross Scolaire' },
          { label: 'Scolaire – Journée Sportive' },
          { label: 'Scolaire – Inscription Club Sportif' },
        ],
      },
    ],
  },

  /* ---------------------------------------------------- */
  /*                  SANTÉ & MÉDICAL                     */
  /* ---------------------------------------------------- */
  {
    id: 'health',
    label: 'SANTÉ & MÉDICAL',
    icon: Stethoscope,
    image: nature_img,
    models: [
      {
        label: 'Cabinet Médical',
        variants: [
          { label: 'Médecine – Cabinet Médecin Généraliste' },
          { label: 'Médecine – Cabinet Spécialiste' },
          { label: 'Médecine – Cabinet Dentaire' },
          { label: 'Médecine – Clinique Esthétique' },
          { label: 'Médecine – Centre de Radiologie' },
          { label: 'Médecine – Laboratoire d\'Analyses' },
        ],
      },
      {
        label: 'Paramédical & Thérapeutique',
        variants: [
          { label: 'Paramédical – Cabinet Kinésithérapie' },
          { label: 'Paramédical – Cabinet Ostéopathie' },
          { label: 'Paramédical – Cabinet Psychologie' },
          { label: 'Paramédical – Cabinet Nutritionniste' },
          { label: 'Paramédical – Orthophonie' },
          { label: 'Paramédical – Infirmier à Domicile' },
          { label: 'Paramédical – Optique & Vision' },
          { label: 'Paramédical – Audioprothèse' },
        ],
      },
      {
        label: 'Pharmacie & Parapharmacie',
        variants: [
          { label: 'Pharmacie – Promotion Officine' },
          { label: 'Pharmacie – Conseil Santé' },
          { label: 'Pharmacie – Campagne Prévention' },
          { label: 'Pharmacie – Produits Naturels' },
        ],
      },
      {
        label: 'Sensibilisation & Prévention',
        variants: [
          { label: 'Prévention – Campagne Santé Publique' },
          { label: 'Prévention – Journée de Dépistage' },
          { label: 'Prévention – Vaccination' },
          { label: 'Prévention – Santé Mentale' },
          { label: 'Prévention – Lutte contre les Addictions' },
        ],
      },
      {
        label: 'Maison de Retraite & Aide à Domicile',
        variants: [
          { label: 'Aide à Domicile – Services aux Personnes Âgées' },
          { label: 'Aide à Domicile – Auxiliaire de Vie' },
          { label: 'Maison de Retraite – Présentation Établissement' },
          { label: 'Maison de Retraite – Journée Portes Ouvertes' },
        ],
      },
    ],
  },

  /* ---------------------------------------------------- */
  /*               ÉDUCATION & FORMATION                  */
  /* ---------------------------------------------------- */
  {
    id: 'education',
    label: 'ÉDUCATION & FORMATION',
    icon: GraduationCap,
    image: classic_img,
    models: [
      {
        label: 'Établissement Scolaire',
        variants: [
          { label: 'École – Rentrée Scolaire' },
          { label: 'École – Inscription Nouvelle Année' },
          { label: 'École – Portes Ouvertes' },
          { label: 'École – Journée Pédagogique' },
          { label: 'École – Présentation Établissement Privé' },
        ],
      },
      {
        label: 'Cours Particuliers & Soutien Scolaire',
        variants: [
          { label: 'Soutien – Cours Particuliers Général' },
          { label: 'Soutien – Mathématiques' },
          { label: 'Soutien – Langues Étrangères' },
          { label: 'Soutien – Préparation aux Examens' },
          { label: 'Soutien – Aide aux Devoirs' },
          { label: 'Soutien – Centre de Révision' },
        ],
      },
      {
        label: 'Formation Professionnelle',
        variants: [
          { label: 'Formation – Programme Certifiant' },
          { label: 'Formation – Formation Continue' },
          { label: 'Formation – Stage Professionnel' },
          { label: 'Formation – Bilan de Compétences' },
          { label: 'Formation – Reconversion Professionnelle' },
          { label: 'Formation – Formation Numérique & Digital' },
          { label: 'Formation – Leadership & Management' },
        ],
      },
      {
        label: 'Université & Enseignement Supérieur',
        variants: [
          { label: 'Université – Journée d\'Information' },
          { label: 'Université – Remise des Diplômes' },
          { label: 'Université – Conférence Académique' },
          { label: 'Université – Salon de l\'Étudiant' },
          { label: 'Université – Forum des Stages' },
        ],
      },
      {
        label: 'Atelier & Cours Créatifs',
        variants: [
          { label: 'Atelier – Peinture & Dessin' },
          { label: 'Atelier – Photographie' },
          { label: 'Atelier – Musique & Instrument' },
          { label: 'Atelier – Cuisine & Pâtisserie' },
          { label: 'Atelier – Couture & Broderie' },
          { label: 'Atelier – Poterie & Céramique' },
        ],
      },
    ],
  },

  /* ---------------------------------------------------- */
  /*              BEAUTÉ & BIEN-ÊTRE                      */
  /* ---------------------------------------------------- */
  {
    id: 'beauty',
    label: 'BEAUTÉ, MODE & BIEN-ÊTRE',
    icon: Heart,
    image: elegant_img,
    models: [
      {
        label: 'Coiffure',
        variants: [
          { label: 'Coiffure – Salon Mixte' },
          { label: 'Coiffure – Salon Femme' },
          { label: 'Coiffure – Salon Homme / Barbershop' },
          { label: 'Coiffure – Tresses & Extensions' },
          { label: 'Coiffure – Coloration & Soin' },
          { label: 'Coiffure – Coiffure de Mariage' },
        ],
      },
      {
        label: 'Esthétique & Soins',
        variants: [
          { label: 'Esthétique – Institut Beauté Général' },
          { label: 'Esthétique – Épilation & Waxing' },
          { label: 'Esthétique – Manucure & Pédicure' },
          { label: 'Esthétique – Soins Visage & Corps' },
          { label: 'Esthétique – Maquillage Professionnel' },
          { label: 'Esthétique – Microblading & Tatouage Sourcil' },
          { label: 'Esthétique – Pose d\'Ongles' },
        ],
      },
      {
        label: 'Spa & Massage',
        variants: [
          { label: 'Spa – Forfait Relaxation' },
          { label: 'Spa – Massage Thérapeutique' },
          { label: 'Spa – Hammam & Bain Vapeur' },
          { label: 'Spa – Rituel Beauté Complet' },
          { label: 'Spa – Spa de Luxe' },
        ],
      },
      {
        label: 'Yoga, Méditation & Bien-être',
        variants: [
          { label: 'Yoga – Cours Yoga Général' },
          { label: 'Yoga – Yoga Prénatal' },
          { label: 'Yoga – Yoga Enfant' },
          { label: 'Méditation – Séance Méditation' },
          { label: 'Bien-être – Retraite Bien-être' },
          { label: 'Bien-être – Atelier Gestion du Stress' },
        ],
      },
      {
        label: 'Mode & Vêtements',
        variants: [
          { label: 'Mode – Boutique de Prêt-à-Porter' },
          { label: 'Mode – Promo Nouvelle Collection' },
          { label: 'Mode – Liquidation de Stock' },
          { label: 'Mode – Styliste & Couturier' },
          { label: 'Mode – Vente Privée' },
          { label: 'Mode – Défilé de Mode' },
          { label: 'Mode – Accessoires & Bijoux' },
        ],
      },
      {
        label: 'Tatouage & Piercing',
        variants: [
          { label: 'Tatouage – Studio de Tatouage' },
          { label: 'Tatouage – Flash Day' },
          { label: 'Tatouage – Convention Tatouage' },
          { label: 'Piercing – Studio Piercing' },
        ],
      },
    ],
  },

  /* ---------------------------------------------------- */
  /*            IMMOBILIER & CONSTRUCTION                 */
  /* ---------------------------------------------------- */
  {
    id: 'real_estate',
    label: 'IMMOBILIER & CONSTRUCTION',
    icon: Home,
    image: impact_img,
    models: [
      {
        label: 'Agence Immobilière',
        variants: [
          { label: 'Agence – Présentation Agence' },
          { label: 'Agence – Appel aux Propriétaires' },
          { label: 'Agence – Gestion Locative' },
          { label: 'Agence – Estimation Gratuite' },
        ],
      },
      {
        label: 'Vente de Bien',
        variants: [
          { label: 'Vente – Maison Individuelle' },
          { label: 'Vente – Appartement' },
          { label: 'Vente – Terrain à Bâtir' },
          { label: 'Vente – Local Commercial' },
          { label: 'Vente – Immeuble' },
          { label: 'Vente – Bien Neuf / Promoteur' },
        ],
      },
      {
        label: 'Location',
        variants: [
          { label: 'Location – Appartement Vide' },
          { label: 'Location – Appartement Meublé' },
          { label: 'Location – Colocation' },
          { label: 'Location – Résidence Étudiante' },
          { label: 'Location – Local Professionnel' },
          { label: 'Location – Location Saisonnière' },
        ],
      },
      {
        label: 'Visite & Open House',
        variants: [
          { label: 'Open House – Journée Portes Ouvertes' },
          { label: 'Open House – Visite Guidée' },
          { label: 'Open House – Présentation Résidence' },
        ],
      },
      {
        label: 'BTP & Construction',
        variants: [
          { label: 'BTP – Entreprise de Construction' },
          { label: 'BTP – Rénovation & Travaux' },
          { label: 'BTP – Architecture & Maîtrise d\'Œuvre' },
          { label: 'BTP – Aménagement Intérieur' },
          { label: 'BTP – Carrelage & Revêtement' },
          { label: 'BTP – Charpente & Toiture' },
          { label: 'BTP – Chauffage & Climatisation (CVC)' },
        ],
      },
    ],
  },

  /* ---------------------------------------------------- */
  /*             ASSOCIATIONS & SOLIDARITÉ                */
  /* ---------------------------------------------------- */
  {
    id: 'associations',
    label: 'ASSOCIATIONS, ONG & SOLIDARITÉ',
    icon: History,
    image: classic_img,
    models: [
      {
        label: 'Collecte & Financement',
        variants: [
          { label: 'Collecte – Appel aux Dons' },
          { label: 'Collecte – Collecte de Denrées / Vêtements' },
          { label: 'Collecte – Financement Participatif' },
          { label: 'Collecte – Tombola & Loterie Solidaire' },
          { label: 'Collecte – Vente Solidaire' },
        ],
      },
      {
        label: 'Campagne de Sensibilisation',
        variants: [
          { label: 'Campagne – Sensibilisation Environnementale' },
          { label: 'Campagne – Lutte contre les Violences' },
          { label: 'Campagne – Droits des Enfants' },
          { label: 'Campagne – Accès à l\'Éducation' },
          { label: 'Campagne – Lutte contre la Pauvreté' },
          { label: 'Campagne – Santé Communautaire' },
        ],
      },
      {
        label: 'Événement Associatif',
        variants: [
          { label: 'Associatif – Assemblée Générale' },
          { label: 'Associatif – Réunion Publique' },
          { label: 'Associatif – Marche Solidaire' },
          { label: 'Associatif – Festival Local' },
          { label: 'Associatif – Journée Bénévolat' },
        ],
      },
      {
        label: 'ONG & Humanitaire',
        variants: [
          { label: 'ONG – Mission Humanitaire' },
          { label: 'ONG – Rapport d\'Activité' },
          { label: 'ONG – Appel à Volontaires' },
          { label: 'ONG – Partenariat & Mécénat' },
        ],
      },
      {
        label: 'Religion & Communauté',
        variants: [
          { label: 'Religion – Annonce Événement Religieux' },
          { label: 'Religion – Célébration Communautaire' },
          { label: 'Religion – Appel à la Prière / Rassemblement' },
          { label: 'Religion – Quête & Offrande' },
        ],
      },
    ],
  },

  /* ---------------------------------------------------- */
  /*             NATURE & DÉVELOPPEMENT DURABLE           */
  /* ---------------------------------------------------- */
  {
    id: 'nature',
    label: 'NATURE, ÉCO & DÉVELOPPEMENT DURABLE',
    icon: Leaf,
    image: nature_img,
    models: [
      {
        label: 'Environnement & Écologie',
        variants: [
          { label: 'Éco – Journée Mondiale de l\'Environnement' },
          { label: 'Éco – Collecte de Déchets' },
          { label: 'Éco – Plantation d\'Arbres' },
          { label: 'Éco – Festival Écologique' },
          { label: 'Éco – Campagne Zéro Déchet' },
        ],
      },
      {
        label: 'Agriculture & Produits Bio',
        variants: [
          { label: 'Bio – Marché Bio & Local' },
          { label: 'Bio – Épicerie Naturelle' },
          { label: 'Bio – Vente Directe Producteur' },
          { label: 'Bio – AMAP & Paniers Bio' },
          { label: 'Bio – Atelier Agriculture Urbaine' },
        ],
      },
      {
        label: 'Atelier Développement Durable',
        variants: [
          { label: 'Atelier – Compostage & Jardinage' },
          { label: 'Atelier – Couture & Upcycling' },
          { label: 'Atelier – Fabrication Produits Ménagers Naturels' },
          { label: 'Atelier – Potager Urbain' },
          { label: 'Atelier – Apiculture Urbaine' },
        ],
      },
      {
        label: 'Énergie & Habitat Durable',
        variants: [
          { label: 'Énergie – Présentation Énergie Solaire' },
          { label: 'Énergie – Rénovation Énergétique' },
          { label: 'Habitat – Construction Écologique' },
          { label: 'Habitat – Habitat Participatif' },
        ],
      },
    ],
  },

  /* ---------------------------------------------------- */
  /*              COMMERCE & DISTRIBUTION                 */
  /* ---------------------------------------------------- */
  {
    id: 'retail',
    label: 'COMMERCE & DISTRIBUTION',
    icon: ShoppingBag,
    image: colorful_img,
    models: [
      {
        label: 'Commerce de Détail',
        variants: [
          { label: 'Commerce – Flyer Promotion Magasin' },
          { label: 'Commerce – Soldes & Liquidation' },
          { label: 'Commerce – Ouverture de Magasin' },
          { label: 'Commerce – Fidélité Client' },
          { label: 'Commerce – Vente Flash' },
        ],
      },
      {
        label: 'Épicerie & Alimentation',
        variants: [
          { label: 'Épicerie – Promotion Produits' },
          { label: 'Épicerie – Arrivage Nouveau Produit' },
          { label: 'Épicerie – Spécial Fêtes' },
          { label: 'Épicerie – Alimentation Ethnique' },
        ],
      },
      {
        label: 'High-Tech & Électronique',
        variants: [
          { label: 'High-Tech – Promo Téléphones' },
          { label: 'High-Tech – Réparation Téléphone / Informatique' },
          { label: 'High-Tech – Accessoires Informatique' },
          { label: 'High-Tech – Nouveauté Tech' },
        ],
      },
      {
        label: 'Auto, Moto & Transport',
        variants: [
          { label: 'Auto – Vente Véhicule' },
          { label: 'Auto – Garage & Mécanique' },
          { label: 'Auto – Carrosserie & Peinture Auto' },
          { label: 'Auto – Location de Véhicule' },
          { label: 'Transport – Service de Taxi / VTC' },
          { label: 'Transport – Déménagement & Livraison' },
        ],
      },
    ],
  },

  /* ---------------------------------------------------- */
  /*              VOYAGE & TOURISME                       */
  /* ---------------------------------------------------- */
  {
    id: 'travel',
    label: 'VOYAGE & TOURISME',
    icon: Plane,
    image: impact_img,
    models: [
      {
        label: 'Agence de Voyage',
        variants: [
          { label: 'Voyage – Offre Circuit Touristique' },
          { label: 'Voyage – Séjour Balnéaire' },
          { label: 'Voyage – Voyage de Noces' },
          { label: 'Voyage – Voyage Scolaire / Éducatif' },
          { label: 'Voyage – Offre Dernière Minute' },
        ],
      },
      {
        label: 'Hôtellerie & Hébergement',
        variants: [
          { label: 'Hôtel – Présentation Établissement' },
          { label: 'Hôtel – Offre Spéciale Week-end' },
          { label: 'Hôtel – Package Romantique' },
          { label: 'Auberge – Auberge de Jeunesse' },
          { label: 'Hébergement – Location Villa / Gîte' },
        ],
      },
      {
        label: 'Événement Touristique',
        variants: [
          { label: 'Tourisme – Festival Local' },
          { label: 'Tourisme – Circuit Culturel' },
          { label: 'Tourisme – Tourisme Aventure' },
          { label: 'Tourisme – Visite Guidée' },
        ],
      },
    ],
  },

  /* ---------------------------------------------------- */
  /*                    CRÉATIFS                          */
  /* ---------------------------------------------------- */
  {
    id: 'creative',
    label: 'DESIGN CRÉATIF & ARTISTIQUE',
    icon: PenTool,
    image: creative_img,
    models: [
      {
        label: 'Style Typographique',
        variants: [
          { label: 'Typo – Composition Typographique Dominante' },
          { label: 'Typo – Typo Gigantesque & Minimaliste' },
          { label: 'Typo – Typo Expressive & Colorée' },
          { label: 'Typo – Typo Mono & Technique' },
          { label: 'Typo – Typo Mixte & Superposition' },
        ],
      },
      {
        label: 'Style Graphique',
        variants: [
          { label: 'Graphique – Illustration Vectorielle' },
          { label: 'Graphique – Style Flat Design' },
          { label: 'Graphique – Style Rétro / Vintage' },
          { label: 'Graphique – Style Néomorphisme' },
          { label: 'Graphique – Style Brutaliste' },
          { label: 'Graphique – Style Glassmorphisme' },
        ],
      },
      {
        label: 'Affiche Conceptuelle',
        variants: [
          { label: 'Concept – Abstrait Géométrique' },
          { label: 'Concept – Dégradé & Couleurs Vives' },
          { label: 'Concept – Monochrome & Contrastes' },
          { label: 'Concept – Double Exposition' },
          { label: 'Concept – Composition Asymétrique' },
          { label: 'Concept – Layout Magazine' },
        ],
      },
      {
        label: 'Art & Culture',
        variants: [
          { label: 'Art – Exposition Artistique' },
          { label: 'Art – Vente d\'Œuvres' },
          { label: 'Art – Atelier Artistique' },
          { label: 'Culture – Journée Culturelle' },
          { label: 'Culture – Festival d\'Art' },
        ],
      },
    ],
  },

  /* ---------------------------------------------------- */
  /*                    CLASSIQUES                        */
  /* ---------------------------------------------------- */
  {
    id: 'classic',
    label: 'MODÈLES CLASSIQUES & INSTITUTIONNELS',
    icon: Gem,
    image: elegant_img,
    models: [
      {
        label: 'Modèle Élégant',
        image: elegant_img,
        variants: [
          { label: 'Élégant – Noir & Or Premium' },
          { label: 'Élégant – Blanc & Or Raffiné' },
          { label: 'Élégant – Marine & Argent' },
          { label: 'Élégant – Bordeaux & Crème' },
        ],
      },
      {
        label: 'Modèle Minimaliste',
        variants: [
          { label: 'Minimaliste – Noir & Blanc Épuré' },
          { label: 'Minimaliste – Blanc Total' },
          { label: 'Minimaliste – Noir Total' },
          { label: 'Minimaliste – Tonalité Sable & Beige' },
        ],
      },
      {
        label: 'Modèle Institutionnel',
        variants: [
          { label: 'Institutionnel – Annonce Officielle' },
          { label: 'Institutionnel – Courrier Formel' },
          { label: 'Institutionnel – Communiqué de Presse' },
          { label: 'Institutionnel – Présentation d\'Autorité' },
        ],
      },
      {
        label: 'Modèle Vintage & Rétro',
        variants: [
          { label: 'Vintage – Affiche Années 20-30' },
          { label: 'Vintage – Affiche Années 50-60' },
          { label: 'Vintage – Papier Vieilli & Sépia' },
          { label: 'Vintage – Rétro Pop Années 70-80' },
        ],
      },
    ],
  },

  /* ---------------------------------------------------- */
  /*                     MODERNE                          */
  /* ---------------------------------------------------- */
  {
    id: 'modern',
    label: 'DESIGN MODERNE & TENDANCE',
    icon: Palette,
    image: modern_img,
    models: [
      {
        label: 'Style Néon & Futuriste',
        image: modern_img,
        variants: [
          { label: 'Néon – Violet & Rose Vif' },
          { label: 'Néon – Cyan & Bleu Électrique' },
          { label: 'Néon – Multicolore' },
          { label: 'Futuriste – Fond Sombre Lumineux' },
          { label: 'Futuriste – Grille & Géométrie Tech' },
        ],
      },
      {
        label: 'Style Moderne Épuré',
        variants: [
          { label: 'Épuré – Tons Neutres & Serif Moderne' },
          { label: 'Épuré – Blanc Cassé & Accent Sombre' },
          { label: 'Épuré – Pastel Doux & Arrondi' },
          { label: 'Épuré – Grid System & Espace Blanc' },
        ],
      },
      {
        label: 'Style Coloré & Pop',
        variants: [
          { label: 'Pop – Couleurs Primaires & Contrastes' },
          { label: 'Pop – Fond Jaune Vif' },
          { label: 'Pop – Fond Rouge Impact' },
          { label: 'Pop – Fond Vert & Orange' },
          { label: 'Pop – Palette Candy & Pastel' },
        ],
      },
      {
        label: 'Style Dégradé & Texture',
        variants: [
          { label: 'Dégradé – Violet Vers Rose' },
          { label: 'Dégradé – Bleu Vers Vert' },
          { label: 'Dégradé – Orange Vers Rouge' },
          { label: 'Texture – Grain & Film Photographique' },
          { label: 'Texture – Papier Texturé' },
          { label: 'Texture – Marbre & Pierre' },
        ],
      },
    ],
  },
];