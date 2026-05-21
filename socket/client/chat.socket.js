const Chat = require("../../models/chat.model");
const User = require("../../models/user.model");

module.exports = (socket) => {
  socket.on("client_send_message", async (data) => {
    const chat = new Chat({
      user_id: data.user_id,
      content: data.content,
      images: data.images || [],
      type: data.images && data.images.length > 0 ? "images" : (data.type || "text"),
    });
    await chat.save();

    const infoUser = await User.findOne({ _id: data.user_id }).select("fullName");

    _io.emit("server_send_message", {
      userId: data.user_id,
      fullName: infoUser.fullName,
      content: data.content,
      images: data.images || [],
      type: data.images && data.images.length > 0 ? "images" : (data.type || "text"),
    });
  });

  // Typing indicator
  socket.on("client_typing", async (data) => {
    const infoUser = await User.findOne({ _id: data.user_id }).select("fullName");
    socket.broadcast.emit("server_typing", {
      userId: data.user_id,
      fullName: infoUser ? infoUser.fullName : "Ai đó",
      typing: data.typing,
    });
  });
};
