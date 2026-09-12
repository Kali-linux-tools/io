"use strict";


const FALLBACK_IMAGE =
"https://i.ibb.co/842QM2Ms/da3c60c60705ea25ae03d07cd940ff2d.jpg";


const state = {

    tools: [],

    category: "الكل",

    search: ""

};


const elements = {

    grid: document.getElementById("toolsGrid"),

    loading: document.getElementById("loading"),

    empty: document.getElementById("emptyState"),

    search: document.getElementById("searchInput"),

    clearSearch: document.getElementById("clearSearch"),

    resultsText: document.getElementById("resultsText"),

    totalTools: document.getElementById("totalTools"),

    totalCategories: document.getElementById("totalCategories"),

    sort: document.getElementById("sortSelect"),

    reset: document.getElementById("resetFilters"),

    mobileMenu: document.getElementById("mobileMenu"),

    mobileNav: document.getElementById("mobileNav"),

    categoryScroll: document.getElementById("categoryScroll"),

    year: document.getElementById("year")

};


document.addEventListener(
    "DOMContentLoaded",
    init
);


async function init() {

    elements.year.textContent =
        new Date().getFullYear();


    setupEvents();


    try {

        const response =
            await fetch(
                "tools/tools.json",
                {
                    cache: "no-cache"
                }
            );


        if (!response.ok) {

            throw new Error(
                "tools.json not found"
            );

        }


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                "Invalid tools.json"
            );

        }


        state.tools = data;


        updateStats();

        buildCategories();

        render();


    } catch (error) {

        console.error(error);

        state.tools = [];

        elements.loading.classList.add(
            "hidden"
        );

        showError();

    }

}


function setupEvents() {


    elements.search.addEventListener(
        "input",
        () => {

            state.search =
                elements.search.value.trim();


            elements.clearSearch.classList.toggle(
                "visible",
                state.search.length > 0
            );


            render();

        }
    );


    elements.clearSearch.addEventListener(
        "click",
        () => {

            elements.search.value = "";

            state.search = "";

            elements.clearSearch.classList.remove(
                "visible"
            );

            elements.search.focus();

            render();

        }
    );


    elements.sort.addEventListener(
        "change",
        render
    );


    elements.reset.addEventListener(
        "click",
        resetFilters
    );


    elements.mobileMenu.addEventListener(
        "click",
        () => {

            elements.mobileNav.classList.toggle(
                "open"
            );

        }
    );


    document
        .querySelectorAll("[data-category]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    state.category =
                        button.dataset.category;


                    updateCategoryUI();


                    elements.mobileNav.classList.remove(
                        "open"
                    );


                    render();

                }
            );

        });

}


function buildCategories() {

    const categories =
        new Set();


    state.tools.forEach(
        tool => {

            if (
                Array.isArray(
                    tool.categories
                )
            ) {

                tool.categories.forEach(
                    category =>
                        categories.add(
                            category
                        )
                );

            }

            else if (
                tool.category
            ) {

                categories.add(
                    tool.category
                );

            }

        }
    );


    const sorted =
        [...categories].sort(
            (a, b) =>
                String(a).localeCompare(
                    String(b),
                    "en"
                )
        );


    sorted.forEach(
        category => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "category-chip";


            button.dataset.category =
                category;


            button.textContent =
                category;


            button.addEventListener(
                "click",
                () => {

                    state.category =
                        category;


                    updateCategoryUI();

                    render();

                }
            );


            elements.categoryScroll.appendChild(
                button
            );

        }
    );

}


function updateCategoryUI() {

    document
        .querySelectorAll(
            "[data-category]"
        )
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.category ===
                state.category
            );

        });

}


function getFilteredTools() {

    let result =
        [...state.tools];


    if (
        state.category !== "الكل"
    ) {

        result =
            result.filter(tool => {

                if (
                    Array.isArray(
                        tool.categories
                    )
                ) {

                    return tool.categories.includes(
                        state.category
                    );

                }


                return tool.category ===
                    state.category;

            });

    }


    if (state.search) {

        const search =
            normalize(
                state.search
            );


        result =
            result.filter(tool => {

                const content = [

                    tool.name,

                    tool.id,

                    tool.description,

                    tool.importance,

                    tool.category,

                    ...(tool.categories || []),

                    ...(tool.use_cases || []),

                    ...(tool.examples || [])

                ]
                .filter(Boolean)
                .join(" ");


                return normalize(
                    content
                ).includes(
                    search
                );

            });

    }


    if (
        elements.sort.value ===
        "name"
    ) {

        result.sort(
            (a, b) =>
                String(
                    a.name || ""
                ).localeCompare(
                    String(
                        b.name || ""
                    ),
                    "ar"
                )
        );

    }


    return result;

}


