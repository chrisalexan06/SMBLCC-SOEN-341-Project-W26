import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hiddenRecipes = await prisma.hiddenRecipe.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(hiddenRecipes);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipeId } = await req.json();

    if (!recipeId) {
      return NextResponse.json({ error: "Recipe ID is required" }, { status: 400 });
    }

    const hiddenRecipe = await prisma.hiddenRecipe.upsert({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
      update: {},
      create: {
        userId,
        recipeId,
      },
    });

    return NextResponse.json({ hiddenRecipe, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}