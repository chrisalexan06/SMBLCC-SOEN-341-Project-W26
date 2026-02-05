"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  
  const [formData, setFormData] = useState({
    age: "",
    height: "",
    currentWeight: "",
    targetWeight: "", 
    activityLevel: "",
    goal: "",
    dietaryType: "",
    allergies: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!user) {
      toast.error("Please sign in to continue.");
      setIsLoading(false);
      return;
    }

    try {
      // Database: Handle "none" or blank as an empty array []
      const allergyInput = formData.allergies.toLowerCase().trim();
      const allergyArray = (allergyInput === "" || allergyInput === "none") 
        ? [] 
        : allergyInput.split(",").map((item) => item.trim()).filter(Boolean);

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          allergies: allergyArray,
        }),
      });

      if (!res.ok) throw new Error("Failed to save profile");

      toast.success("Profile setup complete!");
      router.push("/dashboard"); 
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen font-sans">
      {/* image with WHITE OVERLAY*/}
      <div className="hidden lg:flex lg:w-1/3 relative flex-col justify-center items-center p-12 overflow-hidden">
        <Image
          src="/images/meals.webp"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        
        <div className="absolute inset-0 bg-white/80 z-10" />

        {/* Logo centered*/}
        <div className="relative z-20 mt-12">
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