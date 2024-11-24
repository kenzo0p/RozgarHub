import React from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { Button } from "./ui/button";
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
  "Fire Safety Officer",
];
function CategoryCaraousal() {
  return (
    <div>
      <Carousel className="w-full max-w-xl mx-auto my-20">
        <CarouselContent>
          {category.map((category, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <Button variant="outline" className="rounded-full">{category}</Button>
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
