import { Search } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import { useNavigate } from "react-router-dom";

function HeroSection() {
  const [query ,setQuery] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const searchJobHandler = () =>{
    dispatch(setSearchedQuery(query))
    navigate("/browse")
  }
  return (
    <div className="text-center">
        <div className="flex flex-col gap-5 my-10">
        <span className="mx-auto px-4 py-2 rounded-full  bg-gray-100 text-blue-500 text-sm sm:text-xl font-medium">The Ultimate Destination for Blue-Collar Jobs.</span>
        <h1 className="sm:text-4xl md:text-5xl text-3xl font-bold text-[#526a6e]"><span className="text-blue-500">RozgarHub</span> : Empowering<span className="text-blue-500"> Blue-Collar </span> Workers</h1>
        <p className="text-[#5e7b80] sm:text-xl text-sm font-bold">Connecting Skilled Hands with the Right Opportunities</p>
        <div className="flex w-[40%] shadow-lg border border-gray-200 pl-3 rounded-full items-center gap-4 m-auto">
            <input type="text"
            placeholder="What job are you looking for?"
            onChange={(e) => setQuery(e.target.value)}
            className="text-sm sm:text-md outline-none border-none w-full"
            />
            <Button onClick ={searchJobHandler} className="rounded-r-full bg-blue-500 "><Search className="h-5 w-5"/></Button>
        </div>
        </div>

    </div>
  );
}

export default HeroSection;
