import { useMemo } from 'react';
import { useSupporterStats } from './useSupporterStats';

export const useUserTier = (userId) => {
  const stats = useSupporterStats(userId);

  return useMemo(
    () => ({
      tier: stats.tier,
      score: stats.scoreCop,
      progressToNextTier: stats.progressPercent,
      totalDonated: stats.totalDonatedCop,
      monthsSubscribed: stats.monthsSubscribed,
      nextTierKey: stats.nextTierKey,
      remainingToNext: stats.remainingToNextCop,
      loading: stats.loading,
      error: stats.error,
      refresh: stats.refresh,
    }),
    [stats]
  );
};

export default useUserTier;
