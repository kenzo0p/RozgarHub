import React, { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import { ScrollArea } from "./ui/scroll-area";

const filterData = [
  {
    filterType: "Location",
    array: ["Delhi NCR", "Banglore", "Hyderabad", "Pune", "Mumbai", "Chennai"],
  },
  {
    filterType: "Industry",
    array: [
      "Carpenter",
      "Electrician",
      "Plumber",
      "Mason",
      "Factory Worker",
      "Machine Operator",
      "Assembly Line Worker",
      "Delivery Driver",
      "Truck Driver",
      "Warehouse Worker",
      "HVAC Technician",
      "Auto Mechanic",
      "Maintenance Worker",
      "Security Guard",
      "driver",
      "construction worker",
      "Fire Safety Officer",
    ],
  },
  {
    filterType: "Salary",
    array: ["0-40k", "42k-1lakh", "1lakh to 5lakh"],
  },
];
function FilterCard() {
  const [selectedValue, setSelectedValue] = useState("");
  const dispatch = useDispatch();
  const changeHandler = (value) => {
    setSelectedValue(value);
  };
  useEffect(() => {
    dispatch(setSearchedQuery(selectedValue));
  }, [selectedValue]);
  return (
    <div className="hidden sm:block md:w-full bg-white p-3 rounded-md">
      <h1 className="font-bold text-lg">Filter Jobs</h1>
      <hr className="mt-3" />
      
      <RadioGroup value={selectedValue} onValueChange={changeHandler}>
        <ScrollArea className="h-[80vh]">
        {filterData.map((data, index) => (
          <div key={index}>
            <h1 className="font-bold text-lg">{data.filterType}</h1>
            {data.array.map((item, idx) => {
              const itemId = `id${index}-${idx}`;
              return (
                <div className="flex items-center space-x-2 my-2">
                  <RadioGroupItem value={item} id={itemId} />
                  <Label htmlFor={itemId}>{item}</Label>
                </div>
              );
            })}
          </div>
        ))}
          </ScrollArea>
      </RadioGroup>
    </div>
  );
}

export default FilterCard;
