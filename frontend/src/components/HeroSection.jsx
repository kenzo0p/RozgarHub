import { Search } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";

function HeroSection() {
  return (
    <div className="text-center">
        <div className="flex flex-col gap-5 my-10">
        <span className="mx-auto px-4 py-2 rounded-full  bg-gray-100 text-blue-500 font-medium">The Ultimate Destination for Blue-Collar Jobs.</span>
        <h1 className="text-5xl font-bold text-[#526a6e]"><span className="text-blue-500">RozgarHub</span> : Empowering<span className="text-blue-500"> Blue-Collar </span> Workers</h1>
        <p className="text-[#5e7b80] font-bold">Connecting Skilled Hands with the Right Opportunities</p>
        <div className="flex w-[40%] shadow-lg border border-gray-200 pl-3 rounded-full items-center gap-4 m-auto">
            <input type="text"
            placeholder="What job are you looking for?"
            className="outline-none border-none w-full"
            />
            <Button className="rounded-r-full bg-blue-500 "><Search className="h-5 w-5"/></Button>
        </div>
        </div>

    </div>
  );
}

export default HeroSection;
