import type { Metadata } from "next";
import { 
  ClerkProvider, 
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton, } from '@clerk/nextjs';
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/app/components/ui/sonner";
import "./globals.css";
import "./styles/index.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nutrition Flow",
  description: "Manage your nutrition and recipes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
     <ClerkProvider
      signInUrl="/login"
      signUpUrl="/signup"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* clerk header from setup online*/}
        <nav className="flex justify-between items-center w-full px-8 py-4 bg-brand-sage text-white shadow-md">
            {/* Show the sign-in and sign-up buttons when the user is signed out */}
            <SignedOut>
              <SignInButton />
            </SignedOut>
            {/* Show the user button when the user is signed in */}
            <SignedIn>
              <UserButton />
            </SignedIn>
          </nav>
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}
