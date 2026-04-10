import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { SavedRecipes } from "@/app/components/SavedRecipes";

export default async function SavedRecipesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const savedRecipes = await prisma.savedRecipe.findMany({
    where: { userId },
    include: {
      recipe: {
        include: {
          ingredients: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return <SavedRecipes savedRecipes={savedRecipes} />;
}