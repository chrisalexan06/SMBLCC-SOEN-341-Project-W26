import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all recipes (excluding user's own)
    const recipes = await prisma.recipe.findMany({
      where: {
        userId: { not: userId },
      },
      include: { ingredients: true },
      orderBy: { createdAt: "desc" },
    });

    // Fetch user profile for dietary restrictions
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Filter by dietary types if available
    let recommendations = recipes;
    if (user?.dietaryType && user.dietaryType.length > 0) {
      recommendations = recipes.filter((recipe) =>
        recipe.dietaryTags?.some((tag) => user.dietaryType.includes(tag))
      );
    }

    // Shuffle and return top 20
    const shuffled = recommendations.sort(() => 0.5 - Math.random());
    return NextResponse.json(shuffled.slice(0, 20));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
