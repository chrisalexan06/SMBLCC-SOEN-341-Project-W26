"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";  // get logging in user info
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { toast } from "sonner"; // for pop-up notifications
import { Check } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter(); // Redirect the user to other pages
  const { user } = useUser(); //Access the current logged in user from Clerk
  const [isLoading, setIsLoading] = useState(false); //Track if database is currently saving data

  //Memory storage for all form inputs
  const [formData, setFormData] = useState({
    age: "",
    height: "",
    currentWeight: "",
    targetWeight: "", 
    activityLevel: "",
    goal: "",
    dietaryType: [] as string[],
    allergies: [] as string[],
  });
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft-in">("cm");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("lbs");
  // Updates formData every time a user types or picks an option
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
// When user clicks "Finish Setup", this function sends formData to the backend to be saved in the database
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
      const allergyArray = formData.allergies.includes("NONE") ? [] : formData.allergies;
      
      // Convert height to cm if in feet/inches
      let heightInCm = formData.height;
      if (heightUnit === "ft-in") {
        const feet = parseInt(heightFeet) || 0;
        const inches = parseInt(heightInches) || 0;
        heightInCm = String(Math.round(feet * 30.48 + inches * 2.54));
      }

      // Convert weights to kg if in lbs
      let currentWeightKg = formData.currentWeight;
      let targetWeightKg = formData.targetWeight;
      if (weightUnit === "lbs") {
        currentWeightKg = String(Math.round((parseFloat(formData.currentWeight) / 2.20462) * 100) / 100);
        if (formData.targetWeight) {
          targetWeightKg = String(Math.round((parseFloat(formData.targetWeight) / 2.20462) * 100) / 100);
        }
      }

      const res = await fetch("/api/onboarding", {  //Send formData to backend API 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id, //  Clerk user ID or else does not let the sign in happen
          email: user.emailAddresses[0]?.emailAddress,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          ...formData,
          height: heightInCm,
          currentWeight: currentWeightKg,
          targetWeight: targetWeightKg,
          allergies: allergyArray,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save profile");
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
    <div className="flex h-screen font-sans overflow-hidden overscroll-none">
      {/* image with WHITE OVERLAY*/}
      <div className="hidden lg:flex lg:w-1/3 lg:h-screen relative flex-col justify-center items-center p-12 overflow-hidden flex-shrink-0">
        <Image
          src="/images/meals.webp"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        
        <div className="absolute inset-0 bg-white/90 z-10" />

        {/* Logo centered*/}
        <div className="relative z-20 mt-12 overflow-hidden max-h-[90vh]">
          <Image
            src="/images/logo1.png"
            alt="Logo"
            width={405}
            height={405}
            priority
          />
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

      
      


  {/* RIGHT SIDE: Onboarding Form (Sage Green) */}
      <div className="flex-1 flex flex-col justify-start items-center p-8 bg-sage-green-light overflow-y-auto h-screen">
        <div className="w-full max-w-md space-y-8 py-8 pb-1">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl mb-2 font-bold">Complete Your Profile</h2>
            <p className="text-muted-foreground">Please fill in the required fields</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Age *</label>
                <input
                  type="number"
                  name="age"
                  required
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border bg-white"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Height *</label>
                <div className="flex gap-2">
                  {heightUnit === "cm" ? (
                    <div className="flex-1">
                      <input
                        type="number"
                        name="height"
                        required
                        value={formData.height}
                        onChange={handleChange}
                        placeholder="cm"
                        className="w-full px-4 py-3 rounded-lg border bg-white"
                        style={{ borderColor: 'var(--border)' }}
                      />
                    </div>
                  ) : (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="number"
                        value={heightFeet}
                        onChange={(e) => setHeightFeet(e.target.value)}
                        placeholder="ft"
                        required
                        className="w-1/2 px-4 py-3 rounded-lg border bg-white"
                        style={{ borderColor: 'var(--border)' }}
                      />
                      <input
                        type="number"
                        value={heightInches}
                        onChange={(e) => setHeightInches(e.target.value)}
                        placeholder="in"
                        className="w-1/2 px-4 py-3 rounded-lg border bg-white"
                        style={{ borderColor: 'var(--border)' }}
                      />
                    </div>
                  )}
                  <select
                    value={heightUnit}
                    onChange={(e) => setHeightUnit(e.target.value as "cm" | "ft-in")}
                    className="px-3 py-3 rounded-lg border bg-white text-sm font-medium"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <option value="cm">cm</option>
                    <option value="ft-in">ft/in</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Weights Section */}
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Current Weight ({weightUnit}) *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="currentWeight"
                  required
                  value={formData.currentWeight}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border bg-white"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Target Weight ({weightUnit})</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="targetWeight"
                  value={formData.targetWeight}
                  onChange={handleChange}
                  placeholder="Optional"
                  className="w-full px-4 py-3 rounded-lg border bg-white"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
              <select
                value={weightUnit}
                onChange={(e) => setWeightUnit(e.target.value as "kg" | "lbs")}
                className="px-3 py-3 rounded-lg border bg-white text-sm font-medium"
                style={{ borderColor: 'var(--border)' }}
              >
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Activity Level *</label>
              <select 
                name="activityLevel"
                required
                value={formData.activityLevel}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border bg-white"
                style={{ borderColor: 'var(--border)' }}
              >
                <option value="" disabled>Select frequency</option>
                <option value="SEDENTARY">Sedentary (0-1 time a week)</option>
                <option value="LIGHT">Light (1-2 times a week)</option>
                <option value="MODERATE">Moderate (3-4 times a week)</option>
                <option value="ACTIVE">Active (5-6 times a week)</option>
                <option value="VERY_ACTIVE">Very Active (Daily)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Your Goal *</label>
              <select name="goal" required value={formData.goal} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border bg-white" style={{ borderColor: 'var(--border)' }}>
                <option value="" disabled>Select goal</option>
                <option value="MAINTAIN">Maintain Weight</option>
                <option value="BULK">Bulk (Gain muscle)</option>
                <option value="CUT">Cut (Lose weight)</option>
              </select>
            </div>

            <div className="rounded-xl border bg-white p-4" style={{ borderColor: "var(--border)" }}>
  <div className="mb-3">
    <label className="text-sm font-medium">Dietary Preferences *</label>
    <p className="text-xs text-muted-foreground">Select one or more</p>
  </div>

  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
    {/* None (exclusive) */}
    <label className="cursor-pointer">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={formData.dietaryType.includes("NONE")}
        onChange={(e) => {
          const checked = e.target.checked;
          setFormData((prev) => ({
            ...prev,
            dietaryType: checked ? ["NONE"] : [],
          }));
        }}
      />
      <div
        className="rounded-full border px-3 py-2 text-sm text-center transition hover:bg-gray-50
                   peer-checked:text-white
                   peer-checked:[background-color:var(--sage-green)]
                   peer-checked:[border-color:var(--sage-green)]"
      >
        None
      </div>
    </label>

    {/* Vegan */}
    <label className="cursor-pointer">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={formData.dietaryType.includes("VEGAN")}
        onChange={(e) => {
          const checked = e.target.checked;
          setFormData((prev) => ({
            ...prev,
            dietaryType: checked
              ? [...prev.dietaryType.filter((v) => v !== "NONE"), "VEGAN"]
              : prev.dietaryType.filter((v) => v !== "VEGAN"),
          }));
        }}
      />
      <div
        className="rounded-full border px-3 py-2 text-sm text-center transition hover:bg-gray-50
                   peer-checked:text-white
                   peer-checked:[background-color:var(--sage-green)]
                   peer-checked:[border-color:var(--sage-green)]"
      >
        Vegan
      </div>
    </label>

    {/* Vegetarian */}
    <label className="cursor-pointer">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={formData.dietaryType.includes("VEGETARIAN")}
        onChange={(e) => {
          const checked = e.target.checked;
          setFormData((prev) => ({
            ...prev,
            dietaryType: checked
              ? [...prev.dietaryType.filter((v) => v !== "NONE"), "VEGETARIAN"]
              : prev.dietaryType.filter((v) => v !== "VEGETARIAN"),
          }));
        }}
      />
      <div
        className="rounded-full border px-3 py-2 text-sm text-center transition hover:bg-gray-50
                   peer-checked:text-white
                   peer-checked:[background-color:var(--sage-green)]
                   peer-checked:[border-color:var(--sage-green)]"
      >
        Vegetarian
      </div>
    </label>

    {/* Keto */}
    <label className="cursor-pointer">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={formData.dietaryType.includes("KETO")}
        onChange={(e) => {
          const checked = e.target.checked;
          setFormData((prev) => ({
            ...prev,
            dietaryType: checked
              ? [...prev.dietaryType.filter((v) => v !== "NONE"), "KETO"]
              : prev.dietaryType.filter((v) => v !== "KETO"),
          }));
        }}
      />
      <div
        className="rounded-full border px-3 py-2 text-sm text-center transition hover:bg-gray-50
                   peer-checked:text-white
                   peer-checked:[background-color:var(--sage-green)]
                   peer-checked:[border-color:var(--sage-green)]"
      >
        Keto
      </div>
    </label>

    {/* Halal */}
    <label className="cursor-pointer">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={formData.dietaryType.includes("HALAL")}
        onChange={(e) => {
          const checked = e.target.checked;
          setFormData((prev) => ({
            ...prev,
            dietaryType: checked
              ? [...prev.dietaryType.filter((v) => v !== "NONE"), "HALAL"]
              : prev.dietaryType.filter((v) => v !== "HALAL"),
          }));
        }}
      />
      <div
        className="rounded-full border px-3 py-2 text-sm text-center transition hover:bg-gray-50
                   peer-checked:text-white
                   peer-checked:[background-color:var(--sage-green)]
                   peer-checked:[border-color:var(--sage-green)]"
      >
        Halal
      </div>
    </label>

    {/* Kosher */}
    <label className="cursor-pointer">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={formData.dietaryType.includes("KOSHER")}
        onChange={(e) => {
          const checked = e.target.checked;
          setFormData((prev) => ({
            ...prev,
            dietaryType: checked
              ? [...prev.dietaryType.filter((v) => v !== "NONE"), "KOSHER"]
              : prev.dietaryType.filter((v) => v !== "KOSHER"),
          }));
        }}
      />
      <div
        className="rounded-full border px-3 py-2 text-sm text-center transition hover:bg-gray-50
                   peer-checked:text-white
                   peer-checked:[background-color:var(--sage-green)]
                   peer-checked:[border-color:var(--sage-green)]"
      >
        Kosher
      </div>
    </label>

    {/* Gluten Free */}
    <label className="cursor-pointer">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={formData.dietaryType.includes("GLUTEN_FREE")}
        onChange={(e) => {
          const checked = e.target.checked;
          setFormData((prev) => ({
            ...prev,
            dietaryType: checked
              ? [...prev.dietaryType.filter((v) => v !== "NONE"), "GLUTEN_FREE"]
              : prev.dietaryType.filter((v) => v !== "GLUTEN_FREE"),
          }));
        }}
      />
      <div
        className="rounded-full border px-3 py-2 text-sm text-center transition hover:bg-gray-50
                   peer-checked:text-white
                   peer-checked:[background-color:var(--sage-green)]
                   peer-checked:[border-color:var(--sage-green)]"
      >
        Gluten Free
      </div>
    </label>

    {/* Pescatarian */}
    <label className="cursor-pointer">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={formData.dietaryType.includes("PESCATARIAN")}
        onChange={(e) => {
          const checked = e.target.checked;
          setFormData((prev) => ({
            ...prev,
            dietaryType: checked
              ? [...prev.dietaryType.filter((v) => v !== "NONE"), "PESCATARIAN"]
              : prev.dietaryType.filter((v) => v !== "PESCATARIAN"),
          }));
        }}
      />
      <div
        className="rounded-full border px-3 py-2 text-sm text-center transition hover:bg-gray-50
                   peer-checked:text-white
                   peer-checked:[background-color:var(--sage-green)]
                   peer-checked:[border-color:var(--sage-green)]"
      >
        Pescatarian
      </div>
    </label>
  </div>

  <p className="mt-3 text-xs text-muted-foreground">
    Selected: {formData.dietaryType.includes("NONE") ? 0 : formData.dietaryType.length}
  </p>
</div>

           <div className="rounded-xl border bg-white p-4" style={{ borderColor: "var(--border)" }}>
  <div className="mb-3">
    <label className="text-sm font-medium">Allergies *</label>
    <p className="text-xs text-muted-foreground">Select one or more</p>
  </div>

  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
    {/* None (exclusive) */}
    <label className="cursor-pointer">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={formData.allergies.includes("NONE")}
        onChange={(e) => {
          const checked = e.target.checked;
          setFormData((prev) => ({
            ...prev,
            allergies: checked ? ["NONE"] : [],
          }));
        }}
      />
      <div className="rounded-full border px-3 py-2 text-sm text-center transition hover:bg-gray-50
             peer-checked:text-white
             peer-checked:[background-color:var(--sage-green)]
             peer-checked:[border-color:var(--sage-green)]">
        None
      </div>
    </label>

    {/* Peanuts */}
    <label className="cursor-pointer">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={formData.allergies.includes("PEANUTS")}
        onChange={(e) => {
          const checked = e.target.checked;
          setFormData((prev) => ({
            ...prev,
            allergies: checked
              ? [...prev.allergies.filter((v) => v !== "NONE"), "PEANUTS"]
              : prev.allergies.filter((v) => v !== "PEANUTS"),
          }));
        }}
      />
      <div className="rounded-full border px-3 py-2 text-sm text-center transition hover:bg-gray-50
             peer-checked:text-white
             peer-checked:[background-color:var(--sage-green)]
             peer-checked:[border-color:var(--sage-green)]">
        Peanuts
      </div>
    </label>

    {/* Tree nuts */}
    <label className="cursor-pointer">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={formData.allergies.includes("TREE_NUTS")}
        onChange={(e) => {
          const checked = e.target.checked;
          setFormData((prev) => ({
            ...prev,
            allergies: checked
              ? [...prev.allergies.filter((v) => v !== "NONE"), "TREE_NUTS"]
              : prev.allergies.filter((v) => v !== "TREE_NUTS"),
          }));
        }}
      />
      <div className="rounded-full border px-3 py-2 text-sm text-center transition hover:bg-gray-50
             peer-checked:text-white
             peer-checked:[background-color:var(--sage-green)]
             peer-checked:[border-color:var(--sage-green)]">
        Tree nuts
      </div>
    </label>

    {/* Milk */}
    <label className="cursor-pointer">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={formData.allergies.includes("MILK")}
        onChange={(e) => {
          const checked = e.target.checked;
          setFormData((prev) => ({
            ...prev,
            allergies: checked
              ? [...prev.allergies.filter((v) => v !== "NONE"), "MILK"]
              : prev.allergies.filter((v) => v !== "MILK"),
          }));
        }}
      />
      <div className="rounded-full border px-3 py-2 text-sm text-center transition hover:bg-gray-50
             peer-checked:text-white
             peer-checked:[background-color:var(--sage-green)]
             peer-checked:[border-color:var(--sage-green)]">
        Milk
      </div>
    </label>

    {/* Eggs */}
    <label className="cursor-pointer">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={formData.allergies.includes("EGGS")}
        onChange={(e) => {
          const checked = e.target.checked;
          setFormData((prev) => ({
            ...prev,
            allergies: checked
              ? [...prev.allergies.filter((v) => v !== "NONE"), "EGGS"]
              : prev.allergies.filter((v) => v !== "EGGS"),
          }));
        }}
      />
      <div className="rounded-full border px-3 py-2 text-sm text-center transition hover:bg-gray-50
             peer-checked:text-white
             peer-checked:[background-color:var(--sage-green)]
             peer-checked:[border-color:var(--sage-green)]">
        Eggs
      </div>
    </label>

    {/* Wheat */}
    <label className="cursor-pointer">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={formData.allergies.includes("WHEAT")}
        onChange={(e) => {
          const checked = e.target.checked;
          setFormData((prev) => ({
            ...prev,
            allergies: checked
              ? [...prev.allergies.filter((v) => v !== "NONE"), "WHEAT"]
              : prev.allergies.filter((v) => v !== "WHEAT"),
          }));
        }}
      />
      <div className="rounded-full border px-3 py-2 text-sm text-center transition hover:bg-gray-50
             peer-checked:text-white
             peer-checked:[background-color:var(--sage-green)]
             peer-checked:[border-color:var(--sage-green)]">
        Wheat
      </div>
    </label>

    {/* Soy */}
    <label className="cursor-pointer">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={formData.allergies.includes("SOY")}
        onChange={(e) => {
          const checked = e.target.checked;
          setFormData((prev) => ({
            ...prev,
            allergies: checked
              ? [...prev.allergies.filter((v) => v !== "NONE"), "SOY"]
              : prev.allergies.filter((v) => v !== "SOY"),
          }));
        }}
      />
      <div className="rounded-full border px-3 py-2 text-sm text-center transition hover:bg-gray-50
             peer-checked:text-white
             peer-checked:[background-color:var(--sage-green)]
             peer-checked:[border-color:var(--sage-green)]">
        Soy
      </div>
    </label>

    {/* Fish */}
    <label className="cursor-pointer">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={formData.allergies.includes("FISH")}
        onChange={(e) => {
          const checked = e.target.checked;
          setFormData((prev) => ({
            ...prev,
            allergies: checked
              ? [...prev.allergies.filter((v) => v !== "NONE"), "FISH"]
              : prev.allergies.filter((v) => v !== "FISH"),
          }));
        }}
      />
      <div className="rounded-full border px-3 py-2 text-sm text-center transition hover:bg-gray-50
             peer-checked:text-white
             peer-checked:[background-color:var(--sage-green)]
             peer-checked:[border-color:var(--sage-green)]">
        Fish
      </div>
    </label>

    {/* Shellfish */}
    <label className="cursor-pointer">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={formData.allergies.includes("SHELLFISH")}
        onChange={(e) => {
          const checked = e.target.checked;
          setFormData((prev) => ({
            ...prev,
            allergies: checked
              ? [...prev.allergies.filter((v) => v !== "NONE"), "SHELLFISH"]
              : prev.allergies.filter((v) => v !== "SHELLFISH"),
          }));
        }}
      />
      <div className="rounded-full border px-3 py-2 text-sm text-center transition hover:bg-gray-50
             peer-checked:text-white
             peer-checked:[background-color:var(--sage-green)]
             peer-checked:[border-color:var(--sage-green)]">
        Shellfish
      </div>
    </label>

    {/* Sesame */}
    <label className="cursor-pointer">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={formData.allergies.includes("SESAME")}
        onChange={(e) => {
          const checked = e.target.checked;
          setFormData((prev) => ({
            ...prev,
            allergies: checked
              ? [...prev.allergies.filter((v) => v !== "NONE"), "SESAME"]
              : prev.allergies.filter((v) => v !== "SESAME"),
          }));
        }}
      />
      <div className="rounded-full border px-3 py-2 text-sm text-center transition hover:bg-gray-50
             peer-checked:text-white
             peer-checked:[background-color:var(--sage-green)]
             peer-checked:[border-color:var(--sage-green)]">
        Sesame
      </div>
    </label>

    {/* Gluten */}
    <label className="cursor-pointer">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={formData.allergies.includes("GLUTEN")}
        onChange={(e) => {
          const checked = e.target.checked;
          setFormData((prev) => ({
            ...prev,
            allergies: checked
              ? [...prev.allergies.filter((v) => v !== "NONE"), "GLUTEN"]
              : prev.allergies.filter((v) => v !== "GLUTEN"),
          }));
        }}
      />
      <div className="rounded-full border px-3 py-2 text-sm text-center transition hover:bg-gray-50
             peer-checked:text-white
             peer-checked:[background-color:var(--sage-green)]
             peer-checked:[border-color:var(--sage-green)]">
        Gluten
      </div>
    </label>
  </div>

  <p className="mt-3 text-xs text-muted-foreground">
    Selected: {formData.allergies.includes("NONE") ? 0 : formData.allergies.length}
  </p>
</div>

            <Button
              type="submit"
              className="w-full h-12 text-white font-semibold mt-4"
              disabled={isLoading}
              style={{ backgroundColor: 'var(--sage-green)' }}
            >
              {isLoading ? "Saving..." : "Finish Setup"}
            </Button>
          </form>
    

    </div>
      </div>
    </div>
  );
}