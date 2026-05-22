const User = require("../../models/user.model");

// [GET] /users/notFriend
module.exports.notFriend = async (req, res) => {
  const user_id = res.locals.currentUser.id;

  // Lấy ra danh sách người dùng chưa kết bạn
  const requestFriend = res.locals.currentUser.requestFriend || [];
  const acceptFriend = res.locals.currentUser.acceptFriend || [];
  const listFriend = res.locals.currentUser.listFriend || [];

  // ID của những người đã là bạn bè
  const friendIds = listFriend.map((friend) => friend.user_id);

  // Loại trừ: chính mình, những người đã là bạn bè, và những người đã gửi lời mời cho mình
  const users = await User.find({
    _id: {
      $ne: user_id,
      $nin: [...friendIds, ...acceptFriend],
    },
    status: "active",
    deleted: false,
  }).select("fullName avatar");

  res.render("client/pages/users/notFriend", {
    TitlePage: "Danh sách người dùng",
    users: users,
  });
};

// [GET] /users/accept
module.exports.accept = async (req, res) => {
  const acceptFriend = res.locals.currentUser.acceptFriend || [];

  // Tìm danh sách người dùng đã gửi lời mời kết bạn cho A
  const users = await User.find({
    _id: { $in: acceptFriend },
    status: "active",
    deleted: false,
  }).select("fullName avatar");

  res.render("client/pages/users/accept", {
    TitlePage: "Lời mời kết bạn",
    users: users,
  });
};

// [GET] /users/request
module.exports.request = async (req, res) => {
  const requestFriend = res.locals.currentUser.requestFriend || [];

  // Tìm danh sách người dùng đã gửi lời mời kết bạn cho A
  const users = await User.find({
    _id: { $in: requestFriend },
    status: "active",
    deleted: false,
  }).select("fullName avatar");

  res.render("client/pages/users/request", {
    TitlePage: "Lời mời kết bạn",
    users: users,
  });
};

// [GET] /users/friends
module.exports.friends = async (req, res) => {
  const listFriend = res.locals.currentUser.listFriend || [];
  const friendIds = listFriend.map((friend) => friend.user_id);

  // Tìm danh sách người dùng đã là bạn bè
  const users = await User.find({
    _id: { $in: friendIds },
    status: "active",
    deleted: false,
  }).select("fullName avatar");

  res.render("client/pages/users/friends", {
    TitlePage: "Danh sách bạn bè",
    users: users,
  });
};
