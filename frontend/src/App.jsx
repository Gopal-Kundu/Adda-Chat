import React, { useEffect, useState, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { baseurl } from "../address/address";
import { setOnlineUsers } from "../redux/socketSlice";
import UpdateProfilePage from "./pages/UpdateProfilePage";
import axios from "axios";
import { setUser } from "../redux/authSlice";
import {
  increaseMsg,
  setAllMsgs,
  setChats,
  setGroupAllMsgs,
  setGroupMsg,
  setGroupMsgToZero,
  setGroups,
  setMsg,
  setNewChat,
  setNewGroup,
  setNewMsgCount,
  updateMessagesToSeen,
  updateSingleMessageToSeen
} from "../redux/chatSlice";
import { RightSideBar } from "./components/RightSideBar";
import LoadingPage from "./pages/LoadingPage";
import { GroupChatPage } from "./pages/GroupChatPage";

export let socket;

const App = () => {
  const user = useSelector((store) => store.auth.user);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  useEffect(() => {
    const remember = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${baseurl}/remember`, {
          withCredentials: true,
        });

        if (res.data.success) {
          dispatch(setUser(res.data.user));
          dispatch(setAllMsgs(res.data.allMessages));
          dispatch(setChats(res.data.participants));
          dispatch(setGroups(res.data.allGroups));
          dispatch(setGroupAllMsgs(res.data.allGroupMessages));
        }
      } catch (err) {
        console.error("No active session");
      } finally {
        setLoading(false);
      }
    };

    remember();
  }, [dispatch]);

  useEffect(() => {
    if (!user) return;

    socketRef.current = io(baseurl);
    socket = socketRef.current;

    socket.emit("Connect me", user._id);

    const handleOnline = (data) => dispatch(setOnlineUsers(data));

    socket.on("Connected users", handleOnline);
    socket.on("Disconnected users", handleOnline);

    return () => {
      socket.off("Connected users", handleOnline);
      socket.off("Disconnected users", handleOnline);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, dispatch]);

  useEffect(() => {
    if (!socket || !user) return;

    const handleIncomingMessage = (msg) => dispatch(setMsg(msg));

    const handleIncomingChat = (chat) => dispatch(setNewChat({ user: chat }));

    const handleNewMsgCount = (data) => dispatch(setNewMsgCount(data));

    const handleGroupMsg = (data) => dispatch(setGroupMsg(data));

    const handleCreateGroup = (data) => {
      if (data.members.includes(user._id)) {
        dispatch(setNewGroup(data));
      }
    };

    const handleIncreaseGroupCount = (data) => {
      if (data.members.includes(user._id)) {
        dispatch(increaseMsg(data));
      }
    };

    const handleMessagesSeen = (data) => dispatch(updateMessagesToSeen(data));

    const handleInstantlySeen = (data) => dispatch(updateSingleMessageToSeen(data));

    socket.on("Messages_marked_seen", handleMessagesSeen);
    socket.on("Message_seen_instantly", handleInstantlySeen);
    socket.on("Msg_from_sender", handleIncomingMessage);
    socket.on("New_Chat", handleIncomingChat);
    socket.on("New_Msg_Count", handleNewMsgCount);
    socket.on("group-msg", handleGroupMsg);
    socket.on("create-group", handleCreateGroup);
    socket.on("new_group_Msg", handleIncreaseGroupCount);

    return () => {
      socket.off("Messages_marked_seen", handleMessagesSeen);
      socket.off("Message_seen_instantly", handleInstantlySeen);
      socket.off("Msg_from_sender", handleIncomingMessage);
      socket.off("New_Chat", handleIncomingChat);
      socket.off("New_Msg_Count", handleNewMsgCount);
      socket.off("group-msg", handleGroupMsg);
      socket.off("create-group", handleCreateGroup);
      socket.off("new_group_Msg", handleIncreaseGroupCount);
    };
  }, [user, dispatch]);

  if (loading) return <LoadingPage />;

  return (
    <div className="bg-black">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/chat/:id" element={<RightSideBar />} />
        <Route path="/group-chat/:id" element={<GroupChatPage />} />
        <Route path="/profile" element={<UpdateProfilePage />} />
        <Route path="/profile/:id" element={<UpdateProfilePage />} />
      </Routes>
    </div>
  );
};

export default App;