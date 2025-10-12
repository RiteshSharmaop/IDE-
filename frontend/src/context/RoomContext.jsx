import { createContext, useContext, useState } from "react";
import {ReactNode } from "react";


const RoomContext = createContext(undefined);

export const RoomProvider = ({ children }) => {
  const [roomId, setRoomId] = useState("");

  return (
    <RoomContext.Provider value={{ roomId, setRoomId }}>
      {children}
    </RoomContext.Provider>
  );
};

// Custom hook for easier usage
export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error("useRoom must be used within a RoomProvider");
  }
  return context;
};
