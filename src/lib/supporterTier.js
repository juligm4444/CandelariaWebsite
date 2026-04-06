export const COP_PER_USD = 4000;
export const SUBSCRIPTION_BONUS_COP = 5000;

export const SUPPORTER_TIERS = [
  { key: 'visitor', minScore: 0 },
  { key: 'supporter', minScore: 1 },
  { key: 'bronze', minScore: 20000 },
  { key: 'silver', minScore: 60000 },
  { key: 'gold', minScore: 150000 },
  { key: 'core', minScore: 300000 },
];

export const toCop = (amount, currency = 'COP') => {
  const numericAmount = Number(amount || 0);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) return 0;

  if (String(currency).toUpperCase() === 'USD') {
    return numericAmount * COP_PER_USD;
  }

  return numericAmount;
};

export const toUsd = (amountCop) => {
  const numericAmount = Number(amountCop || 0);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) return 0;
  return numericAmount / COP_PER_USD;
};

export const calculateScore = (
  totalDonatedCop,
  monthsSubscribed,
  subscriptionBonus = SUBSCRIPTION_BONUS_COP
) => {
  const donated = Number(totalDonatedCop || 0);
  const months = Number(monthsSubscribed || 0);
  return donated + months * subscriptionBonus;
};

export const getTierByScore = (score) => {
  const numericScore = Number(score || 0);

  let currentTier = SUPPORTER_TIERS[0];
  for (const tier of SUPPORTER_TIERS) {
    if (numericScore >= tier.minScore) {
      currentTier = tier;
    }
  }

  return currentTier.key;
};

export const getNextTier = (tierKey) => {
  const index = SUPPORTER_TIERS.findIndex((tier) => tier.key === tierKey);
  if (index < 0 || index === SUPPORTER_TIERS.length - 1) return null;
  return SUPPORTER_TIERS[index + 1];
};

export const getTierProgress = (score, tierKey) => {
  const numericScore = Number(score || 0);
  const current = SUPPORTER_TIERS.find((tier) => tier.key === tierKey) || SUPPORTER_TIERS[0];
  const next = getNextTier(current.key);

  if (!next) {
    return {
      percent: 100,
      nextTierKey: null,
      remainingScore: 0,
      nextTierTarget: current.minScore,
    };
  }

  const span = Math.max(1, next.minScore - current.minScore);
  const raw = ((numericScore - current.minScore) / span) * 100;

  return {
    percent: Math.max(0, Math.min(100, raw)),
    nextTierKey: next.key,
    remainingScore: Math.max(0, next.minScore - numericScore),
    nextTierTarget: next.minScore,
  };
};

export const formatUsd = (amount, locale = 'en-US') => {
  const numericAmount = Number(amount || 0);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(numericAmount);
};
