import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Users, Gift, Star, ChevronRight } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { ReferralCodeCard } from '../../components/ReferralCodeCard';
import { AiService } from '../../api/ai.service';
import { useAuthStore } from '../../store/authStore';
import { NeonButton } from '../../components/ui/NeonButton';
import { GenericModal, ModalType } from '../../components/ui/GenericModal';

export default function ReferralScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [applying, setApplying] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ type: ModalType; title: string; message: string }>({
    type: 'info', title: '', message: '',
  });

  const fetchStats = async () => {
    try {
      const data = await AiService.getReferralStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const showFeedback = (type: ModalType, title: string, message: string) => {
    setModalConfig({ type, title, message });
    setModalVisible(true);
  };

  const handleApplyCode = async () => {
    if (!referralCodeInput.trim()) return;
    
    setApplying(true);
    try {
      await AiService.applyReferralCode(referralCodeInput.trim());
      showFeedback('success', 'Félicitations !', 'Le code de parrainage a été appliqué avec succès.');
      setReferralCodeInput('');
      fetchStats(); // Refresh to show we are referred
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || "Impossible d'appliquer ce code.";
      showFeedback('error', 'Erreur', errorMsg);
    } finally {
      setApplying(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <BackgroundGradientOnboarding darkOverlay blurIntensity={90} imageSource="splash">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      </BackgroundGradientOnboarding>
    );
  }

  return (
    <BackgroundGradientOnboarding darkOverlay blurIntensity={90} imageSource="splash">
      <SafeAreaView style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={22} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>Parrainage</Text>
            <Text style={styles.subtitle}>Invite tes amis et gagne des mois gratuits</Text>
          </View>

          {/* Referral Code */}
          {stats?.referralCode && <ReferralCodeCard code={stats.referralCode} />}

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <StatCard 
              icon={<Users size={20} color={colors.primary.light} />}
              label="Filleuls"
              value={stats?.totalReferred || 0}
            />
            <StatCard 
              icon={<Gift size={20} color={colors.primary.light} />}
              label="Mois offerts"
              value={stats?.freeMonthsPending || 0}
            />
          </View>

          {/* Ambassador Status */}
          {stats?.isAmbassador ? (
            <View style={styles.ambassadorCard}>
              <View style={styles.ambassadorIcon}>
                <Star size={24} color="#FFD700" fill="#FFD700" />
              </View>
              <View style={styles.ambassadorInfo}>
                <Text style={styles.ambassadorTitle}>Statut Ambassadeur Actif</Text>
                <Text style={styles.ambassadorText}>Tu profites de -50% sur ton abonnement à vie !</Text>
              </View>
            </View>
          ) : (
            <View style={styles.infoCard}>
              <Star size={20} color={colors.primary.main} />
              <Text style={styles.infoText}>
                Deviens <Text style={styles.highlight}>Ambassadeur</Text> avec 10 filleuls payants et obtiens <Text style={styles.highlight}>-50% à vie</Text> sur ton abonnement.
              </Text>
            </View>
          )}

          {/* Apply Code Section */}
          {!user?.referredBy && (
            <View style={styles.applySection}>
              <Text style={styles.sectionTitle}>Tu as été parrainé ?</Text>
              <Text style={styles.sectionSubtitle}>Entre le code de ton parrain pour le remercier.</Text>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Code de parrainage (ex: REF-USR-123)"
                  placeholderTextColor={colors.text.muted}
                  value={referralCodeInput}
                  onChangeText={setReferralCodeInput}
                  autoCapitalize="characters"
                />
                <TouchableOpacity 
                  style={[styles.applyButton, !referralCodeInput && styles.applyButtonDisabled]}
                  onPress={handleApplyCode}
                  disabled={applying || !referralCodeInput}
                >
                  {applying ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <ChevronRight size={24} color="#000" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* How it works */}
          <View style={styles.rulesCard}>
            <Text style={styles.rulesTitle}>Comment ça marche ?</Text>
            <RuleItem 
              number="1" 
              text="Partage ton code unique avec tes amis." 
            />
            <RuleItem 
              number="2" 
              text="Ton ami s'inscrit et s'abonne à un pack Hipster IA." 
            />
            <RuleItem 
              number="3" 
              text="Tu gagnes 1 mois gratuit pour chaque nouvel abonné !" 
            />
          </View>

        </ScrollView>
      </SafeAreaView>

      <GenericModal
        visible={modalVisible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalVisible(false)}
      />
    </BackgroundGradientOnboarding>
  );
}

function StatCard({ icon, label, value }: { icon: any; label: string; value: number | string }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function RuleItem({ number, text }: { number: string; text: string }) {
  return (
    <View style={styles.ruleItem}>
      <View style={styles.ruleNumber}><Text style={styles.ruleNumberText}>{number}</Text></View>
      <Text style={styles.ruleText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 10 },
  backButton: {
    position: 'absolute', left: 0, top: -4, width: 44, height: 44,
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.text.primary, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.text.secondary, textAlign: 'center' },
  
  statsGrid: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20,
    padding: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  statIcon: { marginBottom: 12, opacity: 0.8 },
  statValue: { fontSize: 24, fontWeight: '800', color: colors.text.primary, marginBottom: 4 },
  statLabel: { fontSize: 11, fontWeight: '700', color: colors.text.muted, textTransform: 'uppercase' },

  ambassadorCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255, 215, 0, 0.3)',
    marginBottom: 24,
  },
  ambassadorIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255, 215, 0, 0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  ambassadorInfo: { flex: 1 },
  ambassadorTitle: { fontSize: 16, fontWeight: '800', color: '#FFD700', marginBottom: 2 },
  ambassadorText: { fontSize: 13, color: '#FFD700', opacity: 0.8 },

  infoCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: 20, padding: 16, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.2)',
    marginBottom: 24, gap: 12,
  },
  infoText: { flex: 1, fontSize: 13, color: colors.text.secondary, lineHeight: 18 },
  highlight: { color: colors.primary.main, fontWeight: '700' },

  applySection: { marginBottom: 32 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text.primary, marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: colors.text.muted, marginBottom: 16 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, padding: 4, paddingLeft: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  input: { flex: 1, height: 48, color: colors.text.primary, fontSize: 15, fontWeight: '600' },
  applyButton: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primary.main,
    justifyContent: 'center', alignItems: 'center',
  },
  applyButtonDisabled: { backgroundColor: colors.text.muted, opacity: 0.5 },

  rulesCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 24 },
  rulesTitle: { fontSize: 16, fontWeight: '800', color: colors.text.primary, marginBottom: 20 },
  ruleItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 16 },
  ruleNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary.main, justifyContent: 'center', alignItems: 'center' },
  ruleNumberText: { fontSize: 12, fontWeight: '900', color: '#000' },
  ruleText: { flex: 1, fontSize: 14, color: colors.text.secondary, lineHeight: 20 },
});
