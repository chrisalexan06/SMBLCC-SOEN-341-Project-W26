"use client";

import React, { useState } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Plus, X } from "lucide-react";

interface IngredientInput {
  name: string;
  amount: string;
  unit: string;
}

export function AddRecipePlaceholder() {
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
        setSubmitted(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("There was an error saving the recipe.");
    }
  };

  return (
    <Card className="p-6 rounded-2xl">
      <h3 className="mb-4 flex items-center gap-2">
        <Plus className="w-5 h-5" style={{ color: "var(--sage-green)" }} />
        Add Your Recipe
      </h3>

      {submitted ? (
        <div
          className="p-4 rounded-lg text-center"
          style={{ backgroundColor: "var(--sage-green-light)" }}
        >
          <div className="text-sm font-semibold" style={{ color: "var(--sage-green-dark)" }}>
            ✓ Recipe saved!
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Backend integration coming soon
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Recipe Name */}
          <div>
            <label className="text-sm font-medium mb-2 block">Recipe Name</label>
            <Input
              type="text"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              placeholder="e.g., Quinoa Buddha Bowl"
              className="rounded-lg"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <textarea
              className="w-full p-2 border rounded-lg"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="text-sm font-medium mb-2 block">Image URL</label>
            <Input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="rounded-lg"
            />
          </div>

          {/* Prep Time */}
          <div>
            <label className="text-sm font-medium mb-2 block">Preparation Time (minutes)</label>
            <Input
              type="number"
              value={prepTime}
              onChange={(e) => setPrepTime(Number(e.target.value))}
              className="rounded-lg"
            />
          </div>

          {/* Ingredients */}
          <div>
            <label className="text-sm font-medium mb-2 block">Ingredients</label>
            <div className="space-y-2">
              {ingredients.map((ingredient, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(idx, "name", e.target.value)}
                    placeholder={`Name`}
                    className="rounded-lg flex-1"
                  />
                  <Input
                    type="text"
                    value={ingredient.amount}
                    onChange={(e) => handleIngredientChange(idx, "amount", e.target.value)}
                    placeholder="Amount"
                    className="w-24 rounded-lg"
                  />
                  <select
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(idx, "unit", e.target.value)}
                    className="w-24 rounded-lg border p-2"
                  >
                    <option value="G">g</option>
                    <option value="ML">ml</option>
                    <option value="L">l</option>
                    <option value="OZ">oz</option>
                    <option value="CUP">cup</option>
                    <option value="TBSP">tbsp</option>
                    <option value="TSP">tsp</option>
                    <option value="COUNT">count</option>
                  </select>
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredientField(idx)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addIngredientField}
              className="mt-3 text-sm flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
              style={{ color: "var(--sage-green)" }}
            >
              <Plus className="w-4 h-4" />
              Add Ingredient
            </button>
          </div>

          {/* Preparation Steps */}
          <div>
            <label className="text-sm font-medium mb-2 block">Preparation Steps</label>
            <div className="space-y-2">
              {prepSteps.map((step, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="text-sm">{idx + 1}.</span>
                  <Input
                    type="text"
                    value={step}
                    onChange={(e) => handleStepChange(idx, e.target.value)}
                    placeholder="Describe step"
                    className="flex-1 rounded-lg"
                  />
                  {prepSteps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setPrepSteps(prepSteps.filter((_, i) => i !== idx))}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addStepField}
              className="mt-3 text-sm flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
              style={{ color: "var(--sage-green)" }}
            >
              <Plus className="w-4 h-4" />
              Add Step
            </button>
          </div>

          {/* Difficulty & Estimates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="rounded-lg border p-2 w-full"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Calories Estimate</label>
              <Input
                type="number"
                value={estimatedCalories}
                onChange={(e) => setEstimatedCalories(Number(e.target.value))}
                className="rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Cost Estimate</label>
              <Input
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(Number(e.target.value))}
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full text-white rounded-lg"
            style={{ backgroundColor: "var(--sage-green)" }}
          >
            Save Recipe
          </Button>
        </form>
      )}
    </Card>
  );
}
