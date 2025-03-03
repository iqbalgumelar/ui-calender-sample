"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@nextui-org/button";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { useModalContext } from "@/providers/modal-provider";
import { Plus, Eye, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import AddScheduleForm from "./add-schedule-modal";

export default function ManageScheduleModalContent({ selectedLocation, selectedObject }) {
  const { onClose } = useModalContext();
  const { showModal: showScheduleForm } = useModalContext();
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🔹 Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({
    total_pages: 1,
    total_records: 0,
    page_size: 10,
  });

  useEffect(() => {
    if (!selectedLocation || !selectedObject) return;

    fetchScheduleData(currentPage); // Fetch data based on page

  }, [selectedLocation, selectedObject, currentPage]);

  // 🔹 Fetch data with pagination
  const fetchScheduleData = async (page) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.API_CALENDAR_URL}/api/v1/calendars?objectId=${selectedObject}&locationId=${selectedLocation}&page=${page}`,
        {
          headers: {
            "x-userid": "test1",
            "x-username": "test2",
            "x-source": "test3",
            "x-orgid": "2",
            "x-lang": "en",
          },
        }
      );
      
      // 🔹 Update data & pagination meta
      setScheduleData(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      console.error("Error fetching schedule data:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.total_pages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Schedule List</h3>
        <Button 
          color="primary" 
          startContent={<Plus size={16} />} 
          onClick={(e) => {
            e.stopPropagation();
            showScheduleForm({
              title: "Add Schedule",
              body: <AddScheduleForm selectedLocation={selectedLocation} selectedObject={selectedObject} />,
            });
          }}
        >
          Add Schedule
        </Button>
      </div>

      <div className="overflow-y-auto max-h-[500px]">
        {loading ? (
          <p>Loading schedule...</p>
        ) : scheduleData.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableColumn>Start Date</TableColumn>
                <TableColumn>End Date</TableColumn>
                <TableColumn>From Time</TableColumn>
                <TableColumn>To Time</TableColumn>
                <TableColumn>Calendar Title</TableColumn>
                <TableColumn>Actions</TableColumn>
              </TableHeader>
              <TableBody>
                {scheduleData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.start_date.split("T")[0]}</TableCell>
                    <TableCell>{item.end_date.split("T")[0]}</TableCell>
                    <TableCell>{item.from_time.slice(0, 5)}</TableCell>
                    <TableCell>{item.to_time.slice(0, 5)}</TableCell>
                    <TableCell>{item.calendar_title}</TableCell>
                    <TableCell className="flex gap-2">
                      <button className="text-blue-500 hover:text-blue-700">
                        <Eye size={18} />
                      </button>
                      <button
                        className="text-green-500 hover:text-green-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          showScheduleForm({
                            title: "Edit Schedule",
                            body: (
                              <AddScheduleForm
                                selectedLocation={selectedLocation}
                                selectedObject={selectedObject}
                                selectedSchedule={item} // Pass selected schedule data
                              />
                            ),
                          });
                        }}
                      >
                        <Pencil size={18} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* 🔹 Pagination Controls */}
            <div className="flex justify-end items-center mt-4 gap-4">
              <Button
                isDisabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                startContent={<ChevronLeft size={16} />}
              >
                Prev
              </Button>
              <span className="text-sm">
                Page {currentPage} of {meta.total_page}
              </span>
              <Button
                isDisabled={currentPage === meta.total_page}
                onClick={() => handlePageChange(currentPage + 1)}
                endContent={<ChevronRight size={16} />}
              >
                Next
              </Button>
            </div>

          </>
        ) : (
          <p>No schedule data available.</p>
        )}
      </div>
    </div>
  );
}
