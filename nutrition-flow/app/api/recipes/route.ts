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
      dietaryTags,
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
        dietaryTags: dietaryTags || [],
        userId: userId, // Save the Clerk ID
        ingredients: {
          create: (ingredients || [])
            .filter((i: any) => i.name && i.name.trim())
            .map((i: any) => ({
              name: i.name,
              amount: i.amount ? parseFloat(i.amount.toString()) : 0,
              unit: i.unit || "G",
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
      name,
      description,
      imageUrl,
      prepTimeMinutes,
      prepSteps,
      difficulty,
      estimatedCalories,
      estimatedCost,
      ingredients,
      dietaryTags,
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
        name,
        description,
        imageUrl,
        prepTimeMinutes,
        prepSteps,
        difficulty,
        estimatedCalories,
        estimatedCost,
        dietaryTags: dietaryTags || [],
      },
    });

    // Delete old ingredients and create new ones
    await prisma.ingredient.deleteMany({
      where: { recipeId },
    });

    if (ingredients && ingredients.length > 0) {
      const ingredientsToCreate = ingredients
        .filter((i: any) => i.name && i.name.trim())
        .map((i: any) => ({
          name: i.name,
          amount: i.amount ? parseFloat(i.amount.toString()) : 0,
          unit: i.unit || "G",
          recipeId,
        }));

      if (ingredientsToCreate.length > 0) {
        await prisma.ingredient.createMany({
          data: ingredientsToCreate,
        });
      }
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

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { recipeId } = data;

    if (!recipeId) {
      return NextResponse.json({ error: "Recipe ID is required" }, { status: 400 });
    }

    // Verify the recipe belongs to the user
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!existingRecipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    if (existingRecipe.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete ingredients first (due to foreign key constraint)
    await prisma.ingredient.deleteMany({
      where: { recipeId },
    });

    // Delete the recipe
    await prisma.recipe.delete({
      where: { id: recipeId },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}