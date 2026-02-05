"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Heart, MessageCircle, MapPin, User, Settings, Calendar, Plus } from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { ChefHat } from "lucide-react";

const calorieData = [
  { name: "Consumed", value: 1650 },
  { name: "Remaining", value: 350 },
];

const COLORS = {
  consumed: "#A8B5A0", // sage green
  remaining: "#E0D5EF", // lilac purple light
};

const feedData = [
  {
    id: 1,
    user: "Sarah Chen",
    avatar: "🧑‍🎓",
    image: "https://images.unsplash.com/photo-1672959202028-51e3b71255bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwYm93bCUyMGZvb2R8ZW58MXx8fHwxNzcwMDUwNTYzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    caption: "Healthy lunch bowl! 🥗",
    calories: 450,
    likes: 23,
    comments: 5,
    time: "2h ago",
  },
  {
    id: 2,
    user: "Mike Johnson",
    avatar: "👨‍🎓",
    image: "https://images.unsplash.com/photo-1676300184847-4ee4030409c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMGRpc2glMjBmb29kfGVufDF8fHx8MTc3MDAxMDA1NXww&ixlib=rb-4.1.0&q=80&w=1080",
    caption: "Homemade pasta for dinner 🍝",
    calories: 680,
    likes: 34,
    comments: 8,
    time: "4h ago",
  },
  {
    id: 3,
    user: "Emma Davis",
    avatar: "👩‍🎓",
    image: "https://images.unsplash.com/photo-1609158087148-3bae840bcfda?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmVha2Zhc3QlMjBhdm9jYWRvJTIwdG9hc3R8ZW58MXx8fHwxNzcwMDIzMTUyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    caption: "Perfect breakfast to start the day ☀️",
    calories: 520,
    likes: 45,
    comments: 12,
    time: "6h ago",
  },
];

const weekDays = [
  { day: "Mon", date: "Feb 3", meals: ["Oatmeal", "Salad Bowl", "Grilled Chicken"] },
  { day: "Tue", date: "Feb 4", meals: ["Smoothie", "Wrap", "Pasta"] },
  { day: "Wed", date: "Feb 5", meals: ["Eggs", "Burrito", "Salmon"] },
  { day: "Thu", date: "Feb 6", meals: ["Yogurt", "", "Pizza"] },
  { day: "Fri", date: "Feb 7", meals: ["", "", ""] },
  { day: "Sat", date: "Feb 8", meals: ["", "", ""] },
  { day: "Sun", date: "Feb 9", meals: ["", "", ""] },
];

const savedRecipes = [
  {
    id: 1,
    name: "Quinoa Buddha Bowl",
    image: "https://images.unsplash.com/photo-1672959202028-51e3b71255bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwYm93bCUyMGZvb2R8ZW58MXx8fHwxNzcwMDUwNTYzfDA&ixlib=rb-4.1.0&q=80&w=400",
    calories: 450,
    time: "25 min",
  },
  {
    id: 2,
    name: "Avocado Toast",
    image: "https://images.unsplash.com/photo-1609158087148-3bae840bcfda?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmVha2Zhc3QlMjBhdm9jYWRvJTIwdG9hc3R8ZW58MXx8fHwxNzcwMDIzMTUyfDA&ixlib=rb-4.1.0&q=80&w=400",
    calories: 350,
    time: "10 min",
  },
  {
    id: 3,
    name: "Creamy Pasta",
    image: "https://images.unsplash.com/photo-1676300184847-4ee4030409c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMGRpc2glMjBmb29kfGVufDF8fHx8MTc3MDAxMDA1NXww&ixlib=rb-4.1.0&q=80&w=400",
    calories: 680,
    time: "30 min",
  },
  {
    id: 4,
    name: "Meal Prep Bowl",
    image: "https://images.unsplash.com/photo-1666251214795-a1296307d29c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwbWVhbCUyMHByZXB8ZW58MXx8fHwxNzY5OTk4ODk0fDA&ixlib=rb-4.1.0&q=80&w=400",
    calories: 520,
    time: "40 min",
  },
];

