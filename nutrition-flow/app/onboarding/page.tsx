"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { toast } from "sonner";
import { Dumbbell, TrendingDown, Scale } from "lucide-react";

const GOAL_CARD_STYLES = "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all peer-data-[state=checked]:border-transparent peer-data-[state=checked]:[background-image:linear-gradient(var(--card),var(--card)),linear-gradient(to_right,var(--sage-green),var(--lilac-purple))] peer-data-[state=checked]:[background-origin:border-box] peer-data-[state=checked]:[background-clip:padding-box,border-box]";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    age: "",
    height: "",
    currentWeight: "",
    activityLevel: "SEDENTARY",
    goal: "MAINTAIN",
    dietaryType: "NONE",
    allergies: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      const allergyArray = formData.allergies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          allergies: allergyArray,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save profile");
      }

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            We need a few details to personalize your nutrition plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Age & Height */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age *</Label>
                <Input 
                  type="number" 
                  required 
                  placeholder="25" 
                  onChange={(e) => handleChange("age", e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Height (cm) *</Label>
                <Input 
                  type="number" 
                  required 
                  placeholder="175" 
                  onChange={(e) => handleChange("height", e.target.value)} 
                />
              </div>
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label>Current Weight (lbs) *</Label>
              <Input 
                type="number" 
                required 
                placeholder="160" 
                onChange={(e) => handleChange("currentWeight", e.target.value)} 
              />
            </div>

            {/* Activity Level */}
            <div className="space-y-2">
              <Label>Activity Level</Label>
              <Select defaultValue="SEDENTARY" onValueChange={(val) => handleChange("activityLevel", val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEDENTARY">Sedentary (Office Job)</SelectItem>
                  <SelectItem value="LIGHT">Light Exercise</SelectItem>
                  <SelectItem value="MODERATE">Moderate Exercise</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="VERY_ACTIVE">Very Active</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Goal */}
            <div className="space-y-3">
              <Label>Goal</Label>
              {/* Invisible SVG definition for gradients */}
              <svg width="0" height="0" className="absolute block">
                <defs>
                  <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--sage-green-dark)" />
                    <stop offset="100%" stopColor="var(--lilac-purple-dark)" />
                  </linearGradient>
                </defs>
              </svg>

              <RadioGroup defaultValue="MAINTAIN" onValueChange={(val) => handleChange("goal", val)} className="grid grid-cols-3 gap-4">
                
                {/* BULK */}
                <div>
                  <RadioGroupItem value="BULK" id="bulk" className="peer sr-only" />
                  <Label 
                    htmlFor="bulk"
                    className={GOAL_CARD_STYLES}
                  >
                    <Dumbbell className="mb-3 h-10 w-10" style={{ stroke: "url(#icon-gradient)" }} />
                    <span className="font-semibold bg-gradient-to-r from-[var(--sage-green-dark)] to-[var(--lilac-purple-dark)] bg-clip-text text-transparent">Bulk</span>
                  </Label>
                </div>

                {/* CUT */}
                <div>
                  <RadioGroupItem value="CUT" id="cut" className="peer sr-only" />
                  <Label 
                    htmlFor="cut"
                    className={GOAL_CARD_STYLES}
                  >
                    <TrendingDown className="mb-3 h-10 w-10" style={{ stroke: "url(#icon-gradient)" }} />
                    <span className="font-semibold bg-gradient-to-r from-[var(--sage-green-dark)] to-[var(--lilac-purple-dark)] bg-clip-text text-transparent">Cut</span>
                  </Label>
                </div>

                {/* MAINTAIN */}
                <div>
                  <RadioGroupItem value="MAINTAIN" id="maintain" className="peer sr-only" />
                  <Label 
                    htmlFor="maintain"
                    className={GOAL_CARD_STYLES}
                  >
                    <Scale className="mb-3 h-10 w-10" style={{ stroke: "url(#icon-gradient)" }} />
                    <span className="font-semibold bg-gradient-to-r from-[var(--sage-green-dark)] to-[var(--lilac-purple-dark)] bg-clip-text text-transparent">Maintain</span>
                  </Label>
                </div>
                
              </RadioGroup>
            </div>

            {/* Diet */}
            <div className="space-y-2">
              <Label>Dietary Preference</Label>
              <Select defaultValue="NONE" onValueChange={(val) => handleChange("dietaryType", val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  <SelectItem value="VEGAN">Vegan</SelectItem>
                  <SelectItem value="VEGETARIAN">Vegetarian</SelectItem>
                  <SelectItem value="KETO">Keto</SelectItem>
                  <SelectItem value="HALAL">Halal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Allergies */}
            <div className="space-y-2">
              <Label>Allergies (Optional)</Label>
              <Input 
                placeholder="Peanuts, Shellfish..." 
                onChange={(e) => handleChange("allergies", e.target.value)} 
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving..." : "Finish Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}