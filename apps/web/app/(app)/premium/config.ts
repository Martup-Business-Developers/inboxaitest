import { env } from "@/env";
import { PremiumTier } from "@prisma/client";

type Tier = {
  name: string;
  tiers: { monthly: PremiumTier; annually: PremiumTier };
  href: { monthly: string; annually: string };
  price: { monthly: number; annually: number };
  priceAdditional: { monthly: number; annually: number };
  discount: { monthly: number; annually: number };
  description: string;
  features: string[];
  cta: string;
  ctaLink?: string;
  mostPopular?: boolean;
  duration?: string;
  getDisplayedPrice: (frequency: "monthly" | "annually") => number;
  getEquivalentMonthlyPrice: (frequency: "monthly" | "annually") => number;
};

const getFrequencySuffix = (
  tier: PremiumTier,
  frequency: "monthly" | "annually",
) => {
  if (tier === PremiumTier.SEVEN_DAY_PASS) {
    return ""; // No suffix for 7-Day Pass
  }
  return frequency === "monthly" ? "/month" : "/month";
};

export const frequencies = [
  {
    value: "monthly" as const,
    label: "Monthly",
    priceSuffix: (tier: PremiumTier) => getFrequencySuffix(tier, "monthly"),
  },
  {
    value: "annually" as const,
    label: "Annually",
    priceSuffix: (tier: PremiumTier) => getFrequencySuffix(tier, "annually"),
  },
];

const pricing: Record<PremiumTier, number> = {
  [PremiumTier.BASIC_MONTHLY]: 12,
  [PremiumTier.BASIC_ANNUALLY]: 5,
  [PremiumTier.PRO_MONTHLY]: 12,
  [PremiumTier.PRO_ANNUALLY]: 5,
  [PremiumTier.BUSINESS_MONTHLY]: 12,
  [PremiumTier.BUSINESS_ANNUALLY]: 5,
  [PremiumTier.COPILOT_MONTHLY]: 499,
  [PremiumTier.LIFETIME]: 299,
  [PremiumTier.SEVEN_DAY_PASS]: 7,
};

const pricingAdditonalEmail: Record<PremiumTier, number> = {
  [PremiumTier.BASIC_MONTHLY]: 6,
  [PremiumTier.BASIC_ANNUALLY]: 4,
  [PremiumTier.PRO_MONTHLY]: 6,
  [PremiumTier.PRO_ANNUALLY]: 4,
  [PremiumTier.BUSINESS_MONTHLY]: 12,
  [PremiumTier.BUSINESS_ANNUALLY]: 96,
  [PremiumTier.COPILOT_MONTHLY]: 0,
  [PremiumTier.LIFETIME]: 99,
};

const variantIdToTier: Record<number, PremiumTier> = {
  [env.NEXT_PUBLIC_BASIC_MONTHLY_VARIANT_ID]: PremiumTier.BASIC_MONTHLY,
  [env.NEXT_PUBLIC_BASIC_ANNUALLY_VARIANT_ID]: PremiumTier.BASIC_ANNUALLY,
  [env.NEXT_PUBLIC_PRO_MONTHLY_VARIANT_ID]: PremiumTier.PRO_MONTHLY,
  [env.NEXT_PUBLIC_PRO_ANNUALLY_VARIANT_ID]: PremiumTier.PRO_ANNUALLY,
  [env.NEXT_PUBLIC_BUSINESS_MONTHLY_VARIANT_ID]: PremiumTier.BUSINESS_MONTHLY,
  [env.NEXT_PUBLIC_BUSINESS_ANNUALLY_VARIANT_ID]: PremiumTier.BUSINESS_ANNUALLY,
  [env.NEXT_PUBLIC_COPILOT_MONTHLY_VARIANT_ID]: PremiumTier.COPILOT_MONTHLY,
  [env.NEXT_PUBLIC_LIFETIME_VARIANT_ID]: PremiumTier.LIFETIME,
  [env.NEXT_PUBLIC_SEVEN_DAY_PASS_VARIANT_ID]: PremiumTier.SEVEN_DAY_PASS,
};

const tierToVariantId: Record<PremiumTier, number> = {
  [PremiumTier.BASIC_MONTHLY]: env.NEXT_PUBLIC_BASIC_MONTHLY_VARIANT_ID,
  [PremiumTier.BASIC_ANNUALLY]: env.NEXT_PUBLIC_BASIC_ANNUALLY_VARIANT_ID,
  [PremiumTier.PRO_MONTHLY]: env.NEXT_PUBLIC_PRO_MONTHLY_VARIANT_ID,
  [PremiumTier.PRO_ANNUALLY]: env.NEXT_PUBLIC_PRO_ANNUALLY_VARIANT_ID,
  [PremiumTier.BUSINESS_MONTHLY]: env.NEXT_PUBLIC_BUSINESS_MONTHLY_VARIANT_ID,
  [PremiumTier.BUSINESS_ANNUALLY]: env.NEXT_PUBLIC_BUSINESS_ANNUALLY_VARIANT_ID,
  [PremiumTier.COPILOT_MONTHLY]: env.NEXT_PUBLIC_COPILOT_MONTHLY_VARIANT_ID,
  [PremiumTier.LIFETIME]: env.NEXT_PUBLIC_LIFETIME_VARIANT_ID,
  [PremiumTier.SEVEN_DAY_PASS]: env.NEXT_PUBLIC_SEVEN_DAY_PASS_VARIANT_ID,
};

