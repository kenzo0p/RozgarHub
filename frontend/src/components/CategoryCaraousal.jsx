import React from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
const category = [
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
];
function CategoryCaraousal() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const searchJobHandler = (query) =>{
    dispatch(setSearchedQuery(query))
    navigate("/browse")
  }
  return (
    <div>
      <Carousel className="w-[280px] md:w-full max-w-xl mx-auto my-20">
        <CarouselContent>
          {category.map((category, index) => (
            <CarouselItem key={index} className="md:basis-3/2 basis-7/5">
                <Button onClick={() => searchJobHandler(category)} variant="outline" className="rounded-full">{category}</Button>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious/>
        <CarouselNext/>
      </Carousel>
    </div>
  );
}

export default CategoryCaraousal;
