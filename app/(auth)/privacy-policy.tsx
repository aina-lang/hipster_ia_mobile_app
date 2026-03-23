import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { colors } from '../../theme/colors';
import { PRIVACY_POLICY_CONTENT } from '../../constants/privacyPolicy';
import { NeonBackButton } from '../../components/ui/NeonBackButton';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <BackgroundGradientOnboarding darkOverlay={true}>
      {/* ── FIXED HEADER ── */}
      <View style={styles.header}>
        <NeonBackButton onPress={() => router.back()} />
        <View style={styles.headerCenter}>
          <View style={styles.titleRow}>
            <Text style={styles.titleSub}>Conditions</Text>
            <Text style={styles.titleScript}>d'utilisation</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {PRIVACY_POLICY_CONTENT.sections.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </BackgroundGradientOnboarding>
  );
}

const styles = StyleSheet.create({
  /* Header - Fixed at top */
  header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 40, paddingBottom: 8, backgroundColor: 'rgba(10,15,30,0.95)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', zIndex: 100 },
  backButton:     { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  headerCenter:   { flex: 1, alignItems: 'center' },
  titleRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  titleSub:       { fontFamily: 'Arimo-Bold', fontSize: 16, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', lineHeight: 22 },
  titleScript:    { fontFamily: 'Brittany-Signature', paddingLeft: 1, fontSize: 28, color: '#fff', textShadowColor: '#00eaff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 18, lineHeight: 22, includeFontPadding: false },

  scrollContent:  { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  section:        { marginBottom: 24 },
  sectionTitle:   { fontSize: 16, fontWeight: '600', color: colors.neon, marginBottom: 12 },
  sectionContent: { fontSize: 14, color: colors.text.secondary, lineHeight: 22 },
  bottomSpace:    { height: 20 },
});
