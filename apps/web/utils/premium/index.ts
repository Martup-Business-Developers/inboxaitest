import { FeatureAccess, type Premium, PremiumTier } from "@prisma/client";

// Determines if the user is currently a premium user
export const isPremium = (lemonSqueezyRenewsAt: Date | null): boolean => {
  return !!lemonSqueezyRenewsAt && new Date(lemonSqueezyRenewsAt) > new Date();
};

// Deprecated: Legacy plan determination logic for older users
const getUserPlan = (
  lemonSqueezyRenewsAt?: Date | null,
): PremiumTier | null => {
  if (!lemonSqueezyRenewsAt) return null;

  const renewsAt = new Date(lemonSqueezyRenewsAt);
  const currentDate = new Date();

  // Check for a 7-day pass
  if (
    renewsAt > currentDate &&
    renewsAt <= new Date(currentDate.setDate(currentDate.getDate() + 7))
  ) {
    return PremiumTier.SEVEN_DAY_PASS;
  }

  // Check for a lifetime plan
  if (renewsAt.getFullYear() - currentDate.getFullYear() >= 5)
    return PremiumTier.LIFETIME;

  // Check for annual plan
  if (renewsAt > new Date(new Date().setMonth(new Date().getMonth() + 6)))
    return PremiumTier.BUSINESS_ANNUALLY;

  // Monthly plan as fallback
  return PremiumTier.BUSINESS_MONTHLY;
};

// Get the user's current premium tier
export const getUserTier = (
  premium?: Pick<Premium, "tier" | "lemonSqueezyRenewsAt"> | null,
) => {
  return premium?.tier || getUserPlan(premium?.lemonSqueezyRenewsAt);
};

// Check if the premium subscription has expired
export const isPremiumExpired = (
  premium?: Pick<Premium, "lemonSqueezyRenewsAt"> | null,
) => {
  return (
    !!premium?.lemonSqueezyRenewsAt && premium.lemonSqueezyRenewsAt < new Date()
  );
};

// Check if the user is an admin for premium features
export const isAdminForPremium = (
  premiumAdmins: { id: string }[],
  userId?: string,
) => {
  if (!userId) return false;
  if (!premiumAdmins.length) return true; // If no admins are set, skip the check
  return premiumAdmins.some((admin) => admin.id === userId);
};

// Check if the user has access to unsubscribe features
export const hasUnsubscribeAccess = (
  bulkUnsubscribeAccess?: FeatureAccess | null,
  unsubscribeCredits?: number | null,
): boolean => {
  if (
    bulkUnsubscribeAccess === FeatureAccess.UNLOCKED ||
    bulkUnsubscribeAccess === FeatureAccess.UNLOCKED_WITH_API_KEY
  ) {
    return true;
  }
  return unsubscribeCredits !== 0;
};

// Check if the user has AI access
export const hasAiAccess = (
  aiAutomationAccess?: FeatureAccess | null,
  aiApiKey?: string | null,
) => {
  return !!(
    aiAutomationAccess === FeatureAccess.UNLOCKED ||
    (aiAutomationAccess === FeatureAccess.UNLOCKED_WITH_API_KEY && aiApiKey)
  );
};

// Check if the user has cold email access
export const hasColdEmailAccess = (
  coldEmailBlockerAccess?: FeatureAccess | null,
  aiApiKey?: string | null,
) => {
  return !!(
    coldEmailBlockerAccess === FeatureAccess.UNLOCKED ||
    (coldEmailBlockerAccess === FeatureAccess.UNLOCKED_WITH_API_KEY && aiApiKey)
  );
};

// Check if a user's tier is higher than another tier
export function isOnHigherTier(
  tier1?: PremiumTier | null,
  tier2?: PremiumTier | null,
) {
  const tierRanking = {
    [PremiumTier.BASIC_MONTHLY]: 1,
    [PremiumTier.BASIC_ANNUALLY]: 2,
    [PremiumTier.PRO_MONTHLY]: 3,
    [PremiumTier.PRO_ANNUALLY]: 4,
    [PremiumTier.BUSINESS_MONTHLY]: 5,
    [PremiumTier.BUSINESS_ANNUALLY]: 6,
    [PremiumTier.COPILOT_MONTHLY]: 7,
    [PremiumTier.LIFETIME]: 8,
    [PremiumTier.SEVEN_DAY_PASS]: 9, // Highest priority for now
  };

  const tier1Rank = tier1 ? tierRanking[tier1] : 0;
  const tier2Rank = tier2 ? tierRanking[tier2] : 0;

  return tier1Rank > tier2Rank;
}
