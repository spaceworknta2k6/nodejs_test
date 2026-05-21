const User = require("../../models/user.model");

// Helper to parse cookies from handshake
const parseCookies = (cookieString) => {
  const list = {};
  if (!cookieString) return list;
  cookieString.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    list[parts.shift().trim()] = decodeURI(parts.join('='));
  });
  return list;
};

module.exports = (socket) => {
  // Khi A gửi yêu cầu cho B
  socket.on("client_add_friend", async (userIdB) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie);
      const token = cookies.userToken;
      if (!token) return;

      const userA = await User.findOne({ token, deleted: false, status: "active" });
      if (!userA) return;

      const userIdA = userA.id;

      // Thêm B vào requestFriend của A
      await User.updateOne(
        { _id: userIdA },
        { $addToSet: { requestFriend: userIdB } }
      );
      // Thêm A vào acceptFriend của B
      await User.updateOne(
        { _id: userIdB },
        { $addToSet: { acceptFriend: userIdA } }
      );
    } catch (error) {
      console.error("client_add_friend socket error:", error);
    }
  });

  // Khi A huỷ yêu cầu gửi cho B
  socket.on("client_cancel_friend", async (userIdB) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie);
      const token = cookies.userToken;
      if (!token) return;

      const userA = await User.findOne({ token, deleted: false, status: "active" });
      if (!userA) return;

      const userIdA = userA.id;

      // Xoá B khỏi requestFriend của A
      await User.updateOne(
        { _id: userIdA },
        { $pull: { requestFriend: userIdB } }
      );
      // Xoá A khỏi acceptFriend của B
      await User.updateOne(
        { _id: userIdB },
        { $pull: { acceptFriend: userIdA } }
      );
    } catch (error) {
      console.error("client_cancel_friend socket error:", error);
    }
  });
};
