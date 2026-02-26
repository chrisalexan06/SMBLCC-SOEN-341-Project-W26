import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("recipe POST data:", data);
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

    // ensure a placeholder user exists
    const user = await prisma.user.upsert({
      where: { id: "user-123" },
      update: {},
      create: {
        id: "user-123",
        email: "placeholder@local",
        firstName: "Placeholder",
        lastName: "User",
        age: 0,
        currentWeight: 0,
        height: 0,
      },
    });

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
        user: {
          connect: { id: user.id },
        },
        ingredients: {
          create: ingredients.map((i: any) => ({
            name: i.name,
            amount: parseFloat(i.amount) || 0,
            unit: i.unit,
          })),
        },
      },
      include: { ingredients: true },
    });

    return NextResponse.json({ recipe });
  } catch (err: any) {
    console.error("recipe POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}