"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { Onboarding } from "@/components/Onboarding";
import { useProfileStore } from "@/stores/profile-store";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, completeOnboarding } = useProfileStore();

  if (!profile.onboarded) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
