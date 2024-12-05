import { Conversation } from "../models/consversation.model.js";
import { Message } from "../models/message.models.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async () => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { message } = req.body;
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });
    // establish the conversation if not started yet
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }
    const newMessage = await Message.create({ senderId, receiverId, message });
    if (newMessage) conversation.messages.push(newMessage._id);
    await Promise.all([conversation.save() ,newMessage.save()])

    // implement socket.io for real time data transfer
    const receiversocketId = getReceiverSocketId(receiverId);
    if (receiversocketId) {
      io.to(receiversocketId).emit("newMessage", newMessage);
    }


    return res.status(201).json({
        success:true,
        newMessage
    })
  } catch (error) {
    console.log(error, "Error while sending a message");
  }
};

export const getMessage = async () => {
    try {
        const senderId = req.id
        const receiverId = req.params.id
        const conversation = await Conversation.findOne({
            participants:{$all :[senderId ,receiverId]}
        })
        if(!conversation) {
            return res.status(200).json({success:true, messages :[]})
        }
        return res.status(200).json({success:true ,messages:conversation?.messages})
    } catch (error) {
        console.log(error , "Error during getting the messages")
    }
}
