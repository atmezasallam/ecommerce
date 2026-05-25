import { HelpTopicShell } from "../help-topic-shell";

export default function HelpSellerPage() {
  return (
    <HelpTopicShell title="Seller Support" pageName="Seller Support">
      <p>
        Sellers on Salamo manage inventory, shipping, and customer messages from the seller dashboard. Keep your
        store policies accurate to build buyer trust.
      </p>
      <p>
        If your application is pending, our team reviews storefront details and contact information before
        activation.
      </p>
      <p>
        For performance issues or policy questions, use{" "}
        <a className="font-medium text-primary underline" href="/report-problem">
          Report a Problem
        </a>{" "}
        and choose &quot;Seller Complaint&quot; or &quot;Technical Issue&quot; as appropriate.
      </p>
    </HelpTopicShell>
  );
}
