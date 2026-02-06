"use client";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const { signOut } = useClerk(); //sign out function from Clerk
  const router = useRouter(); //router to redirect user after signing out

  const handleSignOut = async () => {
    await signOut(); //ends current user session in Clerk
    router.push("/login");
  };
}