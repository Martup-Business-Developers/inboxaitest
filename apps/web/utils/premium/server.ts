import prisma from "@/utils/prisma";
import { FeatureAccess, PremiumTier } from "@prisma/client";

const TEN_YEARS = 10 * 365 * 24 * 60 * 60 * 1000;

export async function upgradeToPremium(options: {
  userId: string;
  tier: PremiumTier;
  lemonSqueezyRenewsAt: Date | null;
  lemonSqueezySubscriptionId: number | null;
  lemonSqueezySubscriptionItemId: number | null;
  lemonSqueezyOrderId: number | null;
  lemonSqueezyCustomerId: number | null;
  lemonSqueezyProductId: number | null;
  lemonSqueezyVariantId: number | null;
  lemonLicenseKey?: string;
  lemonLicenseInstanceId?: string;
  emailAccountsAccess?: number;
}) {
  const { userId, ...rest } = options;

  let lemonSqueezyRenewsAt: Date | null;

  if (options.tier === PremiumTier.LIFETIME) {
    lemonSqueezyRenewsAt = new Date(Date.now() + TEN_YEARS);
  } else if (options.tier === PremiumTier.SEVEN_DAY_PASS) {
    lemonSqueezyRenewsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  } else {
    lemonSqueezyRenewsAt = options.lemonSqueezyRenewsAt;
  }

  const user = await prisma.user.findUnique({
    where: { id: options.userId },
    select: { premiumId: true },
  });

  if (!user) throw new Error(`User not found for id ${options.userId}`);

  const data = {
    ...rest,
    lemonSqueezyRenewsAt,
    ...getTierAccess(options.tier),
  };

  if (user.premiumId) {
    return await prisma.premium.update({
      where: { id: user.premiumId },
      data,
      select: { users: { select: { email: true } } },
    });
  } else {
    return await prisma.premium.create({
      data: {
        users: { connect: { id: options.userId } },
        admins: { connect: { id: options.userId } },
        ...data,
      },
      select: { users: { select: { email: true } } },
    });
  }
}

export async function extendPremium(options: {
  premiumId: string;
  lemonSqueezyRenewsAt: Date;
}) {
  return await prisma.premium.update({
    where: { id: options.premiumId },
    data: {
      lemonSqueezyRenewsAt: options.lemonSqueezyRenewsAt,
    },
    select: {
      users: {
        select: { email: true },
      },
    },
  });
}

export async function cancelPremium({
  premiumId,
  lemonSqueezyEndsAt,
  variantId,
  expired,
}: {
  premiumId: string;
  lemonSqueezyEndsAt: Date;
  variantId?: number;
  expired: boolean;
}) {
  if (variantId) {
    const premium = await prisma.premium.findUnique({
      where: { id: premiumId, lemonSqueezyVariantId: variantId },
      select: { id: true },
    });
    if (!premium) return null;
  }

  return await prisma.premium.update({
    where: { id: premiumId },
    data: {
      lemonSqueezyRenewsAt: lemonSqueezyEndsAt,
      bulkUnsubscribeAccess: FeatureAccess.LOCKED,
      aiAutomationAccess: FeatureAccess.LOCKED,
      coldEmailBlockerAccess: FeatureAccess.LOCKED,
      emailAccountsAccess: 3, // Optionally lock email access
    },
    select: {
      users: {
        select: { email: true },
      },
    },
  });
}

export async function editEmailAccountsAccess(options: {
  premiumId: string;
  count: number;
}) {
  const { count } = options;
  if (!count) return;

  return await prisma.premium.update({
    where: { id: options.premiumId },
    data: {
      emailAccountsAccess:
        count > 0 ? { increment: count } : { decrement: count },
    },
    select: {
      users: {
        select: { email: true },
      },
    },
  });
}

function getTierAccess(tier: PremiumTier | null) {
  switch (tier) {
    case PremiumTier.BASIC_MONTHLY:
    case PremiumTier.BASIC_ANNUALLY:
      return {
        bulkUnsubscribeAccess: FeatureAccess.UNLOCKED,
        aiAutomationAccess: FeatureAccess.LOCKED,
        coldEmailBlockerAccess: FeatureAccess.LOCKED,
      };
    case PremiumTier.PRO_MONTHLY:
    case PremiumTier.PRO_ANNUALLY:
      return {
        bulkUnsubscribeAccess: FeatureAccess.UNLOCKED,
        aiAutomationAccess: FeatureAccess.UNLOCKED_WITH_API_KEY,
        coldEmailBlockerAccess: FeatureAccess.UNLOCKED_WITH_API_KEY,
      };
    case PremiumTier.BUSINESS_MONTHLY:
    case PremiumTier.BUSINESS_ANNUALLY:
    case PremiumTier.LIFETIME:
    case PremiumTier.SEVEN_DAY_PASS:
      return {
        bulkUnsubscribeAccess: FeatureAccess.UNLOCKED,
        aiAutomationAccess: FeatureAccess.UNLOCKED,
        coldEmailBlockerAccess: FeatureAccess.UNLOCKED,
      };
    default:
      // Default to locked for all features when no plan is present
      return {
        bulkUnsubscribeAccess: FeatureAccess.UNLOCKED_WITH_API_KEY,
        aiAutomationAccess: FeatureAccess.UNLOCKED_WITH_API_KEY,
        coldEmailBlockerAccess: FeatureAccess.UNLOCKED_WITH_API_KEY,
      };
  }
}
