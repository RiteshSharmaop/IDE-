import { createContext, useContext, useState } from "react";
import { ReactNode } from "react";



const SocketContext = createContext(undefined);

export const SocketProvider = ({ children }) => {
  // const [socketId, setSocketId] = useState<string>("");
  const [socketId, setSocketId] = useState(undefined);


  return (
    <SocketContext.Provider value={{ socketId, setSocketId }}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook for easier usage
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
