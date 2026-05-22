// Client-side Friend Requests Handling

// ==================== HELPER: SHOW CLIENT ALERT ====================
const showAlert = (message, type = 'success', duration = 3000) => {
  // Create alert container
  const alertDiv = document.createElement("div");
  alertDiv.className = `client-alert client-alert--${type}`;
  alertDiv.dataset.time = duration;

  // Add text span
  const textSpan = document.createElement("span");
  textSpan.className = "client-alert__text";
  textSpan.textContent = message;
  alertDiv.appendChild(textSpan);

  // Add close button
  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "client-alert__close";
  closeBtn.setAttribute("aria-label", "Đóng thông báo");
  closeBtn.innerHTML = "&times;";
  alertDiv.appendChild(closeBtn);

  // Add to body
  document.body.appendChild(alertDiv);

  // Trigger show animation in the next frame
  requestAnimationFrame(() => {
    alertDiv.classList.add("show");
  });

  // Handle close action
  const closeAlert = () => {
    alertDiv.classList.remove('show');
    window.setTimeout(() => alertDiv.remove(), 250);
  };

  closeBtn.addEventListener('click', closeAlert);

  if (duration > 0) {
    window.setTimeout(closeAlert, duration);
  }
};

// ==================== ADD FRIEND ====================
const listBtnAddFriend = document.querySelectorAll(".btn-add-friend");
if (listBtnAddFriend.length > 0) {
  listBtnAddFriend.forEach((btn) => {
    btn.addEventListener("click", () => {
      const userIdB = btn.getAttribute("data-user-id");
      const cardActions = btn.closest(".user-card__actions");
      if (!cardActions) return;

      // Toggle UI instantly for a responsive feeling
      btn.classList.add("d-none");
      const btnCancel = cardActions.querySelector(".btn-cancel-friend");
      if (btnCancel) {
        btnCancel.classList.remove("d-none");
      }

      // Show success notification
      showAlert("Đã gửi yêu cầu kết bạn!");

      // Emit socket event to update the database
      if (socket) {
        socket.emit("client_add_friend", userIdB);
      }
    });
  });
}
// ==================== END ADD FRIEND ====================

// ==================== CANCEL FRIEND REQUEST ====================
const listBtnCancelFriend = document.querySelectorAll(".btn-cancel-friend");
if (listBtnCancelFriend.length > 0) {
  listBtnCancelFriend.forEach((btn) => {
    btn.addEventListener("click", () => {
      const userIdB = btn.getAttribute("data-user-id");
      const cardActions = btn.closest(".user-card__actions");
      if (!cardActions) return;

      // Toggle UI instantly
      btn.classList.add("d-none");
      const btnAdd = cardActions.querySelector(".btn-add-friend");
      if (btnAdd) {
        btnAdd.classList.remove("d-none");
      }

      // Nếu ở trang Lời mời đã gửi (/users/request), ẩn cả card của user đó đi
      const userCard = btn.closest(".user-card");
      if (userCard && window.location.pathname === "/users/request") {
        userCard.classList.add("d-none");
      }

      // Show success notification
      showAlert("Đã hủy yêu cầu kết bạn!");

      // Emit socket event
      if (socket) {
        socket.emit("client_cancel_friend", userIdB);
      }
    });
  });
}
// ==================== END CANCEL FRIEND REQUEST ====================

// ==================== REFUSE FRIEND REQUEST ====================
const listBtnRefuseFriend = document.querySelectorAll(".btn-refuse-friend");
if (listBtnRefuseFriend.length > 0) {
  listBtnRefuseFriend.forEach((btn) => {
    btn.addEventListener("click", () => {
      const userIdB = btn.getAttribute("data-user-id");
      const cardActions = btn.closest(".user-card__actions");
      if (!cardActions) return;

      // Xử lý giao diện ngay lập tức
      const userCard = btn.closest(".user-card");
      if (userCard) {
        userCard.classList.add("d-none"); // Hoặc dùng userCard.remove();
      }

      // Show success notification
      showAlert("Đã từ chối lời mời kết bạn!");

      // Emit socket event
      if (socket) {
        socket.emit("client_refuse_friend", userIdB);
      }
    });
  });
}
// ==================== END REFUSE FRIEND REQUEST ====================

// ==================== ACCEPT FRIEND REQUEST ====================
const listBtnAcceptFriend = document.querySelectorAll(".btn-accept-friend");
if (listBtnAcceptFriend.length > 0) {
  listBtnAcceptFriend.forEach((btn) => {
    btn.addEventListener("click", () => {
      const userIdB = btn.getAttribute("data-user-id");
      const cardActions = btn.closest(".user-card__actions");
      if (!cardActions) return;

      // Xử lý giao diện ngay lập tức
      const userCard = btn.closest(".user-card");
      if (userCard) {
        userCard.classList.add("d-none"); // Ẩn thẻ sau khi chấp nhận thành công
      }

      // Show success notification
      showAlert("Đã chấp nhận lời mời kết bạn!");

      // Emit socket event
      if (socket) {
        socket.emit("client_accept_friend", userIdB);
      }
    });
  });
}
// ==================== END ACCEPT FRIEND REQUEST ====================

// ==================== UNFRIEND ====================
const listBtnUnfriend = document.querySelectorAll(".btn-unfriend");
if (listBtnUnfriend.length > 0) {
  listBtnUnfriend.forEach((btn) => {
    btn.addEventListener("click", () => {
      const userIdB = btn.getAttribute("data-user-id");
      const cardActions = btn.closest(".user-card__actions");
      if (!cardActions) return;

      // Xử lý giao diện ngay lập tức
      const userCard = btn.closest(".user-card");
      if (userCard) {
        userCard.classList.add("d-none"); // Ẩn thẻ bạn bè đó ngay lập tức
      }

      // Show success notification
      showAlert("Hủy kết bạn thành công!");

      // Emit socket event
      if (socket) {
        socket.emit("client_unfriend", userIdB);
      }
    });
  });
}
// ==================== END UNFRIEND ====================
