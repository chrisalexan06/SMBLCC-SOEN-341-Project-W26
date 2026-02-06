import Link from "next/link";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { 
  ClerkProvider, 
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton, } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/*background image opaque*/}
      <Image
        src="/images/meals.webp"
        alt="Background"
        fill
        className="object-cover -z-20"
        priority
      />
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-white/90 -z-10" />

      {/* Navbar at the top */}
      <nav className="flex justify-between items-center w-full px-8 py-4 bg-brand-sage text-white shadow-md">
        {/* Logo Container - aspect-square ensures perfect circle */}
        <div className="bg-white rounded-full w-[50px] h-[50px] flex items-center justify-center overflow-hidden shadow-sm">
          <Image
            src="/images/logo.png"
            alt="Nutrition Flow Logo"
            width={200}
            height={200}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <SignedOut>
          <SignInButton />
          </SignedOut>
          {/* Show the user button when the user is signed in */}
          <SignedIn>
          <UserButton />
          </SignedIn>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-8 max-w-2xl">
          <Image
            src="/images/logo1.png"
            alt="Nutrition Flow Logo"
            width={700}
            height={700}
            className="object-contain"
            priority
          />
          <p className="text-xl text-muted-foreground text-center font-medium">
            Eat smarter. Feel better. Live lighter. <br/> Your personal student companion for healthy living.
          </p>
          <Link href="/login">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}