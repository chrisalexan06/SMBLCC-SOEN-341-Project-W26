import { Recipes } from "@/app/components/Recipes";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@clerk/nextjs/server"; // Import the Clerk helper
import { redirect } from "next/navigation"; // To send users to login if they aren't signed in

export default async function RecipesPage() {
  // 1. Get the userId from Clerk
  const { userId } = await auth();

  // 2. Security: If the user isn't logged in, redirect them to the sign-in page
  if (!userId) {
    redirect("/sign-in");
  }

  // 3. Fetch ONLY the recipes where the userId matches the Clerk ID
  const myRecipes = await prisma.recipe.findMany({
    where: {
      userId: userId, 
    },
    include: {
      ingredients: true,
    },
    // Optional: Sort by newest first
    orderBy: {
      id: 'desc' 
    }
  });

  // 4. Send the filtered list to your component
  return <Recipes recipes={myRecipes} />;
}