import React, { useEffect } from 'react'
import Navbar from './shared/Navbar'
import Job from './Job'
import { useDispatch, useSelector } from 'react-redux'
import { setSearchedQuery } from '@/redux/jobSlice'
import useGetAllJobs from '@/hooks/useGetAllJobs'
// const randomjobs =[1,2,8]
function Browse() {
  useGetAllJobs()
  const {allJobs} = useSelector(store => store.job)
  const dispatch = useDispatch()
  useEffect(()=>{
    return () => {
      dispatch(setSearchedQuery(''))
    }
  },[])
  return (
    <div>
        <Navbar/>
        <div className='max-w-7xl mx-auto my-10'>
            <h1 className='font-bold text-xl my-10'>Search Results ({allJobs.length})</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 '>
            {
                allJobs.map((job)=>(
                    <Job key={job._id} job={job}/>
                ))
            }
            </div>
        </div>
    </div>
  )
}

export default Browse