"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Slider } from "@/app/components/ui/slider";
import { Checkbox } from "@/app/components/ui/checkbox";
import { ArrowLeft, ChefHat, Clock, Flame, Pencil, Search, Utensils, ListChecks, Trash2, Plus, DollarSign, X, ImageIcon, FileText, ListOrdered, Tag } from "lucide-react"; // Cute icons from lucide
import { toast } from "sonner";

export function Recipes({ recipes }: { recipes: any[] }) {
  const router = useRouter();

  //SEARCH STATE
  const [searchQuery, setSearchQuery] = useState("");
  
  //FILTER STATE - VISUAL ONLY
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [timeFilter, setTimeFilter] = useState<number | null>(null);
  const [costFilter, setCostFilter] = useState<number | null>(null);

  //SELECTION STATE
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(new Set());
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string | null>(null);

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
    dietaryTags: [],
  });

  //FILTER LOGIC
  const filteredRecipes = (recipes || []).filter((recipe) => {
  // Search
  if (!recipe.name.toLowerCase().startsWith(searchQuery.toLowerCase())) return false;

  // Difficulty (your state stores "Easy"/"Medium"/"Hard", DB stores "EASY"/"MEDIUM"/"HARD")
  if (selectedDifficulty && recipe.difficulty !== selectedDifficulty.toUpperCase()) return false;

  // Time (timeFilter is a number representing minutes)
  if (timeFilter && recipe.prepTimeMinutes > timeFilter) return false;

  // Cost
  if (costFilter && recipe.estimatedCost > costFilter) return false;

  // Dietary tags (your UI uses "Gluten Free", DB stores "GLUTEN_FREE") - show recipe only if it matches ALL selected tags
  if (selectedTags.size > 0) {
    const allTagsMatch = Array.from(selectedTags).every((tag) => {
      const normalizedTag = tag.toUpperCase().replace(" ", "_");
      return recipe.dietaryTags?.includes(normalizedTag);
    });
    if (!allTagsMatch) return false;
  }

  return true;
});

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
      dietaryTags: recipe.dietaryTags || [],
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
      const count = selectedRecipes.size;
      setDeleteSuccessMessage(`Successfully deleted ${count} recipe${count > 1 ? "s" : ""}`);
      setTimeout(() => {
        setDeleteSuccessMessage(null);
        router.refresh();
      }, 2000);
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
        body: JSON.stringify({
          recipeId: editingRecipe.id,
          name: formData.recipeName,
          description: formData.description,
          imageUrl: formData.imageUrl,
          prepTimeMinutes: formData.prepTime,
          difficulty: formData.difficulty,
          estimatedCalories: formData.estimatedCalories,
          estimatedCost: formData.estimatedCost,
          ingredients: formData.ingredients,
          prepSteps: formData.prepSteps,
          dietaryTags: formData.dietaryTags,
        }),
      });
      if (!response.ok) throw new Error("Failed to update recipe");
      setIsEditDialogOpen(false);
      toast.success("Recipe updated successfully!");
      router.refresh();
    } catch (error) {
      toast.error("Error updating recipe. Please try again.");
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

          {deleteSuccessMessage ? (
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg" style={{ backgroundColor: "var(--sage-green-light)" }}>
              <span className="text-sm font-medium" style={{ color: "var(--sage-green-dark)" }}>
                ✓ {deleteSuccessMessage}
              </span>
            </div>
          ) : selectedRecipes.size > 0 ? (

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600">
                {selectedRecipes.size} selected
              </span>
              <Button
                data-testid="delete-selected-button"
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

          ) : null}

        </div>

        {/* --- FILTERS SECTION --- */}
        <div className="space-y-4 mb-8">
          
          {/* Row 1: Difficulty & Time & Cost */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Filters:</span>
            
            {/* Difficulty Slider */}
            <div className="relative bg-gray-100 rounded-full p-1 flex items-center h-9 w-[220px]">
              {/* Sliding Background */}
              <div 
                className={`absolute top-1 bottom-1 rounded-full transition-all duration-300 shadow-sm ${
                    !selectedDifficulty ? "hidden" :
                    selectedDifficulty === "Easy" ? "left-1 w-[68px] bg-green-100 text-green-700 ring-1 ring-green-200" :
                    selectedDifficulty === "Medium" ? "left-[72px] w-[75px] bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200" :
                    "left-[152px] w-[64px] bg-red-100 text-red-700 ring-1 ring-red-200"
                }`}
              ></div>

              {/* Text Labels */}
              <button 
                onClick={() => setSelectedDifficulty(selectedDifficulty === "Easy" ? null : "Easy")}
                className={`relative z-10 w-[68px] text-[11px] font-medium transition-colors text-center ${selectedDifficulty === "Easy" ? "text-green-800" : "text-gray-500 hover:text-gray-800"}`}
              >
                Easy
              </button>
              <button 
                onClick={() => setSelectedDifficulty(selectedDifficulty === "Medium" ? null : "Medium")}
                className={`relative z-10 w-[75px] text-[11px] font-medium transition-colors text-center ${selectedDifficulty === "Medium" ? "text-yellow-800" : "text-gray-500 hover:text-gray-800"}`}
              >
                Medium
              </button>
              <button 
                onClick={() => setSelectedDifficulty(selectedDifficulty === "Hard" ? null : "Hard")}
                className={`relative z-10 w-[64px] text-[11px] font-medium transition-colors text-center ${selectedDifficulty === "Hard" ? "text-red-800" : "text-gray-500 hover:text-gray-800"}`}
              >
                Hard
              </button>
            </div>

            <div className="h-6 w-px bg-gray-200 mx-1"></div>

            {/* Time Filter - Slider */}
            <div className="w-[160px] space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-600 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-orange-400" /> Time Limit:&nbsp;
                  {timeFilter ? `${timeFilter}m` : "Any"}
                </label>
              </div>
              <Slider
                value={timeFilter ? [timeFilter] : [120]}
                onValueChange={(val) => setTimeFilter(val[0] === 120 ? null : val[0])}
                min={0}
                max={120}
                step={5}
                className="w-full"
              />
            </div>

            {/* Cost Filter - Slider */}
            <div className="w-[160px] space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-600 flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Max Cost:&nbsp;
                  {costFilter ? `$${costFilter}` : "Any"}
                </label>
              </div>
              <Slider
                value={costFilter ? [costFilter] : [200]}
                onValueChange={(val) => setCostFilter(val[0] === 200 ? null : val[0])}
                min={0}
                max={200}
                step={1}
                className="w-full"
              />
            </div>

            {/* Clear Filters (Only shows if something is selected) */}
            {(selectedDifficulty || selectedTags.size > 0 || timeFilter || costFilter) && (
              <button 
                onClick={() => {
                  setSelectedDifficulty(null);
                  setSelectedTags(new Set());
                  setTimeFilter(null);
                  setCostFilter(null);
                }}
                className="text-xs text-red-400 hover:text-red-600 ml-auto flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {/* Row 2: Dietary Tags (Scrollable) */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Dietary Preferences:</span>
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide p-1">
              {["Vegan", "Vegetarian", "Keto", "Halal", "Gluten Free", "Kosher", "Pescatarian"].map((tag) => {
                const isSelected = selectedTags.has(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      const newTags = new Set(selectedTags);
                      if (newTags.has(tag)) {
                        newTags.delete(tag);
                      } else {
                        newTags.add(tag);
                      }
                      setSelectedTags(newTags);
                    }}
                    className={`
                      px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 border
                      ${isSelected
                        ? "text-white border-transparent shadow-md" 
                        : "bg-white text-gray-600 border-gray-200 hover:border-sage-300 hover:text-sage-600 hover:bg-gray-50"
                      }
                    `}
                    style={isSelected ? { background: "linear-gradient(135deg, var(--lilac-purple) 0%, var(--sage-green) 100%)" } : {}}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recipe Grid */}
        {filteredRecipes.length === 0 && searchQuery ? (
          <div className="w-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 italic">No recipes found matching "{searchQuery}"</p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="w-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 italic">No recipes yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <Card key={recipe.id} className="overflow-hidden rounded-2xl bg-white flex flex-col relative group border-none shadow-sm hover:shadow-md transition-all">
                
                {/* Checkbox - Top Left */}
                <div className="absolute top-3 left-3 z-10">
                  <Checkbox
                    data-testid={`select-recipe-${recipe.name}`}
                    name={`${recipe.name}`}
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
                    <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover" width={400} height={225} />
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
                    <Badge className={`text-[10px] ${recipe.difficulty === "EASY" ? "bg-green-100 text-green-700" : recipe.difficulty === "MEDIUM" ? "bg-yellow-100 text-yellow-700" : "bg-rose-100 text-rose-700"}`}>
                      {recipe.difficulty}
                    </Badge>
                  </div>
                  
                  {/* Dietary Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {recipe.dietaryTags?.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-[10px] text-sage-600 border-sage-200 bg-sage-50">
                        {tag.replace('_', ' ')}
                      </Badge>
                    ))}
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

              <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100 text-sm font-semibold">
                <div className="flex items-center gap-2"><Clock className="text-sage-600"/> {viewingRecipe.prepTimeMinutes} Minutes</div>
                <div className="flex items-center gap-2"><Flame className="text-orange-500"/> {viewingRecipe.estimatedCalories} Calories</div>
                <div className="flex items-center gap-2"><DollarSign className="text-sage-600" style={{width: '16px', height: '16px'}}/> ${viewingRecipe.estimatedCost || 0}</div>
              </div>

              {/* Dietary Tags */}
              {viewingRecipe.dietaryTags && viewingRecipe.dietaryTags.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 font-bold text-lg mb-3"><Tag className="w-5 h-5 text-sage-600" /> Dietary Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingRecipe.dietaryTags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-sm text-sage-600 border-sage-200 bg-sage-50">
                        {tag.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

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
          <DialogHeader><DialogTitle className="text-2xl font-bold text-sage-800">Edit Recipe</DialogTitle></DialogHeader>
          <div className="space-y-6 pt-4">

            {/* ── Section: Basic Info ── */}
            <div className="space-y-4">
              {/* Recipe Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Recipe Name</label>
                <Input data-testid="edit-recipe-name" value={formData.recipeName} onChange={(e) => handleInputChange("recipeName", e.target.value)} placeholder="e.g., Quinoa Buddha Bowl" className="rounded-xl border-gray-200 focus:border-sage-500 h-11" />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description</label>
                <textarea className="w-full p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sage-200 focus:border-sage-400 transition-colors min-h-[80px]" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} placeholder="A short description of your dish..." />
              </div>

              {/* Image URL */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  <span className="flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5 text-gray-400" /> Image URL</span>
                </label>
                <Input value={formData.imageUrl} onChange={(e) => handleInputChange("imageUrl", e.target.value)} placeholder="https://example.com/photo.jpg" className="rounded-xl border-gray-200 h-11" />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* ── Section: Details ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                <Utensils className="w-4 h-4" />
                Details
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Prep Time */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" /> Time
                  </label>
                  <div className="flex items-center gap-2">
                    <Input type="text" inputMode="numeric" value={formData.prepTime} onChange={(e) => {const num = parseInt(e.target.value) || 0; handleInputChange("prepTime", num);}} className="rounded-xl border-gray-200 h-11 flex-1" placeholder="0" />
                    <span className="text-sm font-semibold text-gray-500 w-12 text-center">min</span>
                  </div>
                </div>

                {/* Calories */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-400" /> Calories
                  </label>
                  <div className="flex items-center gap-2">
                    <Input type="text" inputMode="numeric" value={formData.estimatedCalories} onChange={(e) => {const num = parseInt(e.target.value) || 0; handleInputChange("estimatedCalories", num);}} className="rounded-xl border-gray-200 h-11 flex-1" placeholder="0" />
                    <span className="text-sm font-semibold text-gray-500 w-12 text-center">kcal</span>
                  </div>
                </div>

                {/* Cost */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-green-500" /> Cost
                  </label>
                  <div className="flex items-center gap-2">
                    <Input type="text" inputMode="decimal" value={formData.estimatedCost} onChange={(e) => {const num = parseFloat(e.target.value) || 0; handleInputChange("estimatedCost", num);}} className="rounded-xl border-gray-200 h-11 flex-1" placeholder="0.00" />
                    <span className="text-sm font-semibold text-gray-500 w-8 text-center">$</span>
                  </div>
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Difficulty</label>
                <div className="flex gap-2">
                  {["EASY", "MEDIUM", "HARD"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleInputChange("difficulty", level)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                        formData.difficulty === level
                          ? "text-white shadow-sm"
                          : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                      }`}
                      style={formData.difficulty === level ? { backgroundColor: "var(--sage-green)", borderColor: "var(--sage-green)" } : {}}
                    >
                      {level === "EASY" ? "Easy" : level === "MEDIUM" ? "Medium" : "Hard"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* ── Section: Ingredients ── */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                <ListOrdered className="w-4 h-4" />
                Ingredients
              </div>

              <div className="space-y-2">
                {(formData.ingredients || []).map((ingredient: any, idx: number) => (
                  <div key={idx} className="flex gap-2 items-center group">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-gray-400">{idx + 1}</span>
                    </div>
                    <Input type="text" value={ingredient.name || ""} onChange={(e) => { const updated = [...(formData.ingredients || [])]; updated[idx] = { ...updated[idx], name: e.target.value }; handleInputChange("ingredients", updated); }} placeholder="Ingredient" className="rounded-xl border-gray-200 h-10 flex-1" />
                    <Input type="text" value={ingredient.amount || ""} onChange={(e) => { const updated = [...(formData.ingredients || [])]; updated[idx] = { ...updated[idx], amount: e.target.value }; handleInputChange("ingredients", updated); }} placeholder="Qty" className="w-20 rounded-xl border-gray-200 h-10 text-center" />
                    <select value={ingredient.unit || "G"} onChange={(e) => { const updated = [...(formData.ingredients || [])]; updated[idx] = { ...updated[idx], unit: e.target.value }; handleInputChange("ingredients", updated); }} className="w-20 rounded-xl border border-gray-200 h-10 text-sm bg-white px-2 focus:outline-none focus:ring-2 focus:ring-sage-200">
                      <option value="G">g</option>
                      <option value="ML">ml</option>
                      <option value="L">l</option>
                      <option value="OZ">oz</option>
                      <option value="CUP">cup</option>
                      <option value="TBSP">tbsp</option>
                      <option value="TSP">tsp</option>
                      <option value="COUNT">ct</option>
                    </select>
                    {(formData.ingredients || []).length > 1 && (
                      <button type="button" onClick={() => { const updated = (formData.ingredients || []).filter((_: any, i: number) => i !== idx); handleInputChange("ingredients", updated); }} className="p-1.5 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => handleInputChange("ingredients", [...(formData.ingredients || []), { name: "", amount: "", unit: "G" }])} className="text-sm flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors font-medium" style={{ color: "var(--sage-green)" }}>
                <Plus className="w-4 h-4" />
                Add ingredient
              </button>
            </div>

            <hr className="border-gray-100" />

            {/* ── Section: Preparation Steps ── */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                <ChefHat className="w-4 h-4" />
                Steps
              </div>

              <div className="space-y-2">
                {(formData.prepSteps || []).map((step: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-start group">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-2" style={{ backgroundColor: "color-mix(in srgb, var(--sage-green) 15%, white)" }}>
                      <span className="text-xs font-bold" style={{ color: "var(--sage-green)" }}>{idx + 1}</span>
                    </div>
                    <textarea value={step} onChange={(e) => { const updated = [...(formData.prepSteps || [])]; updated[idx] = e.target.value; handleInputChange("prepSteps", updated); }} placeholder={`Step ${idx + 1}...`} className="flex-1 p-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sage-200 focus:border-sage-400 transition-colors min-h-[42px]" rows={1} />
                    {(formData.prepSteps || []).length > 1 && (
                      <button type="button" onClick={() => { const updated = (formData.prepSteps || []).filter((_: any, i: number) => i !== idx); handleInputChange("prepSteps", updated); }} className="p-1.5 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => handleInputChange("prepSteps", [...(formData.prepSteps || []), ""])} className="text-sm flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors font-medium" style={{ color: "var(--sage-green)" }}>
                <Plus className="w-4 h-4" />
                Add step
              </button>
            </div>

            <hr className="border-gray-100" />

            {/* ── Section: Dietary Tags ── */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                <Tag className="w-4 h-4" />
                Tags
              </div>

              <div className="flex flex-wrap gap-2">
                {["VEGAN", "VEGETARIAN", "KETO", "HALAL", "GLUTEN_FREE", "KOSHER", "PESCATARIAN"].map((tag) => {
                  const isSelected = (formData.dietaryTags || []).includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const currentTags = formData.dietaryTags || [];
                        if (isSelected) {
                          handleInputChange("dietaryTags", currentTags.filter((t: string) => t !== tag));
                        } else {
                          handleInputChange("dietaryTags", [...currentTags, tag]);
                        }
                      }}
                      className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all border capitalize ${
                        isSelected
                          ? "text-white shadow-sm"
                          : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                      }`}
                      style={isSelected ? { backgroundColor: "var(--sage-green)", borderColor: "var(--sage-green)" } : {}}
                    >
                      {tag.replace('_', ' ').toLowerCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isLoading} className="flex-1">Cancel</Button>
              <Button onClick={handleEditSubmit} disabled={isLoading} className="flex-1 text-white" style={{ backgroundColor: "var(--sage-green)" }}>{isLoading ? "Saving..." : "Save Changes"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}