export function Dashboard() {
  const router = useRouter();
  const totalCalories = 2000;
  const consumedCalories = 1650;
  const percentage = Math.round((consumedCalories / totalCalories) * 100);
  const todayIndex = 2; // Wednesday is today

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl" style={{ color: "var(--sage-green-dark)" }}>
            NutriFlow
          </h1>
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
      <main className="max-w-7xl mx-auto p-6">
        {/* Weekly Meal Planner - Full Width */}
        <Card className="p-6 rounded-2xl mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6" style={{ color: "var(--sage-green-dark)" }} />
              <h2>Weekly Meal Plan</h2>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                style={{ borderColor: "var(--sage-green)", color: "var(--sage-green-dark)" }}
              >
                Plan Week
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/recipes")}
                style={{ borderColor: "var(--sage-green)", color: "var(--sage-green-dark)" }}
              >
                My Recipes
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {weekDays.map((day, index) => (
              <div
                key={day.day}
                className={`p-4 rounded-xl border-2 ${
                  index === todayIndex ? "border-[var(--sage-green)]" : "border-gray-200"
                }`}
                style={
                  index === todayIndex
                    ? { backgroundColor: "var(--sage-green-light)", borderColor: "var(--sage-green)" }
                    : {}
                }
              >
                <div className="text-center mb-3">
                  <div className={`text-sm ${index === todayIndex ? "font-semibold" : "text-muted-foreground"}`}>
                    {day.day}
                  </div>
                  <div className="text-xs text-muted-foreground">{day.date}</div>
                </div>
                <div className="space-y-2">
                  {["B", "L", "D"].map((mealType, mealIndex) => (
                    <div key={mealType}>
                      {day.meals[mealIndex] ? (
                        <div className="text-xs p-2 bg-white rounded-lg border">
                          <div className="text-[10px] text-muted-foreground mb-1">{mealType}</div>
                          <div className="truncate">{day.meals[mealIndex]}</div>
                        </div>
                      ) : (
                        <button className="w-full text-xs p-2 bg-white rounded-lg border border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center gap-1">
                          <Plus className="w-3 h-3" />
                          <span className="text-[10px]">{mealType}</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Calories Chart */}
          <div className="lg:col-span-3">
            <Card className="p-6 rounded-2xl">
              <h3 className="mb-4">Today's Calories</h3>
              <div className="relative">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={calorieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill={COLORS.consumed} />
                      <Cell fill={COLORS.remaining} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <div className="text-3xl">{percentage}%</div>
                  <div className="text-sm text-muted-foreground">of goal</div>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS.consumed }}
                    />
                    <span className="text-sm">Consumed</span>
                  </div>
                  <span className="text-sm">{consumedCalories} cal</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS.remaining }}
                    />
                    <span className="text-sm">Remaining</span>
                  </div>
                  <span className="text-sm">{totalCalories - consumedCalories} cal</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Goal</span>
                    <span className="text-sm">{totalCalories} cal</span>
                  </div>
                </div>
              </div>
              <Button
                className="w-full mt-6 text-white"
                style={{ backgroundColor: "var(--sage-green)" }}
              >
                Log Meal
              </Button>
            </Card>

            {/* My Targets - Macros */}
            <Card className="p-6 rounded-2xl mt-6">
              <h3 className="mb-4">My Targets</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Calories</span>
                    <span className="text-sm">1650/2000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: "83%",
                        backgroundColor: "var(--sage-green)",
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Fats</span>
                    <span className="text-sm">45/65g</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: "69%",
                        backgroundColor: "var(--lilac-purple)", 
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Carbs</span>
                    <span className="text-sm">180/250g</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: "72%",
                        backgroundColor: "var(--sage-green)",
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Proteins</span>
                    <span className="text-sm">95/150g</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: "63%",
                        backgroundColor: "var(--lilac-purple)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Middle Column - Social Feed */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <h2 className="mb-4">Friend Feed</h2>
              <div className="space-y-4">
                {feedData.map((post) => (
                  <Card key={post.id} className="overflow-hidden rounded-2xl">
                    {/* Post Header */}
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: "var(--lilac-purple-light)" }}
                        >
                          <span>{post.avatar}</span>
                        </div>
                        <div>
                          <div>{post.user}</div>
                          <div className="text-sm text-muted-foreground">
                            {post.time}
                          </div>
                        </div>
                      </div>
                      <div
                        className="px-3 py-1 rounded-full text-sm"
                        style={{ backgroundColor: "var(--sage-green-light)" }}
                      >
                        {post.calories} cal
                      </div>
                    </div>

                    {/* Post Image */}
                    <ImageWithFallback
                      src={post.image}
                      alt={post.caption}
                      className="w-full h-80 object-cover"
                    />

                    {/* Post Actions */}
                    <div className="p-4">
                      <p className="mb-3">{post.caption}</p>
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 hover:opacity-70">
                          <Heart className="w-5 h-5" />
                          <span className="text-sm">{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 hover:opacity-70">
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-sm">{post.comments}</span>
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Map */}
          <div className="lg:col-span-3">
            <Card className="p-6 rounded-2xl">
              <h3 className="mb-4">Nearby Places</h3>
              <div
                className="w-full h-64 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "var(--sage-green-light)" }}
              >
                <div className="text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-2" style={{ color: "var(--sage-green-dark)" }} />
                  <p className="text-sm text-muted-foreground">Map view</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <div>Campus Cafe</div>
                    <div
                      className="px-2 py-0.5 rounded text-xs"
                      style={{ backgroundColor: "var(--sage-green-light)" }}
                    >
                      0.3 mi
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">Healthy bowls, salads</div>
                </div>
                <div className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <div>Pizza Palace</div>
                    <div
                      className="px-2 py-0.5 rounded text-xs"
                      style={{ backgroundColor: "var(--sage-green-light)" }}
                    >
                      0.5 mi
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">Italian, Pizza</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}