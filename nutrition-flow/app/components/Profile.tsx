"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Switch } from "@/app/components/ui/switch";
import { ArrowLeft, User } from "lucide-react";

export function Profile() {
  const router = useRouter();
  const [weight, setWeight] = useState("150");
  const [height, setHeight] = useState("5'8\"");
  const [allergies, setAllergies] = useState({
    peanuts: false,
    gluten: false,
  });

  const handleSave = () => {
    // Mock save functionality
    alert("Settings saved successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl" style={{ color: "var(--sage-green-dark)" }}>
              NutriFlow - Profile Settings
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-10 h-10"
            style={{ backgroundColor: "var(--lilac-purple-light)" }}
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto p-6">
        <div className="space-y-6">
          {/* Profile Picture Section */}
          <Card className="p-6 rounded-2xl">
            <h3 className="mb-6">Profile Picture</h3>
            <div className="flex items-center gap-6">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
                style={{ backgroundColor: "var(--lilac-purple-light)" }}
              >
                👤
              </div>
              <div className="flex-1">
                <Button
                  variant="outline"
                  className="mr-3"
                  style={{ borderColor: "var(--sage-green)" }}
                >
                  Upload Photo
                </Button>
                <Button variant="ghost" className="text-muted-foreground">
                  Remove
                </Button>
              </div>
            </div>
          </Card>

          {/* Personal Information */}
          <Card className="p-6 rounded-2xl">
            <h3 className="mb-6">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue="Alex Johnson"
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "var(--border)",
                    "--tw-ring-color": "var(--sage-green)",
                  } as React.CSSProperties}
                />
              </div>
              <div>
                <label className="block mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="alex.johnson@university.edu"
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "var(--border)",
                    "--tw-ring-color": "var(--sage-green)",
                  } as React.CSSProperties}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Weight (lbs)</label>
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      borderColor: "var(--border)",
                      "--tw-ring-color": "var(--sage-green)",
                    } as React.CSSProperties}
                  />
                </div>
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

          {/* Dietary Preferences */}
          <Card className="p-6 rounded-2xl">
            <h3 className="mb-6">Dietary Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Daily Calorie Goal</label>
                <input
                  type="text"
                  defaultValue="2000"
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "var(--border)",
                    "--tw-ring-color": "var(--sage-green)",
                  } as React.CSSProperties}
                />
              </div>
              <div>
                <label className="block mb-2">Diet Type</label>
                <select
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "var(--border)",
                    "--tw-ring-color": "var(--sage-green)",
                  } as React.CSSProperties}
                >
                  <option>None</option>
                  <option>Vegetarian</option>
                  <option>Vegan</option>
                  <option>Pescatarian</option>
                  <option>Keto</option>
                  <option>Paleo</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Allergies */}
          <Card className="p-6 rounded-2xl">
            <h3 className="mb-6">Allergies & Restrictions</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                <div className="flex-1">
                  <div className="mb-1">Peanuts</div>
                  <div className="text-sm text-muted-foreground">
                    Alert me about peanut ingredients
                  </div>
                </div>
                <Switch
                  checked={allergies.peanuts}
                  onCheckedChange={(checked) =>
                    setAllergies({ ...allergies, peanuts: checked })
                  }
                  className="data-[state=checked]:bg-[var(--sage-green)]"
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                <div className="flex-1">
                  <div className="mb-1">Gluten</div>
                  <div className="text-sm text-muted-foreground">
                    Alert me about gluten ingredients
                  </div>
                </div>
                <Switch
                  checked={allergies.gluten}
                  onCheckedChange={(checked) =>
                    setAllergies({ ...allergies, gluten: checked })
                  }
                  className="data-[state=checked]:bg-[var(--sage-green)]"
                />
              </div>
              <Button
                variant="outline"
                className="w-full"
                style={{ borderColor: "var(--sage-green)", color: "var(--sage-green-dark)" }}
              >
                Add More Allergies
              </Button>
            </div>
          </Card>

          {/* Privacy Settings */}
          <Card className="p-6 rounded-2xl">
            <h3 className="mb-6">Privacy Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                <div className="flex-1">
                  <div className="mb-1">Public Profile</div>
                  <div className="text-sm text-muted-foreground">
                    Make your meals visible to all users
                  </div>
                </div>
                <Switch
                  defaultChecked
                  className="data-[state=checked]:bg-[var(--sage-green)]"
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                <div className="flex-1">
                  <div className="mb-1">Share Location</div>
                  <div className="text-sm text-muted-foreground">
                    Show nearby restaurants in your area
                  </div>
                </div>
                <Switch
                  defaultChecked
                  className="data-[state=checked]:bg-[var(--sage-green)]"
                />
              </div>
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
