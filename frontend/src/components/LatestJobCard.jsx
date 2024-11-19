import React from 'react'
import { Badge } from './ui/badge'

function LatestJobCard() {
    return (
        <div className='p-5 rounded-md shadow-xl bg-white border border-gray-100 cursor-pointer hover:shadow-2xl'>
            <div>
                <h1 className="font-medium text-lg">Company Name</h1>
                <p className='text-sm text-gray-500'>India</p>
            </div>
            <div>
                <h1 className='font-bold text-lg my-2 '>Job Title</h1>
                <p className='text-sm text-gray-600'>Lorem ipsum dolor sit, amet consectetur adipisicing elit.</p>
            </div>
            <div className='flex items-center gap-2 mt-4'>
                <Badge variant="ghost" className={'text-blue-500  font-bold'}>12 Positions</Badge>
                <Badge variant="ghost" className={'text-red-500  font-bold'}>full time</Badge>
                <Badge variant="ghost" className={'text-slate-600  font-bold'}>1000/per month</Badge>
            </div>
        </div>
    )
}

export default LatestJobCard