document.addEventListener("DOMContentLoaded", async () => {

    const basePath = getBasePath();

    /*
     * Load reusable components
     */

    await loadComponent(
        "#header",
        `${basePath}components/header.html`
    );

    await loadComponent(
        "#footer",
        `${basePath}components/footer.html`
    );


    /*
     * Fix links and assets inside
     * the loaded components
     */

    fixComponentPaths(basePath);


    /*
     * Set active navigation item
     */

    setActivePage();


    /*
     * Publications page
     */

    if (
        document.querySelector("#publications-list")
    ) {

        await initializePublications(
            basePath
        );

    }

});


/* =========================================================
   PATH
   ========================================================= */

function getBasePath() {

    const currentPath =
        window.location.pathname;


    /*
     * Pages inside /pages/
     * need to go one level up.
     *
     * /index.html
     *     -> ./
     *
     * /pages/publicacoes.html
     *     -> ../
     */

    if (
        currentPath.includes("/pages/")
    ) {

        return "../";

    }


    return "./";

}


/* =========================================================
   LOAD COMPONENT
   ========================================================= */

async function loadComponent(
    selector,
    path
) {

    const element =
        document.querySelector(selector);


    if (!element) {

        console.error(
            `Element ${selector} was not found.`
        );

        return;

    }


    try {

        const response =
            await fetch(path);


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status} - ${response.statusText}`
            );

        }


        const html =
            await response.text();


        element.innerHTML =
            html;


    } catch (error) {

        console.error(
            `Could not load component: ${path}`,
            error
        );

    }

}


/* =========================================================
   COMPONENT PATHS
   ========================================================= */

function fixComponentPaths(
    basePath
) {

    /*
     * HOME
     */

    document
        .querySelectorAll(
            '[data-link="home"]'
        )
        .forEach(link => {

            link.href =
                `${basePath}index.html`;

        });


    /*
     * PUBLICAÇÕES
     */

    document
        .querySelectorAll(
            '[data-link="publicacoes"]'
        )
        .forEach(link => {

            link.href =
                `${basePath}pages/publicacoes.html`;

        });


    /*
     * EQUIPE
     */

    document
        .querySelectorAll(
            '[data-link="equipe"]'
        )
        .forEach(link => {

            link.href =
                `${basePath}pages/equipe.html`;

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
     * If there is no filename,
     * assume index.html.
     */

    if (!currentFile) {

        currentFile =
            "index.html";

    }


    /*
     * index.html
     *     -> index
     *
     * publicacoes.html
     *     -> publicacoes
     */

    const currentPage =
        currentFile.replace(
            ".html",
            ""
        );


    /*
     * Remove previous active states
     */

    document
        .querySelectorAll(
            ".main-nav a"
        )
        .forEach(link => {

            link.classList.remove(
                "active"
            );


            /*
             * Compare data-page
             */

            if (
                link.dataset.page ===
                currentPage
            ) {

                link.classList.add(
                    "active"
                );

            }

        });

}


/* =========================================================
   PUBLICATIONS
   ========================================================= */

async function initializePublications(
    basePath
) {

    try {

        const response =
            await fetch(
                `${basePath}data/publications.json`
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status} - ${response.statusText}`
            );

        }


        const publications =
            await response.json();


        /*
         * Create filter options
         */

        setupPublicationFilters(
            publications,
            basePath
        );


        /*
         * Display publications
         */

        renderPublications(
            publications,
            basePath
        );


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

function setupPublicationFilters(
    publications,
    basePath
) {

    const yearFilter =
        document.querySelector(
            "#year-filter"
        );


    const authorFilter =
        document.querySelector(
            "#author-filter"
        );


    /*
     * Safety check
     */

    if (
        !yearFilter ||
        !authorFilter
    ) {

        return;

    }


    /* -----------------------------------------------------
       YEARS
       ----------------------------------------------------- */

    const years = [
        ...new Set(
            publications.map(
                publication =>
                    publication.year
            )
        )
    ]
        .sort(
            (a, b) => b - a
        );


    years.forEach(year => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            year;


        option.textContent =
            year;


        yearFilter.appendChild(
            option
        );

    });


    /* -----------------------------------------------------
       AUTHORS
       ----------------------------------------------------- */

    const authors = [
        ...new Set(
            publications.map(
                publication =>
                    publication.author
            )
        )
    ]
        .sort(
            (a, b) =>
                a.localeCompare(
                    b,
                    "pt-BR"
                )
        );


    authors.forEach(author => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            author;


        option.textContent =
            author;


        authorFilter.appendChild(
            option
        );

    });


    /* -----------------------------------------------------
       EVENTS
       ----------------------------------------------------- */

    yearFilter.addEventListener(
        "change",
        () => {

            filterPublications(
                publications,
                basePath
            );

        }
    );


    authorFilter.addEventListener(
        "change",
        () => {

            filterPublications(
                publications,
                basePath
            );

        }
    );

}


/* =========================================================
   FILTER PUBLICATIONS
   ========================================================= */

function filterPublications(
    publications,
    basePath
) {

    const selectedYear =
        document.querySelector(
            "#year-filter"
        ).value;


    const selectedAuthor =
        document.querySelector(
            "#author-filter"
        ).value;


    const filtered =
        publications.filter(
            publication => {

                const matchesYear =
                    selectedYear === "all" ||
                    String(
                        publication.year
                    ) === selectedYear;


                const matchesAuthor =
                    selectedAuthor === "all" ||
                    publication.author ===
                    selectedAuthor;


                return (
                    matchesYear &&
                    matchesAuthor
                );

            }
        );


    renderPublications(
        filtered,
        basePath
    );

}


/* =========================================================
   RENDER PUBLICATIONS
   ========================================================= */

function renderPublications(
    publications,
    basePath
) {

    const list =
        document.querySelector(
            "#publications-list"
        );


    const noPublications =
        document.querySelector(
            "#no-publications"
        );


    if (!list) {

        return;

    }


    /*
     * Clear existing cards
     */

    list.innerHTML = "";


    /*
     * No results
     */

    if (
        publications.length === 0
    ) {

        if (noPublications) {

            noPublications.hidden =
                false;

        }

        return;

    }


    if (noPublications) {

        noPublications.hidden =
            true;

    }


    /*
     * Create cards
     */

    publications.forEach(
        publication => {

            const card =
                createPublicationCard(
                    publication,
                    basePath
                );


            list.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   CREATE PUBLICATION CARD
   ========================================================= */

function createPublicationCard(
    publication,
    basePath
) {

    const article =
        document.createElement(
            "article"
        );


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
                rel="noopener noreferrer"
            >

                <span>
                    Acessar publicação 
                </span>

                <img
                    src="${basePath}assets/arrowUp.png"
                    alt="Link externo" style="width: 9px; height: 9px; margin-left: 5px;"
                >

            </a>

        </div>

    `;


    return article;

}