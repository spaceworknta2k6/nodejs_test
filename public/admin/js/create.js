const imageInput = document.querySelector("#images");
const previewStage = document.querySelector("[data-preview-stage]");
const mainPreview = document.querySelector("[data-main-preview]");
const previewCount = document.querySelector("[data-preview-count]");
const previewList = document.querySelector("[data-preview-list]");
const emptyPreview = document.querySelector("[data-empty-preview]");
const createForm = document.querySelector("#form-create-product");

if (
  imageInput &&
  previewStage &&
  mainPreview &&
  previewCount &&
  previewList &&
  emptyPreview &&
  createForm
) {
  const MAX_IMAGES = 5;
  const defaultPreviewSrc = mainPreview.getAttribute("src");
  const defaultCountText = "Chưa chọn ảnh";
  const defaultListMarkup =
    '<span class="preview-card__placeholder">Chưa có ảnh để hiển thị</span>';

  let previewUrls = [];

  const clearPreviewUrls = () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    previewUrls = [];
  };

  const resetPreview = () => {
    clearPreviewUrls();
    mainPreview.src = defaultPreviewSrc;
    previewCount.textContent = defaultCountText;
    previewList.innerHTML = defaultListMarkup;
    previewStage.classList.remove("has-image");
    emptyPreview.style.display = "block";
  };

  const setActivePreview = (url, activeItem) => {
    mainPreview.src = url;

    const allItems = previewList.querySelectorAll(".preview-card__item");
    allItems.forEach((item) => item.classList.remove("is-active"));

    activeItem.classList.add("is-active");
  };

  imageInput.addEventListener("change", (event) => {
    clearPreviewUrls();

    const selectedFiles = Array.from(event.target.files || []).filter((file) =>
      file.type.startsWith("image/")
    );

    if (selectedFiles.length === 0) {
      resetPreview();
      return;
    }

    const limitedFiles = selectedFiles.slice(0, MAX_IMAGES);

    previewStage.classList.add("has-image");
    emptyPreview.style.display = "none";
    previewList.innerHTML = "";

    if (selectedFiles.length > MAX_IMAGES) {
      previewCount.textContent = `Đã chọn ${selectedFiles.length} ảnh, chỉ hiển thị ${MAX_IMAGES} ảnh đầu tiên`;
    } else {
      previewCount.textContent = `Đã chọn ${limitedFiles.length} ảnh`;
    }

    limitedFiles.forEach((file, index) => {
      const imageUrl = URL.createObjectURL(file);
      previewUrls.push(imageUrl);

      const thumbButton = document.createElement("button");
      thumbButton.type = "button";
      thumbButton.className = "preview-card__item";

      if (index === 0) {
        thumbButton.classList.add("is-active");
        mainPreview.src = imageUrl;
      }

      thumbButton.innerHTML = `
        <span class="preview-card__index">${index + 1}</span>
        <img src="${imageUrl}" alt="Ảnh xem trước ${index + 1}">
      `;

      thumbButton.addEventListener("click", () => {
        setActivePreview(imageUrl, thumbButton);
      });

      previewList.appendChild(thumbButton);
    });
  });

  createForm.addEventListener("reset", () => {
    setTimeout(() => {
      resetPreview();
    }, 0);
  });
}
