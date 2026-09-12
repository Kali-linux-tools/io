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

        /*
         * ملفات الأدوات
         *
         * تقدر تضيف عدد لا نهائي عمليًا:
         *
         * tools.json
         * tools2.json
         * tools3.json
         * tools4.json
         * ...
         */

        const files = [

            "tools/tools.json",

            "tools/tools2.json",

            "tools/tools3.json",

            "tools/tools4.json",

            "tools/tools5.json",

            "tools/tools6.json",

            "tools/tools7.json",

            "tools/tools8.json",

            "tools/tools9.json",

            "tools/tools10.json"

        ];


        const allTools = [];


        /*
         * تحميل كل الملفات
         *
         * لو ملف غير موجود:
         * الموقع يتجاهله ويكمل باقي الملفات
         */

        for (const file of files) {

            try {

                const response =
                    await fetch(
                        file,
                        {
                            cache: "no-cache"
                        }
                    );


                if (!response.ok) {

                    console.warn(
                        `تعذر تحميل الملف: ${file}`
                    );

                    continue;

                }


                const data =
                    await response.json();


                if (!Array.isArray(data)) {

                    console.warn(
                        `الملف ليس JSON Array صالح: ${file}`
                    );

                    continue;

                }


                /*
                 * إضافة أدوات الملف
                 * إلى القائمة الرئيسية
                 */

                allTools.push(
                    ...data
                );


            } catch (error) {

                console.warn(
                    `خطأ في تحميل ${file}:`,
                    error
                );

            }

        }


        /*
         * كل ملفات JSON أصبحت
         * Array واحدة
         */

        state.tools =
            allTools;


        /*
         * إزالة أي ID مكرر
         * إذا حدث بالخطأ
         */

        const uniqueTools =
            [];

        const usedIds =
            new Set();


        state.tools.forEach(
            tool => {

                const toolId =
                    String(
                        tool.id ||
                        ""
                    ).trim();


                /*
                 * لو الأداة ليس لها ID
                 * نضيفها عادي
                 */

                if (!toolId) {

                    uniqueTools.push(
                        tool
                    );

                    return;

                }


                /*
                 * منع التكرار
                 */

                if (
                    !usedIds.has(
                        toolId
                    )
                ) {

                    usedIds.add(
                        toolId
                    );

                    uniqueTools.push(
                        tool
                    );

                }

            }
        );


        state.tools =
            uniqueTools;


        /*
         * تحديث الإحصائيات
         */

        updateStats();


        /*
         * إنشاء الأقسام
         */

        buildCategories();


        /*
         * عرض الأدوات
         */

        render();


    } catch (error) {

        console.error(
            error
        );


        state.tools =
            [];


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

            elements.search.value =
                "";


            state.search =
                "";


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
        .querySelectorAll(
            "[data-category]"
        )
        .forEach(
            button => {

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

            }
        );

}


function buildCategories() {

    const categories =
        new Set();


    /*
     * منع تكرار إنشاء الأقسام
     * لو buildCategories اتنفذت أكثر من مرة
     */

    elements.categoryScroll
        .querySelectorAll(
            ".dynamic-category"
        )
        .forEach(
            button =>
                button.remove()
        );


    state.tools.forEach(
        tool => {

            if (
                Array.isArray(
                    tool.categories
                )
            ) {

                tool.categories.forEach(
                    category => {

                        if (
                            category
                        ) {

                            categories.add(
                                category
                            );

                        }

                    }
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
                    "ar"
                )
        );


    sorted.forEach(
        category => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "category-chip dynamic-category";


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


    updateCategoryUI();

}


function updateCategoryUI() {

    document
        .querySelectorAll(
            "[data-category]"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.category ===
                    state.category
                );

            }
        );

}


function getFilteredTools() {

    let result =
        [
            ...state.tools
        ];


    /*
     * فلترة حسب القسم
     */

    if (
        state.category !==
        "الكل"
    ) {

        result =
            result.filter(
                tool => {

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

                }
            );

    }


    /*
     * البحث
     */

    if (
        state.search
    ) {

        const search =
            normalize(
                state.search
            );


        result =
            result.filter(
                tool => {

                    const content = [

                        tool.name,

                        tool.id,

                        tool.description,

                        tool.importance,

                        tool.category,

                        ...(tool.categories || []),

                        ...(tool.use_cases || []),

                        ...(tool.examples || []),

                        ...(tool.installation || []),

                        ...(tool.basic_usage || []),

                        ...(tool.legal_note || []),

                        ...(tool.tags || [])

                    ]
                    .filter(
                        Boolean
                    )
                    .join(
                        " "
                    );


                    return normalize(
                        content
                    ).includes(
                        search
                    );

                }
            );

    }


    /*
     * الترتيب
     */

    if (
        elements.sort.value ===
        "name"
    ) {

        result.sort(
            (a, b) =>
                String(
                    a.name ||
                    ""
                ).localeCompare(
                    String(
                        b.name ||
                        ""
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


    elements.grid.innerHTML =
        "";


    if (
        !tools.length
    ) {

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
                createCard(
                    tool
                )
            );

        }
    );


    elements.grid.appendChild(
        fragment
    );

}


function createCard(
    tool
) {

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


    /*
     * دعم الصور سواء كانت:
     *
     * img: ["url"]
     *
     * أو:
     *
     * img: "url"
     */

    let imageUrl =
        FALLBACK_IMAGE;


    if (
        Array.isArray(
            tool.img
        ) &&
        tool.img.length &&
        tool.img[0]
    ) {

        imageUrl =
            tool.img[0];

    }

    else if (
        typeof tool.img ===
        "string" &&
        tool.img.trim()
    ) {

        imageUrl =
            tool.img.trim();

    }


    image.src =
        imageUrl;


    /*
     * صورة بديلة لو الصورة الأصلية
     * غير موجودة أو الرابط مكسور
     */

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
        (
            Array.isArray(
                tool.categories
            ) &&
            tool.categories[0]
        ) ||
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
            tool.id || ""
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
                    category => {

                        if (
                            category
                        ) {

                            categories.add(
                                category
                            );

                        }

                    }
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


function normalize(
    value
) {

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
        "تأكد من وجود ملفات الأدوات داخل مجلد tools.";

            }
