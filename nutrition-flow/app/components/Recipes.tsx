"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft, Plus, ChefHat, Clock, Flame } from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

const recipes = [
  {
    id: 1,
    name: "Quinoa Buddha Bowl",
    image: "https://images.unsplash.com/photo-1672959202028-51e3b71255bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwYm93bCUyMGZvb2R8ZW58MXx8fHwxNzcwMDUwNTYzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    calories: 450,
    time: "25 min",
    category: "Lunch",
    macros: { protein: 18, carbs: 65, fat: 12 },
  },
  {
    id: 2,
    name: "Avocado Toast with Eggs",
    image: "https://images.unsplash.com/photo-1609158087148-3bae840bcfda?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmVha2Zhc3QlMjBhdm9jYWRvJTIwdG9hc3R8ZW58MXx8fHwxNzcwMDIzMTUyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    calories: 350,
    time: "10 min",
    category: "Breakfast",
    macros: { protein: 14, carbs: 32, fat: 18 },
  },
  {
    id: 3,
    name: "Creamy Pasta Primavera",
    image: "https://images.unsplash.com/photo-1676300184847-4ee4030409c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMGRpc2glMjBmb29kfGVufDF8fHx8MTc3MDAxMDA1NXww&ixlib=rb-4.1.0&q=80&w=1080",
    calories: 680,
    time: "30 min",
    category: "Dinner",
    macros: { protein: 22, carbs: 85, fat: 24 },
  },
  {
    id: 4,
    name: "Meal Prep Power Bowl",
    image: "https://images.unsplash.com/photo-1666251214795-a1296307d29c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwbWVhbCUyMHByZXB8ZW58MXx8fHwxNzY5OTk4ODk0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    calories: 520,
    time: "40 min",
    category: "Lunch",
    macros: { protein: 32, carbs: 55, fat: 15 },
  },
  {
    id: 5,
    name: "Greek Yogurt Parfait",
    image: "https://images.unsplash.com/photo-1672959202028-51e3b71255bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwYm93bCUyMGZvb2R8ZW58MXx8fHwxNzcwMDUwNTYzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    calories: 280,
    time: "5 min",
    category: "Breakfast",
    macros: { protein: 20, carbs: 35, fat: 6 },
  },
  {
    id: 6,
    name: "Grilled Chicken Salad",
    image: "https://images.unsplash.com/photo-1672959202028-51e3b71255bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwYm93bCUyMGZvb2R8ZW58MXx8fHwxNzcwMDUwNTYzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    calories: 380,
    time: "20 min",
    category: "Lunch",
    macros: { protein: 35, carbs: 25, fat: 12 },
  },
];

export function Recipes() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <ChefHat className="w-6 h-6" style={{ color: "var(--sage-green-dark)" }} />
              <h1 className="text-2xl" style={{ color: "var(--sage-green-dark)" }}>
                My Recipes
              </h1>
            </div>
          </div>
          <Button
            className="text-white"
            style={{ backgroundColor: "var(--sage-green)" }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Recipe
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Filter Tabs */}
        <div className="flex gap-3 mb-6">
          <button
            className="px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: "var(--sage-green)" }}
          >
            All Recipes
          </button>
          <button className="px-4 py-2 rounded-lg bg-white hover:bg-gray-50">
            Breakfast
          </button>
          <button className="px-4 py-2 rounded-lg bg-white hover:bg-gray-50">
            Lunch
          </button>
          <button className="px-4 py-2 rounded-lg bg-white hover:bg-gray-50">
            Dinner
          </button>
          <button className="px-4 py-2 rounded-lg bg-white hover:bg-gray-50">
            Snacks
          </button>
        </div>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="overflow-hidden rounded-2xl hover:shadow-lg transition-shadow cursor-pointer">
              <div className="relative">
                <ImageWithFallback
                  src={recipe.image}
                  alt={recipe.name}
                  className="w-full h-48 object-cover"
                />
                <div
                  className="absolute top-3 right-3 px-3 py-1 rounded-full text-sm"
                  style={{ backgroundColor: "var(--lilac-purple-light)" }}
                >
                  {recipe.category}
                </div>
              </div>
              <div className="p-5">
                <h3 className="mb-3">{recipe.name}</h3>
                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{recipe.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="w-4 h-4" />
                    <span>{recipe.calories} cal</span>
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  <div
                    className="flex-1 px-3 py-2 rounded-lg text-center text-xs"
                    style={{ backgroundColor: "var(--sage-green-light)" }}
                  >
                    <div className="text-muted-foreground">Protein</div>
                    <div>{recipe.macros.protein}g</div>
                  </div>
                  <div
                    className="flex-1 px-3 py-2 rounded-lg text-center text-xs"
                    style={{ backgroundColor: "var(--lilac-purple-light)" }}
                  >
                    <div className="text-muted-foreground">Carbs</div>
                    <div>{recipe.macros.carbs}g</div>
                  </div>
                  <div
                    className="flex-1 px-3 py-2 rounded-lg text-center text-xs"
                    style={{ backgroundColor: "var(--sage-green-light)" }}
                  >
                    <div className="text-muted-foreground">Fat</div>
                    <div>{recipe.macros.fat}g</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    style={{ borderColor: "var(--sage-green)", color: "var(--sage-green-dark)" }}
                  >
                    View Recipe
                  </Button>
                  <Button
                    className="flex-1 text-white"
                    style={{ backgroundColor: "var(--sage-green)" }}
                  >
                    Add to Plan
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
