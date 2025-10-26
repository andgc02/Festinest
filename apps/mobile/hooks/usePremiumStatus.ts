import { useCallback, useEffect, useState } from 'react';

import { PremiumStatusValue, fetchPremiumEntitlement } from '@/services/premium';

export type PremiumStatus = PremiumStatusValue;

export function usePremiumStatus(userId?: string) {
  const [status, setStatus] = useState<PremiumStatus>('inactive');
  const [loading, setLoading] = useState(Boolean(userId));

  const refresh = useCallback(async () => {
    if (!userId) {
      setStatus('inactive');
      setLoading(false);
      return 'inactive' as PremiumStatus;
    }
    setLoading(true);
    try {
      const entitlement = await fetchPremiumEntitlement(userId);
      setStatus(entitlement.status);
      return entitlement.status;
    } catch (error) {
      console.warn('Unable to refresh premium status', error);
      setStatus('inactive');
      return 'inactive' as PremiumStatus;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const isPremium = status === 'active' || status === 'preview';

  return { status, loading, isPremium, refresh };
}
