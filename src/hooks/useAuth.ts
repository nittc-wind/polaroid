"use client";

import { useSession, signOut } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const user = session?.user;

  const logout = async () => {
    await signOut({ redirectTo: "/auth/signin" });
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
  };
}
