import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { PRIVACY_POLICY_CONTENT } from '../../constants/privacyPolicy';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <BackgroundGradientOnboarding darkOverlay={true}>
      <ScreenHeader titleSub="Conditions" titleScript="d'utilisation" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {PRIVACY_POLICY_CONTENT.sections.map((section) => (
          <View key={section.id} style={s.section}>
            <Text style={s.sectionTitle}>{section.title}</Text>
            <Text style={s.sectionContent}>{section.content}</Text>
          </View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </BackgroundGradientOnboarding>
  );
}

const s = StyleSheet.create({
  scrollContent:  { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  section:        { marginBottom: 24 },
  sectionTitle:   { fontFamily: fonts.arimo.bold, fontSize: 16, fontWeight: '600', color: colors.gray, marginBottom: 12 },
  sectionContent: { fontFamily: fonts.arimo.regular, fontSize: 14, color: colors.text.secondary, lineHeight: 22 },
});