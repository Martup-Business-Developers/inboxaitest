import Link from "next/link";
import { ExternalLinkIcon, EyeIcon } from "lucide-react";
import type { PendingExecutedRules } from "@/app/api/user/planned/route";
import { decodeSnippet } from "@/utils/gmail/decode";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ActionBadgeExpanded } from "@/components/PlanBadge";
import { Tooltip } from "@/components/Tooltip";
import { EmailDate } from "@/components/email-list/EmailDate";
import { getGmailUrl } from "@/utils/url";
import { HoverCard } from "@/components/HoverCard";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/ui/button";
import { conditionsToString, conditionTypesToString } from "@/utils/condition";
import { MessageText } from "@/components/Typography";
import { ReportMistake } from "@/app/(app)/automation/ReportMistake";
import type { ParsedMessage } from "@/utils/types";
import { useDisplayedEmail } from "@/hooks/useDisplayedEmail";
import { ViewEmailButton } from "@/components/ViewEmailButton";

export function EmailCell({
  from,
  subject,
  snippet,
  threadId,
  messageId,
  userEmail,
}: {
  from: string;
  subject: string;
  snippet: string;
  threadId: string;
  messageId: string;
  userEmail: string;
}) {
  // use regex to find first letter
  const firstLetter = from.match(/[a-zA-Z]/)?.[0] || "-";

  const { showEmail } = useDisplayedEmail();

  return (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarFallback>{firstLetter}</AvatarFallback>
      </Avatar>
      <div className="flex flex-1 flex-col justify-center">
        <div className="font-semibold">{from}</div>
        <div className="mt-1 flex items-center font-medium">
          {subject}{" "}
          <OpenInGmailButton messageId={messageId} userEmail={userEmail} />
        </div>
        <div className="mt-1 text-muted-foreground">
          {decodeSnippet(snippet)}
        </div>
      </div>
      <ViewEmailButton threadId={threadId} messageId={messageId} />
    </div>
  );
}

export function RuleCell({
  rule,
  reason,
  message,
  isTest,
}: {
  rule: PendingExecutedRules["executedRules"][number]["rule"];
  reason?: string | null;
  message: ParsedMessage;
  isTest: boolean;
}) {
  if (!rule) return null;

  return (
    <div className="flex gap-2">
      <HoverCard
        className="w-80"
        content={
          <div>
            <div className="flex justify-between font-medium">
              {rule.name}
              <Badge color="blue">{conditionTypesToString(rule)}</Badge>
            </div>
            <div className="mt-2">{conditionsToString(rule)}</div>
            <div className="mt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/automation/rule/${rule.id}`}>View</Link>
              </Button>
            </div>
            {!!reason && (
              <div className="mt-4 space-y-2">
                <div className="font-medium">
                  AI reason for choosing this rule:
                </div>
                <MessageText>{reason}</MessageText>
              </div>
            )}
          </div>
        }
      >
        <Badge color="green">
          {rule.name}
          <EyeIcon className="ml-1.5 size-3.5 opacity-70" />
        </Badge>
      </HoverCard>
      <ReportMistake
        result={{ rule, reason }}
        message={message}
        isTest={isTest}
      />
    </div>
  );
}

export function ActionItemsCell({
  actionItems,
}: {
  actionItems: PendingExecutedRules["executedRules"][number]["actionItems"];
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {actionItems.map((item) => (
        <ActionBadgeExpanded key={item.id} action={item} />
      ))}
    </div>
  );
}

export function DateCell({ createdAt }: { createdAt: Date }) {
  return (
    <div className="whitespace-nowrap">
      <Tooltip content={new Date(createdAt).toLocaleString()}>
        <EmailDate date={new Date(createdAt)} />
      </Tooltip>
    </div>
  );
}

function OpenInGmailButton({
  messageId,
  userEmail,
}: {
  messageId: string;
  userEmail: string;
}) {
  return (
    <Link
      href={getGmailUrl(messageId, userEmail)}
      target="_blank"
      className="ml-2 text-gray-700 hover:text-gray-900"
    >
      <ExternalLinkIcon className="h-4 w-4" />
    </Link>
  );
}
