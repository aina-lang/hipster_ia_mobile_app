import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { DeerAnimation } from '../../components/ui/DeerAnimation';
import { SelectionCard } from '../../components/ui/SelectionCard';
import { useCreationStore, JobType, CreationCategory } from '../../store/creationStore';
import {
  FileText,
  FileCheck,
  Palette,
  MessageSquare,
  Instagram,
  ShoppingBag,
  User,
  Utensils,
  Megaphone,
  Globe,
  Package,
  Ticket,
  MessageCircle,
  Home,
  Camera,
  Mail,
  Activity,
  Zap,
  Video,
  Youtube,
  Layers,
  Type,
  Clock,
  Briefcase,
} from 'lucide-react-native';

interface JobFunction {
  label: string;
  category: CreationCategory;
  icon: any;
}

const JOB_FUNCTIONS: Record<string, JobFunction[]> = {
  Artisan: [
    { label: 'Générer un devis (PDF / DOCX)', category: 'Document', icon: FileText },
    { label: 'Générer une facture (PDF)', category: 'Document', icon: FileCheck },
    { label: 'Créer un flyer / affiche (Image)', category: 'Image', icon: Palette },
    { label: 'Rédiger un message client (Texte)', category: 'Texte', icon: MessageSquare },
  ],
  'Coiffeur / Barber': [
    { label: 'Post Instagram (Image + Texte)', category: 'Social', icon: Instagram },
    { label: 'Fiche tarifaire (PDF / Image)', category: 'Document', icon: FileText },
    { label: 'Affiche promo / -20% (Image)', category: 'Image', icon: ShoppingBag },
    { label: 'Description / Bio Insta (Texte)', category: 'Texte', icon: User },
  ],
  'Restaurant / Snack': [
    { label: 'Créer un menu complet (PDF / DOCX)', category: 'Document', icon: FileText },
    { label: 'Post “plat du jour” (Image + Texte)', category: 'Social', icon: Utensils },
    { label: 'Flyer promotionnel (Image)', category: 'Image', icon: Megaphone },
    { label: 'Description Maps / Uber (Texte)', category: 'Texte', icon: Globe },
  ],
  Boutique: [
    { label: 'Fiche produit (Texte + Image)', category: 'Texte', icon: Package },
    { label: 'Post Instagram produit (Image)', category: 'Social', icon: Instagram },
    { label: 'Flyer soldes / promo (Image)', category: 'Image', icon: Ticket },
    { label: 'Message de vente / WhatsApp (Texte)', category: 'Texte', icon: MessageCircle },
  ],
  'Agent Immobilier': [
    { label: 'Annonce immobilière (Texte + Photo)', category: 'Texte', icon: Home },
    { label: 'Visuel immobilier (Image IA)', category: 'Image', icon: Camera },
    { label: 'Fiche technique du bien (PDF)', category: 'Document', icon: FileCheck },
    { label: 'Message client / RDV (Texte)', category: 'Texte', icon: Mail },
  ],
  'Coach / Consultant': [
    { label: 'Post éducatif + visuel (Image + Texte)', category: 'Social', icon: Instagram },
    { label: 'Plan de séance / programme (PDF)', category: 'Document', icon: Activity },
    { label: 'Page de vente courte (Texte)', category: 'Texte', icon: Briefcase },
    { label: 'Message client pro (Texte)', category: 'Texte', icon: MessageSquare },
  ],
  'E-commerce': [
    { label: 'Fiche produit SEO (Texte)', category: 'Texte', icon: Globe },
    { label: 'Image produit / mockup (Image IA)', category: 'Image', icon: Camera },
    { label: 'Publicité Meta / Google Ads (Texte)', category: 'Texte', icon: Zap },
    { label: 'Email de vente / Copy (Texte)', category: 'Texte', icon: Mail },
  ],
  'Créateur de contenu': [
    { label: 'Idée + script vidéo (Texte)', category: 'Texte', icon: Video },
    { label: 'Miniature YouTube (Image IA)', category: 'Image', icon: Youtube },
    { label: 'Post carrousel Insta (Image + Texte)', category: 'Social', icon: Layers },
    { label: 'Description YT / TikTok (Texte)', category: 'Texte', icon: Type },
  ],
  'Service local': [
    { label: 'Flyer local (Image)', category: 'Image', icon: Palette },
    { label: 'Message WhatsApp pro (Texte)', category: 'Texte', icon: MessageCircle },
    { label: 'Petite affiche / tarifs (Image)', category: 'Image', icon: Clock },
    { label: 'Description Google Maps (Texte)', category: 'Texte', icon: Globe },
  ],
};

export default function Step2TypeScreen() {
  const router = useRouter();
  const { selectedJob, setFunction, selectedFunction } = useCreationStore();

  const currentFunctions = selectedJob ? JOB_FUNCTIONS[selectedJob as string] || [] : [];

  const handleSelect = (fn: JobFunction) => {
    setFunction(fn.label, fn.category);
    setTimeout(() => {
      router.push('/(guided)/step3-context');
    }, 300);
  };

  return (
    <BackgroundGradient>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Que souhaitez-vous faire ?</Text>
            <Text style={styles.subtitle}>Sélectionnez une option pour votre activité.</Text>
          </View>

          <View style={styles.animationContainer}>
            <DeerAnimation size={120} progress={40} />
          </View>

          <View style={styles.list}>
            {currentFunctions.map((fn, index) => (
              <SelectionCard
                key={index}
                label={fn.label}
                icon={fn.icon}
                selected={selectedFunction === fn.label}
                onPress={() => handleSelect(fn)}
                fullWidth
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 100,
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  animationContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  list: {
    gap: 12,
  },
});
