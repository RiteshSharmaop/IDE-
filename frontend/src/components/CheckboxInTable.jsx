"use client"

import React, { useEffect, useState } from "react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowUpDown, ArrowUpRightSquare } from "lucide-react"
import { useSocket } from "../context/SocketContext"
import { useRoom } from "../context/RoomContext"

// const tableData = [
//   {
//     id: "1",
//     username: "Sarah Chen",
//     checkbox: false,
//     title: "Design System Audit",
//     role: "Admin",
//     status: "Active",
//   },
//   {
//     id: "2",
//     username: "Marcus Rodriguez",
//     checkbox: false,
//     title: "API Integration",
//     role: "User",
//     status: "Active",
//   },
//   {
//     id: "3",
//     username: "Priya Patel",
//     checkbox: false,
//     title: "Database Optimization",
//     role: "User",
//     status: "Pending",
//   },
//   {
//     id: "4",
//     username: "David Kim",
//     checkbox: false,
//     title: "Mobile App Launch",
//     role: "Editor",
//     status: "Inactive",
//   },
// ]

const typeColor = {
  USER_JOINED: "bg-green-600",
  USER_LEFT: "bg-red-600",
  FILE_CREATED: "bg-blue-600",
  FOLDER_CREATED: "bg-purple-600",
}


export default function CheckboxInTable() {
  const [selectedRows, setSelectedRows] = useState(new Set([]))
  const [notifications, setNotifications] = useState([])
  const [tableData, setTableData] = useState([])
  const { socket, socketId } = useSocket();
  
  const { roomId, setRoomId } = useRoom();




    // useEffect(() => {
    //   socket.on("notification", (data) => {
    //     setNotifications((prev) => [
    //       {
    //         id: crypto.randomUUID(),
    //         ...data,
    //         createdAt: Date.now(),
    //       },
    //       ...prev,
    //     ])
    //   })

    //   return () => socket.off("notification")
    // }, [])
    const mapStatus = (type) => {
      switch (type) {
        case "USER_JOINED":
          return "Active"
        case "USER_LEFT":
          return "Inactive"
        case "FILE_CREATED":
        case "FOLDER_CREATED":
          return "Pending"
        default:
          return "Pending"
      }
    }

useEffect(() => {
  if (!socket || !roomId) return

  const handler = (data) => {
    if (data.roomId !== roomId) return

    setTableData(prev => [
      {
        id: crypto.randomUUID(),
        username: data.username || "System",
        title: data.message,
        role: "Notification",
        status: mapStatus(data.type),
      },
      ...prev,
    ])
  }

  socket.on("notification", handler)
  return () => socket.off("notification", handler)
}, [socket, roomId])




useEffect(() => {
  console.log("TableData:", tableData)
}, [tableData])


useEffect(() => {
  setSelectedRows(new Set())
}, [tableData])



    // useEffect(()=>{
    //   console.log("TableDAta : " , tableData);
    //   console.log("notification : " , notifications);
      
    // },[notifications, setNotifications , tableData, setTableData])


  const selectAll =
  tableData.length > 0 && selectedRows.size === tableData.length


  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(new Set(tableData.map((row) => row.id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleSelectRow = (id, checked) => {
    const newSelected = new Set(selectedRows)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedRows(newSelected)
  }

  return (
    <>
      <Table className="bg-[#0A0A0A] text-white  ">
        <TableHeader>
          <TableRow className="bg-[#111111]">
            <TableHead className="w-8">
              <Checkbox
                id="select-all"
                checked={selectAll}
                onCheckedChange={handleSelectAll}
                />
            </TableHead>
            <TableHead className="text-white ">Username</TableHead>
            
            <TableHead className="text-white ">Title  </TableHead>
        
            <TableHead className="text-white ">Role</TableHead>
            <TableHead className="text-white ">Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {tableData.map((row) => (
            <TableRow
            key={row.id}
            data-state={selectedRows.has(row.id) ? "selected" : undefined}
            className="hover:bg-[#181818] data-[state=selected]:bg-[#262626]"
            >
              <TableCell>
                <Checkbox
                  id={`row-${row.id}`}
                  checked={selectedRows.has(row.id)}
                  // onCheckedChange={(checked) => handleSelectRow(row.id, checked === true)}
                  onCheckedChange={(checked) => {
                    if (checked === "indeterminate") return
                    handleSelectRow(row.id, checked)
                  }}

                  />
              </TableCell>
              <TableCell className="font-medium">{row.username}</TableCell>
              <TableCell>{row.title}</TableCell>
              <TableCell>{row.role}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-sm font-medium ${
                    row.status === "Active"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : row.status === "Pending"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                    >
                  {row.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
          {/* {notifications.map((n) => (
          <TableRow key={n.id}>
            <TableCell>{n.type}</TableCell>
            <TableCell>{n.message}</TableCell>
            <TableCell>
              {new Date(n.createdAt).toLocaleTimeString()}
            </TableCell>
          </TableRow>
        ))} */}

          </>
  )
}
