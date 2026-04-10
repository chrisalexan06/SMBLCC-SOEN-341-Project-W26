"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft, BookmarkX, Clock, Flame } from "lucide-react";
import { RecipeDetailsDialog } from "@/app/components/RecipeDetailsDialog";

export function SavedRecipes({ savedRecipes }: { savedRecipes: any[] }) {
  const router = useRouter();
  const [items, setItems] = useState(savedRecipes);
  const [viewingRecipe, setViewingRecipe] = useState<any | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const recipes = useMemo(() => items.map((item) => item.recipe), [items]);

  const handleRemove = async (recipeId: string) => {
    try {
      const response = await fetch("/api/saved-recipes", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipeId }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove saved recipe");
      }

      setItems((prev) => prev.filter((item) => item.recipe.id !== recipeId));
    } catch (error) {
      console.error("Failed to remove saved recipe:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Saved Recipes</h1>
          <p className="text-sm text-muted-foreground">
            Recipes you saved from the For You feed to review later.
          </p>
        </div>

        {recipes.length === 0 ? (
          <Card className="p-10 text-center rounded-3xl">
            <h2 className="text-xl font-semibold mb-2">No saved recipes yet</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Save recipes from your For You section and they will appear here.
            </p>
            <Button onClick={() => router.push("/dashboard")}>
              Go to For You
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Card
                key={recipe.id}
                className="overflow-hidden rounded-3xl border border-gray-100 shadow-sm bg-white"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    setViewingRecipe(recipe);
                    setIsViewOpen(true);
                  }}
                >
                  <div className="relative w-full aspect-[16/9] bg-gray-50 overflow-hidden">
                    <img
                      src={recipe.imageUrl || "/images/meals.webp"}
                      alt={recipe.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {recipe.name}
                    </h3>

                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-orange-400" />
                        {recipe.estimatedCalories || "---"} kcal
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {recipe.prepTimeMinutes} min
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {recipe.dietaryTags?.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
                        >
                          {tag.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleRemove(recipe.id)}
                  >
                    <BookmarkX className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <RecipeDetailsDialog
          isOpen={isViewOpen}
          onOpenChange={setIsViewOpen}
          recipe={viewingRecipe}
        />
      </div>
    </div>
  );
}