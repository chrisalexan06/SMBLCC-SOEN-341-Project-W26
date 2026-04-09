"use client";

import { 
  ClerkProvider, 
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton, } from '@clerk/nextjs';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Switch } from "@/app/components/ui/switch";
import { ArrowLeft, User } from "lucide-react";

export function Profile() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [age, setAge] = useState(""); 
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState("");
  const [dietaryTypes, setDietaryTypes] = useState({
    vegan: false,
    vegetarian: false,
    keto: false,
    halal: false,
    gluten_free: false,
    kosher: false,
    pescatarian: false,
  });
  const [allergies, setAllergies] = useState({
    peanuts: false,
    gluten: false,
    shellfish: false,
    soy: false,
    eggs: false,
    treeNuts: false,
    wheat: false,
    fish: false,
    milk: false,
    sesame: false,
  });

  useEffect(() => {
    async function loadProfile() {
      try {
      const res = await fetch("/api/user/sync"); 
      const data = await res.json();

      if (res.ok && data ) {
        setUserData(data);

        setHeight(data.height?.toString() || "");
        setAge(data.age ? data.age.toString() : "");
        setGoal(data.goal || "");

        if (data.dietaryType) {
            const updatedDiets: any = { ...dietaryTypes };
            data.dietaryType.forEach((type: string) => {
              const key = type.toLowerCase().replace(" ", "_");
              if (Object.prototype.hasOwnProperty.call(updatedDiets, key)) {
                updatedDiets[key] = true;
              }
            });
            setDietaryTypes(updatedDiets);
          }

        if (data.allergies) {
            const updatedAllergies: any = { ...allergies };
            data.allergies.forEach((allergy: string) => {
              const key = allergy.toLowerCase().replace(" ", "_");
              if (Object.prototype.hasOwnProperty.call(updatedAllergies, key)) {
                updatedAllergies[key] = true;
              }
            });
            setAllergies(updatedAllergies);
          }
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      const response = await fetch("/api/onboarding", { // Reusing onboarding upsert logic
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: parseInt(age) || 0,
          height: parseFloat(height) || 0,
          goal: goal,
          dietaryType: Object.keys(dietaryTypes)
            .filter(key => (dietaryTypes as any)[key])
            .map(key => key.toUpperCase()),
          allergies: Object.keys(allergies)
            .filter(key => (allergies as any)[key])
            .map(key => key.toUpperCase()) 
        }),
      });

      if (response.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings.");
      }
    } catch (error) {
      alert("Error saving data.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg">Loading Profile Settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl" style={{ color: "var(--sage-green-dark)" }}>
              NutriFlow - Profile Settings
            </h1>
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto p-6">
        <div className="space-y-6">
          {/* Personal Information */}
          <Card className="p-6 rounded-2xl">
            <h3 className="mb-6">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={userData?.email || ""}
                  disabled
                  className="w-full px-4 py-3 rounded-lg border bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
              <label className="block mb-2 text-sm font-medium">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-[var(--sage-green)]"
                placeholder="Enter your age"
              />
            </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Height</label>
                  <input
                    type="text"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      borderColor: "var(--border)",
                      "--tw-ring-color": "var(--sage-green)",
                    } as React.CSSProperties}
                  />
                </div>
              </div>
            </div>
          </Card>

        <Card className="p-6 rounded-2xl">
            <h3 className="mb-4 font-semibold">Fitness Goal</h3>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-[var(--sage-green)]"
            >
              <option value="">Select a Goal</option>
              <option value="BULK">Bulk</option>
              <option value="CUT">Cut</option>
              <option value="MAINTAIN">Maintain</option>
            </select>
          </Card>
          {/* Dietary Preferences */}
          <Card className="p-6 rounded-2xl">
            <h3 className="mb-6 font-semibold">Dietary Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(dietaryTypes).map((dietKey) => (
                <div key={dietKey} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border">
                  <span className="text-sm font-medium capitalize">
                    {dietKey.replace("_", " ")}
                  </span>
                  <Switch
                    checked={(dietaryTypes as any)[dietKey]}
                    onCheckedChange={(checked) =>
                      setDietaryTypes({ ...dietaryTypes, [dietKey]: checked })
                    }
                    className="data-[state=checked]:bg-[var(--sage-green)]"
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Allergies */}
          <Card className="p-6 rounded-2xl">
            <h3 className="mb-6 font-semibold">Allergies & Restrictions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(allergies).map((allergyKey) => (
                <div key={allergyKey} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                  <span className="text-sm font-medium capitalize">
                    {allergyKey.replace("_", " ")}
                  </span>
                  <Switch
                    checked={(allergies as any)[allergyKey]}
                    onCheckedChange={(checked) =>
                      setAllergies({ ...allergies, [allergyKey]: checked })
                    }
                    className="data-[state=checked]:bg-[var(--sage-green)]"
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/")}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 text-white"
              style={{ backgroundColor: "var(--sage-green)" }}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
