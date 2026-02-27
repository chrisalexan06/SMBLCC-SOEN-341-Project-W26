import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@clerk/nextjs/server"; // Use Clerk

export async function POST(req: Request) {
  try {
    const { userId } = await auth(); // Get the ID from Clerk

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const {
      recipeName,
      description,
      imageUrl,
      prepTime,
      prepSteps,
      difficulty,
      estimatedCalories,
      estimatedCost,
      ingredients,
    } = data;

    const recipe = await prisma.recipe.create({
      data: {
        name: recipeName,
        description,
        imageUrl,
        prepTimeMinutes: prepTime,
        prepSteps,
        difficulty,
        estimatedCalories,
        estimatedCost,
        userId: userId, // Save the Clerk ID
        ingredients: {
          create: ingredients.map((i: any) => ({
            name: i.name,
            amount: parseFloat(i.amount) || 0,
            unit: i.unit,
          })),
        },
      },
    });

    return NextResponse.json({ recipe });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = await auth(); // Get the ID from Clerk

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const {
      recipeId,
      recipeName,
      description,
      imageUrl,
      prepTime,
      prepSteps,
      difficulty,
      estimatedCalories,
      estimatedCost,
      ingredients,
    } = data;

    // Verify the recipe belongs to the user
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: { ingredients: true },
    });

    if (!existingRecipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    if (existingRecipe.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update the recipe
    const updatedRecipe = await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        name: recipeName,
        description,
        imageUrl,
        prepTimeMinutes: prepTime,
        prepSteps,
        difficulty,
        estimatedCalories,
        estimatedCost,
      },
    });

    // Delete old ingredients and create new ones
    await prisma.ingredient.deleteMany({
      where: { recipeId },
    });

    if (ingredients && ingredients.length > 0) {
      await prisma.ingredient.createMany({
        data: ingredients.map((i: any) => ({
          name: i.name,
          amount: parseFloat(i.amount) || 0,
          unit: i.unit,
          recipeId,
        })),
      });
    }

    // Fetch updated recipe with ingredients
    const finalRecipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: { ingredients: true },
    });

    return NextResponse.json({ recipe: finalRecipe });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}