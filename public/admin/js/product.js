// toggle change status
const buttonChangeStatus = document.querySelectorAll(".status-toggle")
const formChangeStatus = document.querySelector("#form-change-status")
if(buttonChangeStatus.length > 0) {
    const path = formChangeStatus.getAttribute("data-path")

    buttonChangeStatus.forEach(button => {
        button.addEventListener("change", (e) => {
            const { id } = e.target.dataset;
            const {checked } = e.target

            const action = path + `/${id}/${checked}?_method=PATCH`
            formChangeStatus.action = action
            formChangeStatus.submit()
        })
    })

}

// end toglle change stauts