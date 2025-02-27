"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@nextui-org/button";

import { Tabs, Tab } from "@nextui-org/tabs";
import { Calendar, CalendarDaysIcon } from "lucide-react";
import { BsCalendarMonth, BsCalendarWeek } from "react-icons/bs";

import AddEventModal from "../../_modals/add-event-modal";
import AddScheduleModal from "../../_modals/add-schedule-modal";
import DailyView from "./day/daily-view";
import MonthView from "./month/month-view";
import WeeklyView from "./week/week-view";
import { useModalContext } from "@/providers/modal-provider";
import { ClassNames, CustomComponents, Views } from "@/types/index";

// Sample Master Object Data (Replace with API response)
const masterObject = {
  data: [
    {
      id: "fd6f4d17-5c97-48a4-9ff6-5262674131f5",
      object_code: "code1",
      object_type: "type1",
      is_active: true,
      title: "test1",
      title_en: "titleEn1",
    },
    {
      id: "2d6f4d17-5c97-48a4-9ff6-5262674131f6",
      object_code: "code2",
      object_type: "type2",
      is_active: true,
      title: "test2",
      title_en: "titleEn2",
    },
  ],
};

export default function SchedulerViewFilteration({
  views = {
    views: ["day", "week", "month"],
    mobileViews: ["day"],
  },
  CustomComponents,
  classNames,
}: {
  views?: Views;
  CustomComponents?: CustomComponents;
  classNames?: ClassNames;
}) {
  const { showModal: showAddEventModal } = useModalContext();
  const [clientSide, setClientSide] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  useEffect(() => {
    setClientSide(true);
  }, []);

  useEffect(() => {
    if (!clientSide) return;
    setIsMobile(window.innerWidth <= 768);

    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [clientSide]);

  function handleAddEvent(selectedDay?: number) {
    const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), selectedDay ?? new Date().getDate(), 0, 0, 0, 0);
    const endDate = new Date(new Date().getFullYear(), new Date().getMonth(), selectedDay ?? new Date().getDate(), 23, 59, 59, 999);

    showAddEventModal({
      title: CustomComponents?.CustomEventModal?.CustomAddEventModal?.title || "Event",
      body: <AddEventModal CustomAddEventModal={CustomComponents?.CustomEventModal?.CustomAddEventModal?.CustomForm} />,
      data: { startDate, endDate },
    });
  }

  const viewsSelector = isMobile ? views?.mobileViews : views?.views;

  return (
    <div className="flex w-full flex-col">
      {/* Filter Dropdown */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Filter Events</h2>
        <select
  onChange={(e) => setSelectedFilter(e.target.value)}
  className="border p-2 rounded-md"
>
  <option value="">Select Object</option>
  {masterObject.data.map((item) => (
    <option key={item.id} value={item.object_code}>
      {item.title_en}
    </option>
  ))}
</select>
      </div>

      <div className="flex w-full">
        <div className="dayly-weekly-monthly-selection relative w-full">
          <Tabs classNames={{ ...classNames?.tabs }} aria-label="Options" color="primary" variant="solid">
            {viewsSelector?.includes("day") && (
              <Tab
                key="day"
                title={
                  CustomComponents?.customTabs?.CustomDayTab || (
                    <div className="flex items-center space-x-2">
                      <CalendarDaysIcon size={15} />
                      <span>Day</span>
                    </div>
                  )
                }
              >
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, type: "spring", stiffness: 250 }}>
                  <DailyView classNames={classNames?.buttons} filter={selectedFilter} />
                </motion.div>
              </Tab>
            )}

            {viewsSelector?.includes("week") && (
              <Tab
                key="week"
                title={
                  CustomComponents?.customTabs?.CustomWeekTab || (
                    <div className="flex items-center space-x-2">
                      <BsCalendarWeek />
                      <span>Week</span>
                    </div>
                  )
                }
              >
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, type: "spring", stiffness: 250 }}>
                  <WeeklyView classNames={classNames?.buttons} filter={selectedFilter} />
                </motion.div>
              </Tab>
            )}

            {viewsSelector?.includes("month") && (
              <Tab
                key="month"
                title={
                  CustomComponents?.customTabs?.CustomMonthTab || (
                    <div className="flex items-center space-x-2">
                      <BsCalendarMonth />
                      <span>Month</span>
                    </div>
                  )
                }
              >
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, type: "spring", stiffness: 250 }}>
                  <MonthView classNames={classNames?.buttons} filter={selectedFilter} />
                </motion.div>
              </Tab>
            )}
          </Tabs>

          {/* Add Event Button */}
          <Button onClick={() => handleAddEvent()} className={"absolute top-0 right-0 " + classNames?.buttons?.addEvent} color="primary" startContent={<Calendar />}>
            Add Appointment
          </Button>
        </div>
      </div>
    </div>
  );
}
