import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useModalContext } from "@/providers/modal-provider"; 
import AddEventModal from "@/components/schedule/_modals/add-event-modal";
import { CustomEventModal, Event } from "@/types";
import { Button } from "@nextui-org/button";
import { Chip } from "@nextui-org/chip";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { time } from "console";
import axios from "axios";

const timeIntervals = [15, 30, 60]; // Available time slots

// API response with booked slots
const bookedData = {
  data: [
    {
      appointmentFromTime: "09:15:00",
      appointmentToTime: "09:30:00",
      appointmentId:  "1"
    },
  ],
};

export default function DailyView({
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
  const [selectedSlot, setSelectedSlot] = useState(null);
  const hoursColumnRef = useRef<HTMLDivElement>(null);
  const [timeInterval, setTimeInterval] = useState(15); // Default: 15 minutes

  const [detailedHour, setDetailedHour] = useState<array | null>(null);
  const [timelinePosition, setTimelinePosition] = useState<number>(0);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [availableData, setAvailable] = useState<any>([]);
  const [bookedData, setBookedData] = useState<any>([]);
  const { showModal } = useModalContext();

  const handleNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);
    setCurrentDate(nextDay);
    getAppointments();
  };

  const handlePrevDay = () => {
    const prevDay = new Date(currentDate);
    prevDay.setDate(currentDate.getDate() - 1);
    setCurrentDate(prevDay);
    getAppointments();
  };

  const calculateEndTime = (startTime: any, duration: any) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const endDate = new Date();
    endDate.setHours(hours);
    endDate.setMinutes(minutes + duration);
  
    const endHours = String(endDate.getHours()).padStart(2, "0");
    const endMinutes = String(endDate.getMinutes()).padStart(2, "0");
  
    return `${endHours}:${endMinutes}`;
  };

  

  useEffect(() => {
    getCalendars();
  }, [currentDate, filterLocation, filterObject]);

  const getCalendars = async () => {
    if (!currentDate || !filterLocation || !filterObject) return;
  
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
    
    const month = ('0'+ (currentDate.getMonth()+1)).slice(-2)
    const date = ('0'+ (currentDate.getDate())).slice(-2)
    const selectedDate = `${currentDate.getFullYear()}-${month}-${date}`;
    params.append("startDate", selectedDate);
    params.append("endDate", selectedDate);
    params.append("page", "all");
  
    const resp = await axios.get(`http://localhost:3001/api/v1/calendars?${params.toString()}`, {
      headers
    });
    let data = resp.data.data;

     // Convert API time to comparable format (HH:mm)
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
  }

  const getAppointments = async () => {
    if (!filterLocation) return;
  
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
    params.append("appointmentFromDate", (new Date(currentDate)).toISOString())
    params.append("appointmentToDate", (new Date(currentDate)).toISOString())
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
    setBookedData(data)
  }

  function handleAddEventDay(fromTime: string, toTime: string, slot: any, booked: any) {
    console.log("Adding event:", fromTime, "to", toTime, 'slot', slot);
  
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
  

  const getFormattedDayTitle = () => currentDate.toDateString();

  // Generate time slots based on the selected interval
  const timeSlots = Array.from({ length: (24 * 60) / timeInterval }, (_, i) => {
    const hour = Math.floor((i * timeInterval) / 60);
    const minutes = (i * timeInterval) % 60;
    return `${hour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  });

  function handleAddEvent(event?: Event) {
    showModal({
      title: CustomEventModal?.CustomAddEventModal?.title || "Add Appointment",
      body: (
        <AddEventModal
          CustomAddEventModal={
            CustomEventModal?.CustomAddEventModal?.CustomForm
          }
          
        />
      ),
      
      getter: async () => {
        const startDate = event?.startDate || new Date();
        const endDate = event?.endDate || new Date();
        return { startDate, endDate };
      },
    });
  }

  return (
    
    <div className="p-4">
      <h1 className="text-3xl font-semibold mb-4">
          {getFormattedDayTitle()}
        </h1>
      {/* Time Interval Selector */}
      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-semibold">Time Interval:</label>
        <select
          value={timeInterval}
          onChange={(e) => setTimeInterval(Number(e.target.value))}
          className="border p-2 rounded-md"
        >
          {timeIntervals.map((interval) => (
            <option key={interval} value={interval}>
              {interval} minutes
            </option>
          ))}
        </select>
      </div>
      <div className="flex ml-auto  gap-3 mb-2">
          {prevButton ? (
            <div onClick={handlePrevDay}>{prevButton}</div>
          ) : (
            <Button
              className={classNames?.prev}
              startContent={<ArrowLeft />}
              onClick={handlePrevDay}
            >
              Prev
            </Button>
          )}
          {nextButton ? (
            <div onClick={handleNextDay}>{nextButton}</div>
          ) : (
            <Button
              className={classNames?.next}
              onClick={handleNextDay}
              endContent={<ArrowRight />}
            >
              Next
            </Button>
          )}
        </div>

      {/* Time Slots Display */}
      <div className="relative rounded-md bg-default-50 hover:bg-default-100 transition duration-400 w-full">
        <motion.div className="relative rounded-xl flex flex-col w-full" ref={hoursColumnRef}>
          {availableData.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No available time slots.
            </div>
          ) : (
            timeSlots.map((slot, index) => {
              const availableSlot = availableData.find(({ from, to }: any) => slot >= from && slot < to);
              const booked = bookedData.find(({ from, to }: any) => slot >= from && slot < to);
              const isBooked = !!booked;
              const isAvailable = !!availableSlot;

              let slotClass = "bg-gray-800 text-gray-400"; // Default
              let statusText = "";

              if (isBooked) {
                slotClass = "bg-red-500 text-white font-bold rounded-md shadow-md";
                statusText = "⛔ Booked";
              } else if (isAvailable) {
                slotClass = "bg-green-200 text-black font-bold rounded-md shadow-md";
                statusText = "✅ Available";
              }

              return (
                <motion.div
                  key={`time-slot-${index}`}
                  onClick={() => {
                    if (isAvailable && availableSlot) {
                      // Calculate the "to" value by adding the selected timeInterval
                      const [fromHours, fromMinutes] = timeSlots[index].split(":").map(Number);
                      const toDate = new Date();
                      toDate.setHours(fromHours);
                      toDate.setMinutes(fromMinutes + timeInterval); // Add timeInterval minutes

                      const toHours = String(toDate.getHours()).padStart(2, "0");
                      const toMinutes = String(toDate.getMinutes()).padStart(2, "0");
                      const toTime = `${toHours}:${toMinutes}`;

                      handleAddEventDay(timeSlots[index], toTime, availableSlot, booked);
                    }
                  }}
                  className={`cursor-pointer px-6 py-3 h-[40px] flex items-center justify-between border-b border-default-200 w-full text-sm ${slotClass}`}
                >
                  <span>{timeSlots[index]} - {calculateEndTime(timeSlots[index], timeInterval)} {booked && booked.note ? ` | ${booked.note}` : '' }</span>
                  {statusText && <span>{statusText}</span>}
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>
    </div>
  );
}
