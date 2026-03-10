// dropdown
const StatusFilter = document.querySelector("#statusFilter")

if(StatusFilter) {
    StatusFilter.addEventListener("change", (e) => {
        const status = e.target.value

        let url = new URL(window.location.href)

        if(status) {
            url.searchParams.set("status", status)
        } else {
            url.searchParams.delete("status")
        }
        window.location.href = url.href
    })
}

// end dropdown