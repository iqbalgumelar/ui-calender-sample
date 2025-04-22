import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useModalContext } from "@/providers/modal-provider"; 
import AddEventModal from "@/components/schedule/_modals/add-event-modal";
import { CustomEventModal, Event } from "@/types";
import { Button } from "@nextui-org/button";
import { Chip } from "@nextui-org/chip";
import { ArrowLeft, ArrowRight, PlusIcon } from "lucide-react";
import { time } from "console";
import axios from "axios";
import { useScheduler } from "@/providers/schedular-provider";
import { Input } from "@heroui/input";
import { ButtonGroup, Select, SelectItem } from "@heroui/react";

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

interface AppointmentEvent {
  from: string;
  to: string;
  note?: string;
}

export default function DailyView({
  prevButton,
  nextButton,
  CustomEventComponent,
  CustomEventModal,
  classNames,
  // filterLocation,
  filterObject,
  filterOrganization,
}: {
  prevButton?: React.ReactNode;
  nextButton?: React.ReactNode;
  CustomEventComponent?: React.FC<Event>;
  CustomEventModal?: CustomEventModal;
  classNames?: { prev?: string; next?: string; addEvent?: string };
  // filterLocation?: string;
  filterObject?: string;
  filterOrganization?: string;
}) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const hoursColumnRef = useRef<HTMLDivElement>(null);
  const [timeInterval, setTimeInterval] = useState(15); // Default: 15 minutes

  const [detailedHour, setDetailedHour] = useState<[] | null>(null);
  const [timelinePosition, setTimelinePosition] = useState<number>(0);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [availableData, setAvailable] = useState<any>([]);
  const [bookedData, setBookedData] = useState<any>([]);
  const { showModal } = useModalContext();
  const { handlers } = useScheduler();

  const handleNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);
    setCurrentDate(nextDay);
    getAppointments();
  };

  const detectOverlaps = (events: AppointmentEvent[]): AppointmentEvent[][] => {
    const sorted = [...events].sort((a, b) => a.from.localeCompare(b.from));
    const groups: AppointmentEvent[][] = [];
  
    for (const event of sorted) {
      let placed = false;
      for (const group of groups) {
        if (group.every((g) => event.from >= g.to || event.to <= g.from)) {
          group.push(event);
          placed = true;
          break;
        }
      }
      if (!placed) {
        groups.push([event]);
      }
    }
    console.log("groups", groups);  
    return groups;
  };

  const timeToPosition = (time: string): number => {
    const [h, m] = time.split(":").map(Number);
    return (h * 60 + m) * 1.5;
  };
  
  // ✅ Converts time duration to height in pixels
  const timeToHeight = (from: string, to: string): number => {
    const [fh, fm] = from.split(":").map(Number);
    const [th, tm] = to.split(":").map(Number);
    return ((th * 60 + tm) - (fh * 60 + fm)) * 2;
  };

  const renderOverlappingAppointments = (bookedData: AppointmentEvent[]) => {
    const positioned = detectOverlaps(bookedData).flatMap((group) =>
      group.map((event, index) => ({
        ...event,
        columnIndex: index,
        totalColumns: group.length > 1 ? 2 : 1,
      }))
    );
  
    return positioned.map((event, index) => {
      const top = slotToPixels(timeToSlotIndex(event.from));
      const height = slotToPixels(
        timeToSlotIndex(event.to) - timeToSlotIndex(event.from)
      );
      const widthPercent = 100 / event.totalColumns;
      const leftPercent = widthPercent * event.columnIndex;
  
      return (
        <div
          key={`event-${index}`}
          style={{
            position: "absolute",
            top: `${top}px`,
            height: `${height}px`,
            left: `${leftPercent}%`,
            width: `${widthPercent}%`,
            backgroundColor: "#e11d48",
            color: "white",
            padding: "4px",
            borderRadius: "6px",
            fontSize: "12px",
            zIndex: 10,
            boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.2)",
          }}
        >
          {event.note || "Booked"}
        </div>
      );
    });
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
  }, [currentDate, filterObject, filterOrganization]);

  const getCalendars = async () => {
    if (!currentDate || !filterObject) return;
  
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
    if (filterOrganization) params.append("organizationId", filterOrganization);
    // if (filterLocation) params.append("locationId", filterLocation);

    const month = ('0'+ (currentDate.getMonth()+1)).slice(-2)
    const date = ('0'+ (currentDate.getDate())).slice(-2)
    const selectedDate = `${currentDate.getFullYear()}-${month}-${date}`;
    const dateSelect = new Date(selectedDate);
    const dayNumber = (dateSelect.getDay() + 6) % 7 + 1;

    params.append("startDate", selectedDate);
    params.append("endDate", selectedDate);
    params.append("page", "all");
    params.append("day", dayNumber.toString());
  
    const resp = await axios.get(`${process.env.API_CALENDAR_URL}/api/v1/calendars?${params.toString()}`, {
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
      raw: el,
    }));
    setAvailable(data);
    if (data && data.length > 0) { setSelectedCalendar(data[0].calendar_id); }
    getAppointments();
  }

  const getAppointments = async () => {
    // if (!filterLocation) return;
  
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
    // if (filterLocation) params.append("locationId", filterLocation);
    // if (filterOrganization) params.append("hospitalId", filterOrganization);
    params.append("appointmentFromDate", (new Date(currentDate)).toISOString())
    params.append("appointmentToDate", (new Date(currentDate)).toISOString())
    params.append("page", "all");
  
    const resp = await axios.get(`${process.env.API_CALENDAR_URL}/api/v1/appointments?${params.toString()}`, {
      headers
    });
    let data = resp.data.data;

    data = data.map(({ appointmentFromTime, appointmentToTime, note, ...rest }: any) => ({
      id: rest.appointmentId,
      title: note,
      startDate: rest.appointmentDate,
      endDate: rest.appointmentDate,
      from: appointmentFromTime.slice(0, 5),
      to: appointmentToTime.slice(0, 5),
      note,
    }));
    setBookedData(data);
    handlers.handleInitialEvents(data);
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
      title: CustomEventModal?.CustomAddEventModal?.title || (slot ? "Add Appointment" : "Add All Day Appointment"),
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
          filterObject={filterObject}
        />
      ),
      getter: async () => {
        return { startDate, endDate };
      },
    });
  }
  

  const getFormattedDayTitle = () => currentDate.toDateString();

  // Generate time slots based on the selected interval
  const defaultTimeSlots = Array.from({ length: (24 * 60) / timeInterval }, (_, i) => {
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

  // Interval to Flexible
  const [selectedTimeStart, setSelectedTimeStart] = useState<any>();
  const [selectedTimeEnd, setSelectedTimeEnd] = useState<any>();
  const [selectedTimeAppointmentInput, setSelectedTimeAppointmentInput] = useState<any>();
  const [selectedPeriodDurationTime, setSelectedPeriodDurationTime] = useState<any>();
  const [timeSlots, setTimeSlots] = useState<any>(defaultTimeSlots);
  const [selectedCalendar, setSelectedCalendar] = useState<any>();
  const [walkinSlots, setWalkinSlots] = useState<number[]>([]);
  const [selectedCalendarDisplay, setSelectedCalendarDisplay] = useState<any>();

  useEffect(() => {
    if (!(selectedCalendar && availableData)) { return; }
    // resetTimelineSetting();
    const selected = availableData.find((x: any) => x.calendar_id === selectedCalendar)
    setTimelineSetting({
      startTime: selected.from,
      endTime: selected.to,
    })
    setSelectedCalendarDisplay(selected)
    setSelectedTimeAppointmentInput(selected.raw.quota.total || 0)
    const t = generateTimeIntervals(selected.from, selected.to, Number(selected.raw.quota.total));
    setTimeInterval(t.timeIntervalMinutes)
    setTimeSlots(t.timeIntervals)
    // setTimeSlots(t.timeIntervalsFullDay)

    // Walkin Setting
    const walkinQuota = selected.raw.quota.walk_in;
    const walkinQuotaSlotIndexList = [];
    // Determine Next 1 Hour Index
    const nextOneHourIndex: number = Number(findOneHourIndex(t.timeIntervals, t.timeIntervals[0]));
    // Determine how many hour from start to end
    const diffHourPeriod = getTimeDifference(selected.from, selected.to);
    const diffHourPeriodNumber = Number(diffHourPeriod.split(':')[0]);
    const manyHourFromPeriod = walkinQuota/diffHourPeriodNumber
    for (let f = 1; f <= diffHourPeriodNumber; f++) {
      let last = Math.floor((f * nextOneHourIndex) - manyHourFromPeriod);
      let point = f * nextOneHourIndex;
      for (let i = point; i > last; i--) {
        const p = i - 1
        walkinQuotaSlotIndexList.push(p)
      }
    }
    setWalkinSlots(walkinQuotaSlotIndexList);
  }, [selectedCalendar])

  const findOneHourIndex = (timeArray: any[], givenTime: any) => {
    const givenMinutes = givenTime.split(':').reduce((h: any, m: any) => +Number(h) * 60 + +Number(m));
    const oneHourLater = Number(givenMinutes) + 60;

    return timeArray.findIndex(time => {
        const minutes = time.split(':').reduce((h: any, m: any) => +Number(h) * 60 + +Number(m));
        return minutes >= oneHourLater;
    });
  }

  const setTimelineSetting = (data: any) => {
    setSelectedTimeStart(data.startTime);
    setSelectedTimeEnd(data.endTime);
    setSelectedPeriodDurationTime(getTimeDifference(data.startTime, data.endTime))
    // console.log('setTimelineSetting', data)
  }

  const resetTimelineSetting = () => {
    setTimelineSetting({startTime: null, endTime: null});
  }

  const getTimeDifference = (startTime: string, endTime: string) => {
    // Convert times to minutes
    const startMinutes = parseInt(startTime.split(":")[0]) * 60 + parseInt(startTime.split(":")[1]);
    const endMinutes = parseInt(endTime.split(":")[0]) * 60 + parseInt(endTime.split(":")[1]);
    // Calculate the difference in minutes
    const diffMinutes = endMinutes - startMinutes;
    // Handle negative differences (e.g., if endTime is earlier than startTime)
    if (diffMinutes < 0) {
        throw new Error("End time must be later than or equal to start time.");
    }
    // Convert the difference back to HH:MM format
    const diffHours = Math.floor(diffMinutes / 60);
    const diffMins = diffMinutes % 60;
    const diffString = `${String(diffHours).padStart(2, '0')}:${String(diffMins).padStart(2, '0')}`;
    return diffString;
}

const getRandomColor = (seed: number) => {
  const colors = [
    "#e11d48", "#3b82f6", "#10b981", "#f59e0b",
    "#6366f1", "#ec4899", "#14b8a6", "#f97316",
    "#8b5cf6", "#22c55e", "#0ea5e9", "#eab308",
  ];
  return colors[seed % colors.length];
};

const generateTimeIntervals = (startTime: string, endTime: string, numberOfIntervals: number) => {
  // Konversi waktu ke menit
  const startMinutes = parseInt(startTime.split(":")[0]) * 60 + parseInt(startTime.split(":")[1]);
  const endMinutes = parseInt(endTime.split(":")[0]) * 60 + parseInt(endTime.split(":")[1]);
  // Hitung total menit
  const totalMinutes = endMinutes - startMinutes;
  // Hitung interval dalam menit, dibulatkan ke atas
  const intervalMinutes = Math.ceil(totalMinutes / (numberOfIntervals - 0));
  // Hasilkan waktu untuk setiap interval
  const timeIntervals = [];
  for (let i = 0; i < numberOfIntervals; i++) {
      const currentMinutes = startMinutes + i * intervalMinutes;
      const hours = Math.floor(currentMinutes / 60) % 24; // Pastikan jam tetap dalam format 24 jam
      const minutes = currentMinutes % 60;
      const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      timeIntervals.push(timeString);
  }
  // Hasilkan waktu untuk setiap interval dari 00:00 hingga 24:00
  const timeIntervalsFullDay = [];
  const fullDayMinutes = 1440; // 24 jam * 60 menit
  // const fullDayIntervalMinutes = Math.ceil(fullDayMinutes / (numberOfIntervals - 1));
  for (let i = 0; i * intervalMinutes <= fullDayMinutes; i++) {
    const currentMinutes = i * intervalMinutes;
    // Jika melebihi 1440 menit, set ke 24:00
    if (currentMinutes >= fullDayMinutes) {
      // timeIntervalsFullDay.push("24:00");
      break;
    }
    const hours = Math.floor(currentMinutes / 60) % 24; // Pastikan jam tetap dalam format 24 jam
    const minutes = currentMinutes % 60;
    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    timeIntervalsFullDay.push(timeString);
  }

  return {
    timeIntervals,
    timeIntervalsFullDay,
    totalMinutes,
    timeIntervalMinutes: intervalMinutes,
  };
}

  const generateTimeSlotDefault = () => {
    return Array.from({ length: (24 * 60) / timeInterval }, (_, i) => {
      const hour = Math.floor((i * timeInterval) / 60);
      const minutes = (i * timeInterval) % 60;
      return `${hour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    });
  }



  const overlappingGroups = detectOverlaps(bookedData);

  const timeToSlotIndex = (time: string): number => {
    const [h, m] = time.split(":").map(Number);
    return Math.floor((h * 60 + m) / 15);
  };
  
  const slotToPixels = (slots: number) => slots * 30; 


  return (

    
    
    <div className="p-4">
      <h1 className="text-3xl font-semibold mb-4">
          {getFormattedDayTitle()}
        </h1>
      {/* Time Interval Selector */}
      {/* <div className="mb-4 flex items-center gap-3">
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
      </div> */}
      <div className="my-5 gap-2">
        <div className="mb-2">
          <Select className="max-w-xs" label="Calendar View" placeholder="Select calendar view"
            selectedKeys={[selectedCalendar]}
            value={selectedCalendar}
            onChange={(e) => setSelectedCalendar(e.target.value)}>
            {availableData.map((item: any) => (
              <SelectItem key={item.calendar_id} textValue={`Calendar ${item.from}-${item.to}`}>Calendar {item.from}-{item.to}</SelectItem>
            ))}
          </Select>
        </div>
        <div className="mb-2 flex items-center gap-2">
          <Input type="time" label="Start Time" disabled={true} value={selectedTimeStart} onChange={(e) => setSelectedTimeStart(e.target.value)} />
          <Input type="time" label="End Time" disabled={true} value={selectedTimeEnd} onChange={(e) => setSelectedTimeEnd(e.target.value)} />
          <Input label="Total Quota on Period"
            disabled={true}
            value={`${selectedTimeAppointmentInput || '-'} Quota / ${timeInterval || '-'} minutes per slot`} />
          {/* <ButtonGroup className="gap-2" isDisabled={!selectedCalendar}>
          <Button onClick={onClickSaveTimeSlot}>Save</Button>
          <Button onClick={onClickChangeTimeSlot}>Change</Button>
          <Button onClick={onClickResetTimeSlot}>Reset</Button>
          </ButtonGroup> */}
        </div>
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
          <Button
              className={classNames?.prev}
              startContent={<PlusIcon />}
              style={{ marginLeft: 'auto' }}
              disabled={!filterObject}
              onClick={() => handleAddEventDay('00:00', '23:59', null, null)}
            >
              Add All Day
            </Button>
        </div>

      {/* Time Slots Display */}
      
      <div className="flex">

      <div className="w-16 flex flex-col text-xs text-right pr-2 ">
      {Array.from({ length: 24 * 4 }, (_, i) => ( // 96 blocks of 15min
          <div key={i} className="h-[30px] text-gray-500">
            {i % 4 === 0 ? `${String(i / 4).padStart(2, '0')}:00` : ''}
          </div>
        ))}
      </div>

      <div className="relative flex-1 h-[2880px] bg-gray-100 border-l">
      {Array.from({ length: 24 * 4 }, (_, i) => {
    const minutes = i * 8;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const slotStart = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

    const isBooked = bookedData.some(
      (event: AppointmentEvent) => slotStart >= event.from && slotStart < event.to
    );

    return (
      <div
        key={i}
        className={`h-[30px] border-b border-gray-200 px-2 text-xs ${
          isBooked ? "bg-white-200" : "bg-white"
        }`}
      >
        {i % 7 === 0 ? slotStart : ""}
      </div>
    );
  })}

  {/* Booked events layer */}
  {detectOverlaps(bookedData).map((group, groupIndex, allGroups) => {
    const groupWidth = 100 / allGroups.length;
    const leftOffset = groupWidth * groupIndex;

    return group.map((event, eventIndex) => {
      const fromIndex = timeToSlotIndex(event.from);
      const toIndex = timeToSlotIndex(event.to);
      const top = fromIndex * 30;
      const height = (toIndex - fromIndex) * 30;

      return (
        <div
          key={`group-${groupIndex}-event-${eventIndex}`}
          style={{
            position: "absolute",
            top: `${top}px`,
            left: `${leftOffset}%`,
            width: `${groupWidth}%`,
            height: `${height}px`,
            backgroundColor: getRandomColor(eventIndex),
            color: "white",
            padding: "4px",
            border: "1px solid #e11d48",
            fontSize: "12px",
            zIndex: 10,
            boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.2)",
          }}
        >
          {event.note || "Booked"} - 
          {event.from} - {event.to}
        </div>
      );
    });
  })}
      </div>
        
       
      </div>

      {/* Time Slot Display: Waiting List */}
      {selectedCalendarDisplay && selectedCalendarDisplay.raw.is_allow_waiting_list
      ? <div className="my-3">
        <h3 className="text-2xl font-semibold mb-0">Waiting List</h3>
        <hr className="mb-3" />
        
        { !(selectedCalendarDisplay.raw.quota.waiting_list > 0) ?
        <div className="p-4 text-center text-gray-500">
          No available <b>Waiting List</b> time slots.
        </div>
        :
        <div className="relative rounded-md bg-default-50 hover:bg-default-100 transition duration-400 w-full">
        <motion.div className="relative rounded-xl flex flex-col w-full" ref={hoursColumnRef}>
          {availableData.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No available time slots.
            </div>
          ) : (
            Array(selectedCalendarDisplay.raw.quota.waiting_list || 0).fill(1).map((slot, index) => {
              let slotClass = "bg-gray-800 text-gray-400"; // Default
              let statusText = "";

              // if (isBooked) {
              //   slotClass = "bg-red-500 text-white font-bold rounded-md shadow-md";
              //   statusText = "⛔ Booked";
              // } else if (isAvailable) {
                slotClass = "bg-green-200 text-black font-bold rounded-md shadow-md";
                statusText = "✅ Available";
              // }

              return (
                <motion.div
                  key={`time-slot-${index}`}
                  onClick={() => {
                    // if (isAvailable && availableSlot) {
                    //   // Calculate the "to" value by adding the selected timeInterval
                    //   const [fromHours, fromMinutes] = timeSlots[index].split(":").map(Number);
                    //   const toDate = new Date();
                    //   toDate.setHours(fromHours);
                    //   toDate.setMinutes(fromMinutes + timeInterval); // Add timeInterval minutes

                    //   const toHours = String(toDate.getHours()).padStart(2, "0");
                    //   const toMinutes = String(toDate.getMinutes()).padStart(2, "0");
                    //   const toTime = `${toHours}:${toMinutes}`;

                    //   handleAddEventDay(timeSlots[index], toTime, availableSlot, booked);
                    // }
                  }}
                  className={`cursor-pointer px-6 py-3 h-[40px] flex items-center justify-between border-b border-default-200 w-full text-sm ${slotClass}`}
                >
                  <div className="flex flex-col" style={{position: 'relative'}}>
                    <span>{true ? `${selectedTimeStart}-${selectedTimeEnd}` : '' }</span>
                  </div>
                  {statusText && <span>{statusText}</span>}
                </motion.div>
              );
            })
          )}
        </motion.div>
        </div>
}

      </div>
      : ''}
    </div>
  );
}
