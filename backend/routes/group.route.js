import express from "express";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { upload } from "../middleware/multer.js";
import { createGroup, deleteGroupFromUser, getGroupDetails, resetGroupMsgCount, sendGroupMessage } from "../controllers/group.controller.js";

const groupRouter = express.Router();
groupRouter.post("/group/create", isAuthenticated, upload.single("logo"), createGroup);
groupRouter.post("/send-msg-to-group/:groupId", isAuthenticated, sendGroupMessage);
groupRouter.get("/delete-group/:groupId", isAuthenticated, deleteGroupFromUser);
groupRouter.get("/set-group-msg-to-zero/:groupId", isAuthenticated, resetGroupMsgCount);
groupRouter.get("/group/:id", isAuthenticated, getGroupDetails);
export default groupRouter;
