import { Share2, X, Copy, Check, Link } from "lucide-react"
import { useEffect, useState } from "react"
import { PlusIcon } from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { useRoom } from "../context/RoomContext"
import { useSocket } from "../context/SocketContext"

const ShareDialog = ({ theme, colors: c, onClose }) => {
  // const [copied, setCopied] = useState(false)
  // const [copiedRoomId, setCopiedRoomId] = useState(false)
  const [copyStatus, setCopyStatus] = useState(null);
// values: "roomId" | "link" | null

  const [activeUserCount , setActiveUserCount] = useState(0);

  const { socket, socketId } = useSocket();
  const { roomId, setRoomId } = useRoom();

  const link = window.location.href

  // const copyLink = () => {
  //   navigator.clipboard.writeText(link)
  //   setCopied(true)
  //   setTimeout(() => setCopied(false), 2000)
  // }
  
  // const handleRoomIDCopy = ()=>{
  //   navigator.clipboard.writeText(roomId)
  //   setCopiedRoomId(true);
  //   setTimeout(() => setCopiedRoomId(false), 2000)
  // }

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    setCopyStatus("link");
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const handleRoomIDCopy = () => {
    navigator.clipboard.writeText(roomId);
    setCopyStatus("roomId");
    setTimeout(() => setCopyStatus(null), 2000);
  };


  /* 🔥 ACTIVE USER COUNT */
  useEffect(() => {
    if (!socket || !roomId) return

    // Request current count
    socket.emit("getActiveUsers", roomId)
   
    
    // Listen for updates
    const handleActiveUsers = ({ count }) => {
      setActiveUserCount(count)
      console.log("Active users:", count)
    }

    socket.on("activeUserCount", handleActiveUsers)

    return () => {
      socket.off("activeUserCount", handleActiveUsers)
    }
  }, [socket, roomId])


  return (
    // <div>
    //   <div className="flex items-center justify-between mb-4">
    //     <h2 className="text-lg font-semibold">Share Room</h2>
    //     <button onClick={onClose}>
    //       <X />
    //     </button>
    //   </div>

    //   <p className="text-sm mb-4" style={{ color: c.textMuted }}>
    //     Share this link with others to collaborate
    //   </p>

    //   <div
    //     className="flex items-center gap-2 p-3 rounded-lg border"
    //     style={{
    //       backgroundColor: c.bgSecondary,
    //       borderColor: c.border
    //     }}
    //   >
    //     <input
    //       value={link}
    //       readOnly
    //       className="flex-1 bg-transparent outline-none text-sm"
    //       style={{ color: c.text }}
    //     />
    //     <button onClick={copyLink}>
    //       {copied ? <Check size={16} /> : <Copy size={16} />}
    //     </button>
    //   </div>

    //   <button
    //     className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg"
    //     style={{
    //       backgroundColor: c.accent,
    //       color: theme === "dark" ? c.bg : "#fff"
    //     }}
    //   >
    //     <Share2 size={16} />
    //     Share
    //   </button>
    // </div>

    <>
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:size-12 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage
                src="https://github.com/maxleiter.png"
                alt="@maxleiter"
                />
              <AvatarFallback>LR</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage
                src="https://github.com/evilrabbit.png"
                alt="@evilrabbit"
                />
              <AvatarFallback>ER</AvatarFallback>
            </Avatar>
          </div>
        </EmptyMedia>
        {(activeUserCount <= 1) ? <EmptyTitle>No Team Members</EmptyTitle> : <EmptyTitle>{activeUserCount} Team Members</EmptyTitle>}
        
        <EmptyDescription>
          Invite your team to collaborate on this project.
        </EmptyDescription>
       <EmptyDescription>
        <span className="inline-flex items-center gap-1">
          RoomID: {roomId}
          <Link onClick={handleRoomIDCopy} size={12} className="text-blue-500 hover:text-blue-600 cursor-copy" />
        </span>
      </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button  onClick={copyLink}size="sm" className="hover:opacity-70 cursor-pointer">
          <PlusIcon />
          Invite Members
        </Button>
      </EmptyContent>
    </Empty>
    {copyStatus && (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 rounded-lg bg-black/90 px-4 py-2 text-sm text-white shadow-lg animate-in fade-in slide-in-from-bottom-2">
        <Check size={14} className="text-green-400" />
        {copyStatus === "roomId"
          ? "Room ID copied to clipboard"
          : "Invite link copied to clipboard"}
      </div>
    </div>
)}

                </>
  )
}

export default ShareDialog
