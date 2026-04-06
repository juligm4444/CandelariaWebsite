import { useCallback, useEffect, useMemo, useState } from 'react';
import { hasSupabaseEnv, supabase } from '../lib/supabaseClient';
import {
  SUBSCRIPTION_BONUS_COP,
  calculateScore,
  getTierByScore,
  getTierProgress,
  toUsd,
} from '../lib/supporterTier';

const DEFAULT_STATS = {
  tier: 'visitor',
  scoreCop: 0,
  scoreUsd: 0,
  totalDonatedCop: 0,
  totalDonatedUsd: 0,
  monthsSubscribed: 0,
  progressPercent: 0,
  nextTierKey: 'supporter',
  remainingToNextCop: 0,
  remainingToNextUsd: 0,
};

export const useSupporterStats = (userId) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(DEFAULT_STATS);

  const computeDerived = useCallback((rawStats) => {
    const totalDonatedCop = Number(rawStats?.total_donated || 0);
    const monthsSubscribed = Number(rawStats?.months_subscribed || 0);
    const scoreCop = Number(rawStats?.score ?? calculateScore(totalDonatedCop, monthsSubscribed));
    const tier = rawStats?.current_tier || getTierByScore(scoreCop);
    const progress = getTierProgress(scoreCop, tier);

    return {
      tier,
      scoreCop,
      scoreUsd: toUsd(scoreCop),
      totalDonatedCop,
      totalDonatedUsd: toUsd(totalDonatedCop),
      monthsSubscribed,
      progressPercent: progress.percent,
      nextTierKey: progress.nextTierKey,
      remainingToNextCop: progress.remainingScore,
      remainingToNextUsd: toUsd(progress.remainingScore),
    };
  }, []);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!hasSupabaseEnv || !supabase) {
        setStats(DEFAULT_STATS);
        return;
      }

      let targetUserId = userId;

      if (!targetUserId) {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;
        if (!user) {
          setStats(DEFAULT_STATS);
          return;
        }

        targetUserId = user.id;
      }

      const { data, error: statsError } = await supabase
        .from('supporter_stats')
        .select('total_donated, months_subscribed, current_tier, score')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (statsError) throw statsError;

      setStats(computeDerived(data || {}));
    } catch (err) {
      setError(err);
      setStats(DEFAULT_STATS);
    } finally {
      setLoading(false);
    }
  }, [computeDerived, userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (!hasSupabaseEnv || !supabase || !userId) return undefined;

    const channel = supabase
      .channel(`supporter-stats-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'supporter_stats', filter: `user_id=eq.${userId}` },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStats, userId]);

  const ui = useMemo(
    () => ({
      ...stats,
      subscriptionBonusCop: SUBSCRIPTION_BONUS_COP,
    }),
    [stats]
  );

  return {
    ...ui,
    loading,
    error,
    refresh: fetchStats,
  };
};

export default useSupporterStats;
