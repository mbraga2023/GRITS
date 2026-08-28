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

    /*
     * Only initialize publications if the page
     * contains the publications list.
     */
    if (document.querySelector("#publications-list")) {
        await initializePublications();
    }

});


/* =========================================================
   COMPONENTS
   ========================================================= */

async function loadComponent(selector, path) {

    const element = document.querySelector(selector);

    if (!element) {
        return;
    }

    try {

        const response = await fetch(path);

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status} - ${response.statusText}`
            );
        }

        element.innerHTML = await response.text();

    } catch (error) {

        console.error(
            `Could not load component: ${path}`,
            error
        );

    }

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

    if (!currentFile) {
        currentFile = "index.html";
    }

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


/* =========================================================
   PUBLICATIONS
   ========================================================= */

async function initializePublications() {

    try {

        const response =
            await fetch("/data/publications.json");

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }

        const publications =
            await response.json();


        setupPublicationFilters(publications);

        renderPublications(publications);


    } catch (error) {

        console.error(
            "Could not load publications:",
            error
        );

    }

}


/* =========================================================
   FILTER SETUP
   ========================================================= */

function setupPublicationFilters(publications) {

    const yearFilter =
        document.querySelector("#year-filter");

    const authorFilter =
        document.querySelector("#author-filter");


    /* -----------------------------------------
       Years
       ----------------------------------------- */

    const years = [
        ...new Set(
            publications.map(
                publication => publication.year
            )
        )
    ].sort((a, b) => b - a);


    years.forEach(year => {

        const option =
            document.createElement("option");

        option.value = year;
        option.textContent = year;

        yearFilter.appendChild(option);

    });


    /* -----------------------------------------
       Authors
       ----------------------------------------- */

    const authors = [
        ...new Set(
            publications.map(
                publication => publication.author
            )
        )
    ].sort();


    authors.forEach(author => {

        const option =
            document.createElement("option");

        option.value = author;
        option.textContent = author;

        authorFilter.appendChild(option);

    });


    /* -----------------------------------------
       Events
       ----------------------------------------- */

    yearFilter.addEventListener(
        "change",
        () => filterPublications(publications)
    );

    authorFilter.addEventListener(
        "change",
        () => filterPublications(publications)
    );

}


/* =========================================================
   FILTER
   ========================================================= */

function filterPublications(publications) {

    const selectedYear =
        document.querySelector("#year-filter").value;

    const selectedAuthor =
        document.querySelector("#author-filter").value;


    const filtered =
        publications.filter(publication => {

            const matchesYear =
                selectedYear === "all" ||
                String(publication.year) === selectedYear;


            const matchesAuthor =
                selectedAuthor === "all" ||
                publication.author === selectedAuthor;


            return matchesYear && matchesAuthor;

        });


    renderPublications(filtered);

}


/* =========================================================
   RENDER CARDS
   ========================================================= */

function renderPublications(publications) {

    const list =
        document.querySelector("#publications-list");

    const noPublications =
        document.querySelector("#no-publications");


    list.innerHTML = "";


    if (publications.length === 0) {

        noPublications.hidden = false;

        return;

    }


    noPublications.hidden = true;


    publications.forEach(publication => {

        const card =
            createPublicationCard(publication);

        list.appendChild(card);

    });

}


/* =========================================================
   CREATE CARD
   ========================================================= */

function createPublicationCard(publication) {

    const article =
        document.createElement("article");

    article.className =
        "publication-card";


    article.innerHTML = `

        <div class="publication-top">

            <span class="publication-year">
                ${publication.year}
            </span>

            <span class="publication-type">
                ${publication.type}
            </span>

        </div>


        <h2>
            ${publication.title}
        </h2>


        <div class="publication-bottom">

            <span class="publication-author">
                ${publication.author}
            </span>

            <a
                href="${publication.url}"
                class="publication-link"
                target="_blank"
                rel="noopener noreferrer">

                Acessar publicação

                <img
                    src="/assets/arrowUp.png"
                    alt="Link externo">

            </a>

        </div>

    `;


    return article;

}