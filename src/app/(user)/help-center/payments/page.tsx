import { HelpTopicShell } from "../help-topic-shell";

export default function HelpPaymentsPage() {
  return (
    <HelpTopicShell title="Payments & Billing" pageName="Payments & Billing">
      <p>
        Salamo processes payments securely through trusted providers. You&apos;ll see a clear breakdown of
        subtotal, shipping, and taxes before you pay.
      </p>
      <p>
        If a charge fails, check with your bank or try another card. You will not be charged until checkout
        completes successfully.
      </p>
      <p>
        Invoices and receipts can be downloaded from your order history when the seller enables them.
      </p>
    </HelpTopicShell>
  );
}
