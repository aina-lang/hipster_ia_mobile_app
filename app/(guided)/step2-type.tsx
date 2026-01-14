import React from 'react';
import { View, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { DeerAnimation } from '../../components/ui/DeerAnimation';
import { SelectionCard } from '../../components/ui/SelectionCard';
import { useCreationStore, CreationCategory } from '../../store/creationStore';
import { GuidedScreenWrapper } from '../../components/layout/GuidedScreenWrapper';
import {
  FileText,
  Instagram,
  ShoppingBag,
  User,
  Utensils,
  Megaphone,
  Globe,
  Package,
  Ticket,
  MessageCircle,
  Video,
  Youtube,
  Layers,
  Lightbulb,
  BookOpen,
  MessageSquare,
  Ruler,
  Clock,
  Camera,
} from 'lucide-react-native';
import logo from '../../assets/logo.png';

import { WORKFLOWS } from '../../constants/workflows';

interface JobFunction {
  label: string;
  category: CreationCategory;
  icon: any;
}

const JOB_FUNCTIONS: Record<string, JobFunction[]> = {
  Coiffeur: [
    { label: 'Post réseaux sociaux (Image + Texte)', category: 'Social', icon: Instagram },
    { label: 'Fiche tarifaire (PDF / Image)', category: 'Document', icon: FileText },
    { label: 'Affiche promo -20%', category: 'Image', icon: ShoppingBag },
    { label: 'Bio Instagram', category: 'Texte', icon: User },
  ],
  Restaurant: [
    { label: 'Menu complet (PDF / DOCX)', category: 'Document', icon: Utensils },
    { label: 'Post “Plat du jour”', category: 'Social', icon: Camera },
    { label: 'Flyer promotionnel', category: 'Image', icon: Megaphone },
    { label: 'Description Maps / Uber', category: 'Texte', icon: Globe },
  ],
  Boutique: [
    { label: 'Fiche produit', category: 'Texte', icon: Package },
    { label: 'Post réseaux sociaux produit', category: 'Social', icon: Instagram },
    { label: 'Flyer soldes / promo', category: 'Image', icon: Ticket },
    { label: 'Message WhatsApp vente', category: 'Texte', icon: MessageCircle },
  ],
  Créateur: [
    { label: 'Idée + Script vidéo', category: 'Texte', icon: Video },
    { label: 'Miniature YouTube', category: 'Image', icon: Youtube },
    { label: 'Post réseaux sociaux (Carrousel)', category: 'Social', icon: Layers },
    { label: 'Description YT / TikTok', category: 'Texte', icon: FileText },
  ],
  Artisan: [
    { label: 'Idées & Inspirations', category: 'Texte', icon: Lightbulb },
    { label: 'Tutoriels & Guides', category: 'Texte', icon: BookOpen },
    { label: 'Marketing & Com', category: 'Social', icon: Megaphone },
    { label: 'Conseils Pro', category: 'Texte', icon: MessageSquare },
    { label: 'Modèles & Plans', category: 'Image', icon: Ruler },
    { label: 'Estimation', category: 'Document', icon: Clock },
  ],
  'Service local': [
    { label: 'Flyer local', category: 'Image', icon: Globe },
    { label: 'Message WhatsApp pro', category: 'Texte', icon: MessageCircle },
    { label: 'Petite affiche / tarifs', category: 'Document', icon: FileText },
    { label: 'Description Google Maps', category: 'Texte', icon: Globe },
  ],
};

/* ----------------------------- Images aléatoires ---------------------------- */
const CATEGORY_IMAGES: Record<CreationCategory, any[]> = {
  Social: [logo, logo, logo],
  Document: [logo, logo, logo],
  Image: [logo],
  Texte: [logo],
};

/* ----------------------------- Step2 Screen ----------------------------- */
export default function Step2TypeScreen() {
  const router = useRouter();
  const { selectedJob, setFunction, selectedFunction } = useCreationStore();

  const currentFunctions = selectedJob ? JOB_FUNCTIONS[selectedJob] || [] : [];

  const handleSelect = (fn: JobFunction) => {
    setFunction(fn.label, fn.category);

    // Check if there are specific questions for this workflow
    const hasQuestions = selectedJob && WORKFLOWS[selectedJob]?.[fn.label]?.length > 0;

    // Navigate to Step 3 if questions exist, otherwise skip to Step 4
    const nextStep = hasQuestions ? '/(guided)/step3-context' : '/(guided)/step4-create';

    setTimeout(() => router.push(nextStep as any), 300);
  };

  return (
    <GuidedScreenWrapper>
      <View className="px-5">
        {/* HEADER */}
        <View className="mb-5 items-center">
          <Text className="mb-2 text-center text-2xl font-bold text-white">
            Que souhaitez-vous faire ?
          </Text>
          <Text className="text-center text-base text-gray-300">
            Sélectionnez une option pour votre activité.
          </Text>
        </View>

        {/* ANIMATION */}
        <View className="mb-8 items-center">
          <DeerAnimation size={120} progress={40} />
        </View>

        {/* LISTE */}
        <View className="gap-3">
          {currentFunctions.map((fn, index) => (
            <SelectionCard
              key={index}
              label={fn.label}
              icon={fn.icon}
              selected={selectedFunction === fn.label}
              onPress={() => handleSelect(fn)}
              fullWidth>
              {renderPreview(fn.category)}
            </SelectionCard>
          ))}
        </View>
      </View>
    </GuidedScreenWrapper>
  );
}

/* ----------------------------- Render Preview ----------------------------- */
const renderPreview = (category: CreationCategory) => {
  const images = CATEGORY_IMAGES[category];
  // const randomIndex = Math.floor(Math.random() * images.length);
  const source = images[0]; // Simplified to always show the first image for consistency, or use random if preferred

  // Handle both remote URLs (string) and local imports (number/object)
  const imageSource = typeof source === 'string' ? { uri: source } : source;

  return (
    <View className="mt-1">
      <Image
        source={imageSource}
        style={{ width: '100%', height: 80, borderRadius: 12 }}
        resizeMode="cover"
      />
    </View>
  );
};
