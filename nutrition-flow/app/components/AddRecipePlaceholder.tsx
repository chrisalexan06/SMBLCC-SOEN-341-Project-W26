"use client";

import React, { useState } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Plus, X } from "lucide-react";

export function AddRecipePlaceholder() {
  const [recipeName, setRecipeName] = useState("");
  const [ingredients, setIngredients] = useState(["", ""]);
  const [submitted, setSubmitted] = useState(false);

  const handleIngredientChange = (index: number, value: string) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  const addIngredientField = () => {
    setIngredients([...ingredients, ""]);
  };

  const removeIngredientField = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeName.trim()) {
      alert("Please enter a recipe name");
      return;
    }

    const filteredIngredients = ingredients.filter((ing) => ing.trim());
    if (filteredIngredients.length === 0) {
      alert("Please add at least one ingredient");
      return;
    }

    // Placeholder: Log data (backend integration coming soon)
    console.log("Recipe submitted:", {
      name: recipeName,
      ingredients: filteredIngredients,
    });

    // Show success message
    setSubmitted(true);
    setTimeout(() => {
      // Reset form
      setRecipeName("");
      setIngredients(["", ""]);
      setSubmitted(false);
    }, 2000);
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

          {/* Ingredients */}
          <div>
            <label className="text-sm font-medium mb-2 block">Ingredients</label>
            <div className="space-y-2">
              {ingredients.map((ingredient, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    type="text"
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(idx, e.target.value)}
                    placeholder={`Ingredient ${idx + 1}`}
                    className="rounded-lg flex-1"
                  />
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
