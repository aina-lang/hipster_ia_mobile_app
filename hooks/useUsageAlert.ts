import { useCallback, useEffect, useRef } from 'react';

export interface UsageData {
  label: string;
  used: number;
  limit: number;
}

export interface AlertThreshold {
  toast: number; // 80%
  modal: number; // 95%
}

export interface UsageAlert {
  type: 'warning' | 'critical'; // 'warning' for toast (80%), 'critical' for modal (95%)
  label: string;
  percentage: number;
  used: number;
  limit: number;
  message: string;
}

const THRESHOLDS: AlertThreshold = {
  toast: 80,
  modal: 95,
};

export const useUsageAlert = (usageData: UsageData[]) => {
  const shownAlertsRef = useRef<Set<string>>(new Set());

  const getAllerts = useCallback((): UsageAlert[] => {
    const alerts: UsageAlert[] = [];

    usageData.forEach(({ label, used, limit }) => {
      // Skip if no limit (unlimited or not included)
      if (limit === 0 || limit >= 999999) return;

      const percentage = Math.round((used / limit) * 100);

      // Check for critical alert (95%)
      if (percentage >= THRESHOLDS.modal) {
        const alertId = `${label}-critical`;
        if (!shownAlertsRef.current.has(alertId)) {
          alerts.push({
            type: 'critical',
            label,
            percentage,
            used,
            limit,
            message: `Vous avez utilisé ${percentage}% de vos ${label?.toLowerCase()} (${used}/${limit})`,
          });
          shownAlertsRef.current.add(alertId);
        }
      }
      // Check for warning alert (80%)
      else if (percentage >= THRESHOLDS.toast) {
        const alertId = `${label}-warning`;
        if (!shownAlertsRef.current.has(alertId)) {
          alerts.push({
            type: 'warning',
            label,
            percentage,
            used,
            limit,
            message: `Attention : Vous avez utilisé ${percentage}% de vos ${label?.toLowerCase()} (${used}/${limit})`,
          });
          shownAlertsRef.current.add(alertId);
        }
      }
    });

    return alerts;
  }, [usageData]);

  const clearAlerts = useCallback((alertIds: string[]) => {
    alertIds.forEach((id) => {
      shownAlertsRef.current.delete(id);
    });
  }, []);

  return {
    getAlerts: getAllerts,
    clearAlerts,
  };
};
