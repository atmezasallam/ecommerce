"use client";

import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";

export function LegalPrivacyTabs() {
  return (
    <Tabs defaultValue="privacy" className="w-full">
      <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
        <TabsTrigger value="terms">Terms of Service</TabsTrigger>
      </TabsList>

      <TabsContent value="privacy" className="space-y-10">
        <Section id="privacy-policy" title="1. Privacy Policy">
          <p>
            Salamo collects account, order, and device information to operate the marketplace, prevent fraud, and
            improve recommendations. We minimize data collection and retain information only as long as needed for
            legal and business purposes.
          </p>
        </Section>
        <Section id="cookie-policy" title="2. Cookie Policy">
          <p>
            We use essential cookies for sign-in and security, and optional cookies for analytics and personalization.
            You can control non-essential cookies through your browser settings where applicable.
          </p>
        </Section>
        <Section id="data-collection" title="3. Data Collection & Usage">
          <p>
            Examples include contact details, shipping addresses, payment references (not full card numbers), support
            tickets, and seller storefront data. Usage includes order fulfillment, dispute resolution, and platform
            integrity.
          </p>
        </Section>
        <Section id="third-party" title="4. Third-Party Services">
          <p>
            We rely on providers such as authentication, payments, email delivery, and hosting. Each provider is
            bound by contractual obligations consistent with this policy.
          </p>
        </Section>
        <Section id="rights" title="5. Your Rights (GDPR)">
          <p>
            Depending on your jurisdiction, you may request access, correction, export, restriction, or deletion of
            personal data. Submit requests through the contact channel below; we may verify identity before
            processing.
          </p>
        </Section>
        <Section id="contact-requests" title="6. Contact & Data Requests">
          <p>
            For privacy questions or data requests, contact Salamo support through your account help options. We aim
            to respond within statutory timelines.
          </p>
        </Section>
      </TabsContent>

      <TabsContent value="terms" className="space-y-10">
        <Section id="terms-of-service" title="1. Terms of Service">
          <p>
            By using Salamo you agree to follow marketplace rules, provide accurate information, and not misuse the
            platform. We may update these terms with reasonable notice where required.
          </p>
        </Section>
        <Section id="buyer-obligations" title="2. Buyer Obligations">
          <p>
            Buyers must pay for orders they place, cooperate with delivery, and communicate honestly during returns
            or disputes. Abuse of chargebacks or promotions may lead to account restrictions.
          </p>
        </Section>
        <Section id="seller-obligations" title="3. Seller Obligations">
          <p>
            Sellers must fulfill orders as described, honor stated policies, and comply with applicable laws including
            consumer protection and tax reporting where relevant.
          </p>
        </Section>
        <Section id="liability" title="4. Limitation of Liability">
          <p>
            Salamo provides the platform &quot;as is&quot; to the extent permitted by law. We are not liable for
            indirect damages arising from seller-buyer transactions, subject to mandatory exceptions.
          </p>
        </Section>
        <Section id="governing-law" title="5. Governing Law">
          <p>
            Disputes are governed by the laws applicable to Salamo&apos;s operating entity and resolved in the
            courts or forums specified in your regional terms, unless otherwise required.
          </p>
        </Section>
      </TabsContent>
    </Tabs>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}
