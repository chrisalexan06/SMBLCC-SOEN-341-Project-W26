"use client";

import {  
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton, } from '@clerk/nextjs';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Switch } from "@/app/components/ui/switch";
import { ArrowLeft} from "lucide-react";

export function Profile() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [age, setAge] = useState(""); 
  const [height, setHeight] = useState("");
  // Added height unit state to support cm or feet/inch input and display.
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft-in">("cm");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  // Added weight unit state so profile can show kg or lbs consistently.
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [goal, setGoal] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
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
        setCurrentWeight(data.currentWeight?.toString() || "");
        setTargetWeight(data.targetWeight?.toString() || "");
        setGoal(data.goal || "");
        setActivityLevel(data.activityLevel || "");

        if (data.dietaryType) {
            const updatedDiets: any = { ...dietaryTypes };
            data.dietaryType.forEach((type: string) => {
              const key = type.toLowerCase().replace("/\s/g", "_");
              if (Object.prototype.hasOwnProperty.call(updatedDiets, key)) {
                updatedDiets[key] = true;
              }
            });
            setDietaryTypes(updatedDiets);
          }

        if (data.allergies) {
            const updatedAllergies: any = { ...allergies };
            data.allergies.forEach((allergy: string) => {
              const key = allergy.toLowerCase().replace("/\s/g", "_");
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
  });

  // Conversion helpers for height and weight unit switching.
  const convertKgToLbs = (kg: number) => Math.round((kg * 2.20462) * 10) / 10;
  const convertLbsToKg = (lbs: number) => Math.round((lbs / 2.20462) * 10) / 10;
  const convertCmToFeetInches = (cm: number) => {
    const feet = Math.floor(cm / 30.48);
    const inches = Math.round((cm / 2.54) - feet * 12);
    return { feet, inches };
  };
  const convertFeetInchesToCm = (feet: number, inches: number) =>
    Math.round((feet * 30.48 + inches * 2.54) * 10) / 10;

  const handleHeightUnitChange = (unit: "cm" | "ft-in") => {
    // Switches display/input mode between cm and ft/in, converting values immediately.
    if (unit === heightUnit) return;
    if (unit === "ft-in") {
      const cmValue = parseFloat(height);
      if (!Number.isNaN(cmValue)) {
        const { feet, inches } = convertCmToFeetInches(cmValue);
        setHeightFeet(String(feet));
        setHeightInches(String(inches));
      }
    } else {
      const feet = parseInt(heightFeet) || 0;
      const inches = parseInt(heightInches) || 0;
      const cmValue = convertFeetInchesToCm(feet, inches);
      setHeight(String(cmValue.toString()));
    }
    setHeightUnit(unit);
  };

  const handleWeightUnitChange = (unit: "kg" | "lbs") => {
    // Switches weight display between kg and lbs, converting both current and target weight.
    if (unit === weightUnit) return;
    const currentValue = parseFloat(currentWeight);
    if (!Number.isNaN(currentValue)) {
      setCurrentWeight(
        unit === "lbs"
          ? String(convertKgToLbs(currentValue))
          : String(convertLbsToKg(currentValue)),
      );
    }

    if (targetWeight) {
      const targetValue = parseFloat(targetWeight);
      if (!Number.isNaN(targetValue)) {
        setTargetWeight(
          unit === "lbs"
            ? String(convertKgToLbs(targetValue))
            : String(convertLbsToKg(targetValue)),
        );
      }
    }

    setWeightUnit(unit);
  };

  const handleSave = async () => {
    try {
      setNotification(null);
      // Convert display units back into metric values before saving to the backend.
      const heightValue =
        heightUnit === "ft-in"
          ? convertFeetInchesToCm(parseInt(heightFeet) || 0, parseInt(heightInches) || 0)
          : parseFloat(height) || 0;
      const currentWeightKg =
        weightUnit === "lbs"
          ? convertLbsToKg(parseFloat(currentWeight) || 0)
          : parseFloat(currentWeight) || 0;
      const targetWeightKg =
        targetWeight && weightUnit === "lbs"
          ? convertLbsToKg(parseFloat(targetWeight))
          : targetWeight
          ? parseFloat(targetWeight)
          : undefined;

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: parseInt(age) || 0,
          height: heightValue,
          currentWeight: currentWeightKg,
          targetWeight: targetWeightKg,
          activityLevel: activityLevel || undefined,
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
        setNotification({ type: "success", message: "Settings saved successfully!" });
      } else {
        setNotification({ type: "error", message: "Failed to save settings." });
      }
    } catch (error) {
      setNotification({ type: "error", message: "Error saving data." });
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
                  <UserButton data-testid="userimg-button"/>
                </SignedIn>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto p-6">
        <div className="space-y-6">
          {notification ? (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
                notification.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              {notification.message}
            </div>
          ) : null}
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
                data-testid="age-input"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-[var(--sage-green)]"
                placeholder="Enter your age"
              />
            </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block mb-2">Height</label>
                  {heightUnit === "cm" ? (
                    <input
                      type="text"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                      style={{
                        borderColor: "var(--border)",
                        "--tw-ring-color": "var(--sage-green)",
                      } as React.CSSProperties}
                      placeholder="Height in cm"
                    />
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={heightFeet}
                        onChange={(e) => {
                          setHeightFeet(e.target.value);
                          const feet = parseInt(e.target.value) || 0;
                          const inches = parseInt(heightInches) || 0;
                          setHeight(String(convertFeetInchesToCm(feet, inches)));
                        }}
                        className="w-1/2 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                        style={{
                          borderColor: "var(--border)",
                          "--tw-ring-color": "var(--sage-green)",
                        } as React.CSSProperties}
                        placeholder="ft"
                      />
                      <input
                        type="text"
                        value={heightInches}
                        onChange={(e) => {
                          setHeightInches(e.target.value);
                          const feet = parseInt(heightFeet) || 0;
                          const inches = parseInt(e.target.value) || 0;
                          setHeight(String(convertFeetInchesToCm(feet, inches)));
                        }}
                        className="w-1/2 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                        style={{
                          borderColor: "var(--border)",
                          "--tw-ring-color": "var(--sage-green)",
                        } as React.CSSProperties}
                        placeholder="in"
                      />
                    </div>
                  )}
                  <select
                    value={heightUnit}
                    onChange={(e) => handleHeightUnitChange(e.target.value as "cm" | "ft-in")}
                    className="mt-2 w-full px-4 py-3 rounded-lg border focus:ring-2"
                    style={{
                      borderColor: "var(--border)",
                      "--tw-ring-color": "var(--sage-green)",
                    } as React.CSSProperties}
                  >
                    <option value="cm">cm</option>
                    <option value="ft-in">ft/in</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2">Current Weight ({weightUnit})</label>
                  <input
                    type="text"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      borderColor: "var(--border)",
                      "--tw-ring-color": "var(--sage-green)",
                    } as React.CSSProperties}
                    placeholder={`Enter your current weight in ${weightUnit}`}
                  />
                </div>
                <div>
                  <label className="block mb-2">Target Weight ({weightUnit})</label>
                  <input
                    type="text"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      borderColor: "var(--border)",
                      "--tw-ring-color": "var(--sage-green)",
                    } as React.CSSProperties}
                    placeholder={`Enter your target weight in ${weightUnit}`}
                  />
                </div>
                <div>
                  <label className="block mb-2">Weight Unit</label>
                  <select
                    value={weightUnit}
                    onChange={(e) => handleWeightUnitChange(e.target.value as "kg" | "lbs")}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2"
                    style={{
                      borderColor: "var(--border)",
                      "--tw-ring-color": "var(--sage-green)",
                    } as React.CSSProperties}
                  >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

        <Card className="p-6 rounded-2xl">
            <h3 className="mb-4 font-semibold">Fitness Goal</h3>
            <div className="space-y-4">
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
              <div>
                <label className="block mb-2">Activity Level</label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-[var(--sage-green)]"
                >
                  <option value="">Select activity level</option>
                  <option value="SEDENTARY">Sedentary</option>
                  <option value="LIGHT">Light activity</option>
                  <option value="MODERATE">Moderate activity</option>
                  <option value="ACTIVE">Active</option>
                  <option value="VERY_ACTIVE">Very active</option>
                </select>
              </div>
            </div>
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

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/dashboard")}
            >
              Back to Dashboard
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
