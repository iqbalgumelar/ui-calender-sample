import React, { useEffect, useRef, useState } from "react";
import { useScheduler } from "@/providers/schedular-provider";
import { Chip } from "@nextui-org/chip";
import { useModalContext } from "@/providers/modal-provider";
import AddEventModal from "@/components/schedule/_modals/add-event-modal";
import { Button } from "@nextui-org/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import clsx from "clsx";
import { Event, CustomEventModal } from "@/types";
import axios from "axios";
import { motion } from "framer-motion";

const hours = Array.from(
  { length: 24 },
  (_, i) => `${i.toString().padStart(2, "0")}:00`
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function WeeklyView({
  prevButton,
  nextButton,
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
  const { getters } = useScheduler();
  const hoursColumnRef = useRef<HTMLDivElement>(null);
  const [detailedHour, setDetailedHour] = useState<string | null>(null);
  const [timelinePosition, setTimelinePosition] = useState<number>(0);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const { showModal } = useModalContext();
  const [availableData, setAvailable] = useState<any>([]);
  const [bookedData, setBookedData] = useState<any>([]);

  const getMondayOfWeek = (date: Date) => {
    const newDate = new Date(date);
    const day = newDate.getDay(); // Get current day (0 = Sunday, 6 = Saturday)
    const diff = day === 0 ? -6 : 1 - day; // Adjust to Monday
    newDate.setDate(newDate.getDate() + diff);
    return newDate;
  };
  
  // Get the correct Monday of the current week
  const mondayOfWeek = getMondayOfWeek(currentDate);
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(mondayOfWeek);
    day.setDate(mondayOfWeek.getDate() + i);
    return day;
  });

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

  useEffect(() => {
      getCalendars();
  }, [currentDate, filterLocation, filterObject]);

  const getCalendars = async () => {
    if (!filterLocation) return;
  
     // Get the start and end date of the selected week (Monday to Sunday)
     const startOfWeek = new Date(currentDate);
     startOfWeek.setDate(currentDate.getDate() - (currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1)); // Move to Monday
   
     const endOfWeek = new Date(startOfWeek);
     endOfWeek.setDate(startOfWeek.getDate() + 6); // Move to Sunday
  
    // Convert to YYYY-MM-DD format
    const startDate = startOfWeek.toISOString().split("T")[0];
    const endDate = endOfWeek.toISOString().split("T")[0];
  
    const headers = {
      "x-userid": "xxx",
      "x-username": "xxx",
      "x-source": "xxx",
      "x-orgid": 2,
      "x-lang": "en",
      "Content-Type": "application/json"
    };
  
    const params = new URLSearchParams();
    if (filterObject) params.append("objectId", filterObject);
    if (filterLocation) params.append("locationId", filterLocation);
    params.append("startDate", startDate);
    params.append("endDate", endDate);
    params.append("day", '5');
    params.append("page", "all");
    console.log(`http://localhost:3001/api/v1/calendars?${params.toString()}`);
  
    const resp = await axios.get(`http://localhost:3001/api/v1/calendars?${params.toString()}`, {
      headers
    });
  
    let data = resp.data.data;
    data = data.map((el: any, index: number) => ({
      from: el.from_time.slice(0, 5), // Extract HH:mm
      to: el.to_time.slice(0, 5),
      no: index + 1,
      calendar_id: el.id,
      resource_type: el.schedule_category_id,
      allocation_type: el.allocation_type,
      location_id: el.location_id,
      master_object_id: el.master_object_id,
      appointment_no: index,
    }));
  
    setAvailable(data);
    getAppointments();
  };

  const getAppointments = async () => {
    if (!filterLocation) return;
  
    // Get the start and end date of the selected week (Monday to Sunday)
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - (currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1)); // Move to Monday
  
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Move to Sunday
  
    // Convert to ISO format (YYYY-MM-DD)
    const startDate = startOfWeek.toISOString().split("T")[0];
    const endDate = endOfWeek.toISOString().split("T")[0];
  
    const headers = {
      "x-userid": "xxx",
      "x-username": "xxx",
      "x-source": "xxx",
      "x-orgid": 2,
      "x-lang": "en",
      "Content-Type": "application/json"
    };
  
    const params = new URLSearchParams();
    if (filterObject) params.append("masterObjectId", filterObject);
    if (filterLocation) params.append("locationId", filterLocation);
    params.append("appointmentFromDate", startDate);
    params.append("appointmentToDate", endDate);
    params.append("page", "all");
  
    const resp = await axios.get(`http://localhost:3001/api/v1/appointments?${params.toString()}`, {
      headers
    });
  
    let data = resp.data.data;
    data = data.map(({ appointmentFromTime, appointmentToTime, note }: any) => ({
      from: appointmentFromTime.slice(0, 5),
      to: appointmentToTime.slice(0, 5),
      note
    }));
  
    setBookedData(data);
  };   

  function handleAddEventWeek(fromTime: string, toTime: string, slot: any, booked: any) {
    const [fromHours, fromMinutes] = fromTime.split(":").map(Number);
    const [toHours, toMinutes] = toTime.split(":").map(Number);
    const startDate = new Date(currentDate);
    startDate.setHours(fromHours, fromMinutes);
    const endDate = new Date(currentDate);
    endDate.setHours(toHours, toMinutes);
  
    showModal({
      title: CustomEventModal?.CustomAddEventModal?.title || "Add Appointment",
      body: (
        <AddEventModal
          CustomAddEventModal={CustomEventModal?.CustomAddEventModal?.CustomForm}
          fromTime={fromTime} 
          toTime={toTime} 
          slot={slot}
          booked={booked}
          startDate={startDate}
          endDate={endDate}
          refreshCalendar={getCalendars}
        />
      ),
      getter: async () => {
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
      <div key={currentDate.toDateString()} className="grid use-automation-zoom-in grid-cols-8 gap-0">
        <div className="sticky top-0 left-0 z-30 bg-default-100 rounded-tl-lg h-full border-0  flex items-center justify-center">
          <span className="text-lg font-semibold text-muted-foreground">
            Weekly
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
              <Chip color="success" variant="flat" className="absolute vertical-abs-center z-50 left-[-55px] text-xs uppercase">
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
            {Array.from({ length: 7 }, (_, dayIndex) => {
              // const availableDummyData = [
              //   { date: "2025-03-04", from: "09:00", to: "12:00" }, // March 4, 2025
              //   { date: "2025-03-05", from: "14:00", to: "16:00" }, // March 5, 2025
              //   { date: "2025-03-06", from: "10:00", to: "12:30" }, // March 6, 2025
              // ];
              
              // const bookedDummyData = [
              //   { date: "2025-03-04", from: "10:00", to: "11:00", note: "Doctor Slot" },
              //   { date: "2025-03-05", from: "14:30", to: "15:30", note: "IPD Slot" },
              //   { date: "2025-03-06", from: "09:00", to: "10:15", note: "Emergency Slot" },
              // ];
              return (
                <div key={`day-${dayIndex}`} className="relative col-span-1 border-r border-b border-default-200">
                  {Array.from({ length: 96 }, (_, slotIndex) => {
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
                    const currentDateStr = daysOfWeek[dayIndex % 7].toISOString().split("T")[0];
                    const booked = bookedData.find(({ date, from, to }) => date === currentDateStr && startTime >= from && startTime < to);
                    const isBooked = !!booked;
                    const availableSlot = availableData.find(({ date, from, to }) => date === currentDateStr && startTime >= from && startTime < to);
                    const isAvailable = !!availableSlot;

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
                          if (isClickable) handleAddEventWeek(startTime, endTime, availableSlot, booked);
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