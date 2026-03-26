"use client";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  ArrowLeft, 
  Droplets,
  Minus,
  Pencil,
  Trash2,
  Clock,
  Flame,
  DollarSign,
  Utensils,
  ListOrdered,
  ChefHat,
  Tag,
  ImageIcon,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { 
  format, 
  startOfWeek, 
  addDays, 
  addWeeks, 
  subWeeks,
  isSameDay
} from "date-fns";

export function WeeklyPlanner() {
    //CONSTANTS
    const slotToMealType: Record<number, string> = { 1: 'BREAKFAST', 2: 'LUNCH', 3: 'DINNER' };

    //STATE
    const [currentDate, setCurrentDate] = useState(new Date());
    const [waterLevels, setWaterLevels] = useState<Record<string, number>>({});
    const [plannedMeals, setPlannedMeals] = useState<Record<string, any>>({});
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{date: string, slot: number} | null>(null);
    const [userRecipes, setUserRecipes] = useState<any[]>([]);
    const [hoveredMeal, setHoveredMeal] = useState<{date: string, slot: number} | null>(null);
    const [editingRecipe, setEditingRecipe] = useState<any>(null);
    const [isEditRecipeOpen, setIsEditRecipeOpen] = useState(false);
    const [isLoadingEdit, setIsLoadingEdit] = useState(false);
    const [editFormData, setEditFormData] = useState<any>({
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

    const [duplicateMessage, setDuplicateMessage] = useState("");

    const waterGoal = 8;
    const today = new Date();

    //DATA FETCHING
    useEffect(() => {
      const fetchRecipes = async () => {
        const res = await fetch("/api/recipes");
        if (res.ok) {
          const data = await res.json();
          setUserRecipes(data);
        }
      };
      fetchRecipes();
    }, []);

    //LOGIC
    const weekStart = useMemo(() => 
      startOfWeek(currentDate, { weekStartsOn: 1 }), 
      [currentDate]
    );

    // Load saved plan when week changes
    useEffect(() => {
      const fetchPlan = async () => {
        const res = await fetch(`/api/weekly-plan?weekStartDate=${weekStart.toISOString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.entries) {
            // Convert API entries to plannedMeals shape
            const newPlannedMeals: Record<string, any> = {};
            // Use a day index array starting with MONDAY to match weekStartsOn: 1
            const dayOrder = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"];
            data.entries.forEach((entry: any) => {
              // entry.dayOfWeek is e.g. 'MONDAY', entry.mealType is 'BREAKFAST', 'LUNCH', 'DINNER'
              // Find the date for this dayOfWeek in the current week
              const dayIndex = dayOrder.indexOf(entry.dayOfWeek);
              if (dayIndex !== -1) {
                const dateObj = new Date(weekStart);
                dateObj.setDate(dateObj.getDate() + dayIndex);
                const dateKey = format(dateObj, "yyyy-MM-dd");
                // Map mealType to slot
                const slotMap: Record<string, string> = { BREAKFAST: '1', LUNCH: '2', DINNER: '3' };
                const slot = slotMap[entry.mealType] || '0';
                if (entry.recipe) {
                  newPlannedMeals[`${dateKey}-${slot}`] = entry.recipe;
                }
              }
            });
            setPlannedMeals(newPlannedMeals);
          } else {
            setPlannedMeals({});
          }
        }
      };
      fetchPlan();

    }, [weekStart]);
    const router = useRouter();

  const days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = addDays(weekStart, i);
      const dateKey = format(date, "yyyy-MM-dd");
      return {
        dayName: format(date, "EEEE"),
        dateDisplay: format(date, "MMM d"),
        dateKey,
        isToday: isSameDay(date, today),
      };
    });
  }, [weekStart, currentDate]);

  const handleAddRecipeClick = (date: string, slot: number) => {
    setSelectedSlot({ date, slot });
    setDuplicateMessage("");
    setIsSelectorOpen(true);
  };

  const handleEditMeal = (e: React.MouseEvent, date: string, slot: number) => {
    e.stopPropagation();
    // Just open the selector - don't delete the meal yet
    // It will be replaced when they select a new recipe
    setSelectedSlot({ date, slot });
    setDuplicateMessage("");
    setIsSelectorOpen(true);
  };

  const handleDeleteMeal = (e: React.MouseEvent, date: string, slot: number) => {
    e.stopPropagation();
    const mealKey = `${date}-${slot}`;
    setPlannedMeals((prev) => {
      const updated = { ...prev };
      delete updated[mealKey];
      return updated;
    });
  };

  const handleEditRecipeClick = (e: React.MouseEvent | React.KeyboardEvent, recipe: any) => {
    e.stopPropagation();
    setEditingRecipe(recipe);
    setEditFormData({
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
    setIsEditRecipeOpen(true);
  };

  const handleEditRecipeInputChange = (field: string, value: any) => {
    setEditFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveEditRecipe = async () => {
    if (!editingRecipe) return;
    setIsLoadingEdit(true);
    try {
      const res = await fetch("/api/recipes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId: editingRecipe.id,
          name: editFormData.recipeName,
          description: editFormData.description,
          imageUrl: editFormData.imageUrl,
          prepTimeMinutes: editFormData.prepTime,
          prepSteps: editFormData.prepSteps,
          difficulty: editFormData.difficulty,
          estimatedCalories: editFormData.estimatedCalories,
          estimatedCost: editFormData.estimatedCost,
          ingredients: editFormData.ingredients,
          dietaryTags: editFormData.dietaryTags,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        // Update user recipes list
        setUserRecipes((prev) =>
          prev.map((r) => (r.id === editingRecipe.id ? updated.recipe : r))
        );
        setIsEditRecipeOpen(false);
        setEditingRecipe(null);
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
    } finally {
      setIsLoadingEdit(false);
    }
  };

  const updateWater = (dateKey: string, delta: number) => {
    setWaterLevels(prev => ({
      ...prev,
      [dateKey]: Math.max(0, (prev[dateKey] || 0) + delta)
    }));
  };

  const handleSelectRecipe = (recipe: any) => {
    if (!selectedSlot) return;

    const { date, slot } = selectedSlot;

    const isDuplicateInSameDay = [1, 2, 3].some((currentSlot) => {
      if (currentSlot === slot) return false;

      const mealKey = `${date}-${currentSlot}`;
      const existingMeal = plannedMeals[mealKey];

      return existingMeal?.id === recipe.id;
    });

    if (isDuplicateInSameDay) {
      setDuplicateMessage("You already added this recipe.");
      return;
    }

    const mealKey = `${date}-${slot}`;
    setPlannedMeals((prev) => ({
      ...prev,
      [mealKey]: recipe,
    }));

    setDuplicateMessage("");
    setIsSelectorOpen(false);
  };

  //SAVE WEEK LOGIC
  const [saveStatus, setSaveStatus] = useState<null | 'success' | 'error' | 'saving'>(null);
  const handleSaveWeek = async () => {
    setSaveStatus('saving');
    // Prepare entries for API
    const entries = Object.entries(plannedMeals).map(([key, recipe]) => {
      // key is like '2026-03-26-1', split to get date and slot
      const [date, slot] = key.split('-');
      // slot: 1,2,3 → mealType: BREAKFAST, LUNCH, DINNER
      const mealTypeMap = { '1': 'BREAKFAST', '2': 'LUNCH', '3': 'DINNER' } as const;
      const mealType = mealTypeMap[slot as keyof typeof mealTypeMap] || 'SNACK';
      return {
        dayOfWeek: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase(),
        mealType,
        recipeId: recipe.id,
      };
    });
    try {
      const res = await fetch('/api/weekly-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStartDate: weekStart.toISOString(),
          entries,
        }),
      });
      if (res.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(null), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-[#F4F7F2] relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-20 blur-[100px] -translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: "var(--sage-green)" }} />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-[100px] translate-x-1/2 translate-y-1/2" style={{ backgroundColor: "var(--lilac-purple)" }} />
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => router.push("/dashboard")}
              className="rounded-full bg-white border-2 hover:scale-105 transition-all shadow-sm"
              style={{ borderColor: "var(--sage-green-light)" }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: "var(--sage-green-dark)" }} />
            </Button>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-gray-800">Weekly Roadmap</h1>
              <p className="text-sm font-bold tracking-[0.2em] uppercase text-gray-400">NutriFlow Planning System</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm p-2 rounded-2xl shadow-sm border border-gray-100">
             <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
               <ChevronLeft className="w-5 h-5 text-gray-400" />
             </Button>
             <div className="text-sm font-black text-gray-700 px-6 min-w-[220px] text-center uppercase tracking-tight">
               {format(weekStart, "MMMM d")} — {format(addDays(weekStart, 6), "MMMM d, yyyy")}
             </div>
             <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
               <ChevronRight className="w-5 h-5 text-gray-400" />
             </Button>
          </div>
        </header>

        {/* 7-Day Roadmap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          {days.map((day, i) => (
            <div key={i} className="flex flex-col gap-5">
              
              {/* MEAL PLAN CARD */}
              <Card 
                className={`p-6 flex flex-col h-[450px] rounded-[2.8rem] border-2 transition-all duration-300 
                    hover:-translate-y-2 hover:shadow-2xl ${day.isToday ? 'bg-white shadow-xl scale-[1.02] border-[var(--sage-green)]' : 'bg-white/90 border-transparent'}`} 
                style={{ cursor: 'pointer' }}
              >
                <div className="mb-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1" 
                     style={{ color: "var(--sage-green-dark)" }}>
                    {day.dayName}
                  </p>
                  <p className="text-2xl font-black text-gray-800">{day.dateDisplay}</p>
                </div>
                
                <div className="flex-1 space-y-4">
                  {[1, 2, 3].map((slot) => {
                    const mealKey = `${day.dateKey}-${slot}`;
                    const plannedMeal = plannedMeals[mealKey];
                    if (plannedMeal) {
                      console.log('Rendering plannedMeal:', JSON.stringify(plannedMeal));
                    }
                    const isHovered = hoveredMeal?.date === day.dateKey && hoveredMeal?.slot === slot;
                    return (
                      <button
                        key={slot}
                        onClick={() => !plannedMeal && handleAddRecipeClick(day.dateKey, slot)}
                        onMouseEnter={() => plannedMeal && setHoveredMeal({ date: day.dateKey, slot })}
                        onMouseLeave={() => setHoveredMeal(null)}
                        className={`w-full relative py-6 rounded-[1.8rem] flex flex-col items-center justify-center transition-all border-2 
                          ${plannedMeal ? 'hover:scale-110' : 'hover:scale-105'} active:scale-95 group shadow-sm
                          ${plannedMeal ? 'border-none shadow-md' : 'border-dashed'}`}
                        style={{
                          backgroundColor: plannedMeal ? 'var(--sage-green)' : 'rgba(168, 181, 160, 0.05)',
                          borderColor: plannedMeal ? 'transparent' : 'rgba(168, 181, 160, 0.25)'
                        }}
                      >
                        {plannedMeal ? (
                          <>
                            {/* Content */}
                            <div className={`text-center px-2 animate-in fade-in zoom-in duration-300 ${isHovered ? 'opacity-30' : 'opacity-100'}`}>
                              <p className="text-[9px] font-black text-white/70 uppercase tracking-tighter mb-1">
                                {slotToMealType[slot]}
                              </p>
                              <p className="text-[11px] font-black text-white leading-tight">
                                {plannedMeal.name || <span style={{fontSize:'10px'}}>{JSON.stringify(plannedMeal)}</span>}
                              </p>
                            </div>
                            
                            {/* Hover Icons */}
                            {isHovered && (
                              <div className="absolute inset-0 flex items-center justify-center gap-3 animate-in fade-in duration-200 pointer-events-none">
                                <div
                                  onClick={(e) => handleEditMeal(e, day.dateKey, slot)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleEditMeal(e as any, day.dateKey, slot)}
                                  role="button"
                                  tabIndex={0}
                                  className="p-2 rounded-lg transition-all hover:scale-110 active:scale-95 cursor-pointer pointer-events-auto shadow-md"
                                  style={{
                                    backgroundColor: 'var(--lilac-purple)'
                                  }}
                                >
                                  <Pencil className="w-5 h-5 text-white" />
                                </div>
                                <div
                                  onClick={(e) => handleDeleteMeal(e, day.dateKey, slot)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleDeleteMeal(e as any, day.dateKey, slot)}
                                  role="button"
                                  tabIndex={0}
                                  className="p-2 rounded-lg transition-all hover:scale-110 active:scale-95 cursor-pointer pointer-events-auto shadow-md"
                                  style={{
                                    backgroundColor: 'var(--lilac-purple)'
                                  }}
                                >
                                  <Trash2 className="w-5 h-5 text-white" />
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <Plus className="w-6 h-6 transition-all duration-300 text-gray-200 group-hover:text-[var(--sage-green)] group-hover:rotate-90" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* HYDRATION CARD */}
              <Card className="p-5 rounded-[2.2rem] border-none shadow-lg bg-white relative group overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer">
                <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: "var(--lilac-purple-light)" }} />
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-2xl transition-colors group-hover:bg-[var(--lilac-purple)]" style={{ backgroundColor: "var(--lilac-purple-light)" }}>
                      <Droplets className="w-4 h-4 transition-colors group-hover:text-white" style={{ color: "var(--lilac-purple-dark)" }} />
                    </div>
                    <div className="flex items-center gap-1 bg-gray-50 rounded-full p-1 border border-gray-100">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateWater(day.dateKey, -1)}>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-xs font-black px-2 text-gray-700">{waterLevels[day.dateKey] || 0}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateWater(day.dateKey, 1)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden p-0.5">
                       <div 
                        className="h-full rounded-full transition-all duration-700"
                        style={{ 
                          width: `${Math.min(((waterLevels[day.dateKey] || 0) / waterGoal) * 100, 100)}%`,
                          backgroundColor: "var(--lilac-purple)",
                        }}
                       />
                    </div>
                    <p className="text-[9px] font-black text-center text-gray-400 tracking-[0.2em] uppercase">Hydration Plan</p>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
        {/* Save Week Button */}
        <div className="flex justify-end mt-8">
          <Button
            onClick={handleSaveWeek}
            disabled={saveStatus === 'saving'}
            className="px-8 py-3 text-lg font-bold rounded-2xl shadow-md bg-gradient-to-r from-brand-sage to-brand-lilac"
          >
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : 'Save Week'}
          </Button>
          {saveStatus === 'error' && (
            <span className="ml-4 text-red-600 font-semibold">Error saving week. Try again.</span>
          )}
        </div>
      </div>
      
      {/* RECIPE SELECTION MODAL */}
      <Dialog open={isSelectorOpen} onOpenChange={setIsSelectorOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">Select Recipe</DialogTitle>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Add to your Roadmap</p>
          </DialogHeader>

          {duplicateMessage && (
            <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 mt-2">
              {duplicateMessage}
            </p>
          )}

          <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto pr-2">
            {userRecipes.length > 0 ? (
              userRecipes.map((recipe) => (
                <button
                  key={recipe.id}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-[var(--sage-green)] hover:bg-[var(--sage-green-light)]/10 transition-all group text-left"
                  onClick={() => handleSelectRecipe(recipe)}
                  >
                  
                  <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                    <img src={recipe.imageUrl || "/images/meals.webp"} alt={recipe.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 leading-tight">{recipe.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-tight font-medium">
                      {recipe.estimatedCalories || 0} kcal
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      onClick={(e) => handleEditRecipeClick(e, recipe)}
                      onKeyDown={(e) => e.key === 'Enter' && handleEditRecipeClick(e, recipe)}
                      role="button"
                      tabIndex={0}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-4 h-4 text-gray-300 group-hover:text-[var(--lilac-purple)] transition-colors" />
                    </div>
                    <Plus className="w-5 h-5 text-gray-200 group-hover:text-[var(--sage-green)] transition-colors" />
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-sm">No recipes found. Add one in the dashboard first!</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* EDIT RECIPE DIALOG */}
      <Dialog open={isEditRecipeOpen} onOpenChange={setIsEditRecipeOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-2xl font-bold text-gray-800">Edit Recipe</DialogTitle></DialogHeader>
          <div className="space-y-6 pt-4">

            {/* Basic Info */}
            <div className="space-y-4">
              {/* Recipe Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Recipe Name</label>
                <Input value={editFormData.recipeName} onChange={(e) => handleEditRecipeInputChange("recipeName", e.target.value)} placeholder="e.g., Quinoa Buddha Bowl" className="rounded-xl border-gray-200 focus:border-sage-500 h-11" />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description</label>
                <textarea className="w-full p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sage-200 focus:border-sage-400 transition-colors min-h-[80px]" value={editFormData.description} onChange={(e) => handleEditRecipeInputChange("description", e.target.value)} placeholder="A short description of your dish..." />
              </div>

              {/* Image URL */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  <span className="flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5 text-gray-400" /> Image URL</span>
                </label>
                <Input value={editFormData.imageUrl} onChange={(e) => handleEditRecipeInputChange("imageUrl", e.target.value)} placeholder="https://example.com/photo.jpg" className="rounded-xl border-gray-200 h-11" />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Details */}
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
                    <Input type="text" inputMode="numeric" value={editFormData.prepTime} onChange={(e) => {const num = parseInt(e.target.value) || 0; handleEditRecipeInputChange("prepTime", num);}} className="rounded-xl border-gray-200 h-11 flex-1" placeholder="0" />
                    <span className="text-sm font-semibold text-gray-500 w-12 text-center">min</span>
                  </div>
                </div>

                {/* Calories */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-400" /> Calories
                  </label>
                  <div className="flex items-center gap-2">
                    <Input type="text" inputMode="numeric" value={editFormData.estimatedCalories} onChange={(e) => {const num = parseInt(e.target.value) || 0; handleEditRecipeInputChange("estimatedCalories", num);}} className="rounded-xl border-gray-200 h-11 flex-1" placeholder="0" />
                    <span className="text-sm font-semibold text-gray-500 w-12 text-center">kcal</span>
                  </div>
                </div>

                {/* Cost */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-green-500" /> Cost
                  </label>
                  <div className="flex items-center gap-2">
                    <Input type="text" inputMode="decimal" value={editFormData.estimatedCost} onChange={(e) => {const num = parseFloat(e.target.value) || 0; handleEditRecipeInputChange("estimatedCost", num);}} className="rounded-xl border-gray-200 h-11 flex-1" placeholder="0.00" />
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
                      onClick={() => handleEditRecipeInputChange("difficulty", level)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                        editFormData.difficulty === level
                          ? "text-white shadow-sm"
                          : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                      }`}
                      style={editFormData.difficulty === level ? { backgroundColor: "var(--sage-green)", borderColor: "var(--sage-green)" } : {}}
                    >
                      {level === "EASY" ? "Easy" : level === "MEDIUM" ? "Medium" : "Hard"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Ingredients */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                <ListOrdered className="w-4 h-4" />
                Ingredients
              </div>

              <div className="space-y-2">
                {(editFormData.ingredients || []).map((ingredient: any, idx: number) => (
                  <div key={idx} className="flex gap-2 items-center group">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-gray-400">{idx + 1}</span>
                    </div>
                    <Input type="text" value={ingredient.name || ""} onChange={(e) => { const updated = [...(editFormData.ingredients || [])]; updated[idx] = { ...updated[idx], name: e.target.value }; handleEditRecipeInputChange("ingredients", updated); }} placeholder="Ingredient" className="rounded-xl border-gray-200 h-10 flex-1" />
                    <Input type="text" value={ingredient.amount || ""} onChange={(e) => { const updated = [...(editFormData.ingredients || [])]; updated[idx] = { ...updated[idx], amount: e.target.value }; handleEditRecipeInputChange("ingredients", updated); }} placeholder="Qty" className="w-20 rounded-xl border-gray-200 h-10 text-center" />
                    <select value={ingredient.unit || "G"} onChange={(e) => { const updated = [...(editFormData.ingredients || [])]; updated[idx] = { ...updated[idx], unit: e.target.value }; handleEditRecipeInputChange("ingredients", updated); }} className="w-20 rounded-xl border border-gray-200 h-10 text-sm bg-white px-2 focus:outline-none focus:ring-2 focus:ring-sage-200">
                      <option value="G">g</option>
                      <option value="ML">ml</option>
                      <option value="L">l</option>
                      <option value="OZ">oz</option>
                      <option value="CUP">cup</option>
                      <option value="TBSP">tbsp</option>
                      <option value="TSP">tsp</option>
                      <option value="COUNT">ct</option>
                    </select>
                    {(editFormData.ingredients || []).length > 1 && (
                      <button type="button" onClick={() => { const updated = (editFormData.ingredients || []).filter((_: any, i: number) => i !== idx); handleEditRecipeInputChange("ingredients", updated); }} className="p-1.5 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => handleEditRecipeInputChange("ingredients", [...(editFormData.ingredients || []), { name: "", amount: "", unit: "G" }])} className="text-sm flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors font-medium" style={{ color: "var(--sage-green)" }}>
                <Plus className="w-4 h-4" />
                Add ingredient
              </button>
            </div>

            <hr className="border-gray-100" />

            {/* Preparation Steps */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                <ChefHat className="w-4 h-4" />
                Steps
              </div>

              <div className="space-y-2">
                {(editFormData.prepSteps || []).map((step: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-start group">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-2" style={{ backgroundColor: "color-mix(in srgb, var(--sage-green) 15%, white)" }}>
                      <span className="text-xs font-bold" style={{ color: "var(--sage-green)" }}>{idx + 1}</span>
                    </div>
                    <textarea value={step} onChange={(e) => { const updated = [...(editFormData.prepSteps || [])]; updated[idx] = e.target.value; handleEditRecipeInputChange("prepSteps", updated); }} placeholder={`Step ${idx + 1}...`} className="flex-1 p-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sage-200 focus:border-sage-400 transition-colors min-h-[42px]" rows={1} />
                    {(editFormData.prepSteps || []).length > 1 && (
                      <button type="button" onClick={() => { const updated = (editFormData.prepSteps || []).filter((_: any, i: number) => i !== idx); handleEditRecipeInputChange("prepSteps", updated); }} className="p-1.5 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => handleEditRecipeInputChange("prepSteps", [...(editFormData.prepSteps || []), ""])} className="text-sm flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors font-medium" style={{ color: "var(--sage-green)" }}>
                <Plus className="w-4 h-4" />
                Add step
              </button>
            </div>

            <hr className="border-gray-100" />

            {/* Dietary Tags */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                <Tag className="w-4 h-4" />
                Tags
              </div>

              <div className="flex flex-wrap gap-2">
                {["VEGAN", "VEGETARIAN", "KETO", "HALAL", "GLUTEN_FREE", "KOSHER", "PESCATARIAN"].map((tag) => {
                  const isSelected = (editFormData.dietaryTags || []).includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const currentTags = editFormData.dietaryTags || [];
                        if (isSelected) {
                          handleEditRecipeInputChange("dietaryTags", currentTags.filter((t: string) => t !== tag));
                        } else {
                          handleEditRecipeInputChange("dietaryTags", [...currentTags, tag]);
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
              <Button variant="outline" onClick={() => setIsEditRecipeOpen(false)} disabled={isLoadingEdit} className="flex-1">Cancel</Button>
              <Button onClick={handleSaveEditRecipe} disabled={isLoadingEdit} className="flex-1 text-white" style={{ backgroundColor: "var(--sage-green)" }}>{isLoadingEdit ? "Saving..." : "Save Changes"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}