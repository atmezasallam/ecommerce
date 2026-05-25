import { getAccountSettings } from "@/src/app/actions/user.actions";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const initial = await getAccountSettings();
  return <SettingsClient initial={initial} />;
}
