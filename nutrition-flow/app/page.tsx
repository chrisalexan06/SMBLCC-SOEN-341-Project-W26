import Link from "next/link";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F5F4] flex flex-col">
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
          <Link href="/login" className="text-sm font-medium text-white hover:text-gray-400">
            Login
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto space-y-8 p-4">
        <div className="space-y-4 flex flex-col items-center">
          <Image
            src="/images/logo1.png"
            alt="Nutrition Flow Logo"
            width={500}
            height={500}
            className="mx-auto"
          />
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-center">
            Your personal companion for healthy living. Track your meals, discover delicious recipes, and achieve your nutritional goals.
          </p>
        </div>
        
        <Link href="/login">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
            >
              Get Started
            </Button>
        </Link>
      </main>
    </div>
  );
}