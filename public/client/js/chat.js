// client send messege
const inputChat = document.querySelector(".chat-input");
const btnSend = document.querySelector(".chat-btn-send");

if (inputChat && btnSend) {
  // Typing indicator - emit typing events
  let typingTimeout = null;
  const userId = document
    .querySelector(".chat-container")
    .getAttribute("data-user-id");

  inputChat.addEventListener("input", () => {
    socket.emit("client_typing", { user_id: userId, typing: true });

    // Clear previous timeout
    if (typingTimeout) clearTimeout(typingTimeout);

    // Stop typing after 2s of inactivity
    typingTimeout = setTimeout(() => {
      socket.emit("client_typing", { user_id: userId, typing: false });
    }, 2000);
  });

  btnSend.addEventListener("click", () => {
    const message = inputChat.value;
    if (message.trim()) {
      socket.emit("client_send_message", {
        content: message,
        user_id: userId,
      });
      inputChat.value = "";

      // Stop typing immediately when message sent
      if (typingTimeout) clearTimeout(typingTimeout);
      socket.emit("client_typing", { user_id: userId, typing: false });
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

// ==================== STICKER PICKER ====================
const stickerData = {
  smileys: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","😊","😇","🥰","😍","🤩","😘","😗","😚","😙","🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🫢","🤫","🤔","🫡","🤐","🤨","😐","😑","😶","🫥","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🥴","😵","🤯","🥳","🥸","😎","🤓","🧐"],
  gestures: ["👋","🤚","🖐️","✋","🖖","🫱","🫲","🫳","🫴","👌","🤌","🤏","✌️","🤞","🫰","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","🫵","👍","👎","✊","👊","🤛","🤜","👏","🙌","🫶","👐","🤲","🤝","🙏","💪","🦾","🦿","🦵","🦶","👂","🦻","👃","🧠","🫀","🫁","🦷","🦴","👀","👁️","👅","👄","🫦","💋"],
  animals: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐻‍❄️","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐒","🐔","🐧","🐦","🐤","🐣","🐥","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🪱","🐛","🦋","🐌","🐞","🐜","🪰","🪲","🪳","🦟","🦗","🕷️","🦂","🐢","🐍","🦎","🦖","🦕","🐙","🦑","🦐","🦞","🦀","🐡","🐠","🐟","🐬","🐳"],
  food: ["🍕","🍔","🍟","🌭","🥪","🌮","🌯","🫔","🥙","🧆","🥚","🍳","🥘","🍲","🫕","🥣","🥗","🍿","🧈","🧂","🥫","🍝","🍜","🍛","🍚","🍙","🍘","🍢","🍡","🍧","🍨","🍦","🥧","🧁","🍰","🎂","🍮","🍭","🍬","🍫","🍩","🍪","🌰","🥜","🍯","🥛","🍼","☕","🫖","🍵","🧃","🥤","🧋","🍶","🍺","🍻","🥂","🍷","🥃","🍸","🍹","🧉","🍾"],
  activities: ["⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱","🪀","🏓","🏸","🏒","🏑","🥍","🏏","🪃","🥅","⛳","🪁","🏹","🎣","🤿","🥊","🥋","🎽","🛹","🛼","🛷","⛸️","🥌","🎿","⛷️","🏂","🪂","🏋️","🤸","🤺","⛹️","🤾","🏌️","🏇","🧘","🏄","🏊","🤽","🚣","🧗","🚵","🚴","🏆","🥇","🥈","🥉","🏅","🎖️","🏵️","🎗️","🎫","🎟️","🎪","🎭","🎨","🎬"],
  travel: ["🚗","🚕","🚙","🚌","🚎","🏎️","🚓","🚑","🚒","🚐","🛻","🚚","🚛","🚜","🏍️","🛵","🛺","🚲","🛴","🚏","🛣️","🛤️","⛽","🚨","🚥","🚦","🛑","🚧","⚓","🛟","⛵","🛶","🚤","🛳️","⛴️","🛥️","🚢","✈️","🛩️","🛫","🛬","🪂","💺","🚁","🚟","🚠","🚡","🛰️","🚀","🛸","🌍","🌎","🌏","🗺️","🧭","🏔️","⛰️","🌋","🗻","🏕️","🏖️","🏜️","🏝️","🏞️"],
  objects: ["💡","🔦","🕯️","🧯","🛢️","💸","💵","💴","💶","💷","🪙","💰","💳","💎","⚖️","🪜","🧰","🪛","🔧","🔨","⚒️","🛠️","⛏️","🪚","🔩","⚙️","🪤","🧱","⛓️","🧲","🔫","💣","🪓","🔪","🗡️","⚔️","🛡️","🚬","⚰️","🪦","⚱️","🏺","🔮","📿","🧿","🪬","💈","⚗️","🔭","🔬","🕳️","🩹","🩺","🩻","🩼","💊","💉","🩸","🧬","🦠","🧫","🧪","🌡️","🧹","🪠"],
  hearts: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❤️‍🔥","❤️‍🩹","❣️","💕","💞","💓","💗","💖","💘","💝","💟","♥️","🫶","😍","🥰","😘","😻","💑","👩‍❤️‍👨","👩‍❤️‍👩","👨‍❤️‍👨","💏","👩‍❤️‍💋‍👨","👩‍❤️‍💋‍👩","👨‍❤️‍💋‍👨","🌹","🥀","💐","🌷","🌺","🏩","💒","💌","🎀","🎁","🍫","🍷","🥂","✨","🌟","⭐","🔥","💫","🫧"]
};

const btnSticker = document.querySelector("#btnSticker");
const stickerPicker = document.querySelector("#stickerPicker");
const stickerGrid = document.querySelector("#stickerGrid");
const stickerTabs = document.querySelectorAll(".sticker-tab");

if (btnSticker && stickerPicker && stickerGrid) {
  // Render stickers for a category
  function renderStickers(category) {
    stickerGrid.innerHTML = "";
    const stickers = stickerData[category] || [];
    stickers.forEach((sticker) => {
      const btn = document.createElement("button");
      btn.className = "sticker-item";
      btn.textContent = sticker;
      btn.addEventListener("click", () => {
        sendSticker(sticker);
      });
      stickerGrid.appendChild(btn);
    });
  }

  // Toggle sticker picker
  btnSticker.addEventListener("click", (e) => {
    e.stopPropagation();
    const isActive = stickerPicker.classList.contains("active");
    stickerPicker.classList.toggle("active");
    btnSticker.classList.toggle("active");
    if (!isActive) {
      renderStickers("smileys");
    }
  });

  // Tab switching
  stickerTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      stickerTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      renderStickers(tab.getAttribute("data-category"));
    });
  });

  // Close picker when clicking outside
  document.addEventListener("click", (e) => {
    if (!stickerPicker.contains(e.target) && e.target !== btnSticker && !btnSticker.contains(e.target)) {
      stickerPicker.classList.remove("active");
      btnSticker.classList.remove("active");
    }
  });

  // Send sticker
  function sendSticker(sticker) {
    const userId = document
      .querySelector(".chat-container")
      .getAttribute("data-user-id");

    socket.emit("client_send_message", {
      content: sticker,
      user_id: userId,
      type: "sticker",
    });

    // Close picker after sending
    stickerPicker.classList.remove("active");
    btnSticker.classList.remove("active");
  }
}
// ==================== END STICKER PICKER ====================

