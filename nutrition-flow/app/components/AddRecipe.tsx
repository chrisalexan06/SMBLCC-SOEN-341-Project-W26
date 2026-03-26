"use client";

import React, { useState } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Plus, X, ChefHat, Clock, Flame, DollarSign, ImageIcon, FileText, ListOrdered, Tag, Utensils } from "lucide-react";

interface IngredientInput {
  name: string;
  amount: string;
  unit: string;
}

export function AddRecipe() {
  const [recipeName, setRecipeName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [prepTime, setPrepTime] = useState(0);
  const [prepSteps, setPrepSteps] = useState<string[]>([""]);
  const [difficulty, setDifficulty] = useState("EASY");
  const [estimatedCalories, setEstimatedCalories] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [ingredients, setIngredients] = useState<IngredientInput[]>([
    { name: "", amount: "", unit: "G" },
  ]);
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleIngredientChange = (index: number, field: keyof IngredientInput, value: string) => {
    const updated = [...ingredients];
    (updated[index] as any)[field] = value;
    setIngredients(updated);
  };

  const addIngredientField = () => {
    setIngredients([...ingredients, { name: "", amount: "", unit: "G" }]);
  };

  const removeIngredientField = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleStepChange = (index: number, value: string) => {
    const updated = [...prepSteps];
    updated[index] = value;
    setPrepSteps(updated);
  };

  const addStepField = () => {
    setPrepSteps([...prepSteps, ""]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeName.trim()) {
      alert("Please enter a recipe name");
      return;
    }

    const filledIngredients = ingredients.filter(i => i.name.trim());
    if (filledIngredients.length === 0) {
      alert("Please add at least one ingredient");
      return;
    }

    const filledSteps = prepSteps.filter(s => s.trim());
    if (filledSteps.length === 0) {
      alert("Please add at least one preparation step");
      return;
    }

    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeName,
          description,
          imageUrl,
          prepTime,
          prepSteps: filledSteps,
          difficulty,
          estimatedCalories,
          estimatedCost,
          ingredients: filledIngredients,
          dietaryTags,
        }),
      });
      if (!res.ok) throw new Error("Failed to save recipe");
      const data = await res.json();
      console.log("saved", data);
      setSubmitted(true);
      setTimeout(() => {
        setRecipeName("");
        setDescription("");
        setImageUrl("");
        setPrepTime(0);
        setPrepSteps([""]);
        setDifficulty("EASY");
        setEstimatedCalories(0);
        setEstimatedCost(0);
        setIngredients([{ name: "", amount: "", unit: "G" }]);
        setDietaryTags([]);
        setSubmitted(false);
      }, 4000);
    } catch (err) {
      console.error(err);
      alert("There was an error saving the recipe.");
    }
  };

  return (
    <div className="space-y-6">
      {submitted ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: "color-mix(in srgb, var(--sage-green) 15%, white)" }}>
            <ChefHat className="w-8 h-8" style={{ color: "var(--sage-green)" }} />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Recipe Saved!</h3>
          <p className="text-sm text-gray-500">Check your recipe list to see it.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Section: Basic Info ── */}
          <div className="space-y-4">

            {/* Recipe Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Recipe Name *</label>
              <Input
                type="text"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                placeholder="e.g., Quinoa Buddha Bowl"
                className="rounded-xl border-gray-200 focus:border-sage-500 h-11"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description</label>
              <textarea
                className="w-full p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sage-200 focus:border-sage-400 transition-colors min-h-[80px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A short description of your dish..."
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                <span className="flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5 text-gray-400" /> Image URL</span>
              </label>
              <Input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="rounded-xl border-gray-200 h-11"
              />
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
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={prepTime}
                    onChange={(e) => setPrepTime(Number(e.target.value) || 0)}
                    className="rounded-xl border-gray-200 h-11 flex-1"
                    placeholder="0"
                  />
                  <span className="text-sm font-semibold text-gray-500 w-12 text-center">min</span>
                </div>
              </div>

              {/* Calories */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-400" /> Calories
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={estimatedCalories}
                    onChange={(e) => setEstimatedCalories(Number(e.target.value) || 0)}
                    className="rounded-xl border-gray-200 h-11 flex-1"
                    placeholder="0"
                  />
                  <span className="text-sm font-semibold text-gray-500 w-12 text-center">kcal</span>
                </div>
              </div>

              {/* Cost */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-green-500" /> Cost
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(Number(e.target.value) || 0)}
                    className="rounded-xl border-gray-200 h-11 flex-1"
                    placeholder="0.00"
                  />
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
                    onClick={() => setDifficulty(level)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                      difficulty === level
                        ? "text-white shadow-sm"
                        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                    }`}
                    style={difficulty === level ? { backgroundColor: "var(--sage-green)", borderColor: "var(--sage-green)" } : {}}
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
              Ingredients *
            </div>

            <div className="space-y-2">
              {ingredients.map((ingredient, idx) => (
                <div key={idx} className="flex gap-2 items-center group">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-gray-400">{idx + 1}</span>
                  </div>
                  <Input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(idx, "name", e.target.value)}
                    placeholder="Ingredient"
                    className="rounded-xl border-gray-200 h-10 flex-1"
                  />
                  <Input
                    type="text"
                    value={ingredient.amount}
                    onChange={(e) => handleIngredientChange(idx, "amount", e.target.value)}
                    placeholder="Qty"
                    className="w-20 rounded-xl border-gray-200 h-10 text-center"
                  />
                  <select
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(idx, "unit", e.target.value)}
                    className="w-20 rounded-xl border border-gray-200 h-10 text-sm bg-white px-2 focus:outline-none focus:ring-2 focus:ring-sage-200"
                  >
                    <option value="G">g</option>
                    <option value="ML">ml</option>
                    <option value="L">l</option>
                    <option value="OZ">oz</option>
                    <option value="CUP">cup</option>
                    <option value="TBSP">tbsp</option>
                    <option value="TSP">tsp</option>
                    <option value="COUNT">ct</option>
                  </select>
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredientField(idx)}
                      className="p-1.5 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addIngredientField}
              className="text-sm flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              style={{ color: "var(--sage-green)" }}
            >
              <Plus className="w-4 h-4" />
              Add ingredient
            </button>
          </div>

          <hr className="border-gray-100" />

          {/* ── Section: Preparation Steps ── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
              <ChefHat className="w-4 h-4" />
              Steps *
            </div>

            <div className="space-y-2">
              {prepSteps.map((step, idx) => (
                <div key={idx} className="flex gap-2 items-start group">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-2" style={{ backgroundColor: "color-mix(in srgb, var(--sage-green) 15%, white)" }}>
                    <span className="text-xs font-bold" style={{ color: "var(--sage-green)" }}>{idx + 1}</span>
                  </div>
                  <textarea
                    value={step}
                    onChange={(e) => handleStepChange(idx, e.target.value)}
                    placeholder={`Step ${idx + 1}...`}
                    className="flex-1 p-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sage-200 focus:border-sage-400 transition-colors min-h-[42px]"
                    rows={1}
                  />
                  {prepSteps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setPrepSteps(prepSteps.filter((_, i) => i !== idx))}
                      className="p-1.5 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity mt-2"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addStepField}
              className="text-sm flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              style={{ color: "var(--sage-green)" }}
            >
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
                const isSelected = dietaryTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setDietaryTags(dietaryTags.filter((t) => t !== tag));
                      } else {
                        setDietaryTags([...dietaryTags, tag]);
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

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full text-white rounded-xl h-12 text-sm font-semibold shadow-sm"
            style={{ backgroundColor: "var(--sage-green)" }}
          >
            Save Recipe
          </Button>
        </form>
      )}
    </div>
  );
}
