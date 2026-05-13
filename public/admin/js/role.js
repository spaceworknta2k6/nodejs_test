// Lấy thẻ bảng chứa phân quyền
const tablePermissions = document.querySelector("[table-permissions]");

if (tablePermissions) {
  const buttonSubmit = document.querySelector("[button-submit]");

  buttonSubmit.addEventListener("click", () => {
    let permissions = [];

    // Lấy tất cả các hàng có data-name
    const rows = tablePermissions.querySelectorAll("[data-name]");

    rows.forEach((row) => {
      const name = row.getAttribute("data-name");
      const inputs = row.querySelectorAll("input");

      if (name === "id") {
        // Lấy danh sách tiêu đề từ thead (bỏ qua cột đầu tiên "Tính năng")
        const roleTitles = Array.from(tablePermissions.querySelectorAll("thead th")).slice(1).map(th => th.textContent.trim());
        
        // Hàng ID khởi tạo dữ liệu
        inputs.forEach((input, index) => {
          const id = input.value;
          permissions.push({
            id: id,
            title: roleTitles[index] || "",
            permissions: [],
          });
        });
      } else {
        // Hàng chứa quyền
        inputs.forEach((input, index) => {
          const checked = input.checked;

          if (checked) {
            permissions[index].permissions.push(name);
          }
        });
      }
    });

    if (permissions.length > 0) {
      console.log(permissions); // In ra để bạn kiểm tra mảng giống hệt ảnh mẫu
      const formChangePermissions = document.querySelector("#form-change-permissions");
      const inputPermissions = formChangePermissions.querySelector("input[name='permissions']");
      
      inputPermissions.value = JSON.stringify(permissions);
      formChangePermissions.submit();
    }
  });
}

// Logic load data (checked các quyền đã được cấu hình)
const dataRecords = document.querySelector("[data-records]");
if (dataRecords) {
  const records = JSON.parse(dataRecords.getAttribute("data-records"));

  const tablePermissions = document.querySelector("[table-permissions]");

  if (tablePermissions) {
    records.forEach((record, index) => {
      // Lưu ý: Trường trong database của bạn là "permission" (không có s)
      const permissions = record.permission || [];

      permissions.forEach((permission) => {
        const row = tablePermissions.querySelector(`[data-name="${permission}"]`);
        if (row) {
          const input = row.querySelectorAll("input")[index];
          if (input) {
            input.checked = true;
          }
        }
      });
    });
  }
}
