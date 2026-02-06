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
      console.log("SIGNUP RESULT:", result);

      
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

      {/* RIGHT SIDE OF THE PAGE */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-sage-green-light overflow-y-auto">
        <div className="w-full max-w-md space-y-8 py-12">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl mb-2">Create Account</h2>
            <p className="text-muted-foreground">
              Start your journey with NutriFlow
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSignup}>
            {/* added this to fix the invisble captcha error because clerk needs it for the sign up process , we can remove it later from clerk properties to see */}
            <div id="clerk-captcha"></div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border bg-white"
                style={{ borderColor: "var(--border)" }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border bg-white"
                style={{ borderColor: "var(--border)" }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Verify Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border bg-white"
                style={{ borderColor: "var(--border)" }}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-white mt-4"
              style={{ backgroundColor: "var(--sage-green)" }}
            >
              Sign Up
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <button
              onClick={() => router.push("/login")}
              className="hover:underline font-medium"
              style={{ color: "var(--sage-green-dark)" }}
            >
              Log in
            </button>

            {/*FIX THIS LATER JUST A TSIGN OUT BUTTON TO TESTING*/}
            <button
              onClick={() => signOut()}
              className="text-sm underline text-gray-600"
            >
              Sign out
            </button>

            
          </div>
        </div>
      </div>
    </div>
  );
}
