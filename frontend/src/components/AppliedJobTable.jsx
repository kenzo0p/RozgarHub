import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'

function AppliedJobTable() {
  return (
    <div>
      <Table>
        <TableCaption>
          A list of your applied jobs
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>
              Date
            </TableHead>
            <TableHead>
              JOb Role
            </TableHead>
            <TableHead>
              Company/Individual
            </TableHead>
            <TableHead className='text-right'>
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1,3].map((item,index)=>(
            <TableRow key={index}>
              <TableCell>
                21-11-24
              </TableCell>
              <TableCell>
                driver
              </TableCell>
              <TableCell>
                car driving company
              </TableCell>
              <TableCell className="text-right">
                <Badge>Selected</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default AppliedJobTable