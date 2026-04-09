import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import dotenv from "dotenv";
import { io, onlineUsers, activeChats } from "../server.js";

dotenv.config({ quiet: true });

function getSocketId(userId) {
  return onlineUsers[userId];
}

export const getAllChats = async (req, res) => {
  try {
    const user = await User.findById(req.id);
    if (!user || !user.connectedUsers) {
      return res.status(200).json({
        success: true,
        allUsers: [],
      });
    }

    const conversation = await Conversation.findById(user.connectedUsers)
      .populate("participants.user", "username profilePhoto");

    if (!conversation) {
      return res.status(200).json({
        success: true,
        allUsers: [],
      });
    }

    return res.status(200).json({
      success: true,
      allUsers: conversation.participants,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const addUser = async (req, res) => {
  try {
    const userId = req.id;
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number required",
      });
    }

    const newUser = await User.findOne({ phoneNumber });
    if (!newUser || newUser._id.equals(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user",
      });
    }

    const user = await User.findById(userId);
    let conversation = await Conversation.findById(user.connectedUsers);

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [{ user: newUser._id, newMsgCount: 0 }],
        allMessages: [],
      });
      user.connectedUsers = conversation._id;
      await user.save();
    } else {
      const exists = conversation.participants.some(
        p => p.user.toString() === newUser._id.toString()
      );
      if (exists) {
        return res.status(200).json({
          success: true,
          message: "User already added",
        });
      }
      conversation.participants.push({
        user: newUser._id,
        newMsgCount: 0,
      });
      await conversation.save();
    }

    return res.status(200).json({
      success: true,
      newUser: {
        _id: newUser._id,
        username: newUser.username,
        profilePhoto: newUser.profilePhoto,
      },
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { message } = req.body;

    if (!message || senderId === receiverId) {
      return res.status(400).json({ success: false });
    }

    const isChatOpen = activeChats[receiverId]?.toString() === senderId.toString();

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
      status: isChatOpen ? "seen" : "sent"
    });

    const sender = await User.findById(senderId).select("-password");
    let senderConv = await Conversation.findById(sender.connectedUsers);

    if (!senderConv) {
      senderConv = await Conversation.create({
        participants: [{ user: receiverId, newMsgCount: 0 }],
        allMessages: [],
      });
      sender.connectedUsers = senderConv._id;
    }

    senderConv.allMessages.push(newMessage._id);
    await senderConv.save();
    await sender.save();

    const receiver = await User.findById(receiverId);
    let receiverConv = await Conversation.findById(receiver.connectedUsers);

    let receiverNewMsgCount = 0;

    if (!receiverConv) {
      receiverConv = await Conversation.create({
        participants: [{ user: senderId, newMsgCount: isChatOpen ? 0 : 1 }],
        allMessages: [newMessage._id],
      });
      receiver.connectedUsers = receiverConv._id;
      io.to(getSocketId(receiverId)).emit("New_Chat", sender);
      receiverNewMsgCount = isChatOpen ? 0 : 1;
    } else {
      receiverConv.allMessages.push(newMessage._id);

      const participant = receiverConv.participants.find(
        (p) => p.user.toString() === senderId.toString()
      );

      if (participant) {
        if (!isChatOpen) {
          participant.newMsgCount += 1;
        }
        receiverNewMsgCount = participant.newMsgCount;
      } else {
        receiverConv.participants.push({
          user: senderId,
          newMsgCount: isChatOpen ? 0 : 1,
        });
        receiverNewMsgCount = isChatOpen ? 0 : 1;
      }
      io.to(getSocketId(receiverId)).emit("New_Chat", sender);
    }

    await receiverConv.save();
    await receiver.save();

    io.to(getSocketId(receiverId)).emit("Msg_from_sender", newMessage);

    if (isChatOpen) {
      io.to(getSocketId(senderId)).emit("Message_seen_instantly", { 
        messageId: newMessage._id 
      });
    }

    if (!isChatOpen) {
      io.to(getSocketId(receiverId)).emit("New_Msg_Count", {
        _id: senderId,
        newMsgCount: receiverNewMsgCount, 
      });
    }

    return res.json({ success: true, newMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

export const getAllMessage = async (req, res) => {
  try {
    const sender = await User.findById(req.id);
    if (!sender || !sender.connectedUsers) {
      return res.status(200).json({
        success: true,
        messages: [],
      });
    }

    const conversation = await Conversation.findById(sender.connectedUsers)
      .populate("allMessages");

    const messages = conversation.allMessages.filter(
      msg =>
        (msg.senderId.equals(req.id) && msg.receiverId.equals(req.params.id)) ||
        (msg.senderId.equals(req.params.id) && msg.receiverId.equals(req.id))
    );

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const user = await User.findById(req.id);
    if (!user || !user.connectedUsers) {
      return res.status(400).json({
        success: false,
        message: "No conversation",
      });
    }

    const messages = await Message.find({
      $or: [
        { senderId: req.id, receiverId: req.params.id },
        { senderId: req.params.id, receiverId: req.id },
      ],
    }).select("_id");

    await Conversation.findByIdAndUpdate(user.connectedUsers, {
      $pull: {
        participants: { user: req.params.id },
        allMessages: { $in: messages.map(m => m._id) },
      },
    });

    return res.status(200).json({
      success: true,
      deleteUserId: req.params.id,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};

export const setMsgCountZero = async (req, res) => {
  try {
    const userId = req.id;
    const targetId = req.params.id;

    const user = await User.findById(userId);
    if (!user || !user.connectedUsers) {
      return res.status(400).json({
        success: false,
        message: "No conversation found",
      });
    }

    const conversation = await Conversation.findById(user.connectedUsers);
    if (!conversation) {
      return res.status(400).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const participant = conversation.participants.find(
      (p) => p.user.toString() === targetId
    );

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Participant not found",
      });
    }

    participant.newMsgCount = 0;
    await conversation.save();

    return res.status(200).json({
      success: true,
      message: "Message count reset to 0",
      userId: targetId,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const markMessagesAsSeen = async (req, res) => {
  try {
    const receiverId = req.id; 
    const senderId = req.params.id; 

    const updated = await Message.updateMany(
      { senderId, receiverId, status: { $ne: "seen" } }, 
      { status: "seen" }
    );

    io.to(getSocketId(senderId)).emit("Messages_marked_seen", { 
      receiverId,
      senderId 
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
};

