"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { ArrowLeft, Plus, ChefHat, Clock, Flame, Pencil, Search } from "lucide-react";

// This function takes a list of 'recipes' from the database and draws them on the screen
export function Recipes({ recipes }: { recipes: any[] }) {
  const router = useRouter();
 
  //SEARCH STATE 
  const [searchQuery, setSearchQuery] = useState("");

  //EDITING STATE 
  const [editingRecipe, setEditingRecipe] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    recipeName: "",
    description: "",
    imageUrl: "",
    prepTime: 0,
    prepSteps: [],
    difficulty: "",
    estimatedCalories: 0,
    estimatedCost: 0,
    ingredients: [],
  });

  // FILTER LOGIC 
  // This filters the recipes based on what the user types in the search bar
  const filteredRecipes = (recipes || []).filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditClick = (recipe: any) => {
    setEditingRecipe(recipe);
    setFormData({
      recipeName: recipe.name,
      description: recipe.description || "",
      imageUrl: recipe.imageUrl || "",
      prepTime: recipe.prepTimeMinutes || 0,
      prepSteps: recipe.prepSteps || [],
      difficulty: recipe.difficulty || "",
      estimatedCalories: recipe.estimatedCalories || 0,
      estimatedCost: recipe.estimatedCost || 0,
      ingredients: recipe.ingredients || [],
    });
    setIsDialogOpen(true);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditSubmit = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/recipes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipeId: editingRecipe.id,
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update recipe");
      }

      setIsDialogOpen(false);
      setEditingRecipe(null);
      router.refresh();
    } catch (error) {
      console.error("Error updating recipe:", error);
      alert("Failed to update recipe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
     
      {/* --- HEADER --- */}
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
           
            <div className="flex items-center gap-3">
              <ChefHat className="w-6 h-6" style={{ color: "var(--sage-green-dark)" }} />
              <h1 className="text-2xl font-bold" style={{ color: "var(--sage-green-dark)" }}>
                My Recipes
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto p-6">
       
        {/* --- SEARCH BAR --- */}
        <div className="relative mb-8 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search your recipes by name..."
            className="block w-full pl-10 pr-3 py-2 border rounded-xl leading-5 bg-white focus:ring-2 focus:ring-sage-500"
            style={{ borderColor: "var(--sage-green-light)" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* CHECK: If there are NO recipes in the database at all */}
        {(!recipes || recipes.length === 0) ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <ChefHat className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-medium text-gray-900">No recipes yet</h2>
            <p className="text-gray-500 mt-2">Create your first recipe to see it appear here.</p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          /* CHECK: If search results are empty */
          <div className="text-center py-20">
            <p className="text-gray-500">No recipes found matching "{searchQuery}"</p>
          </div>
        ) : (
          /* GRID: Show filtered recipes */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <Card key={recipe.id} className="overflow-hidden rounded-2xl hover:shadow-lg transition-shadow bg-white flex flex-col relative group">
               
                {/* EDIT BUTTON */}
                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    className="rounded-full select-none"
                    style={{ backgroundColor: "var(--sage-green)", color: "white" }}
                    onClick={() => handleEditClick(recipe)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>

                {/* IMAGE */}
                <div className="relative w-full h-48 overflow-hidden rounded-t-2xl bg-gray-100">
                  {recipe.imageUrl ? (
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ChefHat className="w-12 h-12 opacity-20" />
                    </div>
                  )}
                  {recipe.category && (
                    <div
                      className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: "var(--lilac-purple-light)" }}
                    >
                      {recipe.category}
                    </div>
                  )}
                </div>

                {/* TEXT AREA */}
                <div className="p-5 flex-grow">
                  <h3 className="text-xl font-bold mb-3" style={{ color: "var(--sage-green-dark)" }}>
                    {recipe.name}
                  </h3>

                  {/* TAGS */}
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

                  {/* DETAILS: Time and Calories */}
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

                  {/* BUTTONS */}
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

      {/* --- EDIT RECIPE DIALOG --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Recipe</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Recipe Name *</label>
              <Input
                value={formData.recipeName}
                onChange={(e) => handleInputChange("recipeName", e.target.value)}
                placeholder="Enter recipe name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter recipe description"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Image URL</label>
              <Input
                value={formData.imageUrl}
                onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                placeholder="Enter image URL"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Prep Time (min) *</label>
                <Input
                  type="number"
                  value={formData.prepTime}
                  onChange={(e) => handleInputChange("prepTime", parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Difficulty *</label>
                <Select value={formData.difficulty} onValueChange={(value) => handleInputChange("difficulty", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Calories</label>
                <Input
                  type="number"
                  value={formData.estimatedCalories}
                  onChange={(e) => handleInputChange("estimatedCalories", parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cost ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.estimatedCost}
                  onChange={(e) => handleInputChange("estimatedCost", parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSubmit}
                disabled={isLoading}
                className="flex-1 text-white"
                style={{ backgroundColor: "var(--sage-green)" }}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}