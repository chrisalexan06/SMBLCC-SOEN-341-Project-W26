import { WeeklyPlanner } from "@/app/components/WeeklyPlanner";

export default function PlanningPage() {
  return (
    // Adding a z-index and relative position ensures it stays above backgrounds
    <div className="relative z-10">
      <WeeklyPlanner />
    </div>
  );
}