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

  // Khi A từ chối/hủy yêu cầu kết bạn của B gửi tới
  socket.on("client_refuse_friend", async (userIdB) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie);
      const token = cookies.userToken;
      if (!token) return;

      const userA = await User.findOne({ token, deleted: false, status: "active" });
      if (!userA) return;

      const userIdA = userA.id;

      // Xóa B khỏi acceptFriend của A
      await User.updateOne(
        { _id: userIdA },
        { $pull: { acceptFriend: userIdB } }
      );
      // Xóa A khỏi requestFriend của B
      await User.updateOne(
        { _id: userIdB },
        { $pull: { requestFriend: userIdA } }
      );
    } catch (error) {
      console.error("client_refuse_friend socket error:", error);
    }
  });

  // Khi A chấp nhận yêu cầu kết bạn của B
  socket.on("client_accept_friend", async (userIdB) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie);
      const token = cookies.userToken;
      if (!token) return;

      const userA = await User.findOne({ token, deleted: false, status: "active" });
      if (!userA) return;

      const userIdA = userA.id;

      // 1. Thêm B vào listFriend của A, xóa B khỏi acceptFriend của A
      await User.updateOne(
        { _id: userIdA },
        {
          $push: { listFriend: { user_id: userIdB } },
          $pull: { acceptFriend: userIdB }
        }
      );

      // 2. Thêm A vào listFriend của B, xóa A khỏi requestFriend của B
      await User.updateOne(
        { _id: userIdB },
        {
          $push: { listFriend: { user_id: userIdA } },
          $pull: { requestFriend: userIdA }
        }
      );
    } catch (error) {
      console.error("client_accept_friend socket error:", error);
    }
  });

  // Khi A huỷ kết bạn với B
  socket.on("client_unfriend", async (userIdB) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie);
      const token = cookies.userToken;
      if (!token) return;

      const userA = await User.findOne({ token, deleted: false, status: "active" });
      if (!userA) return;

      const userIdA = userA.id;

      // 1. Xóa B khỏi listFriend của A
      await User.updateOne(
        { _id: userIdA },
        { $pull: { listFriend: { user_id: userIdB } } }
      );

      // 2. Xóa A khỏi listFriend của B
      await User.updateOne(
        { _id: userIdB },
        { $pull: { listFriend: { user_id: userIdA } } }
      );
    } catch (error) {
      console.error("client_unfriend socket error:", error);
    }
  });
};
