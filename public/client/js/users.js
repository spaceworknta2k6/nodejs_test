// Client-side Friend Requests Handling

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

      // Emit socket event
      if (socket) {
        socket.emit("client_cancel_friend", userIdB);
      }
    });
  });
}
// ==================== END CANCEL FRIEND REQUEST ====================
