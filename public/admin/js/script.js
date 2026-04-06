const StatusFilter = document.querySelector("#statusFilter");
const formInput = document.querySelector("#keyword");
const sortFilter = document.querySelector("#sortFilter");
const applyButton = document.querySelector("#apply");
const resetButton = document.querySelector("#reset");
// applyButton
if (applyButton) {
  applyButton.addEventListener("click", () => {
    const keyword = formInput.value.trim();
    const status = StatusFilter.value;
    const sort = sortFilter.value;

    const url = new URL(window.location.href);

    if (keyword) {
      url.searchParams.set("keyword", keyword);
    } else {
      url.searchParams.delete("keyword");
    }

    if (status) {
      url.searchParams.set("status", status);
    } else {
      url.searchParams.delete("status");
    }

    if (sort) {
      url.searchParams.set("sort", sort);
    } else {
      url.searchParams.delete("sort");
    }

    url.searchParams.set("page", "1");

    window.location.href = url.href;
  });
}

// end applyButton

// enterInput
if (formInput) {
  formInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      applyButton.click();
    }
  });
}
// end enterInput

// reset Button
if (resetButton) {
  resetButton.addEventListener("click", () => {
    const url = window.location.origin + window.location.pathname;
    window.location.href = url;
  });
}
// end reset Button

// form change multi
const boxCheck = document.querySelectorAll(".row-checkbox");
const selectAllCheckbox = document.querySelector(".select-all");
const countSelected = document.querySelector(".bulk-action-input");

const updateBulkActionInput = () => {
  const iscountChecked = document.querySelectorAll(
    ".row-checkbox:checked",
  ).length;
  if (iscountChecked == 0) {
    countSelected.value = "Chưa có sản phẩm nào được chọn";
  } else {
    countSelected.value = `${iscountChecked} sản phẩm được chọn`;
  }
};

// select All
if (selectAllCheckbox) {
  selectAllCheckbox.addEventListener("change", (e) => {
    const ischecked = e.target.checked;
    boxCheck.forEach((item) => {
      item.checked = ischecked;
    });

    updateBulkActionInput();
  });
}

if (boxCheck.length > 0) {
  boxCheck.forEach((box) => {
    box.addEventListener("change", () => {
      updateBulkActionInput();
    });
  });
}
// end form change multi

// form delete item
const buttonModify = document.querySelectorAll(".action-btn--delete");

if (buttonModify.length > 0) {
  buttonModify.forEach((item) => {
    item.addEventListener("click", () => {
      const formDelete = document.querySelector("#form-delete-item");
      const path = formDelete.getAttribute("data-path");
      var iscomfirm = confirm("Bạn có chắc muốn xóa sản phẩm này không!!");
      if (iscomfirm) {
        const id = item.getAttribute("data-id");
        const action = `${path}/${id}?_method=DELETE`;
        formDelete.action = action;
        formDelete.submit();
      }
    });
  });
}

// end delete item
