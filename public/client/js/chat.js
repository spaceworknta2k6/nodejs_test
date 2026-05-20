// client send messege
const inputChat = document.querySelector(".chat-input");
const btnSend = document.querySelector(".chat-btn-send");

if (inputChat && btnSend) {
  btnSend.addEventListener("click", () => {
    const message = inputChat.value;
    if (message.trim()) {
      // Đọc id của user hiện tại từ thuộc tính data-user-id đã gài trên giao diện
      const userId = document
        .querySelector(".chat-container")
        .getAttribute("data-user-id");

      socket.emit("client_send_message", {
        content: message,
        user_id: userId,
      });
      inputChat.value = "";
    }
  });

  inputChat.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      btnSend.click();
    }
  });
}
// end client send messege

// server send messege
socket.on("server_send_message", (data) => {
  const currentUserId = document.querySelector(".chat-container").getAttribute("data-user-id");
  const chatMessages = document.querySelector(".chat-messages");

  const div = document.createElement("div");
  const isMe = data.userId === currentUserId;
  
  div.classList.add("message");
  div.classList.add(isMe ? "message-outgoing" : "message-incoming");

  div.innerHTML = `
    <img class="chat-avatar message-avatar" src="https://ui-avatars.com/api/?name=${data.fullName}&background=random&color=fff" alt="${data.fullName}" title="${data.fullName}">
    <div class="message-content">
        <div class="inner-name">${data.fullName}</div>
        <div class="message-bubble">${data.content}</div>
    </div>
  `;

  chatMessages.appendChild(div);
  
  // Tự động cuộn xuống dưới cùng với hiệu ứng mượt (smooth scroll)
  chatMessages.scrollTo({
    top: chatMessages.scrollHeight,
    behavior: "smooth"
  });
});
// end server send messege

// Scroll to bottom on load with smooth effect too
const chatMessagesDOM = document.querySelector(".chat-messages");
if (chatMessagesDOM) {
  // Use timeout to let the DOM settle, so smooth scroll works better
  setTimeout(() => {
    chatMessagesDOM.scrollTo({
      top: chatMessagesDOM.scrollHeight,
      behavior: "smooth"
    });
  }, 100);
}
