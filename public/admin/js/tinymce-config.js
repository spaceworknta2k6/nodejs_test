if (typeof tinymce !== "undefined") {
  tinymce.init({
    selector: "#description",
    license_key: "gpl",
    menubar: false,
    height: 320,
    plugins: "lists link image table code help wordcount",
    toolbar:
      "undo redo | blocks | bold italic underline | forecolor backcolor | bullist numlist | link image | alignleft aligncenter alignright | code",
  });
}
