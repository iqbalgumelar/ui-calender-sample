"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { ModalFooter } from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { Input, Textarea } from "@nextui-org/input";
import { format } from "date-fns";
import moment from "moment";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/dropdown";

import { useModalContext } from "@/providers/modal-provider";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  EventFormData,
  eventSchema,
  Variant,
  Event,
  EventFormDataPatient,
  eventSchemaPatient,
} from "@/types/index";
import { useScheduler } from "@/providers/schedular-provider";
import { v4 as uuidv4 } from "uuid";
import { SearchIcon } from "lucide-react";

interface ISlotContent {
  contact_name: string | null;
  contact_birthdate: string | null;
  contact_phone: string | null;
  doctor_name: string | null;
  payer_name?: string | null;
  payer_number?: string | null;
  email_address: string | null;
  notes: string | null;
  visit_number: string | null;
  appointment_code: string | null;
}

export default function AddEventModal({
  CustomAddEventModal,
  fromTime,
  toTime,
  slot,
  booked,
  startDate,
  endDate,
  refreshCalendar,
  filterObject,
}: {
  CustomAddEventModal?: React.FC<{ register: any; errors: any }>;
  fromTime?: string;
  toTime?: string;
  slot?: any;
  booked?: any;
  startDate?: Date;
  endDate?: Date;
  refreshCalendar?: any;
  filterObject?: string;
}) {
  const { onClose, data } = useModalContext();
  const { handlers } = useScheduler();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedBirthDate, setSelectedBirthDate] = useState<Date | null>(null);
  const [selectedPatient, setIsSelectedPatient] = useState<any>(null);
  const [patientList, setPatientList] = useState([]);
  const [isSearchPatient, setIsSearchPatient] = useState(false);
  const [selectedMasterObject, setSelectedMasterObject] = useState<string>("");
  const [description, setDecription] = useState<string>("");
  const [masterObjects, setMasterObjects] = useState<{ key: string; name: string }[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<string>("");
  const [scheduleOptions, setScheduleOptions] = useState<
    { key: string; name: string; startTime: string; endTime: string }[]
  >([]);
  const [appointmentContent, setAppointmentContent] = useState<ISlotContent>();

  const [isAllDay, setIsAllDay] = useState(false);

  const [selectedQuotaSlotIndex, setSelectedQuotaSlotIndex] = useState<number | null>(null);
  
  const [selectedScheduleData, setSelectedScheduleData] = useState<{
    key: string;
    name: string;
    startTime: string;
    endTime: string;
    calendarTitle: string;
    totalQuota: number;
  }[]>([]);;
  const [note, setNote] = useState(booked.note || '');

  const pickedSlot = selectedQuotaSlotIndex !== null ? selectedScheduleData[selectedQuotaSlotIndex] : null;

  if (pickedSlot) {
    console.log("Selected quota time range:", pickedSlot.startTime, pickedSlot.endTime);
  }

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

  const {
    register: registerPatient,
    handleSubmit: handleSubmitPatient,
    reset: resetPatient,
    formState: { errors: errorsPatient },
    setValue: setValuePatient,
  } = useForm<EventFormDataPatient>({
    resolver: zodResolver(eventSchemaPatient),
    defaultValues: {
      patientName: "",
      birthDate: new Date() || "",
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
          {
            id: "3e3ae00a-a09d-4470-8222-36674f89f4aa",
            master_object_id: "00ede1b5-059c-4c25-94d7-df23b25038bb",
            calendar_title: "drg. Jacinta Pipin Puntosari, SpKGA",
            calendar_description: "OPD Doctor drg. Jacinta Pipin Puntosari, SpKGA",
            start_date: "2025-04-15T02:32:22.647Z",
            end_date: null,
            from_time: "15:30:00",
            to_time: "18:00:00",
            day: 2,
            location_id: "00000000-0000-0000-0000-000000000000",
            allocation_type: "3",
            quota: {
              total: 19,
              walk_in: 2,
              waiting_list: 0,
            },
            is_allow_waiting_list: false,
            is_allow_digital_channel: false,
            is_all_day: false,
            group_id: null,
            reference_id: "ec747ec2-e5d0-408c-ac13-4664a5bc01f7",
            status_id: "active",
            series_id: null,
            schedule_category_id: ["1"],
            quota_options: {
              bpjs: 0,
              regular: 17,
              walk_in: 2,
              tele_consult: 0,
              waiting_list: 0,
            },
            repetition_type: "2",
            repetition_interval: 1,
            repetition_dom: null,
            repetition_week: null,
            repetition_month: null,
            booking_options: [],
            is_lock: true,
            created_by: "2293547c-a12e-41d9-bdac-a9dafae4b533",
            created_name: "Vincent.coa",
            created_from: "Trigger-DB",
            created_date: "2025-04-14T02:32:32.814Z",
            modified_by: "2293547c-a12e-41d9-bdac-a9dafae4b533",
            modified_name: "Vincent.coa",
            modified_from: "Trigger-DB",
            modified_date: "2025-04-14T02:32:32.814Z",
            deleted_date: null,
          },
          {
            id: "bf43db52-15ef-45c4-80d3-8340b48cf714",
            master_object_id: "00ede1b5-059c-4c25-94d7-df23b25038bb",
            calendar_title: "drg. Jacinta Pipin Puntosari, SpKGA",
            calendar_description: "OPD Doctor drg. Jacinta Pipin Puntosari, SpKGA",
            start_date: "2025-04-15T02:32:22.648Z",
            end_date: null,
            from_time: "07:00:00",
            to_time: "10:00:00",
            day: 2,
            location_id: "00000000-0000-0000-0000-000000000000",
            allocation_type: "3",
            quota: {
              total: 6,
              walk_in: 0,
              waiting_list: 0,
            },
            is_allow_waiting_list: false,
            is_allow_digital_channel: false,
            is_all_day: false,
            group_id: null,
            reference_id: "6418fe44-18e9-4cde-9764-393cb912fe90",
            status_id: "active",
            series_id: null,
            schedule_category_id: ["1", "4"],
            quota_options: {
              bpjs: 0,
              regular: 0,
              walk_in: 0,
              tele_consult: 6,
              waiting_list: 0,
            },
            repetition_type: "2",
            repetition_interval: 1,
            repetition_dom: null,
            repetition_week: null,
            repetition_month: null,
            booking_options: [],
            is_lock: true,
            created_by: "2293547c-a12e-41d9-bdac-a9dafae4b533",
            created_name: "Vincent.coa",
            created_from: "Trigger-DB",
            created_date: "2025-04-14T02:32:32.814Z",
            modified_by: "2293547c-a12e-41d9-bdac-a9dafae4b533",
            modified_name: "Vincent.coa",
            modified_from: "Trigger-DB",
            modified_date: "2025-04-14T02:32:32.814Z",
            deleted_date: null,
          },
        ],
        code: "OK",
        message: "Get Calendar successfully",
        meta: {
          total_page: 1,
          current_page: 1,
          page_size: 10,
          total_records: 2,
        },
      };
      const availableSchedules = response.data
      .filter((slot) => slot.quota?.total > 0) // Filter if slot has quota
      .map((slot, index) => ({
        key: slot.id,
        name: `${slot.from_time} - ${slot.to_time}`,
        startTime: slot.from_time,
        endTime: slot.to_time,
        calendarTitle: slot.calendar_title,
        totalQuota: slot.quota.total,
      }));

      const availableSchedules2 = response.data
        .filter((slot) => slot.quota?.total > 0)
        .flatMap((slot) => {
          const start = moment(slot.from_time, "HH:mm:ss");
          const end = moment(slot.to_time, "HH:mm:ss");
          const totalMinutes = end.diff(start, "minutes");
          const chunkMinutes = totalMinutes / slot.quota.total;

          const slotChunks = Array.from({ length: slot.quota.total }, (_, i) => {
            const chunkStart = moment(start).add(i * chunkMinutes, "minutes");
            const chunkEnd = moment(start).add((i + 1) * chunkMinutes, "minutes");

            return {
              key: `${slot.id}-${i}`,
              originalId: slot.id,
              calendarTitle: slot.calendar_title,
              startTime: chunkStart.format("HH:mm"),
              endTime: chunkEnd.format("HH:mm"),
              quotaIndex: i + 1,
            };
          });

          return slotChunks;
        });

      setScheduleOptions(availableSchedules);
      setSelectedScheduleData(availableSchedules2);
      
      console.log("why",availableSchedules2);
    };
    fetchSchedules();
  }, [selectedDate, selectedMasterObject]);

  useEffect(() => {
    if (booked) {
      setDecription(booked.note);
    }
    if (startDate) {
      const timeZoneOffset = startDate.getTimezoneOffset() * 60000;
      const adjustedDate = new Date(startDate.getTime() - timeZoneOffset);
      setSelectedDate(adjustedDate);
      setValue("startDate", adjustedDate);
    }
  }, [startDate, booked, setValue]);

  useEffect(() => {
    if (!booked) return;
    console.log("booked", booked);
    setAppointmentContent(booked.appointmentContent);
  }, [slot]);

  const onSubmit: SubmitHandler<EventFormData> = async (formData) => {
    
    console.log("pickedSlot", pickedSlot);
    const selectedOrg = Cookies.get("selectedHospital");
    const selectedSlot = scheduleOptions.find((s) => s.key === selectedSchedule);

    const payload = {
      appointmentHopeId: uuidv4(),
      appointmentNo: slot ? slot.appointment_no : 0,
      appointmentDate: formData.startDate,
      appointmentStatusId: uuidv4(),
      channelId: "123e4567-e89b-12d3-a456-426614174000",
      calendarId: slot ? slot.calendar_id : "00000000-0000-0000-0000-000000000000",
      hospitalId: selectedOrg,
      contactId: selectedPatient?.contactId || "00000000-0000-0000-0000-000000000000",
      masterObjectId: slot ? slot.master_object_id : filterObject,
      note: formData.description,
      isWaitingList: false,
      appointmentFromTime: pickedSlot ? pickedSlot.startTime : "00:00",
      appointmentToTime: pickedSlot ? pickedSlot.endTime : "23:59",
      isWalkin: true,
      isLogged: false,
      type: slot ? "s" : "d",
      createByService: uuidv4(),
      appointmentContent: {
        contact_name: selectedPatient?.name || "",
        contact_birthdate: selectedPatient?.birthDate || "",
        contact_phone: selectedPatient?.mobileNo1 || selectedPatient?.mobileNo2 || "",
        doctor_name: slot?.calendar_title || "", 
      },
    };

    console.log("Payload:", payload);

    try {
      const response = await fetch(`${process.env.API_CALENDAR_URL}/api/v1/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-userid": "test",
          "x-username": "test",
          "x-source": "test",
          "x-orgid": "2",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      refreshCalendar();
    } catch (error) {
      console.error(error);
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

  const onSubmitPatient: SubmitHandler<EventFormDataPatient> = async (formData) => {
    setIsSearchPatient(false);
    setIsSelectedPatient(null);
    const selectedOrg = Cookies.get("selectedHospital");

    const payload = {
      patientName: formData.patientName,
      birthDate: format(formData.birthDate, "yyyy-MM-dd"),
      hospitalId: selectedOrg,
    };

    try {
      const response = await fetch(
        `https://mysiloam-api-02.siloamhospitals.com/callcenter/api/v2/patients/hope/group?patientName=${payload.patientName}&birthDate=${payload.birthDate}&hospitalId=${selectedOrg}`,
        {
          method: "GET",
        }
      );
      const result = await response.json();
      setPatientList(result.data.slice(0, 5));
      setIsSearchPatient(true);
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmitUpdate: SubmitHandler<EventFormData> = async (formData) => {
    const payload = {
      appointmentHopeId: booked.appointmentId,
      appointmentNo: booked.appointmentNo,
      appointmentDate: booked.appointmentDate,
      appointmentStatusId: booked.appointmentStatusId,
      channelId: booked.channelId,
      calendarId: booked.calendarId,
      hospitalId: booked.hospitalId,
      contactId: booked.contactId,
      masterObjectId: booked.masterObjectId,
      note,
      isWaitingList: booked.isWaitingList,
      appointmentFromTime: booked.appointmentFromTime,
      appointmentToTime: booked.appointmentToTime,
      isWalkin: booked.isWalkin,
      appointmentContent: booked.appointmentContent,
      isLogged: false,
      createByService: 'test update',
    };

    try {
      const response = await fetch(`${process.env.API_CALENDAR_URL}/api/v1/appointments/${booked.appointmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-userid": "test",
          "x-username": "test",
          "x-source": "test",
          "x-orgid": "2",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      refreshCalendar();
    } catch (error) {
      console.error(error);
    }

    onClose();
  };

  return (
    <div>
      {!booked && (
        <>
          <form className="flex flex-col gap-3 mb-3" onSubmit={handleSubmitPatient(onSubmitPatient)}>
           
          {!isAllDay && (
            <div className="flex flex-row items-end gap-3">
              <div className="flex-1">
                <Input {...registerPatient("patientName")} label="Name" placeholder="Enter name" variant="bordered" isInvalid={!!errorsPatient.patientName} errorMessage={errorsPatient.patientName?.message} />
              </div>
              <div className="flex-1">
                <Input type="date" label="Birthdate" variant="bordered" value={selectedBirthDate ? selectedBirthDate.toISOString().split("T")[0] : ""} onChange={(e) => {
                  const date = new Date(e.target.value);
                  setSelectedBirthDate(date);
                  setValuePatient("birthDate", date);
                }} />
              </div>
              <Button color="primary" type="submit" startContent={<SearchIcon />} />
            </div>
            )}
            {isSearchPatient && !isAllDay && (
              <div className="mb-5">
                <h5 className="text-lg font-semibold">Select a Patient</h5>
                <div className="flex flex-col gap-2">
                  {patientList.map((patient: any, index) => (
                    <label key={index} className="flex items-center gap-2">
                      <input type="radio" name="selectedPatient" value={patient.contactId} onChange={() => setIsSelectedPatient(patient)} className="form-radio" />
                      <span>{patient.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
          </form>

          <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
            <Input type="date" label="Select Date" variant="bordered" value={selectedDate ? selectedDate.toISOString().split("T")[0] : ""} onChange={(e) => {
              const date = new Date(e.target.value);
              setSelectedDate(date);
              setValue("startDate", date);
            }} />

            {fromTime && toTime && (
              <p className="text-lg font-semibold text-blue-600">
                {fromTime === "00:00" && toTime === "23:59" ? "Time : All Day" : `📅 Selected Time: ${fromTime} - ${toTime}`}
              </p>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allDayToggle"
                checked={isAllDay}
                onChange={() => setIsAllDay(!isAllDay)}
              />
              <label htmlFor="allDayToggle" className="text-sm font-medium">
                All Day
              </label>
            </div>
            {!isAllDay && selectedScheduleData && (
            <div className="mt-4">
              <h5 className="font-semibold mb-2">Select Quota Slot</h5>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: selectedScheduleData.length }, (_, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant={selectedQuotaSlotIndex === i ? "solid" : "flat"}
                    color={selectedQuotaSlotIndex === i ? "primary" : "secondary"}
                    onClick={() => setSelectedQuotaSlotIndex(i)}
                  >
                    {selectedScheduleData[i].startTime} - {selectedScheduleData[i].endTime}
                  </Button>
                ))}
              </div>
            </div>
          )}

            <Textarea {...register("description")} value={description} onChange={(e) => setDecription(e.target.value)} label="Description" placeholder="Enter event description" variant="bordered" />

            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>Cancel</Button>
              <Button color="primary" type="submit">Save Event</Button>
            </ModalFooter>
          </form>
        </>
      )}

      {booked && booked.from != "00:00" && (
        <div>
          <h1>Appointment Detail</h1>
          
          
          <div className="overflow-auto max-h-[400px] border rounded-lg p-4">
          <div className="flex flex-row gap-2 text-size">
            <div>
              <Input isReadOnly className="max-w-xs" value={appointmentContent?.contact_name || "-"} label="Patient Name" type="text" variant="underlined" size="sm" />
              <Input isReadOnly className="max-w-xs" value={appointmentContent?.contact_birthdate || "-"} label="Patient Birtdate" type="text" variant="underlined" />
              <Input isReadOnly className="max-w-xs" value={appointmentContent?.contact_phone || "-"} label="Patient Phone" type="text" variant="underlined" />
            </div>
            
            
            <div>
              <Input isReadOnly className="max-w-xs" value={booked.notes || "-"} label="Notes" type="text" variant="underlined" />
              <Input isReadOnly className="max-w-xs" value={appointmentContent?.visit_number || "-"} label="Visit Number" type="text" variant="underlined" />
              <Input isReadOnly className="max-w-xs" value={booked.id || "-"} label="Booking Code" type="text" variant="underlined" />
            </div>

            
            
          </div>
          
          </div>
        </div>
      )}

      {booked && booked.note && (
        <form className='flex flex-col gap-3' onSubmit={handleSubmit(onSubmitUpdate)}>
            <div className="mb-3 max-h-[400px] border rounded-lg p-4">
              <textarea 
                className="form-control h-full w-full resize-none" 
                name="note" 
                id="note" 
                rows="4"
                placeholder="Tulis catatan di sini..."
                value={note} // << controlled
                onChange={(e) => setNote(e.target.value)} // << update value
              />
            </div>

          <ModalFooter>
            <Button color='primary' type='submit'>Update Event</Button>
          </ModalFooter>
      </form>
      )}
    </div>
  );
}
