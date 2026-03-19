import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar } from 'lucide-react-native';
import { colors } from '../../theme/colors';

const NEON_BLUE = '#00d4ff';

interface ManagementCardProps {
  subscriptionStatus: string | undefined;
  subscriptionEndDate: string | undefined;
  planName: string;
}

export function ManagementCard({ subscriptionStatus, subscriptionEndDate, planName }: ManagementCardProps) {
  const isActive = ['active', 'trialing', 'trial'].includes(subscriptionStatus || '');
  const isCanceled = subscriptionStatus === 'canceled';

  return (
    <View style={s.managementCard}>
      <LinearGradient colors={['rgba(0,212,255,0.06)', 'transparent']} style={StyleSheet.absoluteFill} />
      <View style={s.managementHeader}>
        <View style={s.statusBadge}>
          <View style={[s.statusDot, {
            backgroundColor: isActive ? '#10b981' : '#f59e0b',
          }]} />
          <Text style={s.statusText}>
            {isActive ? 'Plan Actif' : (isCanceled ? "Annulé (actif jusqu'à fin cycle)" : 'En attente')}
          </Text>
        </View>
        <Text style={s.currentPlanTitle}>
          {planName}
        </Text>
      </View>
      <View style={s.managementRow}>
        <Calendar size={16} color={colors.text.muted} />
        <Text style={s.managementLabel}>
          {isCanceled ? 'Expire le' : 'Prochain renouvellement'}
        </Text>
        <Text style={s.managementValue}>
          {subscriptionEndDate
            ? new Date(subscriptionEndDate).toLocaleDateString('fr-FR')
            : 'Non défini'}
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  managementCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.12)',
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(15,23,42,0.6)',
  },
  managementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: 'Arimo-Bold',
    fontSize: 11,
    color: colors.text.secondary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  currentPlanTitle: {
    fontFamily: 'Brittany-Signature',
    fontSize: 22,
    color: '#fff',
    textShadowColor: NEON_BLUE,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    paddingLeft: 4,
  },
  managementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  managementLabel: {
    fontFamily: 'Arimo-Regular',
    fontSize: 14,
    color: colors.text.muted,
    flex: 1,
  },
  managementValue: {
    fontFamily: 'Arimo-Bold',
    fontSize: 14,
    color: '#ffffff',
  },
});
