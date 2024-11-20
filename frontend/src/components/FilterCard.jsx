import React from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

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
      "Fire Safety Officer",
    ],
  },
  {
    filterType: "Salary",
    array: ["0-40k", "42k-1lakh", "1lakh to 5lakh"],
  },
];
function FilterCard() {
  return <div className="w-full bg-white p-3 rounded-md">
    <h1 className="font-bold text-lg">Filter Jobs</h1>
    <hr className="mt-3" />
    <RadioGroup>
      {
        filterData.map((data,index)=>(
          <div>
            <h1 className="font-bold text-lg">{data.filterType}</h1>
            {
              data.array.map((item,index)=>(
                <div className="flex items-center space-x-2 my-2">
                  <RadioGroupItem value={item}/>
                  <Label>{item}</Label>
                </div>
              ))
            }
          </div>
        ))
      }
    </RadioGroup>

  </div>;
}

export default FilterCard;
