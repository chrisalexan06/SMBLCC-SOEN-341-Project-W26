"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Badge } from "@/app/components/ui/badge";
import { Clock, Flame, DollarSign, Tag, Utensils, ListChecks } from "lucide-react";
import Image from "next/image";

interface RecipeDetailsdialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  recipe: any | null;
}

export function RecipeDetailsDialog({ isOpen, onOpenChange, recipe }: RecipeDetailsdialogProps) {
  if (!recipe) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl">
        <div className="space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-sage-800">{recipe.name}</DialogTitle>
          </DialogHeader>

          {recipe.imageUrl && <Image src={recipe.imageUrl} className="w-full h-64 object-cover rounded-xl" alt="" />}
          
          <p className="text-gray-600 italic border-l-4 border-sage-200 pl-4">{recipe.description || "No description provided."}</p>

          <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100 text-sm font-semibold">
            <div className="flex items-center gap-2"><Clock className="text-sage-600"/> {recipe.prepTimeMinutes} Minutes</div>
            <div className="flex items-center gap-2"><Flame className="text-orange-500"/> {recipe.estimatedCalories} Calories</div>
            <div className="flex items-center gap-2"><DollarSign className="text-sage-600" style={{width: '16px', height: '16px'}}/> ${recipe.estimatedCost || 0}</div>
          </div>

          {/* Dietary Tags */}
          {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 font-bold text-lg mb-3"><Tag className="w-5 h-5 text-sage-600" /> Dietary Tags</h4>
              <div className="flex flex-wrap gap-2">
                {recipe.dietaryTags.map((tag: string) => (
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
              {recipe.ingredients?.length > 0 ? (
                recipe.ingredients.map((ing: any, idx: number) => (
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
              {recipe.prepSteps?.length > 0 ? (
                recipe.prepSteps.map((step: string, idx: number) => (
                  <div key={idx} className="flex gap-3 text-sm text-gray-700">
                    <span className="font-bold text-sage-600">{idx + 1}.</span>
                    <p>{step}</p>
                  </div>
                ))
              ) : (<p className="text-gray-400 italic">No steps found.</p>)}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
