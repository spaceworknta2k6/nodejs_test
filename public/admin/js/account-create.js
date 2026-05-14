const avatarInput = document.querySelector('#avatar');
const mainPreview = document.querySelector('[data-main-preview]');
const previewCount = document.querySelector('[data-preview-count]');
const emptyPreview = document.querySelector('[data-empty-preview]');
const previewStage = document.querySelector('[data-preview-stage]');
const formAccount = document.querySelector('#form-create-account, #form-edit-account');

if (avatarInput && mainPreview) {
  const defaultPreviewSrc = mainPreview.getAttribute('src');

  let previewUrl = '';

  const clearPreviewUrl = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = '';
    }
  };

  const resetPreview = () => {
    clearPreviewUrl();
    mainPreview.src = defaultPreviewSrc;
    if (emptyPreview) emptyPreview.style.display = 'block';
    if (previewCount) previewCount.textContent = 'Chưa chọn ảnh';
    if (previewStage) previewStage.classList.remove('has-image');
  };

  avatarInput.addEventListener('change', (event) => {
    clearPreviewUrl();

    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      previewUrl = URL.createObjectURL(file);
      mainPreview.src = previewUrl;

      if (emptyPreview) emptyPreview.style.display = 'none';
      if (previewCount) previewCount.textContent = '1 ảnh đã chọn';
      if (previewStage) previewStage.classList.add('has-image');
    } else {
      resetPreview();
    }
  });

  if (formAccount) {
    formAccount.addEventListener('reset', () => {
      setTimeout(resetPreview, 0);
    });
  }
}
// delete account
const deleteButtons = document.querySelectorAll('.action-btn--delete');
const formDelete = document.querySelector('#form-delete-item');

if (deleteButtons.length > 0 && formDelete) {
  const path = formDelete.getAttribute('data-path');

  deleteButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const isConfirm = confirm('Bạn có chắc chắn muốn xóa tài khoản này?');

      if (isConfirm) {
        const id = button.getAttribute('data-id');
        formDelete.action = `${path}/${id}?_method=PATCH`;
        formDelete.submit();
      }
    });
  });
}