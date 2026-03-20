"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import usePostsData from "@/hooks/usePostsData";
import { getPostsForDate, formatMonthYear } from "@/utils/calendarHelpers";
import { PLATFORM_CONFIG } from "@/config/platforms";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import DailyReview from "@/components/calendar/DailyReview";
import Spinner from "@/components/ui/Spinner";

const VIEWS = ["Month", "Week", "List"];

export default function CalendarPage() {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState(now);
  const [viewMode, setViewMode] = useState("Month");
  const [platformFilter, setPlatformFilter] = useState("all");

  const { allPosts, connectedNames, loading } = usePostsData();

  const calendarPosts = useMemo(
    () => allPosts.filter((p) => p.status === "scheduled" || p.status === "published"),
    [allPosts]
  );

  const selectedDayPosts = useMemo(
    () => getPostsForDate(calendarPosts, selectedDate),
    [calendarPosts, selectedDate]
  );

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-headline">Content Calendar</h1>
          <p className="text-neutral-500 font-medium mt-1">
            Scheduling across {connectedNames.length} active channel{connectedNames.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800/50 p-1 rounded-xl">
          {VIEWS.map((v) => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                viewMode === v ? "bg-green-500 text-black shadow-sm" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 mr-4">
          <button onClick={prevMonth} className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800/50 flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-white font-bold text-sm min-w-[140px] text-center font-headline">
            {formatMonthYear(currentYear, currentMonth)}
          </span>
          <button onClick={nextMonth} className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800/50 flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>

        <button
          onClick={() => setPlatformFilter("all")}
          className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
            platformFilter === "all" ? "bg-green-500/15 text-green-400 border-green-500/30" : "bg-neutral-900 text-neutral-500 border-neutral-800/50 hover:border-neutral-700"
          }`}
        >
          All Channels
        </button>
        {connectedNames.map((name) => {
          const config = PLATFORM_CONFIG[name.toLowerCase()] || {};
          const active = platformFilter === name.toLowerCase();
          return (
            <button
              key={name}
              onClick={() => setPlatformFilter(active ? "all" : name.toLowerCase())}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                active ? "bg-green-500/15 text-green-400 border-green-500/30" : "bg-neutral-900 text-neutral-500 border-neutral-800/50 hover:border-neutral-700"
              }`}
            >
              {config.label || name}
            </button>
          );
        })}
      </div>

      {viewMode === "Month" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <CalendarGrid
              currentYear={currentYear}
              currentMonth={currentMonth}
              posts={calendarPosts}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              platformFilter={platformFilter}
            />
          </div>
          <div className="lg:col-span-4">
            <DailyReview selectedDate={selectedDate} posts={selectedDayPosts} />
          </div>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800/50 rounded-2xl p-8 text-center">
          <p className="text-neutral-500 text-sm">{viewMode} view coming soon</p>
        </div>
      )}
    </div>
  );
}
