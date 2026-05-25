import { HelpTopicShell } from "../help-topic-shell";

export default function HelpAccountPage() {
  return (
    <HelpTopicShell title="Account & Security" pageName="Account & Security">
      <p>
        Your Salamo profile name and photo can be updated from the Profile page. Email and password are managed
        through Clerk for stronger security.
      </p>
      <p>
        Use a unique password and avoid sharing your account. If you notice suspicious orders or logins, change
        your password immediately and contact support.
      </p>
      <p>
        Learn how we handle data in{" "}
        <a className="font-medium text-primary underline" href="/legal-privacy">
          Legal &amp; Privacy
        </a>
        .
      </p>
    </HelpTopicShell>
  );
}