function discount(monthly: number, annually: number) {
  return ((monthly - annually) / monthly) * 100;
}

const basicTier: Tier = {
  name: "Basic",
  tiers: {
    monthly: PremiumTier.BASIC_MONTHLY,
    annually: PremiumTier.BASIC_ANNUALLY,
  },
  href: {
    monthly: env.NEXT_PUBLIC_BASIC_MONTHLY_PAYMENT_LINK,
    annually: env.NEXT_PUBLIC_BASIC_ANNUALLY_PAYMENT_LINK,
  },
  price: { monthly: pricing.BASIC_MONTHLY, annually: pricing.BASIC_ANNUALLY },
  priceAdditional: {
    monthly: pricingAdditonalEmail.BASIC_MONTHLY,
    annually: pricingAdditonalEmail.BASIC_ANNUALLY,
  },
  discount: {
    monthly: 0,
    annually: discount(pricing.BASIC_MONTHLY, pricing.BASIC_ANNUALLY),
  },
  description: "Unlimited unsubscribe credits.",
  features: [
    "Bulk email unsubscriber",
    "Unlimited unsubscribes",
    "Unlimited archives",
    "Email analytics",
  ],
  cta: "Try free for 7 days",
  getDisplayedPrice: (frequency) => {
    return pricing[
      frequency === "monthly"
        ? PremiumTier.BASIC_MONTHLY
        : PremiumTier.BASIC_ANNUALLY
    ];
  },
  getEquivalentMonthlyPrice: (frequency) => {
    if (frequency === "annually") {
      return pricing.BASIC_ANNUALLY / 12;
    }
    return pricing.BASIC_MONTHLY;
  },
};

export const businessTierName = "AI Assistant";

const businessTier: Tier = {
  name: businessTierName,
  tiers: {
    monthly: PremiumTier.BUSINESS_MONTHLY,
    annually: PremiumTier.BUSINESS_ANNUALLY,
  },
  href: {
    monthly: env.NEXT_PUBLIC_BUSINESS_MONTHLY_PAYMENT_LINK,
    annually: env.NEXT_PUBLIC_BUSINESS_ANNUALLY_PAYMENT_LINK,
  },
  price: {
    monthly: pricing.BUSINESS_MONTHLY,
    annually: pricing.BUSINESS_ANNUALLY,
  },
  priceAdditional: {
    monthly: pricingAdditonalEmail.BUSINESS_MONTHLY,
    annually: pricingAdditonalEmail.BUSINESS_ANNUALLY,
  },
  discount: {
    monthly: 0,
    annually: discount(pricing.BUSINESS_MONTHLY, pricing.BUSINESS_ANNUALLY),
  },
  description: "Unlock full AI-powered email management",
  features: [
    "Everything in Basic",
    "AI personal assistant",
    "Smart categories",
    "Cold email blocker",
    "Unlimited AI credits",
    "Priority support",
  ],
  cta: "Get Started",
  mostPopular: true,
  getDisplayedPrice: (frequency) => {
    return pricing[
      frequency === "monthly"
        ? PremiumTier.BUSINESS_MONTHLY
        : PremiumTier.BUSINESS_ANNUALLY
    ];
  },
  getEquivalentMonthlyPrice: (frequency) => {
    if (frequency === "annually") {
      return pricing.BUSINESS_ANNUALLY / 12;
    }
    return pricing.BUSINESS_MONTHLY;
  },
};