function render() {

    const tools =
        getFilteredTools();


    elements.loading.classList.add(
        "hidden"
    );


    elements.grid.innerHTML = "";


    if (!tools.length) {

        elements.empty.classList.remove(
            "hidden"
        );


        elements.resultsText.textContent =
            "لا توجد نتائج";


        return;

    }


    elements.empty.classList.add(
        "hidden"
    );


    elements.resultsText.textContent =
        `عرض ${tools.length} من ${state.tools.length} أداة`;


    const fragment =
        document.createDocumentFragment();


    tools.forEach(
        tool => {

            fragment.appendChild(
                createCard(tool)
            );

        }
    );


    elements.grid.appendChild(
        fragment
    );

}


function createCard(tool) {

    const article =
        document.createElement(
            "article"
        );


    article.className =
        "tool-card";


    const imageWrap =
        document.createElement(
            "div"
        );


    imageWrap.className =
        "card-image-wrap";


    const image =
        document.createElement(
            "img"
        );


    image.className =
        "card-image";


    image.loading =
        "lazy";


    image.decoding =
        "async";


    image.alt =
        `${tool.name || "أداة"} - Kali Linux`;


    const imageUrl =
        Array.isArray(tool.img) &&
        tool.img.length &&
        tool.img[0]

        ? tool.img[0]

        : FALLBACK_IMAGE;


    image.src =
        imageUrl;


    image.onerror =
        () => {

            if (
                image.src !==
                FALLBACK_IMAGE
            ) {

                image.src =
                    FALLBACK_IMAGE;

            }

        };


    const category =
        document.createElement(
            "div"
        );


    category.className =
        "tool-badge";


    category.textContent =
        tool.category ||
        "Kali Tool";


    imageWrap.appendChild(
        image
    );


    imageWrap.appendChild(
        category
    );


    const content =
        document.createElement(
            "div"
        );


    content.className =
        "card-content";


    const title =
        document.createElement(
            "h3"
        );


    title.className =
        "card-title";


    title.textContent =
        tool.name ||
        "بدون اسم";


    const description =
        document.createElement(
            "p"
        );


    description.className =
        "card-description";


    description.textContent =
        tool.importance ||
        tool.description ||
        "أداة من أدوات Kali Linux.";


    const footer =
        document.createElement(
            "div"
        );


    footer.className =
        "card-footer";


    const id =
        document.createElement(
            "span"
        );


    id.className =
        "tool-id";


    id.textContent =
        tool.id ||
        "tool";


    const open =
        document.createElement(
            "a"
        );


    open.className =
        "open-btn";


    open.textContent =
        "عرض الأداة";


    open.href =
        `tool.html?id=${encodeURIComponent(
            tool.id
        )}`;


    footer.appendChild(
        id
    );


    footer.appendChild(
        open
    );


    content.appendChild(
        title
    );


    content.appendChild(
        description
    );


    content.appendChild(
        footer
    );


    article.appendChild(
        imageWrap
    );


    article.appendChild(
        content
    );


    return article;

}


function updateStats() {

    elements.totalTools.textContent =
        state.tools.length;


    const categories =
        new Set();


    state.tools.forEach(
        tool => {

            if (
                Array.isArray(
                    tool.categories
                )
            ) {

                tool.categories.forEach(
                    category =>
                        categories.add(
                            category
                        )
                );

            }

            else if (
                tool.category
            ) {

                categories.add(
                    tool.category
                );

            }

        }
    );


    elements.totalCategories.textContent =
        categories.size;

}


function normalize(value) {

    return String(
        value || ""
    )
    .toLowerCase()
    .trim()
    .replace(
        /[\u064B-\u065F\u0670]/g,
        ""
    )
    .replace(
        /ى/g,
        "ي"
    )
    .replace(
        /ة/g,
        "ه"
    );

}


function resetFilters() {

    state.category =
        "الكل";


    state.search =
        "";


    elements.search.value =
        "";


    elements.clearSearch.classList.remove(
        "visible"
    );


    elements.sort.value =
        "default";


    updateCategoryUI();

    render();

}


function showError() {

    elements.empty.classList.remove(
        "hidden"
    );


    elements.empty.querySelector(
        "h3"
    ).textContent =
        "تعذر تحميل الأدوات";


    elements.empty.querySelector(
        "p"
    ).textContent =
        "تأكد من وجود الملف tools/tools.json.";

}
