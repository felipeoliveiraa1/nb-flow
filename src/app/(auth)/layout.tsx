import { BottomNav } from "@/components/layout/BottomNav";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
