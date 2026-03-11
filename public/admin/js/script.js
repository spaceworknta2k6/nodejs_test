const StatusFilter = document.querySelector("#statusFilter")
const formInput = document.querySelector("#keyword")
const sortFilter = document.querySelector("#sortFilter")
const applyButton = document.querySelector("#apply")
const resetButton = document.querySelector("#reset")
// applyButton
if(applyButton) {
    applyButton.addEventListener("click", () => {
        const keyword = formInput.value.trim()
        const status = StatusFilter.value
        const sort = sortFilter.value

        const url = new URL(window.location.href)

        if(keyword) {
            url.searchParams.set("keyword", keyword)
        } else {
            url.searchParams.delete("keyword")
        }

        if(status) {
            url.searchParams.set("status", status)
        } else {
            url.searchParams.delete("status")
        }

        if(sort) {
            url.searchParams.set("sort", sort)
        } else {
            url.searchParams.delete("sort")
        }

        window.location.href = url.href
    })
}

// end applyButton

// enterInput
if(formInput) {
    formInput.addEventListener("keydown", (e) => {
        if(e.key === "Enter") {
            applyButton.click();
        }
    })
}
// end enterInput


// reset Button
if(resetButton) {
    resetButton.addEventListener("click", () => {
        const url = window.location.origin + window.location.pathname
        window.location.href = url
    })
}
// end reset Button