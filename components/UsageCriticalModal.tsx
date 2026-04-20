import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, X } from 'lucide-react-native';
import { colors } from '../theme/colors';

export interface UsageCriticalModalProps {
  visible: boolean;
  label: string;
  used: number;
  limit: number;
  percentage: number;
  onDismiss: () => void;
  onUpgrade: () => void;
}

export const UsageCriticalModal: React.FC<UsageCriticalModalProps> = ({
  visible,
  label,
  used,
  limit,
  percentage,
  onDismiss,
  onUpgrade,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <SafeAreaView style={styles.overlay}>
        <View style={styles.container}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
            <X size={24} color={colors.text.muted} />
          </TouchableOpacity>

          {/* Alert icon */}
          <View style={styles.iconContainer}>
            <AlertTriangle size={48} color="#ff3333" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Limite presque atteinte</Text>

          {/* Message */}
          <Text style={styles.message}>
            Vous avez utilisé <Text style={styles.highlight}>{percentage}%</Text> de
            vos {label?.toLowerCase()} autorisés
          </Text>

          {/* Usage summary */}
          <View style={styles.usageSummary}>
            <Text style={styles.usageText}>
              Utilisation actuellement : <Text style={styles.usageHighlight}>{used}/{limit}</Text>
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Info text */}
          <Text style={styles.infoText}>
            Pour continuer à générer contenu, veuillez passer à un plan supérieur.
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onDismiss}>
              <Text style={styles.secondaryButtonText}>Plus tard</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={onUpgrade}>
              <Text style={styles.primaryButtonText}>Upgrader mon plan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#0f1722',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  iconContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ff3333',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  highlight: {
    fontWeight: '800',
    color: '#ff3333',
  },
  usageSummary: {
    backgroundColor: 'rgba(255, 51, 51, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#ff3333',
  },
  usageText: {
    fontSize: 14,
    color: colors.text.primary,
    textAlign: 'center',
  },
  usageHighlight: {
    fontWeight: '700',
    color: '#ff3333',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    width: '100%',
    marginVertical: 16,
  },
  infoText: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#1e9bff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
