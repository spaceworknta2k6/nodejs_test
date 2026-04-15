const statusFilter = document.querySelector('#statusFilter');
const formInput = document.querySelector('#keyword');
const sortFilter = document.querySelector('#sortFilter');
const applyButton = document.querySelector('#apply');
const resetButton = document.querySelector('#reset');
const selectAllCheckbox = document.querySelector('.select-all');
const countSelected = document.querySelector('.bulk-action-input');
const formChangeMulti = document.querySelector('#form-change-multi');
const inputIds = document.querySelector('#bulk-ids');
const formDelete = document.querySelector('#form-delete-item');
const formChangeStatus = document.querySelector('#form-change-status');
const paginationBox = document.querySelector('.pagination-ui');

const getVisibleCheckboxes = () =>
  Array.from(document.querySelectorAll('.row-checkbox')).filter((checkbox) => checkbox.offsetParent !== null);

const getVisibleCheckedCheckboxes = () =>
  getVisibleCheckboxes().filter((checkbox) => checkbox.checked);

const updateBulkActionInput = () => {
  if (!countSelected) {
    return;
  }

  const checkedCount = getVisibleCheckedCheckboxes().length;
  countSelected.value =
    checkedCount === 0
      ? 'Chưa có sản phẩm nào được chọn'
      : `${checkedCount} sản phẩm được chọn`;
};

if (applyButton) {
  applyButton.addEventListener('click', () => {
    const url = new URL(window.location.href);
    const keyword = formInput ? formInput.value.trim() : '';
    const status = statusFilter ? statusFilter.value : '';
    const sort = sortFilter ? sortFilter.value : '';

    if (keyword) {
      url.searchParams.set('keyword', keyword);
    } else {
      url.searchParams.delete('keyword');
    }

    if (status) {
      url.searchParams.set('status', status);
    } else {
      url.searchParams.delete('status');
    }

    if (sort) {
      url.searchParams.set('sort', sort);
    } else {
      url.searchParams.delete('sort');
    }

    url.searchParams.set('page', '1');
    window.location.href = url.href;
  });
}

if (formInput && applyButton) {
  formInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      applyButton.click();
    }
  });
}

if (resetButton) {
  resetButton.addEventListener('click', () => {
    window.location.href = `${window.location.origin}${window.location.pathname}`;
  });
}

if (selectAllCheckbox) {
  selectAllCheckbox.addEventListener('change', (event) => {
    getVisibleCheckboxes().forEach((checkbox) => {
      checkbox.checked = event.target.checked;
    });
    updateBulkActionInput();
  });
}

document.querySelectorAll('.row-checkbox').forEach((checkbox) => {
  checkbox.addEventListener('change', () => {
    const visibleCheckboxes = getVisibleCheckboxes();
    const visibleCheckedCount = getVisibleCheckedCheckboxes().length;

    if (selectAllCheckbox && visibleCheckboxes.length > 0) {
      selectAllCheckbox.checked = visibleCheckedCount === visibleCheckboxes.length;
    }

    updateBulkActionInput();
  });
});

document.querySelectorAll('.action-btn--delete').forEach((button) => {
  button.addEventListener('click', () => {
    if (!formDelete) {
      return;
    }

    const path = formDelete.getAttribute('data-path');
    const isConfirm = confirm('Bạn có chắc muốn xóa sản phẩm này không?');

    if (!isConfirm) {
      return;
    }

    const id = button.getAttribute('data-id');
    formDelete.action = `${path}/${id}?_method=DELETE`;
    formDelete.submit();
  });
});

if (formChangeMulti && inputIds) {
  formChangeMulti.addEventListener('submit', (event) => {
    event.preventDefault();

    const checkedType = formChangeMulti.querySelector("input[name='bulkAction']:checked");
    const checkedBoxes = getVisibleCheckedCheckboxes();

    if (!checkedType) {
      alert('Vui lòng chọn thao tác');
      return;
    }

    if (checkedBoxes.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm');
      return;
    }

    if (checkedType.value === 'delete') {
      const isConfirm = confirm('Bạn có chắc muốn xóa các sản phẩm đã chọn không?');
      if (!isConfirm) {
        return;
      }
    }

    const ids = checkedBoxes.map((checkbox) => {
      if (checkedType.value !== 'change-position') {
        return checkbox.value;
      }

      const container = checkbox.closest('tr, .mobile-product-card');
      const positionInput = container ? container.querySelector("input[name='position']") : null;
      const positionValue = positionInput ? positionInput.value : '';
      return `${checkbox.value}-${positionValue}`;
    });

    inputIds.value = ids.join(',');
    formChangeMulti.submit();
  });
}

document.querySelectorAll('.status-toggle').forEach((button) => {
  button.addEventListener('change', (event) => {
    if (!formChangeStatus) {
      return;
    }

    const path = formChangeStatus.getAttribute('data-path');
    const { id } = event.target.dataset;
    const { checked } = event.target;

    formChangeStatus.action = `${path}/${id}/${checked}?_method=PATCH`;
    formChangeStatus.submit();
  });
});

if (paginationBox) {
  const currentPage = parseInt(paginationBox.dataset.currentPage, 10) || 1;
  const totalPage = parseInt(paginationBox.dataset.totalPage, 10) || 1;
  const container = document.querySelector('.pagination-pages');
  const previousButton = document.querySelector('.page-btn-prev');
  const nextButton = document.querySelector('.page-btn-next');

  if (container) {
    let startPage = currentPage >= 5 ? currentPage - 3 : 1;
    let endPage = Math.min(startPage + 4, totalPage);

    if (endPage - startPage < 4) {
      startPage = Math.max(endPage - 4, 1);
    }

    container.innerHTML = '';

    for (let page = startPage; page <= endPage; page += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'page-btn';
      button.innerText = page;
      button.dataset.page = page;

      if (page === currentPage) {
        button.classList.add('is-active');
      }

      container.appendChild(button);
    }

    container.addEventListener('click', (event) => {
      const button = event.target.closest('.page-btn');
      if (!button) {
        return;
      }

      const url = new URL(window.location.href);
      url.searchParams.set('page', button.dataset.page);
      window.location.href = url.href;
    });
  }

  if (previousButton) {
    previousButton.disabled = currentPage <= 1;
    previousButton.addEventListener('click', () => {
      if (currentPage <= 1) {
        return;
      }

      const url = new URL(window.location.href);
      url.searchParams.set('page', currentPage - 1);
      window.location.href = url.href;
    });
  }

  if (nextButton) {
    nextButton.disabled = currentPage >= totalPage;
    nextButton.addEventListener('click', () => {
      if (currentPage >= totalPage) {
        return;
      }

      const url = new URL(window.location.href);
      url.searchParams.set('page', currentPage + 1);
      window.location.href = url.href;
    });
  }
}

updateBulkActionInput();
