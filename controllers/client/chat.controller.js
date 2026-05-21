const Chat = require("../../models/chat.model");
const User = require("../../models/user.model");
const uploadToCloudinary = require("../../helper/uploadToCloudinary");
let chatSocketSetup = false;

//[GET] /chat
module.exports.index = async (req, res) => {
  if (!chatSocketSetup) {
    _io.on("connection", (socket) => {
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

// [POST] /chat/upload
module.exports.upload = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.json({ images: [] });
    }

    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer, "chats")
    );
    const results = await Promise.all(uploadPromises);
    const imageUrls = results.map((result) => result.secure_url);

    res.json({ images: imageUrls });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
};

