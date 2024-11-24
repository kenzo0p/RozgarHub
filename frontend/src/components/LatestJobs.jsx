import React from "react";
import LatestJobCard from "./LatestJobCard";
import { useSelector } from "react-redux";
// const randomJob = [1, 2, 3, 4, 6, 7, 8];
function LatestJobs() {
  const {allJobs} = useSelector(store=>store.job)
  return (
    <div className="max-w-7xl my-20 mx-auto">
      <h1 className="text-4xl font-bold text-[#526a6e]">Job Openings</h1>
      <div className="grid grid-cols-3 gap-4 my-5">
        {" "}
        {allJobs.length <= 0 ? <span>No Job Available</span> : allJobs?.slice(0,6).map((job) => (
          <LatestJobCard key={job._id} />
        ))}
      </div>
    </div>
  );
}

export default LatestJobs;
