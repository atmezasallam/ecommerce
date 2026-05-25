import { Shield } from "lucide-react";
import { AccountBreadcrumbs } from "@/src/components/user/account-breadcrumbs";
import { AccountPageHero } from "@/src/components/user/account-page-hero";
import { PrintPageButton } from "@/src/components/user/print-page-button";
import { LegalPrivacyTabs } from "./legal-tabs";

const toc = [
  { id: "privacy-policy", label: "Privacy Policy" },
  { id: "terms-of-service", label: "Terms of Service" },
  { id: "cookie-policy", label: "Cookie Policy" },
  { id: "data-collection", label: "Data Collection & Usage" },
  { id: "third-party", label: "Third-Party Services" },
  { id: "rights", label: "Your Rights (GDPR)" },
  { id: "contact-requests", label: "Contact & Data Requests" },
] as const;

export default function LegalPrivacyPage() {
  return (
    <>
      <AccountBreadcrumbs pageName="Legal & Privacy" />
      <AccountPageHero
        icon={Shield}
        title="Legal & Privacy"
        subtitle="Privacy, cookies, data practices, and the rules for using Salamo."
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Last updated: March 28, 2026</p>
        <PrintPageButton />
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <nav className="sticky top-24 space-y-1 rounded-xl border bg-card p-4 text-sm shadow-sm">
            <p className="mb-2 font-semibold text-foreground">On this page</p>
            {toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>
        <div className="lg:col-span-3">
          <LegalPrivacyTabs />
        </div>
      </div>
    </>
  );
}
