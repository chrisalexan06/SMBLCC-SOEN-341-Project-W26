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
import { Checkbox } from "@/app/components/ui/checkbox";
import { ArrowLeft, ChefHat, Clock, Flame, Pencil, Search, Utensils, ListChecks, Trash2 } from "lucide-react"; // Cute icons from lucide
import { toast } from "sonner";

export function Recipes({ recipes }: { recipes: any[] }) {
  const router = useRouter();

  //SEARCH STATE
  const [searchQuery, setSearchQuery] = useState("");

  //SELECTION STATE
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(new Set());

  //MODAL STATES
  const [editingRecipe, setEditingRecipe] = useState<any>(null);
  const [viewingRecipe, setViewingRecipe] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  //FORM STATE (For Editing)
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

  //FILTER LOGIC
  const filteredRecipes = (recipes || []).filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  //HANDLERS
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
    setIsEditDialogOpen(true);
  };

  const handleToggleSelection = (recipeId: string) => {
    setSelectedRecipes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recipeId)) {
        newSet.delete(recipeId);
      } else {
        newSet.add(recipeId);
      }
      return newSet;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedRecipes.size === 0) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedRecipes.size} recipe${selectedRecipes.size > 1 ? "s" : ""}? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      setIsDeleting(true);
      const deletionPromises = Array.from(selectedRecipes).map((recipeId) =>
        fetch("/api/recipes", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId }),
        })
      );

      const responses = await Promise.all(deletionPromises);
      const allSuccess = responses.every((res) => res.ok);

      if (!allSuccess) {
        throw new Error("Failed to delete one or more recipes");
      }

      setSelectedRecipes(new Set());
      toast.success(`Successfully deleted ${selectedRecipes.size} recipe${selectedRecipes.size > 1 ? "s" : ""}`);
      router.refresh();
    } catch (error) {
      toast.error("Error deleting recipes. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewDetails = (recipe: any) => {
    setViewingRecipe(recipe);
    setIsViewOpen(true);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleEditSubmit = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/recipes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId: editingRecipe.id, ...formData }),
      });
      if (!response.ok) throw new Error("Failed to update recipe");
      setIsEditDialogOpen(false);
      router.refresh();
    } catch (error) {
      alert("Error updating recipe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/*HEADER*/}
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <ChefHat className="w-6 h-6 text-sage-600" />
              <h1 className="text-2xl font-bold text-gray-800">My Recipes</h1>
            </div>
          </div>
        </div>
      </header>

      {/*MAIN CONTENT*/}
      <main className="max-w-7xl mx-auto p-6">
        
        {/* Search Bar and Delete Button */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              placeholder="Search your recipes by name..."
              className="w-full pl-10 pr-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-sage-500 outline-none text-sm"
              style={{ borderColor: "var(--sage-green-light)" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {selectedRecipes.size > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600">
                {selectedRecipes.size} selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          )}
        </div>

        {/* Recipe Grid */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 italic">No recipes found matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <Card key={recipe.id} className="overflow-hidden rounded-2xl bg-white flex flex-col relative group border-none shadow-sm hover:shadow-md transition-all">
                
                {/* Checkbox - Top Left */}
                <div className="absolute top-3 left-3 z-10">
                  <Checkbox
                    checked={selectedRecipes.has(recipe.id)}
                    onCheckedChange={() => handleToggleSelection(recipe.id)}
                    className="w-5 h-5"
                  />
                </div>

                {/* Edit Pencil (Hover Only) */}
                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" className="rounded-full text-white" onClick={() => handleEditClick(recipe)} style={{ background: "linear-gradient(135deg, var(--lilac-purple) 0%, var(--sage-green) 100%)" }}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>

                {/* Recipe Image */}
                <div className="relative h-48 w-full bg-gray-100">
                  {recipe.imageUrl ? (
                    <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300"><ChefHat className="w-12 h-12 opacity-20" /></div>
                  )}
                </div>

                <div className="p-5 flex-grow flex flex-col">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{recipe.name}</h3>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between py-3 border-t border-gray-50 mb-4">
                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                      <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-sage-600" /><span>{recipe.prepTimeMinutes}m</span></div>
                      <div className="flex items-center gap-1"><Flame className="w-4 h-4 text-orange-500" /><span>{recipe.estimatedCalories} kcal</span></div>
                    </div>
                    <Badge className={`text-[10px] ${recipe.difficulty === "EASY" ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-700"}`}>
                      {recipe.difficulty}
                    </Badge>
                  </div>

                  {/* Single Full-Width Button */}
                  <div className="mt-auto">
                    <Button 
                      className="w-full text-xs font-bold text-white h-10" 
                      onClick={() => handleViewDetails(recipe)}
                      style={{ background: "linear-gradient(135deg, var(--lilac-purple) 0%, var(--sage-green) 100%)" }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/*VIEW DETAILS DIALOG*/}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl">
          {viewingRecipe && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-sage-800">{viewingRecipe.name}</DialogTitle>
              </DialogHeader>

              {viewingRecipe.imageUrl && <img src={viewingRecipe.imageUrl} className="w-full h-64 object-cover rounded-xl" alt="" />}
              
              <p className="text-gray-600 italic border-l-4 border-sage-200 pl-4">{viewingRecipe.description || "No description provided."}</p>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100 text-sm font-semibold">
                <div className="flex items-center gap-2"><Clock className="text-sage-600"/> {viewingRecipe.prepTimeMinutes} Minutes</div>
                <div className="flex items-center gap-2"><Flame className="text-orange-500"/> {viewingRecipe.estimatedCalories} Calories</div>
              </div>

              {/* Ingredients */}
              <div>
                <h4 className="flex items-center gap-2 font-bold text-lg mb-3"><Utensils className="w-5 h-5 text-sage-600" /> Ingredients</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {viewingRecipe.ingredients?.length > 0 ? (
                    viewingRecipe.ingredients.map((ing: any, idx: number) => (
                      <li key={idx} className="bg-gray-50 p-2 rounded-lg text-sm text-gray-700">
                        <span className="font-bold text-sage-700">{ing.amount} {ing.unit}</span> {ing.name}
                      </li>
                    ))
                  ) : (<p className="text-gray-400 italic">No ingredients found.</p>)}
                </ul>
              </div>

              {/* Steps */}
              <div>
                <h4 className="flex items-center gap-2 font-bold text-lg mb-3"><ListChecks className="w-5 h-5 text-sage-600" /> Preparation Steps</h4>
                <div className="space-y-3">
                  {viewingRecipe.prepSteps?.length > 0 ? (
                    viewingRecipe.prepSteps.map((step: string, idx: number) => (
                      <div key={idx} className="flex gap-3 text-sm text-gray-700">
                        <span className="font-bold text-sage-600">{idx + 1}.</span>
                        <p>{step}</p>
                      </div>
                    ))
                  ) : (<p className="text-gray-400 italic">No steps found.</p>)}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/*EDIT RECIPE DIALOG*/}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Recipe</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div><label className="text-sm font-medium">Recipe Name *</label><Input value={formData.recipeName} onChange={(e) => handleInputChange("recipeName", e.target.value)} /></div>
            <div><label className="text-sm font-medium">Description</label><Textarea value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">Prep Time (min)</label><Input type="number" value={formData.prepTime} onChange={(e) => handleInputChange("prepTime", parseInt(e.target.value) || 0)} /></div>
              <div><label className="text-sm font-medium">Difficulty</label>
                <Select value={formData.difficulty} onValueChange={(v) => handleInputChange("difficulty", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent><SelectItem value="EASY">Easy</SelectItem><SelectItem value="MEDIUM">Medium</SelectItem><SelectItem value="HARD">Hard</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isLoading} className="flex-1">Cancel</Button>
              <Button onClick={handleEditSubmit} disabled={isLoading} className="flex-1 text-white bg-sage-500">{isLoading ? "Saving..." : "Save Changes"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}