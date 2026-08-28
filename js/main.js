document.addEventListener("DOMContentLoaded", async () => {

    const basePath = getBasePath();

    await loadComponent(
        "#header",
        `${basePath}components/header.html`
    );

    await loadComponent(
        "#footer",
        `${basePath}components/footer.html`
    );

    fixComponentPaths(basePath);
    setActivePage();

});


/* =========================================================
   PATH
   ========================================================= */

function getBasePath() {

    const currentPath = window.location.pathname;

    return currentPath.includes("/pages/")
        ? "../"
        : "./";

}


/* =========================================================
   LOAD COMPONENT
   ========================================================= */

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
                Error loading component.
            </p>
        `;
    }

}


/* =========================================================
   COMPONENT PATHS
   ========================================================= */

function fixComponentPaths(basePath) {

    /*
     * Header links
     */

    const homeLinks = document.querySelectorAll(
        '[data-link="home"]'
    );

    homeLinks.forEach(link => {
        link.href = `${basePath}index.html`;
    });


    const publicationsLinks = document.querySelectorAll(
        '[data-link="publicacoes"]'
    );

    publicationsLinks.forEach(link => {
        link.href = `${basePath}pages/publicacoes.html`;
    });


    const teamLinks = document.querySelectorAll(
        '[data-link="equipe"]'
    );

    teamLinks.forEach(link => {
        link.href = `${basePath}pages/equipe.html`;
    });


    /*
     * Logo
     */

    const logos = document.querySelectorAll(
        '[data-asset="logo"]'
    );

    logos.forEach(logo => {
        logo.src = `${basePath}assets/logo-1.png`;
    });


    /*
     * Footer links/assets can also use these
     * data attributes if needed.
     */

    document
        .querySelectorAll('[data-asset]')
        .forEach(element => {

            const asset = element.dataset.asset;

            if (asset === "logo") {
                element.src = `${basePath}assets/new-logo-transparent.png`;
            }
            if (asset === "logo-footer") {
                element.src = `${basePath}assets/new-logo2-transparent.png`;
            }

        });

}


/* =========================================================
   ACTIVE PAGE
   ========================================================= */

function setActivePage() {

    let currentFile =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();

    /*
     * Empty filename means index.html
     */

    if (!currentFile) {
        currentFile = "index.html";
    }


    /*
     * Convert filename to page name
     *
     * index.html          -> index
     * publicacoes.html    -> publicacoes
     * equipe.html         -> equipe
     */

    let currentPage =
        currentFile.replace(".html", "");


    /*
     * Home
     */

    if (currentPage === "index") {
        currentPage = "index";
    }


    document
        .querySelectorAll(".main-nav a")
        .forEach(link => {

            link.classList.remove("active");

            if (link.dataset.page === currentPage) {
                link.classList.add("active");
            }

        });

}
