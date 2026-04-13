import mongoose from "mongoose";
import { uploadToCloudinary } from "../configs/fileToCloudinary.js";
import { Group } from "../models/group.model.js";
import { User } from "../models/user.model.js";
import { activeGroupChats, io, onlineUsers } from "../server.js";

export const createGroup = async (req, res) => {
  try {
    let { groupName, members } = req.body;
    let logo;
    const adminId = req.id;

    if (!groupName) {
      return res.status(400).json({
        success: false,
        message: "Group name is required",
      });
    }

    if (!members) {
      return res.status(400).json({
        success: false,
        message: "Members are required",
      });
    }

    if (req.file) {
      logo = await uploadToCloudinary(req.file);
    }

    const newGroup = await Group.create({
      groupName,
      logo,
      members,
      admins: [adminId],
    });

    await User.updateMany(
      { _id: { $in: members } },
      {
        $addToSet: {
          joinedGroups: {
            groups: newGroup._id,
            newMsgCount: 0
          }
        }
      }
    );
    io.emit("create-group", newGroup);
    return res.status(201).json({
      success: true,
      message: "Group created successfully",
      group: newGroup,
    });
  } catch (error) {
    console.error("Create Group Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const { message } = req.body;
    const groupId = req.params.groupId;

    if (!senderId || !message || !groupId) {
      return res.status(400).json({ success: false, message: "Missing info" });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: "Group not found" });

    group.messages.push({ senderId, message });
    await group.save();

    await group.populate({
      path: "messages.senderId",
      select: "_id username profilePhoto",
    });

    const resMsg = group.messages[group.messages.length - 1];

    const membersToUpdate = group.members
      .map(id => id.toString())
      .filter(userId => 
        userId !== senderId.toString() && !activeGroupChats.has(userId)
      );

    if (membersToUpdate.length > 0) {
      await User.updateMany(
        {
          _id: { $in: membersToUpdate },
          "joinedGroups.groups": groupId,
        },
        {
          $inc: { "joinedGroups.$.newMsgCount": 1 },
        }
      );
    }

    io.emit("group-msg", { groupId, message: resMsg });
    io.emit("new_group_Msg", { members: membersToUpdate, groupId });

    return res.status(200).json({ success: true, info: { groupId, message: resMsg } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteGroupFromUser = async (req, res) => {
  try {
    const userId = req.id;
    const { groupId } = req.params;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: "Group ID is required",
      });
    }
    await User.findByIdAndUpdate(userId, {
      $pull: {
        joinedGroups: { groups: groupId }
      }
    });

    const group = await Group.findByIdAndUpdate(
      groupId,
      {
        $pull: {
          members: userId,
          admins: userId,
        },
      },
      { new: true }
    );

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    if (group.admins.length === 0 && group.members.length > 0) {
      group.admins.push(group.members[0]);
      await group.save();
    }

    return res.status(200).json({
      success: true,
      message: "Group removed from user successfully",
      groupId,
      newAdmin: group.admins[0] || null,
    });

  } catch (error) {
    console.error("Delete Group Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const resetGroupMsgCount = async (req, res) => {
  try {
    const userId = req.id;
    const groupId = req.params.groupId;

    if (!userId || !groupId) {
      return res.status(400).json({
        success: false,
        message: "UserId or GroupId missing",
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        "joinedGroups.groups": groupId, 
      },
      {
        $set: { "joinedGroups.$.newMsgCount": 0 }, 
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Group not found in user's joinedGroups",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Group message count reset successfully",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}


export const getGroupDetails = async (req, res) => {
  try {
    const groupId = req.params.id;
    
    const group = await Group.findById(groupId)
      .populate("members", "_id username profilePhoto about")
      .populate("admins", "_id");

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    return res.status(200).json({
      success: true,
      group,
    });
  } catch (error) {
    console.error("Fetch Group Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


function getSocketId(userId) {
  return onlineUsers[userId];
}
