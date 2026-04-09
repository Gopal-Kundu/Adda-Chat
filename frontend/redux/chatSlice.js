import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chats",
  initialState: {
    chats: [],
    msgContainer: [], //For Normal Chats

    groups: [],
    groupMsgContainer: [] //For Group Chats
  },
  reducers: {
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    setAllMsgs: (state, action) => {
      state.msgContainer = action.payload;
    },
    setMsg: (state, action) => {
      state.msgContainer.push(action.payload);
    },
    setNewChat: (state, action) => {
      const user = action.payload.user ?? action.payload;

      const exists = state.chats.find(
        (chat) => chat.user._id === user._id
      );

      if (!exists) {
        state.chats.push({
          user,
          newMsgCount: 0,
        });
      }
    },

    deleteUser: (state, action) => {
      state.chats = state.chats.filter(
        (chat) => chat.user._id !== action.payload
      );

      state.msgContainer = state.msgContainer.filter(
        msg => msg.senderId !== action.payload && msg.receiverId !== action.payload
      );
    },
    setNewMsgCount: (state, action) => {
      const chat = state.chats.find(
        (u) => u.user._id === action.payload._id
      );
      if (chat) {
        chat.newMsgCount = action.payload.newMsgCount;
      }

    },
    setNewMsgCountToZero: (state, action) => {
      const chat = state.chats.find(
        (u) => u.user._id === action.payload._id
      );
      if (chat) {
        chat.newMsgCount = 0;
      }

    },



    //Groups
    setGroups: (state, action) => {
      state.groups = action.payload;
    },
    setGroupAllMsgs: (state, action) => {
      state.groupMsgContainer = action.payload;
    },
    setGroupMsg: (state, action) => {
      const { groupId, message } = action.payload;
      const group = state.groupMsgContainer.find(
        (g) => String(g.groupId) === String(groupId)
      );
      if (!group) return;
      const exists = group.messages.some(
        (msg) => String(msg._id) === String(message._id)
      );
      if (!exists) {
        group.messages.push(message);
      }
    },
    setNewGroup: (state, action) => {
      const exists = state.groups.find(
        (g) => String(g._id) === String(action.payload._id)
      );
      if (!exists) {
        state.groups.push({
          ...action.payload,
          count: action.payload.count || 0
        });
      }
      const msgContainerGroupExist = state.groupMsgContainer.find(
        (g) => String(g.groupId) === String(action.payload._id)
      );
      if (!msgContainerGroupExist) {
        state.groupMsgContainer.push({
          groupId: action.payload._id,
          messages: [],
        });
      }
    },

    deleteGroup: (state, action) => {
      const groupId = action.payload;
      state.groups = state.groups.filter(
        (g) => String(g._id) !== String(groupId)
      );
      state.groupMsgContainer = state.groupMsgContainer.filter(
        (g) => String(g.groupId) !== String(groupId)
      );
    },

    increaseMsg: (state, action) => {
      let group = state.groups.find((perGroup) => String(perGroup._id) === String(action.payload.groupId));

      if (group) {
        group.count = (group.count || 0) + 1;
      }
    },
    setGroupMsgToZero: (state, action) => {
      let group = state.groups.find((perGroup) => String(perGroup._id) === String(action.payload.groupId));
      if (group) {
        group.count = 0;
      }
    },

    updateMessagesToSeen: (state, action) => {
      state.msgContainer.forEach((msg) => {
        if (String(msg.receiverId) === String(action.payload.receiverId)) {
          msg.status = "seen";
        }
      });
    },

    updateMessagesToSeen: (state, action) => {
      state.msgContainer.forEach((msg) => {
        if (
          String(msg.receiverId) === String(action.payload.receiverId) &&
          String(msg.senderId) === String(action.payload.senderId) &&
          msg.status !== "seen"
        ) {
          msg.status = "seen";
        }
      });
    },
  }
});

export const { setChats, updateMessagesToSeen, updateSingleMessageToSeen, setGroupMsgToZero, setMsg, setAllMsgs, deleteGroup, setNewChat, deleteUser, setNewGroup, setGroupMsg, setGroupAllMsgs, setGroups, setNewMsgCount, setNewMsgCountToZero, increaseMsg } = chatSlice.actions;
export default chatSlice.reducer;
