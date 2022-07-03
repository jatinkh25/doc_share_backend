import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import Room from "./data/schema.js";
import dotenv from "dotenv";

dotenv.config();
mongoose.connect(process.env.MONGODB_URI);

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

httpServer.listen(process.env.PORT || 3001);

io.on("connection", (socket) => {
  socket.on("get-room", async (roomId) => {
    const room = await findOrCreateRoom(roomId);
    socket.join(roomId);
    socket.emit("load-document", room.data);
    socket.on("send-changes", (delta) => {
      socket.broadcast.to(roomId).emit("recieve-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await Room.findByIdAndUpdate(roomId, { data });
    });
  });
});

const defaultValue = "";
const findOrCreateRoom = async (roomId) => {
  if (roomId == null) return;

  const room = await Room.findById(roomId);
  if (room) return room;

  return await Room.create({ _id: roomId, data: defaultValue });
};
