"use client";

import React, { useState } from "react";
import axios from "axios";
import { Button } from "@heroui/button";
import { Textarea, Input } from "@heroui/input";
import { RadioGroup, Radio } from "@heroui/radio";
import { useModalContext } from "@/providers/modal-provider";

const intervals = [15, 30, 60];
const days = [
  { name: "Senin", value: 1 },
  { name: "Selasa", value: 2 },
  { name: "Rabu", value: 3 },
  { name: "Kamis", value: 4 },
  { name: "Jumat", value: 5 },
  { name: "Sabtu", value: 6 },
  { name: "Minggu", value: 7 },
];

export default function AddScheduleForm({ selectedLocation, selectedObject, selectedSchedule = null, onRefresh }) {
  const { onClose } = useModalContext();
  const id = selectedSchedule?.id || null;
  const referenceId = selectedSchedule?.reference_id || null;
  const [calendarTitle, setCalendarTitle] = useState(selectedSchedule?.calendar_title || "");
  const [calendarDescription, setCalendarDescription] = useState(selectedSchedule?.calendar_description || "");
  const [startDate, setStartDate] = useState(selectedSchedule?.start_date?.split("T")[0] || "");
  const [interval, setInterval] = useState(15);
  const [endDate, setEndDate] = useState(selectedSchedule?.end_date?.split("T")[0] || "");
  const [startTime, setStartTime] = useState(selectedSchedule?.from_time?.slice(0, 5) || "00:00");
  const [endTime, setEndTime] = useState(selectedSchedule?.to_time?.slice(0, 5) || "00:00");
  const [selectedDay, setSelectedDay] = useState(selectedSchedule?.day || "");
  const [scheduleType, setScheduleType] = useState(selectedSchedule?.scheduleCategoryId?.[0] || "");
  const [total, setTotal] = useState(selectedSchedule?.quota?.total || 0);
  const [walkIn, setWalkIn] = useState(selectedSchedule?.quota?.walkIn || 0);
  const [waitingList, setWaitingList] = useState(selectedSchedule?.quota?.waitingList ||0);
  const [errors, setErrors] = useState({});

  // Generate time slots based on selected interval
  const generateTimeSlots = (interval) => {
    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += interval) {
        times.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      }
    }
    return times;
  };
  const timeOptions = generateTimeSlots(interval);

  // Validation function
  const validateForm = () => {
    let newErrors = {};

    if (!calendarTitle) newErrors.calendarTitle = "Calendar Title is required";
    if (!calendarDescription) newErrors.calendarDescription = "Description is required";
    if (!startDate) newErrors.startDate = "Start Date is required";
    if (!endDate) newErrors.endDate = "End Date is required";
    if (startDate && endDate && startDate > endDate) newErrors.dateRange = "Start Date cannot be after End Date";
    if (!selectedDay) newErrors.selectedDay = "You must select a day";
    if (!scheduleType) newErrors.scheduleType = "You must select a type";
    if (startTime >= endTime) newErrors.timeRange = "Start Time must be before End Time";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      seriesId: selectedSchedule?.seriesId || null,
      calendarTitle,
      calendarDescription,
      startDate,
      endDate,
      fromTime: startTime,
      toTime: endTime,
      day: selectedDay,
      allocationType: "3",
      isAllDay: false,
      scheduleCategoryId: [scheduleType],
      quotaOptions: { regular: total, walkIn, waitingList },
      quota: { waitingList, walkIn, total },
      repetitionType: "2",
      repetitionInterval: 1,
      repetitionDom: null,
      repetitionWeek: null,
      repetitionMonth: null,
      isAllowWaitingList: true,
      locationId: selectedLocation,
      masterObjectId: selectedObject,
      bookingOptions: null,
      isAllowDigitalChannel: false,
    };

    try {
      const updatePayload = {id: id, referenceId: referenceId, ...payload}
      if (selectedSchedule) {
        await axios.post(`${process.env.API_CALENDAR_URL}/api/v1/calendars/bulk`, [updatePayload], {
          headers: {
            "x-userid": "test1",
            "x-username": "test2",
            "x-source": "test3",
            "x-orgid": "2",
            "x-lang": "en",
            "Content-Type": "application/json",
          },
        });
      } else {
        await axios.post("https://uat-mysiloam-api-01.siloamhospitals.com/next-appointment/api/v1/calendars", payload, {
          headers: {
            "x-userid": "test1",
            "x-username": "test2",
            "x-source": "test3",
            "x-orgid": "2",
            "x-lang": "en",
            "Content-Type": "application/json",
          },
        });
      }
      onRefresh();
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Input label="Calendar Title" value={calendarTitle} onChange={(e) => setCalendarTitle(e.target.value)} />
      <Textarea label="Calendar Description" value={calendarDescription} onChange={(e) => setCalendarDescription(e.target.value)} />
      
      <div className="flex gap-4">
        <Input type="date" label="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} error={errors.startDate} />
        <Input type="date" label="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} error={errors.endDate || errors.dateRange} />
      </div>

      <div className="flex items-center gap-4">
        <div className="shrink-0">
          <label className="block text-sm font-medium">Interval</label>
          <select value={interval} onChange={(e) => setInterval(Number(e.target.value))} className="border p-2 rounded-md px-4">
            {intervals.map((value) => (
              <option key={value} value={value}>{value} minutes</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium">Start Time</label>
          <select value={startTime} onChange={(e) => setStartTime(e.target.value)} className="border p-2 rounded-md w-full">
            {timeOptions.map((time) => <option key={time} value={time}>{time}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium">End Time</label>
          <select value={endTime} onChange={(e) => setEndTime(e.target.value)} className="border p-2 rounded-md w-full">
            {timeOptions.map((time) => <option key={time} value={time}>{time}</option>)}
          </select>
          {errors.timeRange && <p className="text-red-500 text-sm">{errors.timeRange}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Select Day</label>
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(Number(e.target.value))}
          className="border p-2 rounded-md w-full"
        >
          <option value="">Select a day</option> {/* Placeholder option */}
          {days.map(({ name, value }) => (
            <option key={value} value={value}>
              {name}
            </option>
          ))}
        </select>
        {errors.selectedDay && <p className="text-red-500 text-sm">{errors.selectedDay}</p>}
      </div>


      <RadioGroup label="Type">
        <div className="flex gap-4">
          <Radio value="1" checked={scheduleType === "1"} onChange={() => setScheduleType("1")}>Regular</Radio>
          <Radio value="2" checked={scheduleType === "2"} onChange={() => setScheduleType("2")}>BPJS</Radio>
        </div>
        {errors.scheduleType && <p className="text-red-500 text-sm">{errors.scheduleType}</p>}
      </RadioGroup>

      <div className="flex gap-4">
        <Input type="number" label="Total" value={total} onChange={(e) => setTotal(Number(e.target.value))} />
        <Input type="number" label="Walk-in" value={walkIn} onChange={(e) => setWalkIn(Number(e.target.value))} />
        <Input type="number" label="Waiting List" value={waitingList} onChange={(e) => setWaitingList(Number(e.target.value))} />
      </div>

      <div className="flex justify-end gap-2">
        <Button onClick={onClose} variant="light">Cancel</Button>
        <Button color="primary" onClick={handleSubmit}>{selectedSchedule !== null ? "Update" : "Submit"}</Button>
      </div>
    </div>
  );
}
