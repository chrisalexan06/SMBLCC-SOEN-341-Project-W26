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