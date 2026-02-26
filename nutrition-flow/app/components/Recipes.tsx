"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { ArrowLeft, Plus, ChefHat, Clock, Flame } from "lucide-react";

// This function takes a list of 'recipes' from the database and draws them on the screen
export function Recipes({ recipes }: { recipes: any[] }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* --- HEADER --- */}
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back button to go to the home page */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            {/* Page Title */}
            <div className="flex items-center gap-3">
              <ChefHat className="w-6 h-6" style={{ color: "var(--sage-green-dark)" }} />
              <h1 className="text-2xl font-bold" style={{ color: "var(--sage-green-dark)" }}>
                My Recipes
              </h1>
            </div>
          </div>

          {/* "Add Recipe" button to open the creation form */}
          <Button
            className="text-white"
            style={{ backgroundColor: "var(--sage-green)" }}
            onClick={() => router.push("/recipes/new")}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Recipe
          </Button>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto p-6">
        
        {/* CHECK: If there are NO recipes in the database, show this message */}
        {(!recipes || recipes.length === 0) ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <ChefHat className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-medium text-gray-900">No recipes yet</h2>
            <p className="text-gray-500 mt-2">Create your first recipe to see it appear here.</p>
          </div>
        ) : (
          /* GRID: If recipes EXIST, show them in a 3-column grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* LOOP: Go through every recipe one by one and create a card */}
            {recipes.map((recipe) => (
              <Card key={recipe.id} className="overflow-hidden rounded-2xl hover:shadow-lg transition-shadow bg-white flex flex-col">
                
                {/* IMAGE: Only shows the picture if the user actually uploaded one */}
                {recipe.imageUrl && (
                  <div className="relative w-full h-48 overflow-hidden rounded-t-2xl">
                    <img 
                      src={recipe.imageUrl} 
                      alt={recipe.name} 
                      className="w-full h-full object-cover"
                    />
                    {/* Category Label (e.g., Breakfast) on top of the image */}
                    {recipe.category && (
                      <div 
                        className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: "var(--lilac-purple-light)" }}
                      >
                        {recipe.category}
                      </div>
                    )}
                  </div>
                )}

                {/* TEXT AREA: Inside the card */}
                <div className="p-5 flex-grow">
                  <h3 className="text-xl font-bold mb-3" style={{ color: "var(--sage-green-dark)" }}>
                    {recipe.name}
                  </h3>

                  {/* TAGS: Small badges for things like #Vegan or #Quick */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {recipe.tags?.map((tag: string) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="text-[10px] font-semibold border-none"
                        style={{ backgroundColor: "var(--sage-green-light)", color: "var(--sage-green-dark)" }}
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  {/* DETAILS: Cooking time and Calories */}
                  <div className="flex items-center gap-4 mb-6 text-sm text-gray-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{recipe.prepTimeMinutes || "0"} min</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span>{recipe.estimatedCalories || "0"} kcal</span>
                    </div>
                  </div>

                  {/* BUTTONS: View full details or add to the meal plan */}
                  <div className="flex gap-2 mt-auto">
                    <Button
                      variant="outline"
                      className="flex-1 text-xs"
                      style={{ borderColor: "var(--sage-green)", color: "var(--sage-green-dark)" }}
                    >
                      View Details
                    </Button>
                    <Button
                      className="flex-1 text-xs text-white"
                      style={{ backgroundColor: "var(--sage-green)" }}
                    >
                      Add to Plan
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}