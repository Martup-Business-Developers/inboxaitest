"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { Label, Radio, RadioGroup } from "@headlessui/react";
import { CheckIcon, CreditCardIcon, SparklesIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { capitalCase } from "capital-case";
import Link from "next/link";
import clsx from "clsx";
import { env } from "@/env";
import { LoadingContent } from "@/components/LoadingContent";
import { usePremium } from "@/components/PremiumAlert";
import { Button } from "@/components/Button";
import { Button as ShadcnButton } from "@/components/ui/button";
import { getUserTier, isPremiumExpired } from "@/utils/premium";
import {
  frequencies,
  sevenDayPassTier,
  businessSingleTier,
} from "@/app/(app)/premium/config";
import { AlertWithButton } from "@/components/Alert";
import { usePricingVariant } from "@/hooks/useFeatureFlags";
import { PremiumTier } from "@prisma/client";
import { switchPremiumPlanAction } from "@/utils/actions/premium";
import { isActionError } from "@/utils/error";

function attachUserInfo(
  url: string,
  user: { id: string; email: string; name?: string | null },
) {
  if (!user) return url;

  return `${url}?checkout[custom][user_id]=${user.id}&checkout[email]=${user.email}&checkout[name]=${user.name}`;
}

function useAffiliateCode() {
  const searchParams = useSearchParams();
  const affiliateCode = searchParams.get("aff");
  return affiliateCode;
}

function buildLemonUrl(url: string, affiliateCode: string | null) {
  if (!affiliateCode) return url;
  const newUrl = `${url}?aff_ref=${affiliateCode}`;
  return newUrl;
}

export function Pricing(props: { header?: React.ReactNode }) {
  const { isPremium, data, isLoading, error } = usePremium();
  const session = useSession();
  const pricingVariant = usePricingVariant();

  const [frequency, setFrequency] = useState(frequencies[1]);

  const affiliateCode = useAffiliateCode();
  const premiumTier = getUserTier(data?.premium);
  const isExpired = isPremiumExpired(data?.premium);

  const header = props.header || (
    <div className="mb-12">
      <div className="mx-auto max-w-2xl text-center lg:max-w-4xl">
        <h2 className="font-cal text-base leading-7 text-blue-600">Pricing</h2>
        <p className="mt-2 font-cal text-4xl text-gray-900 sm:text-5xl">
          Try for free, affordable paid plans
        </p>
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
        No hidden fees. Cancel anytime.
      </p>
    </div>
  );

  function getLayoutComponents() {
    const isBasicTier =
      premiumTier === PremiumTier.BASIC_MONTHLY ||
      premiumTier === PremiumTier.BASIC_ANNUALLY ||
      premiumTier === PremiumTier.SEVEN_DAY_PASS;

    if (pricingVariant === "business-only" && !isBasicTier)
      return {
        Layout: OneColLayout,
        Item: OneColItem,
        tiers: [businessSingleTier],
      };
    if (pricingVariant === "basic-business" || isBasicTier)
      return {
        Layout: TwoColLayout,
        Item: TwoColItem,
        tiers: [sevenDayPassTier, businessSingleTier], // Example tiers
      };
    // control
    return {
      Layout: ThreeColLayout,
      Item: ThreeColItem,
      tiers: [sevenDayPassTier, businessSingleTier], // Adjust tiers as needed
    };
  }

  const { Layout, Item, tiers } = getLayoutComponents();

  return (
    <LoadingContent loading={isLoading} error={error}>
      <div
        id="pricing"
        className="relative isolate mx-auto max-w-7xl bg-white px-6 pt-10 lg:px-8"
      >
        {header}

        {isPremium && (
          <div className="mb-8 mt-8 text-center">
            <Button
              link={{
                href: `https://${env.NEXT_PUBLIC_LEMON_STORE_ID}.lemonsqueezy.com/billing`,
                target: "_blank",
              }}
            >
              <CreditCardIcon className="mr-2 h-4 w-4" />
              Manage subscription
            </Button>

            <Button link={{ href: "/automation" }} color="blue">
              <SparklesIcon className="mr-2 h-4 w-4" />
              Use Mailto Live
            </Button>

            {premiumTier && (
              <div className="mx-auto mt-4 max-w-md">
                <AlertWithButton
                  variant="blue"
                  title="Add extra users to your account!"
                  description="With this plan, you can add 3 additional emails."
                  icon={null}
                  button={
                    <div className="ml-4 whitespace-nowrap">
                      <ShadcnButton asChild variant="blue">
                        <Link href="/settings#manage-users">Add users</Link>
                      </ShadcnButton>
                    </div>
                  }
                />
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-center">
          <RadioGroup
            value={frequency}
            onChange={setFrequency}
            className="grid grid-cols-2 gap-x-1 rounded-full p-1 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200"
          >
            <Label className="sr-only">Payment frequency</Label>
            {frequencies.map((option) => (
              <Radio
                key={option.value}
                value={option}
                className={({ checked }) =>
                  clsx(
                    checked ? "bg-black text-white" : "text-gray-500",
                    "cursor-pointer rounded-full px-2.5 py-1",
                  )
                }
              >
                <span>{option.label}</span>
              </Radio>
            ))}
          </RadioGroup>

          {frequency.value === "annually" && (
            <div className="ml-1">
              <Badge>Save 58%</Badge>
            </div>
          )}
        </div>

        <Layout className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-y-8">
          {tiers.map((tier, tierIdx) => {
            const isCurrentPlan =
              !isExpired && tier.tiers[frequency.value] === premiumTier;

            const user = session.data?.user;

            function getHref(): string {
              if (!user) return "/login?next=/premium";

              if (isCurrentPlan) return "#";

              if (tier.ctaLink) return tier.ctaLink;

              return buildLemonUrl(
                attachUserInfo(tier.href[frequency.value], {
                  id: user.id,
                  email: user.email!,
                  name: user.name,
                }),
                affiliateCode,
              );
            }

            const href = getHref();

            return (
              <Item
                key={tier.name}
                className="rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10"
                index={tierIdx}
                frequency={frequency}
              >
                <div>
                  <div className="flex items-center justify-between gap-x-4">
                    <h3
                      id={tier.name}
                      className={clsx(
                        tier.mostPopular ? "text-blue-600" : "text-gray-900",
                        "font-cal text-lg leading-8",
                      )}
                    >
                      {tier.name}
                    </h3>
                    {tier.mostPopular ? <Badge>Most popular</Badge> : null}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-gray-600">
                    {tier.description}
                  </p>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-gray-900">
                      ${tier.price[frequency.value]}
                    </span>
                    <span className="text-sm font-semibold leading-6 text-gray-600">
                      {frequency.priceSuffix(tier.tiers[frequency.value])}
                    </span>

                    {!!tier.discount?.[frequency.value] && (
                      <Badge>
                        <span className="tracking-wide">
                          SAVE {tier.discount[frequency.value].toFixed(0)}%
                        </span>
                      </Badge>
                    )}
                  </p>

                  {frequency.value === "annually" &&
                    tier.name !== "7-Day Pass" && (
                      <p className="mt-2 text-sm leading-6 text-gray-500">
                        Billed at $59/year
                      </p>
                    )}

                  {tier.priceAdditional ? (
                    <p className="mt-3 text-sm leading-6 text-gray-500">
                      This plan allows you to add +3 extra email accounts.
                    </p>
                  ) : (
                    <div className="mt-16" />
                  )}
                  <ul className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3">
                        <CheckIcon
                          className="h-6 w-5 flex-none text-blue-600"
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={!premiumTier ? href : "#"}
                  onClick={() => {
                    if (premiumTier) {
                      toast.promise(
                        async () => {
                          const result = await switchPremiumPlanAction(
                            tier.tiers[frequency.value],
                          );
                          if (isActionError(result))
                            throw new Error(result.error);
                        },
                        {
                          loading: "Switching to plan...",
                          success: "Switched to plan",
                          error: (e) =>
                            `There was an error switching to plan: ${e.message}`,
                        },
                      );
                    }
                  }}
                  target={
                    !premiumTier && href.startsWith("http")
                      ? "_blank"
                      : undefined
                  }
                  aria-describedby={tier.name}
                  className={clsx(
                    tier.mostPopular
                      ? "bg-blue-600 text-white shadow-sm hover:bg-blue-500"
                      : "text-blue-600 ring-1 ring-inset ring-blue-200 hover:ring-blue-300",
                    "mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
                  )}
                >
                  {isCurrentPlan
                    ? "Current plan"
                    : premiumTier
                      ? "Switch to this plan"
                      : tier.cta}
                </a>
              </Item>
            );
          })}
        </Layout>
      </div>
    </LoadingContent>
  );
}

type ItemProps = {
  children: React.ReactNode;
  className?: string;
  index: number;
  frequency: {
    value: "monthly" | "annually";
    label: string;
    priceSuffix: (tier: PremiumTier) => "" | "/month" | "/year";
  };
};

const ThreeColLayout: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className }) => {
  return (
    <div className={clsx("lg:mx-0 lg:max-w-none lg:grid-cols-3", className)}>
      {children}
    </div>
  );
};

const TwoColLayout: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className }) => {
  return (
    <div className={clsx("gap-x-4 lg:max-w-4xl lg:grid-cols-2", className)}>
      {children}
    </div>
  );
};

const OneColLayout: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

const ThreeColItem: React.FC<ItemProps> = ({
  children,
  className,
  index,
  frequency,
}) => {
  return (
    <div
      className={clsx(
        index === 1 ? "lg:z-10 lg:rounded-b-none" : "lg:mt-8", // middle tier
        index === 0 ? "lg:rounded-r-none" : "",
        index === 2 ? "lg:rounded-l-none" : "",
        className,
      )}
    >
      {children}
    </div>
  );
};

const TwoColItem: React.FC<ItemProps> = ({
  children,
  className,
  index,
  frequency,
}) => {
  return (
    <div className={clsx("flex flex-col justify-between", className)}>
      {children}
    </div>
  );
};

const OneColItem: React.FC<ItemProps> = ({
  children,
  className,
  index,
  frequency,
}) => {
  return <div className={className}>{children}</div>;
};

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-blue-600/10 px-2.5 py-1 text-xs font-semibold leading-5 text-blue-600">
      {children}
    </span>
  );
}

// $3 => $3
// $3.5 => $3.50
function formatPrice(price: number) {
  if (price - Math.floor(price) > 0) return price.toFixed(2);
  return price;
}
