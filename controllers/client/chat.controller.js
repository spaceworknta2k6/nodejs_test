const Chat = require("../../models/chat.model");
const User = require("../../models/user.model");
let chatSocketSetup = false;

//[GET] /chat
module.exports.index = async (req, res) => {
  if (!chatSocketSetup) {
    _io.on("connection", (socket) => {
      socket.on("client_send_message", async (data) => {
        const chat = new Chat({
          user_id: data.user_id,
          content: data.content,
        });
        await chat.save();

        const infoUser = await User.findOne({ _id: data.user_id }).select("fullName");

        _io.emit("server_send_message", {
          userId: data.user_id,
          fullName: infoUser.fullName,
          content: data.content,
        });
      });
    });
    chatSocketSetup = true;
  }
  //   end socket io

  const chats = await Chat.find({
    deleted: false,
  });
  for (const chat of chats) {
    const infoUser = await User.findOne({
      _id: chat.user_id,
    }).select("fullName");
    chat.infoUser = infoUser;
  }

  res.render("client/pages/chat/index", {
    TitlePage: "Chat",
    chats: chats,
  });
};
