import React, { useEffect } from 'react'
import Navbar from '../shared/Navbar'
import ApplicantsTable from './ApplicantsTable'
import api from "@/lib/api"
import { APPLICATION_API_END_POINT } from '@/utils/constant'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setAllApplicants } from '@/redux/applicationSlice'

function Applicants() {
    const params = useParams()
    const dispatch = useDispatch()
    const {applicants} = useSelector(store=>store.application)
    useEffect(() =>{
        const fetchAllApplicants = async() =>{
            try {
                const res = await api.get(`${APPLICATION_API_END_POINT}/${params.id}/applicants`,{withCredentials:true});
                dispatch(setAllApplicants(res.data.data.job))
            } catch (error) {
                console.log(error)
            }
        }
        fetchAllApplicants()
    },[dispatch, params.id])
  return (
    <div>
        <Navbar/>
        <div className='max-w-7xl mx-auto '>
            <h1 className='font-bold text-xl my-5'>Applicants {applicants?.applications?.length}</h1>
            <ApplicantsTable/>
        </div>
    </div>
  )
}

export default Applicants