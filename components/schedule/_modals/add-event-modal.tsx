"use client";

import React, { useEffect, useState } from "react";
import { ModalFooter } from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { Input, Textarea } from "@nextui-org/input";

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/dropdown";

import { useModalContext } from "@/providers/modal-provider";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EventFormData, eventSchema, Variant, Event } from "@/types/index";
import { useScheduler } from "@/providers/schedular-provider";
import { v4 as uuidv4 } from "uuid";
import { BsSkipStart } from "react-icons/bs";

export default function AddEventModal({
  CustomAddEventModal, fromTime, // Accept props
  toTime, slot, booked, startDate, endDate, refreshCalendar
}: {
  CustomAddEventModal?: React.FC<{ register: any; errors: any }>;
  fromTime?: string;
  toTime?: string;
  slot?: any;
  booked?: any;
  startDate?: Date;
  endDate?: Date;
  refreshCalendar?: any;
}) {
  const { onClose, data } = useModalContext();
  const { handlers } = useScheduler();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMasterObject, setSelectedMasterObject] = useState<string>("");
  const [description, setDecription] = useState<string>("");
  const [masterObjects, setMasterObjects] = useState<{ key: string; name: string }[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<string>("");
  const [scheduleOptions, setScheduleOptions] = useState<
    { key: string; name: string; startTime: string; endTime: string }[]
  >([]);

  const typedData = data as Event;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      description: "",
      startDate: new Date(),
      endDate: new Date(),
      variant: data?.variant || "primary",
      color: data?.color || "blue",
      schedule: "",
      masterObjectId: "",
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        description: data.description || "",
        startDate: data.startDate,
        endDate: data.endDate,
        variant: data.variant || "primary",
        color: data.color || "blue",
        schedule: data.schedule || "",
        masterObjectId: data.masterObjectId || "",
      });
    }
  }, [data, reset]);

  useEffect(() => {
    if (!selectedDate) return;
    const fetchMasterObjects = async () => {
      const response = {
        data: [
          { id: "fd6f4d17-5c97-48a4-9ff6-5262674131f5", title: "Master Object 1" },
          { id: "b2345d67-8e97-42b4-81cd-6123456789ab", title: "Master Object 2" },
        ],
      };
      const objects = response.data.map((obj) => ({ key: obj.id, name: obj.title }));
      setMasterObjects(objects);
    };
    fetchMasterObjects();
  }, [selectedDate]);

  useEffect(() => {
    const fetchSchedules = async () => {
      const response = {
        data: [
          { no: 1, appointment_range_time: "00:00 - 01:00", schedule_from_time: "00:00", schedule_to_time: "01:00", is_available: true },
          { no: 2, appointment_range_time: "01:00 - 02:00", schedule_from_time: "01:00", schedule_to_time: "02:00", is_available: true },
        ],
      };
      const availableSchedules = response.data
        .filter((slot) => slot.is_available)
        .map((slot) => ({
          key: String(slot.no),
          name: slot.appointment_range_time,
          startTime: slot.schedule_from_time,
          endTime: slot.schedule_to_time,
        }));
      setScheduleOptions(availableSchedules);
    };
    fetchSchedules();
  }, [selectedDate, selectedMasterObject]);

  useEffect(() => {
    if (booked) {
      setDecription(booked.note)
    }
    if (startDate) {
      console.log("🚀 ~ startDate:", startDate);
      const timeZoneOffset = startDate.getTimezoneOffset() * 60000; // Convert offset to milliseconds
      const adjustedDate = new Date(startDate.getTime() - timeZoneOffset);
      setSelectedDate(adjustedDate);
      setValue("startDate", adjustedDate);
    }
  }, [startDate, booked, setValue]);

  const onSubmit: SubmitHandler<EventFormData> = async (formData) => {
    console.log("🚀 ~ formData:", formData);
    const selectedSlot = scheduleOptions.find(
      (s) => s.key === selectedSchedule
    );

    const payload = {
      appointmentHopeId: uuidv4(),
      appointmentNo: slot.appointment_no,
      appointmentDate: formData.startDate,
      appointmentStatusId: uuidv4(),
      channelId: "123e4567-e89b-12d3-a456-426614174000",
      calendarId: slot.calendar_id,
      hospitalId: "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
      contactId: uuidv4(),
      masterObjectId: slot.master_object_id,
      note: formData.description,
      isWaitingList: false,
      appointmentFromTime: fromTime,
      appointmentToTime: toTime,
      isWalkin: true,
      isLogged: false,
      createByService: uuidv4(),
    };

    try {
      const response = await fetch(
        `${process.env.API_CALENDAR_URL}/api/v1/appointments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-userid": "test",
            "x-username": "test",
            "x-source": "test",
            "x-orgid": "2",
          },
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json();
      console.log(result, " <<<< result");
      refreshCalendar();
    } catch (error) {
      console.log(error, " <<<< error");
    }

    const newEvent: Event = {
      id: uuidv4(),
      title: formData.title,
      startDate: selectedSlot ? new Date(`${formData.startDate} ${selectedSlot.startTime}`) : formData.startDate,
      endDate: selectedSlot ? new Date(`${formData.startDate} ${selectedSlot.endTime}`) : formData.endDate,
      variant: formData.variant,
      description: formData.description,
      schedule: selectedSchedule,
      masterObjectId: formData.masterObjectId,
    };
    if (!typedData?.id) handlers.handleAddEvent(newEvent);
    else handlers.handleUpdateEvent(newEvent, typedData.id);
    onClose();
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
      {/* <Input {...register("title")}  label="MR patient" placeholder="Enter mr patient" variant="bordered" isInvalid={!!errors.title} errorMessage={errors.title?.message} /> */}
      <Textarea {...register("description")} value={description} onChange={(e) => setDecription(e.target.value)} label="Description" placeholder="Enter event description" variant="bordered" />
      <Input
        type="date"
        label="Select Date"
        variant="bordered"
        value={selectedDate ? selectedDate.toISOString().split("T")[0] : ""}
        onChange={(e) => {
          const date = new Date(e.target.value);
          setSelectedDate(date);
          setValue("startDate", date);
        }}
      />
      {fromTime && toTime && (
        <p className="text-lg font-semibold text-blue-600">
          📅 Selected Time: {fromTime} - {toTime}
        </p>
      )}

      <ModalFooter>
        <Button color="danger" variant="light" onPress={onClose}>Cancel</Button>
        <Button color="primary" type="submit">Save Event</Button>
      </ModalFooter>
    </form>
  );
}
