import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { UsageToast } from './UsageToast';
import { UsageCriticalModal } from './UsageCriticalModal';
import { useUsageAlert, UsageAlert } from '../hooks/useUsageAlert';

interface UsageAlertManagerProps {
  usageData: Array<{ label: string; used: number; limit: number }>;
  onUpgradePress?: () => void;
}

export const UsageAlertManager: React.FC<UsageAlertManagerProps> = ({
  usageData,
  onUpgradePress,
}) => {
  const { getAlerts } = useUsageAlert(usageData);
  const [toastAlert, setToastAlert] = useState<UsageAlert | null>(null);
  const [criticalAlert, setCriticalAlert] = useState<UsageAlert | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [showCriticalModal, setShowCriticalModal] = useState(false);

  useEffect(() => {
    const alerts = getAlerts();

    // Separate alerts by type
    const warningAlert = alerts.find((a) => a.type === 'warning');
    const criticalAlertItem = alerts.find((a) => a.type === 'critical');

    // Show warning toast
    if (warningAlert && warningAlert !== toastAlert) {
      setToastAlert(warningAlert);
      setShowToast(true);
    }

    // Show critical modal (takes precedence)
    if (criticalAlertItem && criticalAlertItem !== criticalAlert) {
      setCriticalAlert(criticalAlertItem);
      setShowCriticalModal(true);
      setShowToast(false); // Hide toast when critical alert appears
    }
  }, [usageData, getAlerts, toastAlert, criticalAlert]);

  const handleDismissToast = () => {
    setShowToast(false);
  };

  const handleDismissCriticalModal = () => {
    setShowCriticalModal(false);
  };

  const handleUpgrade = () => {
    setShowCriticalModal(false);
    onUpgradePress?.();
  };

  return (
    <View style={{ position: 'relative' }}>
      {toastAlert && (
        <UsageToast
          visible={showToast}
          message={toastAlert.message}
          onDismiss={handleDismissToast}
        />
      )}

      {criticalAlert && (
        <UsageCriticalModal
          visible={showCriticalModal}
          label={criticalAlert.label}
          used={criticalAlert.used}
          limit={criticalAlert.limit}
          percentage={criticalAlert.percentage}
          onDismiss={handleDismissCriticalModal}
          onUpgrade={handleUpgrade}
        />
      )}
    </View>
  );
};
