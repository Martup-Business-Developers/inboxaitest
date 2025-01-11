"use client";

import { useQueryState } from "nuqs";
import { ProcessRulesContent } from "@/app/(app)/automation/ProcessRules";
import { Toggle } from "@/components/Toggle";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@/hooks/useUser"; // Add this import
import { toastError } from "@/components/Toast"; // Add this import

export function Process() {
  const [mode, setMode] = useQueryState("mode");
  const { user } = useUser();
  const isPremium = user?.isPremium ?? false;
  const isApplyMode = mode === "apply";

  const handleModeChange = (enabled: boolean) => {
    if (enabled && !isPremium) {
      toastError({
        title: "Premium Required",
        description:
          "Applying rules to emails is only available for premium users.",
      });
      return;
    }
    setMode(enabled ? "apply" : "test");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Process your emails</CardTitle>

        <CardDescription>
          {isApplyMode
            ? "Run your rules on previous emails."
            : "Check how your rules perform against previous emails."}
          {!isPremium && (
            <span className="mt-2 block text-red-600">
              Upgrade to premium to apply rules to your emails
            </span>
          )}
        </CardDescription>

        <div className="flex pt-1">
          <Toggle
            name="test-mode"
            label="Test"
            labelRight="Apply"
            enabled={isApplyMode}
            onChange={handleModeChange}
            disabled={!isPremium && mode !== "test"}
            title={!isPremium ? "Upgrade to premium to apply rules" : undefined}
          />
        </div>
      </CardHeader>
      <ProcessRulesContent
        testMode={!isApplyMode}
        disabled={isApplyMode && !isPremium}
      />
    </Card>
  );
}
