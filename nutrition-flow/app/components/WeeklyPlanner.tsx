"use client";

import { useState, useMemo } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  ArrowLeft, 
  Droplets,
  Minus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { 
  format, 
  startOfWeek, 
  addDays, 
  addWeeks, 
  subWeeks,
  isSameDay
} from "date-fns";

export function WeeklyPlanner() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [waterLevels, setWaterLevels] = useState<Record<string, number>>({});
  const waterGoal = 8;
  const today = new Date();

  const weekStart = useMemo(() => 
    startOfWeek(currentDate, { weekStartsOn: 1 }), 
    [currentDate]
  );

  const days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = addDays(weekStart, i);
      const dateKey = format(date, "yyyy-MM-dd");
      return {
        dayName: format(date, "EEEE"),
        dateDisplay: format(date, "MMM d"),
        dateKey,
        isToday: isSameDay(date, today),
      };
    });
  }, [weekStart, currentDate]);

  const updateWater = (dateKey: string, delta: number) => {
    setWaterLevels(prev => ({
      ...prev,
      [dateKey]: Math.max(0, (prev[dateKey] || 0) + delta)
    }));
  };

  return (
    <div className="min-h-screen p-8 bg-[#F4F7F2] relative overflow-hidden">
      {/* Soft theme-colored ambient glows to replace plain white background */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-20 blur-[100px] -translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: "var(--sage-green)" }} />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-[100px] translate-x-1/2 translate-y-1/2" style={{ backgroundColor: "var(--lilac-purple)" }} />
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Navigation Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => router.push("/dashboard")}
              className="rounded-full bg-white border-2 hover:scale-105 transition-all shadow-sm"
              style={{ borderColor: "var(--sage-green-light)" }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: "var(--sage-green-dark)" }} />
            </Button>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-gray-800">Weekly Roadmap</h1>
              <p className="text-sm font-bold tracking-[0.2em] uppercase text-gray-400">NutriFlow Planning System</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm p-2 rounded-2xl shadow-sm border border-gray-100">
             <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
               <ChevronLeft className="w-5 h-5 text-gray-400" />
             </Button>
             <div className="text-sm font-black text-gray-700 px-6 min-w-[220px] text-center uppercase tracking-tight">
               {format(weekStart, "MMMM d")} — {format(addDays(weekStart, 6), "MMMM d, yyyy")}
             </div>
             <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
               <ChevronRight className="w-5 h-5 text-gray-400" />
             </Button>
          </div>
        </header>

        {/* 7-Day Grid */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          {days.map((day, i) => (
            <div key={i} className="flex flex-col gap-5">
              
              {/* MEAL PLAN SECTION - Sage Green Theme */}
              <Card 
                className={`p-6 flex flex-col h-[450px] rounded-[2.8rem] border-2 transition-all duration-500 
                  ${day.isToday ? 'bg-white shadow-xl scale-[1.02]' : 'bg-white/90 border-transparent'}`}
                style={{ borderColor: day.isToday ? "var(--sage-green)" : "transparent" }}
              >
                <div className="mb-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1" 
                     style={{ color: "var(--sage-green-dark)" }}>
                    {day.dayName}
                  </p>
                  <p className="text-2xl font-black text-gray-800">{day.dateDisplay}</p>
                </div>
                
                <div className="flex-1 space-y-4">
                  {[1, 2, 3].map((slot) => (
                    <button 
                      key={slot}
                      className="w-full py-8 border-2 border-dashed rounded-[1.8rem] flex items-center justify-center transition-all 
                        hover:bg-[var(--sage-green-light)]/20 hover:border-[var(--sage-green)] group"
                      style={{ 
                        borderColor: "rgba(168, 181, 160, 0.2)", 
                        backgroundColor: "rgba(168, 181, 160, 0.05)" 
                      }}
                    >
                      <Plus className="w-6 h-6 transition-colors text-gray-300 group-hover:text-[var(--sage-green)]" />
                    </button>
                  ))}
                </div>
              </Card>

              {/* HYDRATION PLAN SECTION - Lilac Purple Theme */}
              <Card className="p-5 rounded-[2.2rem] border-none shadow-lg bg-white relative group overflow-hidden">
                {/* Visual Section Indicator */}
                <div className="absolute top-0 left-0 w-full h-1.5 transition-colors" 
                     style={{ backgroundColor: "var(--lilac-purple-light)" }} />
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-2xl transition-colors group-hover:bg-[var(--lilac-purple)]" 
                         style={{ backgroundColor: "var(--lilac-purple-light)" }}>
                      <Droplets className="w-4 h-4 transition-colors group-hover:text-white" style={{ color: "var(--lilac-purple-dark)" }} />
                    </div>
                    <div className="flex items-center gap-1 bg-gray-50 rounded-full p-1 border border-gray-100">
                      <Button 
                        variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-white hover:text-[var(--lilac-purple)]"
                        onClick={() => updateWater(day.dateKey, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-xs font-black px-2 text-gray-700">
                        {waterLevels[day.dateKey] || 0}
                      </span>
                      <Button 
                        variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-white hover:text-[var(--lilac-purple)]"
                        onClick={() => updateWater(day.dateKey, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden p-0.5">
                       <div 
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{ 
                          width: `${Math.min(((waterLevels[day.dateKey] || 0) / waterGoal) * 100, 100)}%`,
                          backgroundColor: "var(--lilac-purple)",
                          boxShadow: "0 0 12px rgba(189, 172, 219, 0.4)"
                        }}
                       />
                    </div>
                    <p className="text-[9px] font-black text-center text-gray-400 tracking-[0.2em] uppercase">Hydration Plan</p>
                  </div>
                </div>
              </Card>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}