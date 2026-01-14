import React from 'react';
import { View, Text } from 'react-native';
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

interface JobFunction {
  label: string;
  category: CreationCategory;
  icon: any;
}

const JOB_FUNCTIONS: Record<string, JobFunction[]> = {
  Coiffeur: [
    { label: 'Post Instagram (Image + Texte)', category: 'Social', icon: Instagram },
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
    { label: 'Post Instagram produit', category: 'Social', icon: Instagram },
    { label: 'Flyer soldes / promo', category: 'Image', icon: Ticket },
    { label: 'Message WhatsApp vente', category: 'Texte', icon: MessageCircle },
  ],
  Créateur: [
    { label: 'Idée + Script vidéo', category: 'Texte', icon: Video },
    { label: 'Miniature YouTube', category: 'Image', icon: Youtube },
    { label: 'Post carrousel Insta', category: 'Social', icon: Layers },
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
    { label: 'Petite affiche / tarifs', category: 'Image', icon: FileText },
    { label: 'Description Google Maps', category: 'Texte', icon: Globe },
  ],
};

export default function Step2TypeScreen() {
  const router = useRouter();
  const { selectedJob, setFunction, selectedFunction } = useCreationStore();

  const currentFunctions = selectedJob ? JOB_FUNCTIONS[selectedJob] || [] : [];

  const handleSelect = (fn: JobFunction) => {
    setFunction(fn.label, fn.category);
    setTimeout(() => router.push('/(guided)/step3-context'), 300);
  };

  return (
    <GuidedScreenWrapper>
      <View className="px-5">
        
        {/* HEADER */}
        <View className="items-center mb-5">
          <Text className="text-2xl font-bold text-white text-center mb-2">
            Que souhaitez-vous faire ?
          </Text>
          <Text className="text-base text-gray-300 text-center">
            Sélectionnez une option pour votre activité.
          </Text>
        </View>

        {/* ANIMATION */}
        <View className="items-center mb-8">
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
              fullWidth
            >
              {renderPreview(fn.category)}
            </SelectionCard>
          ))}
        </View>

      </View>
    </GuidedScreenWrapper>
  );
}

/* -------------------------------------------------------------------------- */
/*                                PREVIEW BLOCKS                               */
/* -------------------------------------------------------------------------- */

const renderPreview = (category: CreationCategory) => {
  switch (category) {
    case 'Social':
      return (
        <View className="mt-1 opacity-80">
          <View className="flex-row items-center gap-2 mb-2">
            <View className="w-5 h-5 rounded-full bg-white/20" />
            <View className="gap-1">
              <View className="w-10 h-1 rounded bg-white/20" />
              <View className="w-20 h-1 rounded bg-white/20" />
            </View>
          </View>
          <View className="w-full h-[60px] rounded-lg bg-white/10" />
        </View>
      );

    case 'Document':
      return (
        <View className="mt-1 opacity-80">
          <View className="p-3 rounded-lg bg-white/5 border border-white/10 gap-2">
            <View className="w-20 h-1 rounded bg-white/20" />
            <View className="w-20 h-1 rounded bg-white/20" />
            <View className="w-10 h-1 rounded bg-white/20" />
            <View className="w-20 h-1 rounded bg-white/20 mt-1" />
          </View>
        </View>
      );

    case 'Image':
      return (
        <View className="mt-1 opacity-80">
          <View className="w-full h-20 rounded-lg bg-white/15 overflow-hidden relative">
            <View className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white/30" />
            <View className="absolute bottom-0 left-2 w-16 h-10 bg-white/20 rounded-t-xl" />
          </View>
        </View>
      );

    case 'Texte':
    default:
      return (
        <View className="mt-1 opacity-80">
          <View className="p-3 rounded-xl bg-white/10 self-start gap-2 border-b-2 border-b-white/20">
            <View className="w-20 h-1 rounded bg-white/20" />
            <View className="w-10 h-1 rounded bg-white/20" />
          </View>
        </View>
      );
  }
};
