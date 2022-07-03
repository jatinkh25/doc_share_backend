import mongoose from "mongoose";
const { Schema, model } = mongoose;

const Room = new Schema({
  _id: String,
  data: Object,
});

export default model("Room", Room);
