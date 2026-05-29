import React from "react";

const Loading = () => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-50">
      <div className="w-32 h-32 rounded-full overflow-hidden flex justify-center items-center bg-white/20 border-4 border-purple-400 animate-pulse">
        <img
          src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3NqbDNtbzNsandudjAzYmwzeGdzZHE2YTV6d3Q4Nzh0N2l3aXI1dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/6a4udhSXVdp20zVDIz/giphy.gif"
          alt="Loading..."
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default Loading;
