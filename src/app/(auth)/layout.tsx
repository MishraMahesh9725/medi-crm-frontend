import { QueryProvider } from "@/components/providers/QueryProvider";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
