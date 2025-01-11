import React from "react";
import { CTAButtons } from "@/app/(landing)/home/CTAButtons";
import { SquaresPattern } from "@/app/(landing)/home/SquaresPattern";
import { LogoCloud } from "@/app/(landing)/home/LogoCloud";
import { env } from "@/env";
import { HeroAB } from "@/app/(landing)/home/HeroAB";
import HeroVideoDialog from "@/components/HeroVideoDialog";
import { Cover } from "@/components/ui/cover";
import { cn } from "@/utils";

export function HeroText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h1
      className={cn(
        "relative z-20 mx-auto max-w-7xl bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 bg-clip-text py-6 text-center text-4xl font-semibold text-transparent dark:from-neutral-800 dark:via-white dark:to-white md:text-4xl lg:text-6xl",
        className,
      )}
    >
      {children}
    </h1>
  );
}

export function HeroSubtitle({ children }: { children: React.ReactNode }) {
  return <p className="mt-6 text-lg leading-8 text-gray-600">{children}</p>;
}

export function HeroHome() {
  if (env.NEXT_PUBLIC_POSTHOG_HERO_AB) return <HeroAB />;
  return <Hero />;
}

export function Hero({
  title,
  subtitle,
  image,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  image?: string;
}) {
  return (
    <div className="relative pt-14">
      <SquaresPattern />
      <div className="pt-24 sm:pb-12 sm:pt-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-10">
            <ProductHuntBadge />
          </div>

          <div className="mx-auto max-w-xl text-center">
            <HeroText>
              Your Inbox Just got <Cover>10x Faster</Cover>
            </HeroText>
            <HeroSubtitle>
              {subtitle ||
                "Take control of your email workflow with intelligent automation, newsletter management, and spam protection."}
            </HeroSubtitle>
            <CTAButtons />
            <LogoCloud />
          </div>

          <div className="relative mt-16 flow-root sm:mt-24">
            <HeroVideoDialog
              className="block"
              animationStyle="top-in-bottom-out"
              videoSrc="https://ftaxatshahchanel.com"
              thumbnailSrc={image || "/images/newsletters.png"}
              thumbnailAlt="Email Management Dashboard"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductHuntBadge() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
      <a
        href="https://www.producthunt.com/posts/mailto-live?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-mailto&#0045;live"
        target="_blank"
        rel="noreferrer"
      >
        <img
          src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=727877&theme=light"
          alt="Mailto Live - AI Email Management & Gmail Cleanup Tool | Product Hunt"
          className="h-[54px] w-[250px]"
          width="250"
          height="54"
        />
      </a>
    </div>
  );
}

export default Hero;
