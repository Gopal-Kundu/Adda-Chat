import React, { useEffect, useRef } from "react";
import LoadingPage from "../pages/LoadingPage";
import Message from "../components/Message";
import { useSelector, useDispatch } from "react-redux"; 
import { useParams } from "react-router-dom";
import axios from "axios"; 
import { baseurl } from "../../address/address";
import { updateMessagesToSeen } from "../../redux/chatSlice";

function ChatSection({ theirId }) {
  const loading = useSelector((state) => state.auth?.loading);
  const user = useSelector((state) => state.auth?.user);
  const allMsgs = useSelector((state) => state.chat?.msgContainer || []);
  const { id } = useParams();
  const dispatch = useDispatch(); 

  const containerRef = useRef(null);

  const filteredMsgs = allMsgs.filter(
    (msg) =>
      (msg.receiverId === id && msg.senderId === user._id) ||
      (msg.senderId === id && msg.receiverId === user._id)
  );

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }

    const markAsSeen = async () => {
      try {
        await axios.get(`${baseurl}/seen/${theirId}`, {
          withCredentials: true
        });
     
        if (user && theirId) {
          dispatch(updateMessagesToSeen({
            receiverId: user._id, 
            senderId: theirId    
          }));
        }

      } catch (err) {
        console.error("Failed to mark as seen", err);
      }
    };

    if (theirId) markAsSeen();

  }, [filteredMsgs.length, theirId, dispatch, user]);

  return (
    <div ref={containerRef} className="select-none webkit-scrollbar flex-1 overflow-y-auto">
      {loading ? (
        <LoadingPage />
      ) : (
        filteredMsgs.map((msg) => (
          <Message
            key={msg._id}
            user={theirId === msg?.senderId ? "false" : "true"}
            text={msg?.message}
            createdAt={msg?.createdAt}
            status={msg?.status}
          />
        ))
      )}
    </div>
  );
}

export default ChatSection;