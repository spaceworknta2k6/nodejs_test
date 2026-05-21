// client send messege
const inputChat = document.querySelector(".chat-input");
const btnSend = document.querySelector(".chat-btn-send");

// Auto resize textarea function
const autoResizeTextarea = () => {
  if (!inputChat) return;
  inputChat.style.height = "auto";
  const scrollHeight = inputChat.scrollHeight;
  if (scrollHeight <= 50) {
    inputChat.style.height = "50px";
    inputChat.style.overflowY = "hidden";
  } else if (scrollHeight > 120) {
    inputChat.style.height = "120px";
    inputChat.style.overflowY = "auto";
  } else {
    inputChat.style.height = scrollHeight + "px";
    inputChat.style.overflowY = "hidden";
  }
};

if (inputChat && btnSend) {
  // Typing indicator - emit typing events
  let typingTimeout = null;
  const userId = document
    .querySelector(".chat-container")
    .getAttribute("data-user-id");

  let selectedFiles = [];
  const btnAttach = document.querySelector("#btnAttach");
  const fileInput = document.querySelector("#chat-file-input");
  const previewContainer = document.querySelector("#chatPreviewImages");

  // Handle attachment selection
  if (btnAttach && fileInput && previewContainer) {
    btnAttach.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
      const files = Array.from(e.target.files);
      
      files.forEach((file) => {
        if (!file.type.startsWith("image/")) return;
        
        const isDuplicate = selectedFiles.some(
          (f) => f.name === file.name && f.size === file.size
        );
        if (isDuplicate) return;

        selectedFiles.push(file);

        const previewUrl = URL.createObjectURL(file);

        const previewItem = document.createElement("div");
        previewItem.className = "preview-image-item";
        previewItem.innerHTML = `
          <img src="${previewUrl}" alt="${file.name}">
          <button type="button" class="btn-delete-preview">&times;</button>
        `;

        const btnDelete = previewItem.querySelector(".btn-delete-preview");
        btnDelete.addEventListener("click", () => {
          selectedFiles = selectedFiles.filter((f) => f !== file);
          URL.revokeObjectURL(previewUrl);
          previewItem.remove();
          
          if (selectedFiles.length === 0) {
            previewContainer.classList.remove("active");
          }
        });

        previewContainer.appendChild(previewItem);
      });

      if (selectedFiles.length > 0) {
        previewContainer.classList.add("active");
      }
      
      fileInput.value = "";
    });
  }

  inputChat.addEventListener("input", () => {
    socket.emit("client_typing", { user_id: userId, typing: true });

    // Clear previous timeout
    if (typingTimeout) clearTimeout(typingTimeout);

    // Stop typing after 2s of inactivity
    typingTimeout = setTimeout(() => {
      socket.emit("client_typing", { user_id: userId, typing: false });
    }, 2000);

    // Auto resize textarea
    autoResizeTextarea();
  });

  btnSend.addEventListener("click", async () => {
    const message = inputChat.value;
    if (!message.trim() && selectedFiles.length === 0) return;

    btnSend.disabled = true;
    let imageUrls = [];

    try {
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append("images", file);
        });

        const response = await fetch("/chat/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          imageUrls = result.images || [];
        } else {
          console.error("Gửi ảnh thất bại!");
        }
      }

      socket.emit("client_send_message", {
        content: message,
        images: imageUrls,
        user_id: userId,
      });

      inputChat.value = "";
      selectedFiles = [];
      previewContainer.innerHTML = "";
      previewContainer.classList.remove("active");

      // Reset textarea height
      autoResizeTextarea();

      // Stop typing immediately when message sent
      if (typingTimeout) clearTimeout(typingTimeout);
      socket.emit("client_typing", { user_id: userId, typing: false });
    } catch (err) {
      console.error("Lỗi gửi tin nhắn:", err);
    } finally {
      btnSend.disabled = false;
    }
  });

  inputChat.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      btnSend.click();
    } else if (e.key === "Enter" && e.shiftKey) {
      // Let browser insert newline first, then resize
      setTimeout(autoResizeTextarea, 0);
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
        // Chèn emoji vào ô input thay vì gửi ngay
        inputChat.value += sticker;
        inputChat.focus();
        autoResizeTextarea();
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

  let htmlContent = `
    <img class="chat-avatar message-avatar" src="https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName)}&background=random&color=fff" alt="${data.fullName}" title="${data.fullName}">
    <div class="message-content">
        <div class="inner-name">${data.fullName}</div>
  `;

  if (data.content) {
    htmlContent += `<div class="${bubbleClass}">${data.content}</div>`;
  }

  if (data.images && data.images.length > 0) {
    htmlContent += `<div class="message-images">`;
    data.images.forEach((img) => {
      htmlContent += `<img class="message-img" src="${img}" alt="">`;
    });
    htmlContent += `</div>`;
  }

  htmlContent += `
    </div>
  `;

  div.innerHTML = htmlContent;

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

// ==================== IMAGE LIGHTBOX ZOOM ====================
const lightbox = document.querySelector("#chat-image-lightbox");
const lightboxImg = document.querySelector("#lightbox-img");
const lightboxClose = document.querySelector(".lightbox-close");

if (lightbox && lightboxImg) {
  // Lắng nghe click trên toàn bộ chat messages (Ủy quyền sự kiện - Event Delegation)
  if (chatMessagesDOM) {
    chatMessagesDOM.addEventListener("click", (e) => {
      if (e.target.classList.contains("message-img")) {
        const src = e.target.src;
        lightboxImg.src = src;
        lightbox.classList.add("active");
      }
    });
  }

  // Lắng nghe click trên toàn bộ ảnh xem trước preview (Ủy quyền sự kiện)
  const previewContainerDOM = document.querySelector("#chatPreviewImages");
  if (previewContainerDOM) {
    previewContainerDOM.addEventListener("click", (e) => {
      if (e.target.tagName === "IMG") {
        const src = e.target.src;
        lightboxImg.src = src;
        lightbox.classList.add("active");
      }
    });
  }

  // Đóng lightbox khi click nút close hoặc click bất kỳ vị trí nào trên lightbox
  if (lightboxClose) {
    lightboxClose.addEventListener("click", (e) => {
      e.stopPropagation();
      lightbox.classList.remove("active");
      lightboxImg.src = "";
    });
  }

  lightbox.addEventListener("click", () => {
    lightbox.classList.remove("active");
    lightboxImg.src = "";
  });

  // Đóng lightbox khi ấn phím ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("active")) {
      lightbox.classList.remove("active");
      lightboxImg.src = "";
    }
  });
}
// ==================== END IMAGE LIGHTBOX ZOOM ====================

