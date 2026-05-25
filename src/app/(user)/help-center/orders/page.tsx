import { HelpTopicShell } from "../help-topic-shell";

export default function HelpOrdersPage() {
  return (
    <HelpTopicShell title="Orders & Shipping" pageName="Orders & Shipping">
      <p>
        After checkout, you&apos;ll receive an order confirmation email. Use your Salamo account to track status
        from &quot;Processing&quot; to &quot;Shipped&quot; and &quot;Delivered&quot;.
      </p>
      <p>
        Shipping costs and carriers are set by each seller. If a tracking link is available, you&apos;ll find it on
        the order detail page.
      </p>
      <p>
        If a package is delayed, contact the seller first. If you don&apos;t get a response within a reasonable
        time, open a dispute from{" "}
        <a className="font-medium text-primary underline" href="/dispute-resolution">
          Order Dispute Resolution
        </a>
        .
      </p>
    </HelpTopicShell>
  );
}
