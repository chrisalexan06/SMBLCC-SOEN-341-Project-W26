"use client";

import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { useClerk } from "@clerk/nextjs";


export default function SignupPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { signOut } = useClerk();


  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError("");

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    try {
      // Create the user
      const result = await signUp.create({
        emailAddress: email,
        password,
      });

      
      await setActive({ session: result.createdSessionId });

      // Redirect to onboarding
      router.push("/onboarding");
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to create account");
    }
  };

  return (
    <div className="flex h-screen">
      {/* LEFT SIDE OF THE PAGE*/}
      <div className="hidden lg:flex lg:w-1/3 relative flex-col justify-center items-center p-12 overflow-hidden">
        <Image
          src="/images/meals.webp"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-white/80 z-10" />

        <div className="relative z-20 text-center">
          <Image
            src="/images/logo1.png"
            alt="Logo"
            width={405}
            height={405}
            priority
          />
        </div>
      </div>

  
    </div>
  );
}
