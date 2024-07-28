import { CircleAlert } from "lucide-react";
import React from "react";

const SuccessAlert = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-[5rem]">
      <div className="bg-green-700  mt-[1.25rem] text-xs items-center flex text-destructive-foreground h-[2.5rem] rounded-sm">
        <div className="bg-green-800 w-[2rem] h-full flex items-center justify-center rounded-l-sm mr-3">
          <CircleAlert size={18} />
        </div>
        <p>{children}</p>
      </div>
    </div>
  );
};

export default SuccessAlert;
