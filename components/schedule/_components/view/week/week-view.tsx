import React, { useRef, useState } from "react";
import { useScheduler } from "@/providers/schedular-provider";
import { Chip } from "@nextui-org/chip";
import { AnimatePresence, motion } from "framer-motion"; // Import Framer Motion
import { useModalContext } from "@/providers/modal-provider";
import AddEventModal from "@/components/schedule/_modals/add-event-modal";
import EventStyled from "../event-component/event-styled";
import { Button } from "@nextui-org/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import clsx from "clsx";
import { Event, CustomEventModal } from "@/types";

const hours = Array.from(
  { length: 24 },
  (_, i) => `${i.toString().padStart(2, "0")}:00`
);

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Stagger children animations
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function WeeklyView({
  prevButton,
  nextButton,
  CustomEventComponent,
  CustomEventModal,
  classNames,
  filterLocation,
  filterObject,
}: {
  prevButton?: React.ReactNode;
  nextButton?: React.ReactNode;
  CustomEventComponent?: React.FC<Event>;
  CustomEventModal?: CustomEventModal;
  classNames?: { prev?: string; next?: string; addEvent?: string };
  filterLocation?: string;
  filterObject?: string;
}) {
  const { getters, handlers } = useScheduler();
  const hoursColumnRef = useRef<HTMLDivElement>(null);
  const [detailedHour, setDetailedHour] = useState<string | null>(null);
  const [timelinePosition, setTimelinePosition] = useState<number>(0);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const { showModal } = useModalContext();

  const daysOfWeek = getters?.getDaysInWeek(
    getters?.getWeekNumber(currentDate),
    currentDate.getFullYear()
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!hoursColumnRef.current) return;
    const rect = hoursColumnRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const hourHeight = rect.height / 24;
    const hour = Math.max(0, Math.min(23, Math.floor(y / hourHeight)));
    const minuteFraction = (y % hourHeight) / hourHeight;
    const minutes = Math.floor(minuteFraction * 60);
    setDetailedHour(
      `${hour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
    );
    setTimelinePosition(y + 83);
  };

  function handleAddEvent(event?: Event) {
    showModal({
      title: "Add Event",
      body: <AddEventModal />,
      getter: async () => {
        const startDate = event?.startDate || new Date();
        const endDate = event?.endDate || new Date();
        return { startDate, endDate };
      },
    });
  }

  const handleNextWeek = () => {
    const nextWeek = new Date(currentDate);
    nextWeek.setDate(currentDate.getDate() + 7);
    setCurrentDate(nextWeek);
  };

  const handlePrevWeek = () => {
    const prevWeek = new Date(currentDate);
    prevWeek.setDate(currentDate.getDate() - 7);
    setCurrentDate(prevWeek);
  };

  function handleAddEventWeek(dayIndex: number, detailedHour: string) {
    if (!detailedHour) {
      console.error("Detailed hour not provided.");
      return;
    }

    const [hours, minutes] = detailedHour.split(":").map(Number);
    const chosenDay = daysOfWeek[dayIndex % 7].getDate();

    // Ensure day is valid
    if (chosenDay < 1 || chosenDay > 31) {
      console.error("Invalid day selected:", chosenDay);
      return;
    }

    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      chosenDay,
      hours,
      minutes
    );

    handleAddEvent({
      startDate: date,
      endDate: new Date(date.getTime() + 60 * 60 * 1000), // 1-hour duration
      title: "",
      id: "",
      variant: "primary",
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <motion.div
        key={currentDate.toDateString() + "parent"}
        className="all-week-events flex flex-col gap-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
      </motion.div>

      <div className="flex ml-auto gap-3">
        {prevButton ? (
          <div onClick={handlePrevWeek}>{prevButton}</div>
        ) : (
          <Button
            className={classNames?.prev}
            startContent={<ArrowLeft />}
            onClick={handlePrevWeek}
          >
            Prev
          </Button>
        )}
        {nextButton ? (
          <div onClick={handleNextWeek}>{nextButton}</div>
        ) : (
          <Button
            className={classNames?.next}
            onClick={handleNextWeek}
            endContent={<ArrowRight />}
          >
            Next
          </Button>
        )}
      </div>
      <div
        key={currentDate.toDateString()}
        className="grid use-automation-zoom-in grid-cols-8 gap-0"
      >
        <div className="sticky top-0 left-0 z-30 bg-default-100 rounded-tl-lg h-full border-0  flex items-center justify-center">
          <span className="text-lg font-semibold text-muted-foreground">
            Week {getters.getWeekNumber(currentDate)}
          </span>
        </div>

        <div className="col-span-7 flex flex-col relative">
          <div className="grid grid-cols-7 gap-0 flex-grow">
            {daysOfWeek.map((day, idx) => (
              <div key={idx} className="relative flex flex-col">
                <div className="sticky bg-default-100 top-0 z-20 flex-grow flex items-center justify-center">
                  <div className={clsx("text-lg font-semibold text-center p-4", new Date().toDateString() === day.toDateString() && "text-secondary-500")}>
                    <div className="text-lg font-semibold">
                      {getters.getDayName(day.getDay())}
                    </div>
                    <div
                      className={clsx(
                        "text-lg font-semibold",
                        new Date().getDate() === day.getDate() &&
                          new Date().getMonth() === currentDate.getMonth() &&
                          new Date().getFullYear() === currentDate.getFullYear()
                          ? "text-secondary-500"
                          : ""
                      )}
                    >
                      {day.getDate()}
                    </div>
                  </div>
                </div>
                <div className="absolute top-12 right-0 w-px h-[calc(100%-3rem)]"></div>
              </div>
            ))}
          </div>

          {detailedHour && (
            <div
              className="absolute flex z-10 left-0 w-full h-[3px] bg-primary-300 dark:bg-primary/30 rounded-full pointer-events-none"
              style={{ top: `${timelinePosition}px` }}
            >
              <Chip
                color="success"
                variant="flat"
                className="absolute vertical-abs-center z-50 left-[-55px] text-xs uppercase"
              >
                {detailedHour}
              </Chip>
            </div>
          )}
        </div>

        <div
          ref={hoursColumnRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setDetailedHour(null)}
          className="relative grid grid-cols-8 col-span-8"
        >
          <div className="col-span-1 bg-default-50 hover:bg-default-100 transition duration-400">
            {hours.map((hour, index) => (
              <div
                key={`hour-${index}`}
                className="cursor-pointer border-b border-default-200 p-[16px] h-[64px] text-center text-sm text-muted-foreground border-r"
              >
                {hour}
              </div>
            ))}
          </div>

          <div className="col-span-7 bg-default-50 grid h-full grid-cols-7">
            {/* Time Slot Mapping */}
            {Array.from({ length: 7 }, (_, dayIndex) => {
              const availableData = [
                { date: "2025-03-04", from: "09:00", to: "12:00" }, // March 4, 2025
                { date: "2025-03-05", from: "14:00", to: "16:00" }, // March 5, 2025
                { date: "2025-03-06", from: "10:00", to: "12:30" }, // March 6, 2025
              ];
              
              const bookedData = [
                { date: "2025-03-04", from: "10:00", to: "11:00", note: "Doctor Slot" },
                { date: "2025-03-05", from: "14:30", to: "15:30", note: "IPD Slot" },
                { date: "2025-03-06", from: "09:00", to: "10:15", note: "Emergency Slot" },
              ];
              
              
              return (
                <div key={`day-${dayIndex}`} className="relative col-span-1 border-r border-b border-default-200">
                  {Array.from({ length: 96 }, (_, slotIndex) => {
                    // Convert slot index to hour and minute
                    const hour = Math.floor(slotIndex / 4);
                    const minutes = (slotIndex % 4) * 15;
                    let nextHour = hour;
                    let nextMinutes = minutes + 15;

                    if (nextMinutes === 60) {
                      nextMinutes = 0;
                      nextHour += 1;
                    }

                    const startTime = `${hour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
                    const endTime = `${nextHour.toString().padStart(2, "0")}:${nextMinutes.toString().padStart(2, "0")}`;

                    // Get the current day's date as YYYY-MM-DD
                    const currentDateStr = daysOfWeek[dayIndex % 7].toISOString().split("T")[0];

                    // Check if slot is booked for the current day
                    const booked = bookedData.find(({ date, from, to }) => date === currentDateStr && startTime >= from && startTime < to);
                    const isBooked = !!booked;

                    // Check if slot is available for the current day
                    const availableSlot = availableData.find(({ date, from, to }) => date === currentDateStr && startTime >= from && startTime < to);
                    const isAvailable = !!availableSlot;

                    // Determine the slot's style and behavior
                    let slotClass = "hover:bg-default-100 text-xs text-muted-foreground";
                    let slotContent = `${startTime} - ${endTime}`;
                    let isClickable = false;

                    if (isBooked) {
                      slotClass = "bg-red-500 text-white text-xs font-bold rounded-md shadow-md";
                      slotContent = `⛔ ${booked.note || "Booked"}`;
                    } else if (isAvailable) {
                      slotClass = "bg-green-200 text-black text-xs font-bold rounded-md shadow-md";
                      slotContent = `✅ Available`;
                      isClickable = true;
                    }

                    return (
                      <div
                        key={`day-${dayIndex}-slot-${slotIndex}`}
                        className={`relative h-[16px] border-b border-default-200 flex items-center justify-center cursor-pointer transition duration-300 ${slotClass} ${isClickable ? "hover:bg-green-300" : "cursor-not-allowed"}`}
                        onClick={() => {
                          if (isClickable) handleAddEventWeek(dayIndex, startTime);
                        }}
                      >
                        {slotContent}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
