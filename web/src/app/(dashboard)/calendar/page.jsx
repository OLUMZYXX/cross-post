"use client";

import { useState } from "react";
import usePostsData from "@/hooks/usePostsData";
import useCalendarMonth from "@/hooks/useCalendarMonth";
import PageHeader from "@/components/app/PageHeader";
import SegmentedTabs from "@/components/app/SegmentedTabs";
import CalendarToolbar from "@/components/calendar/CalendarToolbar";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import DailyReview from "@/components/calendar/DailyReview";
import AgendaList from "@/components/calendar/AgendaList";
import Spinner from "@/components/ui/Spinner";

const VIEWS = [
  { key: "month", label: "Month" },
  { key: "list", label: "List" },
];

export default function CalendarPage() {
  const [view, setView] = useState("month");
  const { allPosts, connectedNames, loading } = usePostsData();
  const calendar = useCalendarMonth(allPosts);

  if (loading) return <Spinner className="py-24" />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Plan ahead"
        title="Calendar"
        subtitle="Everything you've sent and everything that's queued."
        actions={<SegmentedTabs tabs={VIEWS} value={view} onChange={setView} label="Calendar view" />}
      />

      <CalendarToolbar calendar={calendar} platformNames={connectedNames} />

      {view === "month" ? (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
          <CalendarGrid
            year={calendar.year}
            month={calendar.month}
            posts={calendar.posts}
            selectedDate={calendar.selectedDate}
            onSelectDate={calendar.setSelectedDate}
          />
          <DailyReview selectedDate={calendar.selectedDate} posts={calendar.selectedPosts} />
        </div>
      ) : (
        <AgendaList posts={calendar.monthPosts} />
      )}
    </div>
  );
}
