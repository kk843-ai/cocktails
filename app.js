const RECIPES = [
    {
        title: "Шуроповерт",
        strength: 2,
        tags: ["samogon-b"],
        ingredients: [
            ["самогон Б", "40 мл"],
            ["апельсиновый сок", "80–120 мл"],
            ["лед", "по вкусу"],
        ],
    },
    {
        title: "Апероль",
        strength: 2,
        tags: ["samogon-ch"],
        ingredients: [
            ["шампусик", "90 мл"],
            ["самогон Ч", "60 мл"],
            ["газированная вода", "30 мл"],
            ["лед", "по вкусу"],
        ],
    },
    {
        title: "Черный русский",
        strength: 2,
        tags: ["samogon-b"],
        ingredients: [
            ["самогон Б", "50 мл"],
            ["кофейный ликер", "20 мл"],
            ["лед", "по вкусу"],
        ],
    },
    {
        title: "Питбуль",
        strength: 1,
        tags: ["samogon-b"],
        ingredients: [
            ["самогон Б", "50 мл"],
            ["лимонный сок", "30 мл"],
            ["сахарный сироп", "20 мл"],
            ["лед", "по вкусу"],
        ],
    },
    {
        title: "Секс на диване",
        strength: 1,
        tags: ["samogon-ch"],
        ingredients: [
            ["самогон Ч", "40 мл"],
            ["кофейный ликер", "20 мл"],
            ["апельсиновый сок", "40 мл"],
            ["клюквенный морс", "40 мл"],
            ["лед", "по вкусу"],
        ],
    },
    {
        title: "Субмарина",
        strength: 3,
        tags: ["samogon-b"],
        ingredients: [
            ["самогон Б", "40 мл"],
            ["светлое пиво", "200 мл"],
        ],
    },
    {
        title: "Том Круз",
        strength: 1,
        tags: ["samogon-b"],
        ingredients: [
            ["самогон Б", "60 мл"],
            ["лимонный сок", "30 мл"],
            ["сахарный сироп", "15 мл"],
            ["газированная вода", "30–50 мл"],
            ["лед", "по вкусу"],
            ["долька лимона", "1 шт"],
        ],
    },
    {
        title: "Шорт айлед",
        strength: 3,
        tags: ["samogon-b", "samogon-ch"],
        ingredients: [
            ["самогон Б", "30 мл"],
            ["самогон Ч", "30 мл"],
            ["сахарный сироп", "20 мл"],
            ["лимонный сок", "30 мл"],
            ["кола", "100 мл"],
        ],
    },
];

const elList = document.querySelector("#list");
const tpl = document.querySelector("#cardTpl");
const elSearch = document.querySelector("#search");
const elClear = document.querySelector("#clearSearch");
const elCount = document.querySelector("#count");

// dialog (right sheet)
const dialog = document.querySelector("#filtersDialog");
const openFiltersBtn = document.querySelector("#openFilters");
const closeFiltersBtn = document.querySelector("#closeFilters");

const filterChips = Array.from(document.querySelectorAll(".chip[data-filter]"));
const strengthChips = Array.from(document.querySelectorAll(".chip[data-strength]"));

let state = {
    q: "",
    filter: "all",
    strength: "all",
};

function normalize(s) {
    return (s || "").toLowerCase().trim();
}

function recipeText(r) {
    const ing = r.ingredients.map(([a, b]) => `${a} ${b}`).join(" ");
    return normalize(`${r.title} ${ing} ${r.tags.join(" ")} ${r.strength ?? ""}`);
}

function badgeForTag(tag) {
    if (tag === "samogon-b") return `<span class="badge badge--b">самогон Б</span>`;
    if (tag === "samogon-ch") return `<span class="badge badge--ch">самогон Ч</span>`;
    return `<span class="badge">${tag}</span>`;
}

function matchesFilter(r) {
    if (state.filter === "all") return true;
    return r.tags.includes(state.filter);
}

function matchesStrength(r) {
    if (state.strength === "all") return true;
    return String(r.strength) === state.strength;
}

function strengthIcons(n) {
    const x = Math.max(1, Math.min(3, Number(n) || 1));
    return "🍺".repeat(x);
}

function matchesQuery(r) {
    if (!state.q) return true;
    return recipeText(r).includes(state.q);
}

function updateChipUI() {
    filterChips.forEach((c) => c.classList.toggle("chip--active", c.dataset.filter === state.filter));
    strengthChips.forEach((c) => c.classList.toggle("chip--active", c.dataset.strength === state.strength));
}

function render() {
    elList.innerHTML = "";

    const visible = RECIPES
        .filter(matchesFilter)
        .filter(matchesStrength)
        .filter(matchesQuery);

    elCount.textContent = String(visible.length);

    for (const r of visible) {
        const node = tpl.content.cloneNode(true);
        const head = node.querySelector(".card__head");
        const title = node.querySelector(".card__title");
        const badges = node.querySelector(".card__badges");
        const body = node.querySelector(".card__body");
        const ing = node.querySelector(".ing");

        title.innerHTML = `
      <span class="strength" aria-label="Крепкость ${r.strength} из 3">${strengthIcons(r.strength)}</span>
      <span>${r.title}</span>
    `;

        badges.innerHTML = r.tags.map(badgeForTag).join("");

        for (const [name, val] of r.ingredients) {
            const li = document.createElement("li");
            li.innerHTML = `<span class="name">${name}</span><span class="val">${val}</span>`;
            ing.appendChild(li);
        }

        head.addEventListener("click", () => {
            const expanded = head.getAttribute("aria-expanded") === "true";
            head.setAttribute("aria-expanded", String(!expanded));
            body.hidden = expanded;
        });

        if (state.q) {
            head.setAttribute("aria-expanded", "true");
            body.hidden = false;
        }

        elList.appendChild(node);
    }
}

// search
elSearch.addEventListener("input", () => {
    state.q = normalize(elSearch.value);
    render();
});

elClear.addEventListener("click", () => {
    elSearch.value = "";
    state.q = "";
    elSearch.focus();
    render();
});

// open/close sheet
openFiltersBtn.addEventListener("click", () => {
    updateChipUI();
    dialog.showModal();
});

closeFiltersBtn.addEventListener("click", () => dialog.close());

// close on backdrop click
dialog.addEventListener("click", (e) => {
    const r = dialog.getBoundingClientRect();
    const inBox =
        e.clientX >= r.left && e.clientX <= r.right &&
        e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inBox) dialog.close();
});

// apply immediately
filterChips.forEach((btn) => {
    btn.addEventListener("click", () => {
        state.filter = btn.dataset.filter;
        updateChipUI();
        render();
    });
});

strengthChips.forEach((btn) => {
    btn.addEventListener("click", () => {
        state.strength = btn.dataset.strength;
        updateChipUI();
        render();
    });
});

render();
