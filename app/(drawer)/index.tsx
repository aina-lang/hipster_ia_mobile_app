import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { DeerAnimation } from '../../components/ui/DeerAnimation';
import { useAuthStore } from '../../store/authStore';
import { Compass, Menu, Image, Paperclip, Mic, Send } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const navigation = useNavigation();

  return (
    <BackgroundGradient>
      <SafeAreaView style={styles.container}>
        {/* Header with Menu Button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={styles.menuButton}>
            <Menu size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Greeting Section */}
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>Bonjour {user?.firstName}</Text>
            <Text style={styles.question}>Que créons-nous aujourd'hui ?</Text>
          </View>

          {/* Deer Animation Centerpiece */}
          <View style={styles.animationContainer}>
            <DeerAnimation size={180} progress={0} />
          </View>

          {/* Mode Selection Cards */}
          <View style={styles.modesContainer}>
            {/* Mode Guidé */}
            <TouchableOpacity
              style={styles.modeCard}
              onPress={() => router.push('/(guided)/step1-job')}
              activeOpacity={0.8}>
              <View style={[styles.iconContainer, {  }]}>
                <Compass size={32} color={colors.primary.main} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.modeTitle}>Mode Guidé</Text>
                <Text style={styles.modeDescription}>
                  Laissez-vous accompagner étape par étape pour une création professionnelle.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Mode Libre Input */}
            <View style={styles.freeModeContainer}>
              <View style={styles.separatorContainer}>
                <View style={styles.separator} />
                <Text style={styles.separatorText}>OU MODE LIBRE</Text>
                <View style={styles.separator} />
              </View>

              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="Décrivez votre idée, ajoutez une image ou un audio..."
                  placeholderTextColor={colors.text.muted}
                  style={styles.textInput}
                  multiline
                />

                <View style={styles.actionRow}>
                  <View style={styles.attachmentsRow}>
                    <TouchableOpacity style={styles.iconButton}>
                      <Image size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                      <Paperclip size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                      <Mic size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity style={styles.sendButton}>
                    <Send size={20} color={colors.background.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'flex-start',
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  greetingSection: {
    marginTop: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 20, // Reduced from 24
    color: colors.text.secondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  question: {
    fontSize: 28, // Reduced from 32
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 36,
  },
  animationContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  modesContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  modeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  freeModeContainer: {
    marginTop: 8,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
    opacity: 0.4, // Lighter opacity
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Lighter line
  },
  separatorText: {
    color: colors.text.secondary, // Softer text color
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)', // Slightly more opaque for content
    borderRadius: 24, // More rounded
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    // Shadow for card effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  textInput: {
    color: colors.text.primary,
    fontSize: 16,
    minHeight: 100, // Slightly taller default
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  attachmentsRow: {
    flexDirection: 'row',
    gap: 12, // Increased gap for better spacing
  },
  iconButton: {
    padding: 10,
    borderRadius: 16, // Smoother roundness
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  sendButton: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.primary.main,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 }, // Enhanced shadow
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
});
