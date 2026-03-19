import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, RefreshControl, Animated as RNAnimated, Easing, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Users, Gift, Star, ChevronRight } from 'lucide-react-native';

import { colors } from '../../theme/colors';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { ReferralCodeCard } from '../../components/ReferralCodeCard';
import { AiService } from '../../api/ai.service';
import { GenericModal, ModalType } from '../../components/ui/GenericModal';

import { NeonBorderInput } from '../../components/ui/NeonBorderInput';
import { NeonActionButton } from '../../components/ui/NeonActionButton';


function SectionTitle({ title }: { title: string }) {
  return (
    <View style={s.sectionRow}>
      <Text style={s.sectionText}>{title}</Text>
    </View>
  );
}

function StatCard({ icon, label, value }: { icon: any; label: string; value: number | string }) {
  return (
    <View style={s.statCard}>
      <LinearGradient colors={[colors.primary.main + '0f', 'transparent']} style={StyleSheet.absoluteFill} />
      <View style={s.statIcon}>{icon}</View>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function RuleItem({ number, text }: { number: string; text: string }) {
  return (
    <View style={s.ruleItem}>
      <LinearGradient colors={[colors.neon.primary, colors.primary.light]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.ruleNumber}>
        <Text style={s.ruleNumberText}>{number}</Text>
      </LinearGradient>
      <Text style={s.ruleText}>{text}</Text>
    </View>
  );
}

export default function ReferralScreen() {
  const router = useRouter();
  const [stats, setStats]                         = useState<any>(null);
  const [loading, setLoading]                     = useState(true);
  const [refreshing, setRefreshing]               = useState(false);
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [applying, setApplying]                   = useState(false);
  const [inputFocused, setInputFocused]           = useState(false);
  const [modalVisible, setModalVisible]           = useState(false);
  const [modalConfig, setModalConfig]             = useState<{ type: ModalType; title: string; message: string }>({ type: 'info', title: '', message: '' });

  const fetchStats = async () => {
    try {
      const data = await AiService.getReferralStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching referral stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  useFocusEffect(useCallback(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []));

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
      fetchStats();
    } catch (error: any) {
      showFeedback('error', 'Erreur', error?.response?.data?.message || "Impossible d'appliquer ce code.");
    } finally {
      setApplying(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <BackgroundGradientOnboarding darkOverlay>
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={colors.neon.primary} />
        </View>
      </BackgroundGradientOnboarding>
    );
  }

  return (
    <BackgroundGradientOnboarding darkOverlay>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} tintColor={colors.neon.primary} />}
        >
          <View style={s.header}>
            <TouchableOpacity style={s.backButton} onPress={() => router.back()}>
              <ArrowLeft size={22} color={colors.text.primary} />
            </TouchableOpacity>
            <View style={s.headerCenter}>
              <Text style={s.titleSub}>Parrainage</Text>
            </View>
          </View>

          <Text style={s.heroSubtitleText}>Invite tes amis et gagne des mois gratuits</Text>

          {stats?.referralCode && <ReferralCodeCard code={stats.referralCode} />}

          <View style={s.statsGrid}>
            <StatCard icon={<Users size={20} color={colors.neon.primary} />} label="Filleuls" value={stats?.totalReferred || 0} />
            <StatCard icon={<Gift size={20} color={colors.neon.primary} />} label="Mois offerts" value={stats?.freeMonthsPending || 0} />
          </View>

          {stats?.isAmbassador ? (
            <View style={s.ambassadorCard}>
              <LinearGradient colors={['rgba(255,215,0,0.08)', 'transparent']} style={StyleSheet.absoluteFill} />
              <View style={s.ambassadorIcon}>
                <Star size={22} color="#FFD700" fill="#FFD700" />
              </View>
              <View style={s.ambassadorInfo}>
                <Text style={s.ambassadorTitle}>Statut Ambassadeur Actif</Text>
                <Text style={s.ambassadorText}>Atelier 9,90€/mois · Studio 22€/mois en permanence</Text>
              </View>
            </View>
          ) : (
            <View style={s.infoCard}>
              <LinearGradient colors={[colors.primary.main + '0f', 'transparent']} style={StyleSheet.absoluteFill} />
              <Star size={18} color={colors.neon.primary} />
              <Text style={s.infoText}>
                Deviens <Text style={s.highlight}>Ambassadeur</Text> avec 10 filleuls payants et profite d'un{' '}
                <Text style={s.highlight}>tarif préférentiel permanent</Text> sur tous les packs.
              </Text>
            </View>
          )}

          <View style={s.card}>
            {stats?.isReferred ? (
              <View style={s.referredBadge}>
                <Gift size={18} color={colors.status.success} />
                <Text style={s.referredText}>Tu as déjà un parrain — code appliqué ✓</Text>
              </View>
            ) : (
              <>
                <SectionTitle title="Tu as été parrainé ?" />
                <Text style={s.cardSubtitle}>Entre le code de ton parrain pour le remercier.</Text>
                <NeonBorderInput isActive={inputFocused}>
                  <View style={[s.inputContainer, inputFocused && s.inputContainerActive]}>
                    <TextInput
                      style={s.input}
                      placeholder="Ex: REF-USR-123"
                      placeholderTextColor={colors.text.muted}
                      value={referralCodeInput}
                      onChangeText={setReferralCodeInput}
                      autoCapitalize="characters"
                      onFocus={() => setInputFocused(true)}
                      onBlur={() => setInputFocused(false)}
                    />
                    <TouchableOpacity
                      style={[s.applyButton, (!referralCodeInput || applying) && s.applyButtonDisabled]}
                      onPress={handleApplyCode}
                      disabled={applying || !referralCodeInput}
                    >
                      {applying
                        ? <ActivityIndicator size="small" color="#fff" />
                        : <ChevronRight size={20} color="#fff" />}
                    </TouchableOpacity>
                  </View>
                </NeonBorderInput>
              </>
            )}
          </View>

          <View style={s.card}>
            <SectionTitle title="Comment ça marche ?" />
            <RuleItem number="1" text="Partage ton code unique avec tes amis." />
            <RuleItem number="2" text="Ton ami s'inscrit et s'abonne à un pack Hipster IA." />
            <RuleItem number="3" text="Tu gagnes 1 mois gratuit pour chaque nouvel abonné !" />
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

const s = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent:    { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },

  header:       { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  backButton:   { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  headerCenter: { flex: 1, alignItems: 'center', marginRight: 58, paddingVertical: 10 },
  titleSub:     { fontFamily: 'Arimo-Bold', fontSize: 16, textTransform: 'uppercase', color: '#ffffff' },

  heroSubtitleText: { fontFamily: 'Arimo-Regular', fontSize: 14, color: 'rgba(255,255,255,0.45)', textAlign: 'center', letterSpacing: 0.3, marginBottom: 28 },

  statsGrid: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  statCard:  { flex: 1, borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,212,255,0.12)', backgroundColor: 'rgba(15,23,42,0.6)', overflow: 'hidden' },
  statIcon:  { marginBottom: 10 },
  statValue: { fontFamily: 'Arimo-Bold', fontSize: 28, color: '#ffffff', marginBottom: 4, textShadowColor: colors.neon.primary, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  statLabel: { fontFamily: 'Arimo-Bold', fontSize: 10, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 1 },

  ambassadorCard:  { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,215,0,0.25)', backgroundColor: 'rgba(15,23,42,0.6)', marginBottom: 20, overflow: 'hidden', gap: 16 },
  ambassadorIcon:  { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,215,0,0.15)', justifyContent: 'center', alignItems: 'center' },
  ambassadorInfo:  { flex: 1 },
  ambassadorTitle: { fontFamily: 'Arimo-Bold', fontSize: 15, color: '#FFD700', marginBottom: 3 },
  ambassadorText:  { fontFamily: 'Arimo-Regular', fontSize: 12, color: '#FFD700', opacity: 0.8 },

  infoCard:  { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: 'rgba(0,212,255,0.15)', backgroundColor: 'rgba(15,23,42,0.6)', marginBottom: 20, overflow: 'hidden', gap: 14 },
  infoText:  { flex: 1, fontFamily: 'Arimo-Regular', fontSize: 13, color: colors.text.secondary, lineHeight: 18 },
  highlight: { fontFamily: 'Arimo-Bold', color: colors.neon.primary },

  card:        { backgroundColor: 'rgba(15,23,42,0.6)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', padding: 20, gap: 14, marginBottom: 20 },
  sectionRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  sectionText: { fontFamily: 'Arimo-Bold', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)' },
  cardSubtitle: { fontFamily: 'Arimo-Regular', fontSize: 13, color: colors.text.muted, textAlign: 'center' },

  inputContainer:       { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15,23,42,0.9)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', zIndex: 3 },
  inputContainerActive: { borderColor: 'transparent', backgroundColor: '#030814' },
  input:                { flex: 1, height: 48, fontFamily: 'Arimo-Bold', fontSize: 14, color: colors.text.primary, letterSpacing: 1 },
  applyButton:          { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.neon.primary, justifyContent: 'center', alignItems: 'center' },
  applyButtonDisabled:  { backgroundColor: 'rgba(255,255,255,0.1)' },

  referredBadge: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center', paddingVertical: 8 },
  referredText:  { fontFamily: 'Arimo-Bold', fontSize: 14, color: colors.status.success },

  ruleItem:       { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  ruleNumber:     { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  ruleNumberText: { fontFamily: 'Arimo-Bold', fontSize: 11, color: '#000' },
  ruleText:       { flex: 1, fontFamily: 'Arimo-Regular', fontSize: 14, color: colors.text.secondary, lineHeight: 20 },
});