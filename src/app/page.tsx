import { redirect } from "next/navigation";

/** Root — send everyone to dashboard; AppShell redirects to /login if unauthenticated. */
export default function RootPage() {
  redirect("/dashboard");
}
