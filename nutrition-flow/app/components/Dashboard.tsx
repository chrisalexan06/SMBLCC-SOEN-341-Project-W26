"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/app/components/ui/carousel";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Heart, MessageCircle, MapPin, User, Settings, Calendar, Plus, Flame, Clock, BookOpen, Utensils, ChefHat, Target, Sun, Moon, Sunset, TrendingUp, Sparkles, Droplets } from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import Image from "next/image";
import { AddRecipePlaceholder } from "@/app/components/AddRecipe";

const calorieData = [
  { name: "Consumed", value: 1650 },
  { name: "Remaining", value: 350 },
];

const COLORS = {
  consumed: "#A8B5A0", // sage green
  remaining: "#E0D5EF", // lilac purple light
};

const weekDays = [
  { day: "Mon", date: "Feb 3", meals: ["Oatmeal", "Salad Bowl", "Grilled Chicken"] },
  { day: "Tue", date: "Feb 4", meals: ["Smoothie", "Wrap", "Pasta"] },
  { day: "Wed", date: "Feb 5", meals: ["Eggs", "Burrito", "Salmon"] },
  { day: "Thu", date: "Feb 6", meals: ["Yogurt", "", "Pizza"] },
  { day: "Fri", date: "Feb 7", meals: ["", "", ""] },
  { day: "Sat", date: "Feb 8", meals: ["", "", ""] },
  { day: "Sun", date: "Feb 9", meals: ["", "", ""] },
];

export function Dashboard() {
  const router = useRouter();
  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false);
  const totalCalories = 2000;
  const consumedCalories = 1650;
  const percentage = Math.round((consumedCalories / totalCalories) * 100);
  const todayIndex = 2; // Wednesday is today

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good Morning", icon: Sun };
    if (hour < 17) return { text: "Good Afternoon", icon: Sunset };
    return { text: "Good Evening", icon: Moon };
  };
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  // Weekly progress data (mock)
  const weekProgress = [85, 72, 83, 0, 0, 0, 0]; // Mon-Sun calorie % hit
  const todayDayIndex = new Date().getDay(); // 0=Sun, adjust to Mon-start
  const daysLogged = weekProgress.filter(v => v > 0).length;

  // NEW: State for the Fake FYP
  const [fypRecipes, setFypRecipes] = useState<any[]>([]);

  // NEW: Fetch and shuffle recipes for the FYP
  useEffect(() => {
    const fetchAndShuffleFYP = async () => {
      try {
        const res = await fetch("/api/recipes?all=true");
        if (!res.ok) return;
        const data = await res.json();
        
        // Shuffle the array and pick the top 3 for the FYP illusion
        const shuffled = data.sort(() => 0.5 - Math.random());
        setFypRecipes(shuffled.slice(0, 20));
      } catch (error) {
        console.error("Failed to load FYP:", error);
      }
    };

    fetchAndShuffleFYP();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <Image
            src="/images/logo1.png"
            alt="NutriFlow Logo"
            width={225}
            height={125}
            priority
          />
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/profile")}
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-10 h-10"
              style={{ backgroundColor: "var(--lilac-purple-light)" }}
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-4">
        {/* Hero Section - Today's Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Daily Summary Card */}
          <Card className="col-span-1 md:col-span-2 p-4 rounded-2xl">
            {/* Greeting Row */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <GreetingIcon className="w-5 h-5 text-amber-500" />
                  <h3 className="text-xl font-semibold text-gray-800">{greeting.text}!</h3>
                </div>
                <p className="text-xs text-muted-foreground">You're on a <span className="font-medium text-gray-700">3-day streak</span>. Keep it going!</p>
              </div>
            </div>

            {/* Mini Week Progress */}
            <div className="flex items-end gap-1.5 mb-4">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <div 
                    className="w-full rounded-md transition-all"
                    style={{ 
                      height: weekProgress[i] > 0 ? `${Math.max(weekProgress[i] * 0.32, 8)}px` : "6px",
                      backgroundColor: weekProgress[i] > 0 ? (i === todayIndex ? "var(--sage-green)" : "var(--sage-green-light)") : "#f3f4f6",
                    }}
                  />
                  <span className={`text-[10px] ${i === todayIndex ? "font-semibold text-gray-700" : "text-gray-400"}`}>{day}</span>
                </div>
              ))}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-2 p-2 rounded-xl" style={{ backgroundColor: "var(--sage-green-light)" }}>
                <Flame className="w-4 h-4" style={{ color: "var(--sage-green-dark)" }} />
                <div>
                  <p className="text-[10px] text-muted-foreground leading-none">Calories</p>
                  <p className="text-sm font-semibold text-gray-800">{consumedCalories}<span className="text-xs font-normal text-muted-foreground">/{totalCalories}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl" style={{ backgroundColor: "var(--lilac-purple-light)" }}>
                <Droplets className="w-4 h-4" style={{ color: "var(--lilac-purple-dark)" }} />
                <div>
                  <p className="text-[10px] text-muted-foreground leading-none">Water</p>
                  <p className="text-sm font-semibold text-gray-800">4<span className="text-xs font-normal text-muted-foreground">/8 cups</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50">
                <Calendar className="w-4 h-4 text-amber-600" />
                <div>
                  <p className="text-[10px] text-muted-foreground leading-none">Streak</p>
                  <p className="text-sm font-semibold text-gray-800">3 <span className="text-xs font-normal text-muted-foreground">days</span></p>
                </div>
              </div>
            </div>

            {/* Next Meal Nudge */}
            <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
              <div className="p-1.5 rounded-lg bg-orange-50">
                <Sparkles className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700">Time for your next meal!</p>
                <p className="text-[10px] text-muted-foreground">You've had 2 of 4 meals today</p>
              </div>
            </div>
          </Card>

                    <Card
  className="col-span-1 md:col-span-1 p-4 rounded-2xl flex flex-col justify-center text-center"
  onClick={() => router.push("/planning")}
