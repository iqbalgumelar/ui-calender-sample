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
process.env.API_CALENDAR_URL='https://uat-mysiloam-api-01.siloamhospitals.com/next-appointment'

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
  const [selectedOrganization, setSelectedOrganization] = useState<string>();
  const [masterObject, setMasterObject] = useState<any[]>([]);
  const [masterLocation, setMasterLocation] = useState<any[]>([]);
  const [masterOrganization, setMasterOrganization] = useState<any[]>([]);

  useEffect(() => {
    setClientSide(true);
  }, []);


  useEffect(function(){
    // getAllLocation();
    getAllOrganization();

  }, []);

  const getAllLocation = async (inputOrganization) => {
    try {
      const headers = {
        "x-userid": "xxx",
        "x-username": "xxx",
        "x-source": "xxx",
        "x-orgid": 2,
        "x-lang": "en",
        "Content-Type": "application/json"
      };
      
      const query = `?organizationId=${inputOrganization}`;
      const resp = await axios.get(`${process.env.API_CALENDAR_URL}/api/v1/locations${query}`, {
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

  const getAllOrganization = async () => {
    const masterOrganizationJSON = [
      {
        "name" : "RS Jantung Diagram Cinere",
        "alias" : "SHCN",
        "hospital_id" : "81d7771f-f4ca-49ff-92cf-dd6c4ce7aa12",
        "hospital_hope_id" : 8
      },
      {
        "name" : "Siloam Hospitals Jakabaring",
        "alias" : "SHJK",
        "hospital_id" : "35d3c227-4d28-445b-8c48-79a13156bf31",
        "hospital_hope_id" : 32
      },
      {
        "name" : "BIMC Kuta",
        "alias" : "BIMC Kuta",
        "hospital_id" : "a4c042e7-665b-41d9-a5c3-4bee66d69dd1",
        "hospital_hope_id" : 46
      },
      {
        "name" : "Siloam Hospitals Cito",
        "alias" : "SHCT",
        "hospital_id" : "6963078d-ff13-47b3-997f-1859c80e3183",
        "hospital_hope_id" : 18
      },
      {
        "name" : "Lippo Mall Kemang (Kemang Village)",
        "alias" : "LMK",
        "hospital_id" : "cad5df0e-82c9-41d9-9a4c-a8bf0161d540",
        "hospital_hope_id" : 0
      },
      {
        "name" : "Siloam Hospitals Samarinda",
        "alias" : "SHSM",
        "hospital_id" : "4ed6fdae-5f49-41ad-993a-c1806b390cf6",
        "hospital_hope_id" : 38
      },
      {
        "name" : "Amman Mineral Nusa Tenggara",
        "alias" : "AMNT",
        "hospital_id" : "ef176d1e-378e-4530-b9bd-dfc5765e819e",
        "hospital_hope_id" : 49
      },
      {
        "name" : "Siloam Hospitals Buton",
        "alias" : "SHBN",
        "hospital_id" : "1a013f71-2ff0-4acc-82b2-20f8c37a2aea",
        "hospital_hope_id" : 43
      },
      {
        "name" : "Siloam Hospitals Group Head Office",
        "alias" : "SHG",
        "hospital_id" : "81d22b94-38a1-4870-bcce-234647e3453e",
        "hospital_hope_id" : 1
      },
      {
        "name" : "BIMC Nusa Dua",
        "alias" : "BIMC Nusa Dua",
        "hospital_id" : "da3b47c6-c976-446f-8cbf-aa71fe1c6614",
        "hospital_hope_id" : 47
      },
      {
        "name" : "Siloam Hospitals Semarang",
        "alias" : "SHSR",
        "hospital_id" : "ae36a207-6b3e-4a8f-a693-43db92302e10",
        "hospital_hope_id" : 51
      },
      {
        "name" : "Siloam Hospitals Makassar",
        "alias" : "SHMK",
        "hospital_id" : "253c529a-d4aa-477d-81f9-27fee6b04d5c",
        "hospital_hope_id" : 9
      },
      {
        "name" : "Siloam Hospitals Lippo Village",
        "alias" : "SHLV",
        "hospital_id" : "39764039-37b9-4176-a025-ef7b2e124ba4",
        "hospital_hope_id" : 2
      },
      {
        "name" : "Siloam Hospitals Mampang",
        "alias" : "SHMA",
        "hospital_id" : "7bfbdce7-aa14-41ea-99d4-39f760c7cda1",
        "hospital_hope_id" : 44
      },
      {
        "name" : "Siloam Hospitals Purwakarta",
        "alias" : "SHPW",
        "hospital_id" : "4a58cc8e-9b63-44b5-80e7-2cdd7d10d53a",
        "hospital_hope_id" : 29
      },
      {
        "name" : "Siloam Hospitals Kelapa Dua",
        "alias" : "SHKD",
        "hospital_id" : "65a60870-beab-4925-94ad-4a5246e26d6a",
        "hospital_hope_id" : 30
      },
      {
        "name" : "Siloam Hospitals ASRI",
        "alias" : "SH ASRI",
        "hospital_id" : "598f5450-7e37-460e-aa08-3e354371770c",
        "hospital_hope_id" : 27
      },
      {
        "name" : "Siloam Hospitals Agora Cempaka Putih",
        "alias" : "SHAG",
        "hospital_id" : "f3360448-d4f9-4e8c-80a8-136f46eb994f",
        "hospital_hope_id" : 23
      },
      {
        "name" : "Siloam Hospitals Pasar Baru",
        "alias" : "SHPB",
        "hospital_id" : "765579c7-117d-4d9c-8dc1-6466878301c6",
        "hospital_hope_id" : 35
      },
      {
        "name" : "Siloam Hospitals Putera Bahagia",
        "alias" : "SHCB",
        "hospital_id" : "104188b7-476f-49e8-a100-cb4479a2e284",
        "hospital_hope_id" : 22
      },
      {
        "name" : "Rumah Sakit Umum Siloam Lippo Village",
        "alias" : "RSUS LV",
        "hospital_id" : "5a35d922-2017-4588-9ab2-b2687a6dbdfe",
        "hospital_hope_id" : 7
      },
      {
        "name" : "Siloam Hospitals Labuan Bajo",
        "alias" : "SHLB",
        "hospital_id" : "4c54e7ba-a8d3-4c24-a8a1-526b1a275855",
        "hospital_hope_id" : 39
      },
      {
        "name" : "RSU Syubbanul Wathon",
        "alias" : "RSUSW",
        "hospital_id" : "d2f3bddc-62a2-45af-977f-77a1e15e62d9",
        "hospital_hope_id" : 31
      },
      {
        "name" : "SILOAM CLINIC SOE",
        "alias" : "SCSOE",
        "hospital_id" : "2f80922d-fa65-4058-b173-f4b61914dfa2",
        "hospital_hope_id" : 53
      },
      {
        "name" : "Siloam Hospitals Jambi",
        "alias" : "SHJB",
        "hospital_id" : "f0a2533f-a05a-44ba-b8c5-bafef105fed8",
        "hospital_hope_id" : 6
      },
      {
        "name" : "Siloam Hospitals Paal Dua",
        "alias" : "SHPD",
        "hospital_id" : "bfde6675-2a80-4174-8d5d-3e8dcdba35c7",
        "hospital_hope_id" : 42
      },
      {
        "name" : "Siloam Hospitals Banjarmasin",
        "alias" : "SHBJ",
        "hospital_id" : "a0554ddc-e541-4640-9dc3-e102b97d454a",
        "hospital_hope_id" : 48
      },
      {
        "name" : "Siloam Hospitals Lippo Cikarang",
        "alias" : "SHLC",
        "hospital_id" : "153b75ee-dc07-4290-ad55-d4d28457780f",
        "hospital_hope_id" : 4
      },
      {
        "name" : "Siloam Hospitals Yogyakarta",
        "alias" : "SHYG",
        "hospital_id" : "8c09908a-2eb3-4e5e-a7d3-ab2400df0b82",
        "hospital_hope_id" : 11
      },
      {
        "name" : "Siloam Hospitals Bangka Belitung",
        "alias" : "SHBB",
        "hospital_id" : "4cf6c0fd-6a7f-4ce8-aac9-a5686eac8ad6",
        "hospital_hope_id" : 13
      },
      {
        "name" : "Siloam Hospitals Surabaya",
        "alias" : "SHSB",
        "hospital_id" : "deb78250-e156-4f62-b548-a648cf718bf2",
        "hospital_hope_id" : 5
      },
      {
        "name" : "Siloam Hospitals Balikpapan",
        "alias" : "SHBP",
        "hospital_id" : "c279e92e-57c3-47ad-8ce5-397b4fe8b6f7",
        "hospital_hope_id" : 10
      },
      {
        "name" : "Siloam Hospitals Bogor",
        "alias" : "SHBG",
        "hospital_id" : "80d359a6-57e2-47f6-bcad-36806931c925",
        "hospital_hope_id" : 12
      },
      {
        "name" : "Siloam Hospitals TB Simatupang",
        "alias" : "SHTB",
        "hospital_id" : "561686b8-383e-45d9-97e6-b97e3d5ef492",
        "hospital_hope_id" : 15
      },
      {
        "name" : "Siloam Hospitals Kupang",
        "alias" : "SHKP",
        "hospital_id" : "5cbfbe52-164f-4471-aa56-018e47502274",
        "hospital_hope_id" : 16
      },
      {
        "name" : "Siloam Hospitals Mataram",
        "alias" : "SHMT",
        "hospital_id" : "365e1f45-2d61-45bd-82fe-662e9474c60f",
        "hospital_hope_id" : 26
      },
      {
        "name" : "Siloam Hospitals Bekasi Sepanjang Jaya",
        "alias" : "SHBS",
        "hospital_id" : "2f7446d2-91b3-4e78-bcce-6a749813a842",
        "hospital_hope_id" : 36
      },
      {
        "name" : "Siloam Hospitals Lubuk Linggau",
        "alias" : "SHLL",
        "hospital_id" : "0344e546-ffbd-41e7-ab59-bdf8de74bc89",
        "hospital_hope_id" : 20
      },
      {
        "name" : "Siloam Hospitals Sentosa",
        "alias" : "SHST",
        "hospital_id" : "dcf63376-ed54-4b73-ba93-e84f3f215d4b",
        "hospital_hope_id" : 25
      },
      {
        "name" : "Siloam Hospitals Jember",
        "alias" : "SHJR",
        "hospital_id" : "ae89651b-d83a-44eb-90b6-1bfbe2c859c6",
        "hospital_hope_id" : 21
      },
      {
        "name" : "Siloam Hospitals Manado",
        "alias" : "SHMN",
        "hospital_id" : "63c6af56-bb9a-4962-a698-454d3345630d",
        "hospital_hope_id" : 28
      },
      {
        "name" : "Siloam Hospitals Kebon Jeruk",
        "alias" : "SHKJ",
        "hospital_id" : "5588f248-6f45-4968-9009-13ee8f3bd5ec",
        "hospital_hope_id" : 3
      },
      {
        "name" : "MRCCC Siloam Hospitals Semanggi",
        "alias" : "MRCCC",
        "hospital_id" : "beba4c15-72d4-473a-bb9e-6dc26c0c9052",
        "hospital_hope_id" : 19
      },
      {
        "name" : "Siloam Hospitals Ambon",
        "alias" : "SHAB",
        "hospital_id" : "d27bc94c-ba25-49e1-ac41-beb3996bbc61",
        "hospital_hope_id" : 41
      },
      {
        "name" : "Siloam Hospitals Palangkaraya",
        "alias" : "SHPR",
        "hospital_id" : "c60ae294-df89-47f8-9f44-a8748c55c09f",
        "hospital_hope_id" : 33
      },
      {
        "name" : "Siloam Hospitals Bekasi Timur",
        "alias" : "SHBT",
        "hospital_id" : "e07a3118-a98b-433f-98fb-eb2fcdb1b514",
        "hospital_hope_id" : 37
      },
      {
        "name" : "Siloam Hospitals Medan",
        "alias" : "SHMD",
        "hospital_id" : "7bf8f504-dd72-4248-ac00-5dcb2f261c50",
        "hospital_hope_id" : 34
      },
      {
        "name" : "Siloam Hospitals Denpasar",
        "alias" : "SHDP",
        "hospital_id" : "49a1ef75-2bdb-4586-b287-557929a7d873",
        "hospital_hope_id" : 14
      },
      {
        "name" : "Siloam Sriwijaya Palembang",
        "alias" : "SHPL",
        "hospital_id" : "7b16ee07-7f87-4b78-b019-c0415454a5db",
        "hospital_hope_id" : 17
      }
    ];
    setMasterOrganization(masterOrganizationJSON);
  }

  const handleOganizationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const organizationId = String(event.target.value).trim();
    setSelectedOrganization(organizationId);
    setMasterObject([]);
    setSelectedObject('');
  };

  const handleLocationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocation(event.target.value);
    setSelectedObject('');
  };

  const handleObjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!event.target.value) return;
    setSelectedObject(event.target.value);
  };
  
  useEffect(() => {
    if (selectedOrganization) {
      fetchObjectsByOrganization(selectedOrganization)
    }
  }, [selectedOrganization]);
  
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

  const fetchObjectsByOrganization = async (organizationId: string) => {
    try {
      const headers = {
        "x-userid": "xxx",
        "x-username": "xxx",
        "x-source": "xxx",
        "x-orgid": 2,
        "x-lang": "en",
        "Content-Type": "application/json"
      };
      const resp = await axios.get(`${process.env.API_CALENDAR_URL}/api/v1/master-objects/organization/${organizationId}`, {
        headers
      });
      let data = resp.data.data;
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

  const getDateRange = () => {
    const today = new Date();
    const selectedDate = today.getDate();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    const selectedDay = today.getDay() + 1;

    return { startDate, endDate, selectedDate, selectedDay };
  }

  const handleManageSchedule = () => {
    if (!selectedLocation || !selectedObject) return;
  
    const selectedDate = getDateRange();
    console.log("Manage Schedule Clicked! 222", { selectedLocation, selectedObject, selectedDate });
    showAddScheduleModal({
      title: "Manage Schedule",
      body: <ManageScheduleModalContent selectedLocation={selectedLocation} selectedObject={selectedObject} selectedDate={selectedDate} />,
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
          {/* Organization */}
          <select
            onChange={handleOganizationChange}
            value={selectedOrganization}
            className="border p-2 rounded-md"
          >
            <option value="">
              Select Organization
            </option>
            {masterOrganization?.map((item: any) => (
              <option key={item.hospital_hope_id} value={item.hospital_hope_id}>
                {item.alias} - {item.name}
              </option>
            ))}
          </select>
          {/* Location */}
          {/* <select
            onChange={handleLocationChange}
            value={selectedLocation}
            disabled={!selectedOrganization}
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
          </select> */}
          {/* Master Object */}
          <select
            onChange={handleObjectChange}
            value={selectedObject}
            className="border p-2 rounded-md"
            style={{ maxWidth: "150px" }}
            disabled={!selectedOrganization}
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
                  <DailyView classNames={classNames?.buttons}
                    filterOrganization={selectedOrganization}
                    filterObject={selectedObject} />
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
