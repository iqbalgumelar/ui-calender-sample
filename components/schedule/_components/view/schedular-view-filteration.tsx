import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@nextui-org/button";

import { Tabs, Tab } from "@nextui-org/tabs";
import { Calendar, CalendarDaysIcon, ClipboardList } from "lucide-react";
import { BsCalendarMonth, BsCalendarWeek } from "react-icons/bs";

import AddEventModal from "../../_modals/add-event-modal";
import ManageScheduleModalContent from "../../_modals/manage-schedule-modal";
import DailyView from "./day/daily-view";
import MonthView from "./month/month-view";
import WeeklyView from "./week/week-view";
import { useModalContext } from "@/providers/modal-provider";
import { ClassNames, CustomComponents, Views } from "@/types/index";
import axios from "axios";
import { locationData, objectBylocationData } from "@/services/mocksFilter/masterMock";

// Sample Master Object Data (Replace with API response)
process.env.API_CALENDAR_URL='http://localhost:3000'

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
  const { showModal: showAddScheduleModal } = useModalContext();
  const [clientSide, setClientSide] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedObject, setSelectedObject] = useState<string>();
  const [selectedLocation, setSelectedLocation] = useState<string>();
  const [masterObject, setMasterObject] = useState<any[]>([]);
  const [masterLocation, setMasterLocation] = useState<any[]>([]);

  useEffect(() => {
    setClientSide(true);
  }, []);


  useEffect(function(){
    getAllLocation();

  }, []);

  const getAllLocation = async () => {
    try {
      const headers = {
        "x-userid": "xxx",
        "x-username": "xxx",
        "x-source": "xxx",
        "x-orgid": 2,
        "x-lang": "en",
        "Content-Type": "application/json"
      };
      
      const resp = await axios.get(`${process.env.API_CALENDAR_URL}/api/v1/locations`, {
        headers
      });
      let data = resp.data.data;

      // use mock data for testing
      // let data = locationData.data;
  
      setMasterLocation(data);
    } catch (err) {
      console.log('~  err:', err)
    }
  }

  const handleLocationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocation(event.target.value);
    setSelectedObject('');
  };

  const handleObjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!event.target.value) return;
    setSelectedObject(event.target.value);
  };
  
  useEffect(() => {
    if (selectedLocation) {
      fetchObjectsByLocation(selectedLocation);
    }
  }, [selectedLocation]);
  
  const fetchObjectsByLocation = async (locationId: string) => {
    try {
      const headers = {
        "x-userid": "xxx",
        "x-username": "xxx",
        "x-source": "xxx",
        "x-orgid": 2,
        "x-lang": "en",
        "Content-Type": "application/json"
      };
      
      const resp = await axios.get(`${process.env.API_CALENDAR_URL}/api/v1/master-objects/location?id=${locationId}`, {
        headers
      });

      let data = resp.data.data;

      // use mock data for testing
      // let data = objectBylocationData.data
  
      setMasterObject(data);
    } catch (err) {
      console.log('~  err:', err)
    }
  }

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

  const handleManageSchedule = () => {
    if (!selectedLocation || !selectedObject) return;
  
    console.log("Manage Schedule Clicked!", { selectedLocation, selectedObject });
  
    showAddScheduleModal({
      title: "Manage Schedule",
      body: <ManageScheduleModalContent selectedLocation={selectedLocation} selectedObject={selectedObject} />,
      modalClassName: "max-w-5xl min-h-[600px]",
    });
  };

  const viewsSelector = isMobile ? views?.mobileViews : views?.views;

  return (
    <div className="flex w-full flex-col">
      {/* Filter Dropdown */}
      <div className="flex justify-between items-center mb-4 px-3">
        <h2 className="text-lg font-semibold">Filter Events</h2>
        <div className="flex space-x-4">
          <select
            onChange={handleLocationChange}
            value={selectedLocation}
            className="border p-2 rounded-md"
          >
            <option value="">
              Select Location
            </option>
            {masterLocation?.map((item: any) => (
              <option key={item.location_id} value={item.location_id}>
                {item.name}
              </option>
            ))}
          </select>
          <select
            onChange={handleObjectChange}
            value={selectedObject}
            className="border p-2 rounded-md"
            style={{ maxWidth: "150px" }}
            disabled={!selectedLocation}
          >
            <option value="">
              Select Object
            </option>
            {masterObject?.map((item: any) => (
              <option key={item.master_object_id} value={item.master_object_id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
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
                  <DailyView classNames={classNames?.buttons} filterLocation={selectedLocation} filterObject={selectedObject} />
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
                  <WeeklyView classNames={classNames?.buttons} filterLocation={selectedLocation} filterObject={selectedObject} />
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
                  <MonthView classNames={classNames?.buttons} filterLocation={selectedLocation} filterObject={selectedObject} />
                </motion.div>
              </Tab>
            )}
          </Tabs>

          <div className="absolute top-0 right-0 flex space-x-2">
            {selectedLocation && selectedObject && (
              <Button
                onClick={() => handleManageSchedule()} // New function for Manage Schedule
                className={classNames?.buttons?.addEvent}
                color="secondary"
                startContent={<ClipboardList  />}
              >
                Manage Schedule
              </Button>
            )}

            {/* <Button
              onClick={() => handleAddEvent()}
              className={classNames?.buttons?.addEvent}
              color="primary"
              startContent={<Calendar  />}
            >
              Add Appointment
            </Button> */}
          </div>

        </div>
      </div>
    </div>
  );
}
