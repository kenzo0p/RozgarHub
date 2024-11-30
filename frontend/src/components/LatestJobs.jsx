import React from "react";
import LatestJobCard from "./LatestJobCard";
import { useSelector } from "react-redux";
// const randomJob = [1, 2, 3, 4, 6, 7, 8];
function LatestJobs() {
  const {allJobs} = useSelector(store=>store.job)
  return (
    <div className="p-10 mx-auto bg-slate-50 rounded-lg">
      <div className="max-w-7xl mx-auto">

      <h1 className="text-2xl font-bold text-[#526a6e]">Job Openings</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-5">
        {allJobs.length <= 0 ? <span>No Job Available</span> : allJobs?.slice(0,6).map((job) => (
          <LatestJobCard key={job._id} job={job} />
        ))}
      </div>
      </div>
    </div>
  );
}

export default LatestJobs;
