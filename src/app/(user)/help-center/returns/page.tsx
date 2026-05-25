import { HelpTopicShell } from "../help-topic-shell";

export default function HelpReturnsPage() {
  return (
    <HelpTopicShell title="Returns & Refunds" pageName="Returns & Refunds">
      <p>
        Return windows and restocking rules are set by each seller within Salamo&apos;s marketplace guidelines.
        Always read the return policy on the product page before you buy.
      </p>
      <p>
        To start a return, go to your orders and follow the seller&apos;s instructions. Approved refunds are sent
        to your original payment method.
      </p>
      <p>
        For full policy text, see{" "}
        <a className="font-medium text-primary underline" href="/refund-policy">
          Return &amp; Refund Policy
        </a>
        .
      </p>
    </HelpTopicShell>
  );
}
