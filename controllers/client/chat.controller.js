const Chat = require("../../models/chat.model");
const User = require("../../models/user.model");
const uploadToCloudinary = require("../../helper/uploadToCloudinary");
//[GET] /chat
module.exports.index = async (req, res) => {

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

