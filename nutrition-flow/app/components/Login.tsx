"use client";

import { useSignIn } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Check } from "lucide-react";

export function Login() {
  const { signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const result = await signIn?.create({
        identifier: email,
        password,
      });

      if (result?.status === "complete") {
        await setActive?({ session: result.createdSessionId }):
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid email or password");
      console.error("Error:", err);
    }
  };

  const handleGoogleSignIn = () => {
    signIn?.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/dashboard",
    });
  };

  return (
    <div className="flex h-screen">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/3 flex-col justify-center items-center p-12" style={{ backgroundColor: 'var(--white)' }}>
        <div className="max-w-md">
          <Image
            src="/images/logo1.png"
            alt="Nutrition Flow Logo"
            width={405}
            height={405}
          />
          <p className="text-lg" style={{ color: 'var(--sage-green-dark)' }}>
            Your social meal planner for student life
          </p>
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[#C8B5D9]">
                <Check className="w-4 h-4 text-white" />
              </div>
              <p className="text-lg">Track your meals and calories</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[#C8B5D9]">
                <Check className="w-4 h-4 text-white" />
              </div>
              <p className="text-lg">Share food photos with friends</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[#C8B5D9]">
                <Check className="w-4 h-4 text-white" />
              </div>
              <p className="text-lg">Discover nearby restaurants</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-sage-green-light">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl mb-2">Welcome back</h2>
            <p className="text-muted-foreground">Log in to continue to your account</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Button
              onClick={handleGoogleSignIn}
              className="w-full h-12 bg-white border-2 hover:bg-gray-50 text-foreground"
              style={{ borderColor: 'var(--sage-green)' }}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Log in with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-sage-green-light px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleEmailLogin}>
              <div>
                <label className="block mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 bg-white"
                  style={{ borderColor: 'var(--border)', '--tw-ring-color': 'var(--sage-green)' } as React.CSSProperties}
                />
              </div>
              <div>
                <label className="block mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 bg-white"
                  style={{ borderColor: 'var(--border)', '--tw-ring-color': 'var(--sage-green)' } as React.CSSProperties}
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-white"
                style={{ backgroundColor: 'var(--sage-green)' }}
              >
                Log in
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <button onClick={() => router.push('/signup')} className="hover:underline" style={{ color: 'var(--sage-green-dark)' }}>
                Sign up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
