import React from "react";
import defaultImg from "../assets/defaultUser.png";
import { Clock, Check } from "lucide-react";

function GroupMessage({
  user,
  text,
  createdAt,
  senderName,
  senderLogo,
  status,
}) {
  const time = new Date(createdAt).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isMe = user === "true";

  return (
    <div
      className={`select-none flex my-1 ${
        isMe ? "mr-10 justify-end" : "ml-10 justify-start"
      }`}
    >
      <div
        className={`flex gap-2 max-w-[70%] ${
          isMe ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <img
          src={senderLogo || defaultImg}
          alt={senderName}
          className="w-9 h-9 rounded-full object-cover shrink-0"
        />

        <div
          className={`comic text-white rounded-2xl tracking-wider p-4 transition-opacity duration-300 ${
            isMe ? "bg-green-700" : "bg-purple-500"
          } ${status === "sending" ? "opacity-70" : "opacity-100"}`}
        >
          <p className="text-sm font-semibold mb-1 opacity-90">
            {senderName}
          </p>

          <p className="text-lg">{text}</p>

          <div className="flex justify-end items-center gap-1 mt-1 text-xs text-gray-200 text-right">
            <p>{time}</p>
            {isMe && (
              <span className="flex items-center ml-1 text-gray-300">
                {status === "sending" ? (
                  <Clock size={13} strokeWidth={2} />
                ) : (
                  <Check size={15} strokeWidth={2.5} />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupMessage;