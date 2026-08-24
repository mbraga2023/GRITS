document.addEventListener("DOMContentLoaded", async () => {

    await loadComponent(
        "#header",
        "components/header.html"
    );

    await loadComponent(
        "#footer",
        "components/footer.html"
    );

    setActivePage();

});


async function loadComponent(selector, path) {

    const element = document.querySelector(selector);

    if (!element) {
        console.error(`Element ${selector} was not found.`);
        return;
    }

    try {

        const response = await fetch(path);

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status} - ${response.statusText}`
            );
        }

        const html = await response.text();

        element.innerHTML = html;

    } catch (error) {

        console.error(
            `Could not load component: ${path}`,
            error
        );

        element.innerHTML = `
            <p style="
                padding: 20px;
                color: red;
                font-family: sans-serif;
            ">
                Error loading ${path}
            </p>
        `;
    }
}


function setActivePage() {

    const currentFile =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase() || "index.html";

    const currentPage =
        currentFile.replace(".html", "");


    document
        .querySelectorAll(".main-nav a")
        .forEach(link => {

            if (link.dataset.page === currentPage) {

                link.classList.add("active");

            }

        });

}