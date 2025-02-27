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

export default function AddScheduleModal({
  CustomAddEventModal,
}: {
  CustomAddEventModal?: React.FC<{ register: any; errors: any }>;
}) {
  const { onClose, data } = useModalContext();
  const { handlers } = useScheduler();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMasterObject, setSelectedMasterObject] = useState<string>("");
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
      title: "",
      description: "",
      startDate: null,
      endDate: null,
      variant: data?.variant || "primary",
      color: data?.color || "blue",
      schedule: "",
      masterObjectId: "",
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        title: data.title,
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
    if (!selectedDate || !selectedMasterObject) return;
    const fetchSchedules = async () => {
      const response = {
        data: [
          { no: 1, appointment_range_time: "16:30 - 16:45", schedule_from_time: "16:30", schedule_to_time: "16:45", is_available: true },
          { no: 2, appointment_range_time: "16:45 - 17:00", schedule_from_time: "16:45", schedule_to_time: "17:00", is_available: true },
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

  const onSubmit: SubmitHandler<EventFormData> = (formData) => {
    const selectedSlot = scheduleOptions.find((s) => s.key === selectedSchedule);
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
      <Input {...register("title")} label="Event Name" placeholder="Enter event name" variant="bordered" isInvalid={!!errors.title} errorMessage={errors.title?.message} />
      <Textarea {...register("description")} label="Description" placeholder="Enter event description" variant="bordered" />
      <Input type="date" label="Select Date" variant="bordered" onChange={(e) => {
        const date = new Date(e.target.value);
        setSelectedDate(date);
        setValue("startDate", date);
      }} />
      {selectedDate && (
        <Dropdown backdrop="blur">
          <DropdownTrigger>
            <Button variant="flat" className="justify-between w-fit my-4">
              {masterObjects.find((obj) => obj.key === selectedMasterObject)?.name || "Select Master Object"}
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Master Object selection" variant="flat" selectionMode="single" selectedKeys={[selectedMasterObject]} onSelectionChange={(keys) => {
            const selectedKey = keys.currentKey as string;
            setSelectedMasterObject(selectedKey);
            setValue("masterObjectId", selectedKey);
          }}>
            {masterObjects.map((obj) => <DropdownItem key={obj.key}>{obj.name}</DropdownItem>)}
          </DropdownMenu>
        </Dropdown>
      )}
      <ModalFooter>
        <Button color="danger" variant="light" onPress={onClose}>Cancel</Button>
        <Button color="primary" type="submit">Save Event</Button>
      </ModalFooter>
    </form>
  );
}
