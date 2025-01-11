"use client";

import { useCallback } from "react";
import Link from "next/link";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { AlertBasic } from "@/components/Alert";
import { Input } from "@/components/Input";
import {
  PageHeading,
  SectionDescription,
  TypographyH3,
} from "@/components/Typography";
import { Button } from "@/components/ui/button";
import { createAutomationAction } from "@/utils/actions/ai-rule";
import { isActionError } from "@/utils/error";
import { toastError, toastInfo } from "@/components/Toast";
import { examples } from "@/app/(app)/automation/create/examples";
import { useUser } from "@/hooks/useUser"; // Add this import

type Inputs = { prompt?: string };

export default function AutomationSettingsPage() {
  const router = useRouter();
  const { user } = useUser(); // Add this hook
  const isPremium = user?.isPremium ?? false; // Add premium check

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = useCallback(
    async (data) => {
      if (!isPremium) {
        toastError({
          title: "Premium Required",
          description: "This feature is only available for premium users.",
        });
        return;
      }

      if (data.prompt) {
        const result = await createAutomationAction({ prompt: data.prompt });

        if (isActionError(result)) {
          const existingRuleId = result.existingRuleId;
          if (existingRuleId) {
            toastInfo({
              title: "Rule for group already exists",
              description: "Edit the existing rule to create your automation.",
            });
            router.push(`/automation/rule/${existingRuleId}`);
          } else {
            toastError({
              description: `There was an error creating your automation. ${result.error}`,
            });
          }
        } else if (!result) {
          toastError({
            description: "There was an error creating your automation.",
          });
        } else {
          router.push(`/automation/rule/${result.id}?new=true`);
        }
      }
    },
    [router, isPremium],
  );

  const prompt = watch("prompt");

  return (
    <div className="mb-16 mt-6 md:mt-10">
      <PageHeading className="text-center">
        Add a new rule to your AI Personal Assistant
      </PageHeading>
      <SectionDescription className="mx-auto max-w-prose text-center">
        The easiest way to create rules is using the prompt screen, but if you
        prefer, you can use this screen to add rules manually.
        {!isPremium && (
          <span className="mt-2 block text-yellow-600">
            ⭐ Upgrade to premium to create custom automation rules
          </span>
        )}
      </SectionDescription>

      <div className="mx-auto mt-6 max-w-xl px-4 md:mt-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {typeof prompt === "string" ? (
            <>
              <TypographyH3>
                Instruct the AI how to process an incoming email
              </TypographyH3>

              <Input
                type="text"
                autosizeTextarea
                rows={3}
                name="prompt"
                placeholder={"e.g. Forward receipts to alice@accountant.com."}
                className="mt-2"
                registerProps={register("prompt")}
                error={errors.prompt}
                disabled={!isPremium}
              />
              <div className="mt-2 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setValue("prompt", undefined);
                  }}
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span className="sr-only">Back</span>
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting || !prompt || prompt.length < 5 || !isPremium
                  }
                  loading={isSubmitting}
                  title={
                    !isPremium
                      ? "Upgrade to premium to create automation rules"
                      : undefined
                  }
                >
                  {isPremium ? "Preview Automation" : "Upgrade to Premium"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <TypographyH3>Start from an example</TypographyH3>

              <div className="mt-2 space-y-1 text-sm leading-6 text-gray-700">
                {examples.map((example, i) => {
                  return (
                    <Link
                      key={example.title}
                      className={`block w-full text-left ${!isPremium ? "pointer-events-none opacity-50" : ""}`}
                      href={`/automation/rule/create?example=${i}`}
                    >
                      <AlertBasic
                        title={example.title}
                        description={example.description}
                        icon={example.icon}
                        className={`${isPremium ? "cursor-pointer hover:bg-gray-100" : "cursor-not-allowed"}`}
                      />
                    </Link>
                  );
                })}
              </div>

              <TypographyH3 className="pt-8">
                Or set up a rule yourself
              </TypographyH3>
              <div className="flex space-x-2 pb-8">
                <Button
                  variant="outline"
                  asChild
                  disabled={!isPremium}
                  title={
                    !isPremium
                      ? "Upgrade to premium to create automation rules"
                      : undefined
                  }
                >
                  <Link href={isPremium ? "/automation/rule/create" : "#"}>
                    {isPremium ? "Create rule" : "Upgrade to Premium"}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (isPremium) {
                      setValue("prompt", "");
                    } else {
                      toastError({
                        title: "Premium Required",
                        description:
                          "This feature is only available for premium users.",
                      });
                    }
                  }}
                  disabled={!isPremium}
                  title={
                    !isPremium
                      ? "Upgrade to premium to create automation rules"
                      : undefined
                  }
                >
                  {isPremium ? "Generate rule with AI" : "Upgrade to Premium"}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
