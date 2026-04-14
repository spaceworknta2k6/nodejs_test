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

// pagination
const box = document.querySelector(".pagination-ui")
const currentPage = parseInt(box.dataset.currentPage)
const totalPage = parseInt(box.dataset.totalPage)

let startPage = currentPage >=5 ? currentPage-3 : 1
let endPage = Math.min(startPage+4, totalPage)

const container = document.querySelector(".pagination-pages")
container.innerHTML = ""
for(let i=startPage;i<=endPage;i++) {
    const btn = document.createElement("button")
    btn.className="page-btn"
    btn.innerText = i
    btn.dataset.page = i
    if(i==currentPage) {
        btn.classList.add("is-active")
    }
    container.appendChild(btn)
}
document.querySelector(".page-btn-prev").onclick = () => {
    if (currentPage > 1) {
        const url = new URL(window.location.href);
        url.searchParams.set("page", currentPage - 1);
        window.location.href = url.href;
    }
};

document.querySelector(".page-btn-next").onclick = () => {
    if (currentPage < totalPage) {
        const url = new URL(window.location.href);
        url.searchParams.set("page", currentPage + 1);
        window.location.href = url.href;
    }
};

container.addEventListener("click", (e) => {
    const btn = e.target.closest(".page-btn")
    if(!btn) return
    const page = btn.dataset.page
    const url = new URL(window.location.href)
    url.searchParams.set("page", page)
    window.location.href = url.href
})


// end pagination