// server send messege
socket.on("server_send_message", (data) => {
  const currentUserId = document.querySelector(".chat-container").getAttribute("data-user-id");
  const chatMessages = document.querySelector(".chat-messages");

  const div = document.createElement("div");
  const isMe = data.userId === currentUserId;
  
  div.classList.add("message");
  div.classList.add(isMe ? "message-outgoing" : "message-incoming");

  const isSticker = data.type === "sticker";
  const bubbleClass = isSticker ? "message-bubble sticker-bubble" : "message-bubble";

  div.innerHTML = `
    <img class="chat-avatar message-avatar" src="https://ui-avatars.com/api/?name=${data.fullName}&background=random&color=fff" alt="${data.fullName}" title="${data.fullName}">
    <div class="message-content">
        <div class="inner-name">${data.fullName}</div>
        <div class="${bubbleClass}">${data.content}</div>
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

// Typing indicator - listen for other users typing
let typingHideTimeout = null;
const typingIndicator = document.querySelector("#typingIndicator");

if (typingIndicator) {
  socket.on("server_typing", (data) => {
    const typingName = typingIndicator.querySelector(".typing-name");
    const typingAvatar = typingIndicator.querySelector(".typing-avatar");

    if (data.typing) {
      typingName.textContent = data.fullName;
      typingAvatar.style.backgroundImage = `url(https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName)}&background=random&color=fff&size=56)`;
      typingAvatar.style.backgroundSize = "cover";
      typingIndicator.classList.add("active");

      // Auto-hide after 3s as safety fallback
      if (typingHideTimeout) clearTimeout(typingHideTimeout);
      typingHideTimeout = setTimeout(() => {
        typingIndicator.classList.remove("active");
      }, 3000);
    } else {
      typingIndicator.classList.remove("active");
      if (typingHideTimeout) clearTimeout(typingHideTimeout);
    }
  });
}

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