export const businessSingleTier: Tier = {
  name: businessTierName,
  tiers: {
    monthly: PremiumTier.BUSINESS_MONTHLY,
    annually: PremiumTier.BUSINESS_ANNUALLY,
  },
  href: {
    monthly: env.NEXT_PUBLIC_BUSINESS_MONTHLY_PAYMENT_LINK,
    annually: env.NEXT_PUBLIC_BUSINESS_ANNUALLY_PAYMENT_LINK,
  },
  price: {
    monthly: pricing.BUSINESS_MONTHLY,
    annually: pricing.BUSINESS_ANNUALLY,
  },
  priceAdditional: {
    monthly: pricingAdditonalEmail.BUSINESS_MONTHLY,
    annually: pricingAdditonalEmail.BUSINESS_ANNUALLY,
  },
  discount: {
    monthly: 0,
    annually: discount(pricing.BUSINESS_MONTHLY, pricing.BUSINESS_ANNUALLY),
  },
  description: "Unlock full AI-powered email management",
  features: [
    "AI personal assistant",
    "Cold email blocker",
    "Smart categories",
    "Unlimited AI credits",
    "Bulk email unsubscriber",
    "Email analytics",
    "Priority support",
  ],
  cta: "Get Started",
  mostPopular: true,
  getDisplayedPrice: (frequency) => {
    return pricing[
      frequency === "monthly"
        ? PremiumTier.BUSINESS_MONTHLY
        : PremiumTier.BUSINESS_ANNUALLY
    ];
  },
  getEquivalentMonthlyPrice: (frequency) => {
    if (frequency === "annually") {
      return pricing.BUSINESS_ANNUALLY / 12;
    }
    return pricing.BUSINESS_MONTHLY;
  },
};

const copilotTier: Tier = {
  name: "Co-Pilot",
  tiers: {
    monthly: PremiumTier.COPILOT_MONTHLY,
    annually: PremiumTier.COPILOT_MONTHLY,
  },
  href: {
    monthly: env.NEXT_PUBLIC_COPILOT_MONTHLY_PAYMENT_LINK,
    annually: env.NEXT_PUBLIC_COPILOT_MONTHLY_PAYMENT_LINK,
  },
  price: {
    monthly: pricing.COPILOT_MONTHLY,
    annually: pricing.COPILOT_MONTHLY,
  },
  priceAdditional: {
    monthly: pricingAdditonalEmail.COPILOT_MONTHLY,
    annually: pricingAdditonalEmail.COPILOT_MONTHLY,
  },
  discount: { monthly: 0, annually: 0 },
  description: "Expert human assistant to manage your email",
  features: [
    "Everything in Business",
    "Human assistant to manage your email daily",
    "30-minute 1:1 monthly call",
    "Full refund if not satisfied after first 3 days",
  ],
  cta: "Book a call",
  ctaLink: env.NEXT_PUBLIC_CALL_LINK,
  mostPopular: false,
  getDisplayedPrice: (frequency) => {
    return pricing[
      frequency === "monthly"
        ? PremiumTier.COPILOT_MONTHLY
        : PremiumTier.COPILOT_MONTHLY
    ];
  },
  getEquivalentMonthlyPrice: (frequency) => {
    if (frequency === "annually") {
      return pricing.COPILOT_MONTHLY / 12;
    }
    return pricing.COPILOT_MONTHLY;
  },
};

export const sevenDayPassTier: Tier = {
  name: "7-Day Pass",
  tiers: {
    monthly: PremiumTier.SEVEN_DAY_PASS,
    annually: PremiumTier.SEVEN_DAY_PASS,
  },
  href: {
    monthly: env.NEXT_PUBLIC_SEVEN_DAY_PASS_PAYMENT_LINK,
    annually: env.NEXT_PUBLIC_SEVEN_DAY_PASS_PAYMENT_LINK,
  },
  price: {
    monthly: pricing.SEVEN_DAY_PASS,
    annually: pricing.SEVEN_DAY_PASS,
  },
  priceAdditional: {
    monthly: pricingAdditonalEmail.SEVEN_DAY_PASS,
    annually: pricingAdditonalEmail.SEVEN_DAY_PASS,
  },
  discount: { monthly: 0, annually: 0 },
  description: "Full access for 7 days",
  features: [
    "Everything in Business plan",
    "7 days of full access",
    "No recurring charges",
    "Try all premium features",
    "AI personal assistant",
    "Smart categories",
    "Cold email blocker",
  ],
  cta: "Get 7-Day Pass",
  duration: "7 days",
  getDisplayedPrice: (frequency) => {
    return pricing[
      frequency === "monthly"
        ? PremiumTier.SEVEN_DAY_PASS
        : PremiumTier.SEVEN_DAY_PASS
    ];
  },
  getEquivalentMonthlyPrice: (frequency) => {
    if (frequency === "annually") {
      return pricing.SEVEN_DAY_PASS / 12;
    }
    return pricing.SEVEN_DAY_PASS;
  },
};

export const allTiers: Tier[] = [
  basicTier,
  businessTier,
  copilotTier,
  sevenDayPassTier,
];

export function getSubscriptionTier({
  variantId,
}: {
  variantId: number;
}): PremiumTier {
  const tier = variantIdToTier[variantId];
  if (!tier) throw new Error(`Unknown variant id: ${variantId}`);
  return tier;
}

export function getVariantId({ tier }: { tier: PremiumTier }): number {
  const variantId = tierToVariantId[tier];
  if (!variantId) throw new Error(`Unknown tier: ${tier}`);
  return variantId;
}