>
  <div className="flex flex-col items-center text-center w-full space-y-4">
    <div className="relative">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundColor: "var(--sage-green-light)" }}
      >
        {/* Calendar icon */}
        <Calendar className="w-8 h-8" style={{ color: "var(--sage-green-dark)" }} />
      </div>
    </div>

    <div>
      <h4 className="text-lg font-bold mb-0.5 text-gray-800 tracking-tight">
        Weekly Roadmap
      </h4>
      <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400">
        Plan your success
      </p>
    </div>

    {/* Button moved up  center */}
    <div className="w-full max-w-[140px] pt-2">
      <Button
        className="w-full text-white shadow-none h-auto py-2.5 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:brightness-110"
        style={{ backgroundColor: "var(--sage-green)" }}
      >
        <span className="text-[11px] font-bold uppercase tracking-wider">Open Planner</span>
      </Button>
    </div>
  </div>
</Card>

          {/* Recipes Quick Actions */}
          <Card className="col-span-1 md:col-span-1 p-4 rounded-2xl flex flex-col justify-center text-center">
            <div className="mb-4">
              <div className="flex justify-center items-center mb-1">
                <Utensils className="w-5 h-5 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-0.5">Recipes</h3>
              <p className="text-xs text-muted-foreground">Manage your personal cookbook</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 justify-center">
              <Button
                onClick={() => setIsAddRecipeOpen(true)}
                className="w-full text-white shadow-none h-auto py-2 flex flex-col gap-0.5 items-center justify-center"
                style={{ backgroundColor: "var(--sage-green)" }}
              >
                <Plus className="w-4 h-4" />
                <span className="text-[11px] font-normal">Add New</span>
              </Button>
              <Button
                onClick={() => router.push("/recipes")}
                className="w-full text-white shadow-none border-0 h-auto py-2 flex flex-col gap-0.5 items-center justify-center"
                style={{ backgroundColor: "var(--lilac-purple)" }}
              >
                <BookOpen className="w-4 h-4" />
                <span className="text-[11px] font-normal">My Recipes</span>
              </Button>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
          {/* Left Column - My Targets */}
          <div className="lg:col-span-3 flex">
            {/* My Targets - Macros */}
            <Card className="p-4 rounded-2xl flex-1 flex flex-col justify-center">
              <div className="mb-6 text-center">
                <div className="flex justify-center items-center mb-2">
                  <Target className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-1">My Targets</h3>
                <p className="text-sm text-muted-foreground">Track your daily macros</p>
              </div>
              <div className="space-y-3 px-1">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">Calories</span>
                    <span className="text-xs font-semibold text-gray-800">1650/2000</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: "83%",
                        backgroundColor: "var(--sage-green)",
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">Fats</span>
                    <span className="text-xs font-semibold text-gray-800">45/65g</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: "69%",
                        backgroundColor: "var(--lilac-purple)", 
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">Carbs</span>
                    <span className="text-xs font-semibold text-gray-800">180/250g</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: "72%",
                        backgroundColor: "var(--sage-green)",
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">Proteins</span>
                    <span className="text-xs font-semibold text-gray-800">95/150g</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: "63%",
                        backgroundColor: "var(--lilac-purple)",
                      }}
                    />
                  </div>
                </div>
              </div>
              <Button
                className="w-full mt-4 text-white text-xs h-8 rounded-lg"
                style={{ backgroundColor: "var(--sage-green)" }}
              >
                Log Meal
              </Button>
            </Card>
          </div>

          {/* Middle Column - MODERN CAROUSEL FEED */}
          <div className="lg:col-span-6 flex flex-col">

             <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full relative group/carousel flex-1"
              >
                <CarouselContent className="">
                  {fypRecipes.length > 0 ? (
                    fypRecipes.map((recipe) => (
                      <CarouselItem key={recipe.id} className="basis-full">
                        <Card 
                            key={recipe.id} 
                            className="overflow-hidden rounded-3xl border border-gray-100 shadow-sm bg-white group cursor-pointer flex flex-col h-full"
                          >
                            {/* Image Area */}
                            <div className="relative w-full aspect-[16/9] bg-gray-50 overflow-hidden flex items-center justify-center">
                              <img 
                                src={recipe.imageUrl || "/images/meals.webp"} 
                                alt={recipe.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                            </div>
                            
                            {/* Content Below Image */}
                            <div className="px-3 py-2 flex flex-col gap-1">
                                <p className="text-sm text-gray-800 leading-snug">
                                  {recipe.name}
                                </p>
                                
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                                    {recipe.estimatedCalories || "---"} kcal
                                  </span>
                                  <span className="text-gray-300">·</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" style={{ color: "var(--sage-green)" }} />
                                    {recipe.prepTimeMinutes} min
                                  </span>
                                </div>

                                <div className="flex flex-wrap gap-1">
                                    {recipe.dietaryTags?.slice(0, 3).map((tag: string) => (
                                      <span key={tag} className="text-[11px] text-gray-400">
                                        #{tag.replace('_', '')}
                                      </span>
                                    ))}
                                </div>
                            </div>
                          </Card>
                      </CarouselItem>
                    ))
                  ) : (
                    /* Skeleton Loaders */
                    [1, 2, 3].map((i) => (
                      <CarouselItem key={i} className="basis-full">
                        <div className="w-full h-64 rounded-3xl bg-gray-100 animate-pulse border border-gray-200"></div>
                      </CarouselItem>
                    ))
                  )}
                </CarouselContent>
                
                {/* Navigation Buttons - Tucked Inside or Better Positioned */}
                <div className="hidden lg:block pointer-events-none absolute inset-0">
                   <CarouselPrevious className="left-2 bg-white/80 hover:bg-white text-gray-800 border-none shadow-md pointer-events-auto z-10" />
                   <CarouselNext className="right-2 bg-white/80 hover:bg-white text-gray-800 border-none shadow-md pointer-events-auto z-10" />
                </div>
              </Carousel>
          </div>

          {/* Right Column - Map */}
          <div className="lg:col-span-3 flex">
            <Card className="p-3 rounded-2xl flex-1 flex flex-col">
              <div className="mb-3 text-center">
                <h3 className="text-lg font-semibold mb-0.5">Nearby Places</h3>
                <p className="text-xs text-muted-foreground">Restaurants around you</p>
              </div>
              <div
                className="w-full flex-1 rounded-xl flex items-center justify-center min-h-0"
                style={{ backgroundColor: "var(--sage-green-light)" }}
              >
                <div className="text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-1" style={{ color: "var(--sage-green-dark)" }} />
                  <p className="text-xs text-muted-foreground">Map view</p>
                </div>
              </div>
              <div className="mt-2 space-y-0.5">
                <div className="p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex justify-between items-start mb-0.5">
                    <div className="text-xs">Campus Cafe</div>
                    <div
                      className="px-2 py-0.5 rounded text-xs"
                      style={{ backgroundColor: "var(--sage-green-light)" }}
                    >
                      0.3 mi
                    </div>
                  </div>
                  <div className="text-[11px] text-muted-foreground">Healthy bowls, salads</div>
                </div>
                <div className="p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex justify-between items-start mb-0.5">
                    <div className="text-xs">Pizza Palace</div>
                    <div
                      className="px-2 py-0.5 rounded text-xs"
                      style={{ backgroundColor: "var(--sage-green-light)" }}
                    >
                      0.5 mi
                    </div>
                  </div>
                  <div className="text-[11px] text-muted-foreground">Italian, Pizza</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={isAddRecipeOpen} onOpenChange={setIsAddRecipeOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border-0 shadow-2xl p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">Add Your Recipe</DialogTitle>
          </DialogHeader>
          <AddRecipePlaceholder />
        </DialogContent>
      </Dialog>
    </div>
  );
}