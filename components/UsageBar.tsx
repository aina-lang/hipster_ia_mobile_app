import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { api } from '../api/client';

interface Credits {
  promptsLimit: number;
  imagesLimit: number;
  videosLimit: number;
  audioLimit: number;
  planType?: string;
}

interface UsageBarProps {
  promptsUsed?: number;
  imagesUsed?: number;
  videosUsed?: number;
  audioUsed?: number;
  onRefresh?: () => void;
}

export const UsageBar: React.FC<UsageBarProps> = ({
  promptsUsed = 0,
  imagesUsed = 0,
  videosUsed = 0,
  audioUsed = 0,
  onRefresh,
}) => {
  const [credits, setCredits] = useState<Credits | null>(null);
  const [used, setUsed] = useState({
    promptsUsed,
    imagesUsed,
    videosUsed,
    audioUsed,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      console.log('[UsageBar] Fetching credits from /ai/payment/credits...');
      const resp = await api.get('/ai/payment/credits');
      console.log('[UsageBar] Credits response:', resp.data);
      // Backend wraps responses as { status, statusCode, message, data }
      const data = resp.data?.data ?? resp.data;
      setCredits({
        promptsLimit: data.promptsLimit || 0,
        imagesLimit: data.imagesLimit || 0,
        videosLimit: data.videosLimit || 0,
        audioLimit: data.audioLimit || 0,
        planType: data.planType || 'curieux',
      });
      setUsed({
        promptsUsed: data.promptsUsed || 0,
        imagesUsed: data.imagesUsed || 0,
        videosUsed: data.videosUsed || 0,
        audioUsed: data.audioUsed || 0,
      });
    } catch (error: any) {
      console.error('[UsageBar] Error fetching credits:', error?.response?.status, error?.message);
      console.error('[UsageBar] Full error:', error);
      setError(error?.response?.data?.message || error?.message || 'Erreur lors du chargement des limites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  // If still loading or credits not loaded, show spinner / message
  if (loading || !credits) {
    return (
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary.main} />
        ) : error ? (
          <Text style={{ color: 'red', fontSize: 12 }}>
            Erreur: {error}
          </Text>
        ) : (
          <Text style={{ color: colors.text.muted, fontSize: 12 }}>
            Pas de données disponibles
          </Text>
        )}
      </View>
    );
  }

  // If all limits are zero (no plan/credits), show a hint instead of empty bars
  const allZero = credits.promptsLimit === 0 && credits.imagesLimit === 0 && credits.videosLimit === 0 && credits.audioLimit === 0;
  if (allZero) {
    return (
      <View style={styles.container}>
        <Text style={{ color: colors.text.muted, fontSize: 12 }}>
          Aucun crédit actif — confirmez votre abonnement pour voir vos limites.
        </Text>
      </View>
    );
  }

  // Determine period label based on plan
  const isPeriodDaily = credits.planType?.toLowerCase?.() === 'curieux' || credits.planType === 'curieux';
  const periodLabel = isPeriodDaily ? '/jour' : '/mois';

  const getProgressColor = (used: number, limit: number): string => {
    if (limit === 0) return colors.text.muted; // Plan doesn't include this
    const percentage = (used / limit) * 100;
    if (percentage > 90) return '#ff3333'; // Red - almost full
    if (percentage > 70) return '#ffaa33'; // Orange - getting full
    return colors.primary.main; // Green - ok
  };

  const UsageRow = ({
    label,
    used,
    limit,
  }: {
    label: string;
    used: number;
    limit: number;
  }) => {
    // Handle unlimited limit (999999)
    if (limit >= 999999) {
      return (
        <View style={styles.usageRow}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.count}>Illimité</Text>
          </View>
        </View>
      );
    }

    if (limit === 0) return null; // Don't show if not included in plan

    const percentage = Math.min((used / limit) * 100, 100);
    const isAlmostFull = percentage > 90;

    return (
      <View style={styles.usageRow}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          <Text style={[styles.count, isAlmostFull && styles.countWarning]}>
            {used}/{limit} utilisés {periodLabel}
          </Text>
        </View>
        <View style={styles.barContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${percentage}%`,
                backgroundColor: getProgressColor(used, limit),
              },
            ]}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Votre usage {isPeriodDaily ? "aujourd'hui" : "ce mois-ci"}</Text>
      </View>

      <UsageRow label="Textes" used={used.promptsUsed} limit={credits.promptsLimit} />
      <UsageRow label="Images" used={used.imagesUsed} limit={credits.imagesLimit} />
      <UsageRow label="Vidéos" used={used.videosUsed} limit={credits.videosLimit} />
      <UsageRow label="Audio" used={used.audioUsed} limit={credits.audioLimit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    letterSpacing: 0.5,
  },
  usageRow: {
    marginBottom: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: '500',
  },
  count: {
    fontSize: 11,
    color: colors.text.muted,
    fontWeight: '500',
  },
  countWarning: {
    color: '#ff3333',
  },
  barContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});
