import React, { useEffect, useRef } from "react";
import LoadingPage from "../pages/LoadingPage";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import GroupMessage from "./GroupMessage";

function GroupChatSection() {
  const loading = useSelector((state) => state.auth?.loading);
  const userId = useSelector((state) => state.auth?.user)?._id;
  const allMsgs = useSelector(
    (state) => state.chat?.groupMsgContainer || []
  );

  const { id } = useParams();
  const containerRef = useRef(null);

  const groupData = allMsgs.find(
    (g) => String(g.groupId) === String(id)
  );

  const filteredMsgs = groupData?.messages || [];

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [filteredMsgs.length]);

  if (loading) return <LoadingPage />;

  return (
    <div
      ref={containerRef}
      className="select-none webkit-scrollbar flex-1 overflow-y-auto"
    >
      {filteredMsgs.map((msg) => (
        <GroupMessage
          key={msg._id}
          user={msg?.senderId?._id === userId ? "true" : "false"}
          text={msg?.message}
          createdAt={msg?.time}
          senderName={msg?.senderId?.username}
          senderLogo={msg?.senderId?.profilePhoto}
          status={msg?.status || "sent"}
        />
      ))}
    </div>
  );
}

export default GroupChatSection;