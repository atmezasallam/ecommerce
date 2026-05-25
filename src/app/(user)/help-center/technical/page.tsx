import { HelpTopicShell } from "../help-topic-shell";

export default function HelpTechnicalPage() {
  return (
    <HelpTopicShell title="App & Technical" pageName="App & Technical">
      <p>
        Salamo works best on the latest versions of Chrome, Safari, Firefox, or Edge. Clear your cache if pages
        look out of date.
      </p>
      <p>
        If uploads or checkout fail, try disabling browser extensions temporarily or switching networks.
      </p>
      <p>
        Found a bug? Submit details through{" "}
        <a className="font-medium text-primary underline" href="/report-problem">
          Report a Problem
        </a>{" "}
        so our engineers can reproduce it.
      </p>
    </HelpTopicShell>
  );
}
