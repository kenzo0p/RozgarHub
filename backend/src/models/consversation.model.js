import mongoose, { Mongoose } from "mongoose";

const conversationSchema = new mongoose.Schema({
  participants: [ //this is an array yaha pe senderId and receiverId hain
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
  messages: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Message",
    },
  ],
});
export const Conversation = mongoose.model("Conversation" , conversationSchema)