/* =========================================
   STYLESYNC
   Digital Wardrobe & Outfit Planner
========================================= */


/* =========================================
   DATA
========================================= */

let wardrobe =
    JSON.parse(
        localStorage.getItem("stylesyncWardrobe")
    ) || [];


let savedOutfits =
    JSON.parse(
        localStorage.getItem("stylesyncOutfits")
    ) || [];


let currentOutfit = {

    top: null,

    bottom: null,

    shoes: null

};



/* =========================================
   MODAL
========================================= */

function openModal() {

    document.getElementById("modal")
        .style.display = "flex";

}


function closeModal() {

    document.getElementById("modal")
        .style.display = "none";

    document.getElementById("imagePreview")
        .innerHTML = "";

}



/* =========================================
   IMAGE PREVIEW
========================================= */

document
    .getElementById("itemImage")
    .addEventListener("change", function () {

        const file = this.files[0];

        const preview =
            document.getElementById("imagePreview");


        if (!file) {

            preview.innerHTML = "";

            return;

        }


        const reader = new FileReader();


        reader.onload = function (event) {

            preview.innerHTML = `

                <img
                    src="${event.target.result}"
                    alt="Preview"
                >

            `;

        };


        reader.readAsDataURL(file);

    });



/* =========================================
   ADD CLOTHING
========================================= */

document
    .getElementById("clothingForm")
    .addEventListener("submit", function (event) {

        event.preventDefault();


        const name =
            document.getElementById("itemName")
                .value.trim();


        const category =
            document.getElementById("itemCategory")
                .value;


        const color =
            document.getElementById("itemColor")
                .value.trim();


        const imageInput =
            document.getElementById("itemImage");


        if (!imageInput.files.length) {

            alert(
                "Please select an image."
            );

            return;

        }


        const file =
            imageInput.files[0];


        const reader =
            new FileReader();


        reader.onload = function (event) {


            const item = {

                id: Date.now(),

                name: name,

                category: category,

                color: color,

                image: event.target.result

            };


            wardrobe.push(item);


            saveWardrobe();


            displayWardrobe();

            updateStats();

            updatePlanner();


            document
                .getElementById("clothingForm")
                .reset();


            closeModal();


            alert(
                "Clothing added successfully! 👕"
            );

        };


        reader.readAsDataURL(file);

    });



/* =========================================
   SAVE WARDROBE
========================================= */

function saveWardrobe() {

    localStorage.setItem(

        "stylesyncWardrobe",

        JSON.stringify(wardrobe)

    );

}



/* =========================================
   DISPLAY WARDROBE
========================================= */

function displayWardrobe() {


    const grid =
        document.getElementById(
            "wardrobeGrid"
        );


    const search =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase();


    const filter =
        document
            .getElementById("categoryFilter")
            .value;


    const filtered =
        wardrobe.filter(item => {


            const matchesSearch =

                item.name
                    .toLowerCase()
                    .includes(search)

                ||

                item.color
                    .toLowerCase()
                    .includes(search);


            const matchesCategory =

                filter === "all"

                ||

                item.category === filter;


            return (
                matchesSearch &&
                matchesCategory
            );

        });



    if (filtered.length === 0) {

        grid.innerHTML = `

            <div
                style="
                grid-column:1/-1;
                text-align:center;
                padding:70px 20px;
                "
            >

                <div
                    style="
                    font-size:70px;
                    margin-bottom:15px;
                    "
                >
                    👕
                </div>

                <h2>
                    Your wardrobe is empty
                </h2>

                <p
                    style="
                    margin-top:10px;
                    color:#777;
                    "
                >
                    Add your first clothing item.
                </p>

            </div>

        `;

        return;

    }



    grid.innerHTML = filtered.map(item => `

        <div class="item-card">

            <img
                class="item-image"
                src="${item.image}"
                alt="${escapeHTML(item.name)}"
            >


            <div class="item-info">

                <h3>
                    ${escapeHTML(item.name)}
                </h3>


                <p>
                    ${capitalize(item.category)}
                    •
                    ${escapeHTML(item.color)}
                </p>


                <div class="card-buttons">


                    ${
                        item.category !== "accessory"

                        ?

                        `

                        <button
                            class="use-btn"
                            onclick="
                            useForOutfit(${item.id})
                            "
                        >
                            Use
                        </button>

                        `

                        :

                        ""

                    }


                    <button
                        class="delete-btn"
                        onclick="
                        deleteItem(${item.id})
                        "
                    >
                        Delete
                    </button>


                </div>

            </div>

        </div>

    `).join("");

}



/* =========================================
   DELETE ITEM
========================================= */

function deleteItem(id) {


    if (
        !confirm(
            "Delete this clothing item?"
        )
    ) {

        return;

    }


    wardrobe =
        wardrobe.filter(
            item => item.id !== id
        );


    saveWardrobe();


    displayWardrobe();

    updateStats();

    updatePlanner();

}



/* =========================================
   USE ITEM FROM WARDROBE
========================================= */

function useForOutfit(id) {


    const item =
        wardrobe.find(
            item => item.id === id
        );


    if (!item) return;


    selectOutfitItem(id);


    document
        .getElementById("outfit")
        .scrollIntoView({
            behavior: "smooth"
        });

}



/* =========================================
   CHOOSE ITEM
========================================= */

function chooseItem(category) {


    const selectionArea =
        document.getElementById(
            "selectionArea"
        );


    const items =
        wardrobe.filter(
            item =>
                item.category === category
        );


    if (items.length === 0) {


        selectionArea.innerHTML = `

            <div
                style="
                text-align:center;
                padding:40px;
                background:white;
                border-radius:15px;
                "
            >

                <div
                    style="
                    font-size:60px;
                    "
                >
                    ${
                        category === "top"
                        ? "👕"
                        : category === "bottom"
                        ? "👖"
                        : "👟"
                    }
                </div>


                <h3>
                    No ${capitalize(category)}
                    items yet
                </h3>


                <p
                    style="
                    color:#777;
                    margin-top:8px;
                    "
                >
                    Add a ${category}
                    to your wardrobe first.
                </p>

            </div>

        `;


        return;

    }



    selectionArea.innerHTML = `

        <h3>
            Choose Your
            ${capitalize(category)}
        </h3>


        <div class="selection-grid">

            ${items.map(item => `

                <div
                    class="selection-card"
                    onclick="
                    selectOutfitItem(${item.id})
                    "
                >

                    <img
                        src="${item.image}"
                        alt="${escapeHTML(item.name)}"
                    >


                    <h4>
                        ${escapeHTML(item.name)}
                    </h4>


                    <p>
                        ${escapeHTML(item.color)}
                    </p>

                </div>

            `).join("")}

        </div>

    `;

}



/* =========================================
   SELECT OUTFIT ITEM
========================================= */

function selectOutfitItem(id) {


    const item =
        wardrobe.find(
            item => item.id === id
        );


    if (!item) return;


    if (item.category === "top") {

        currentOutfit.top = item;

    }


    if (item.category === "bottom") {

        currentOutfit.bottom = item;

    }


    if (item.category === "shoes") {

        currentOutfit.shoes = item;

    }


    renderOutfit();


    document
        .getElementById("selectionArea")
        .innerHTML = "";

}



/* =========================================
   RENDER OUTFIT
========================================= */

function renderOutfit() {


    renderSlot(

        "outfitTop",

        currentOutfit.top,

        "👕",

        "Select Top",

        "top"

    );


    renderSlot(

        "outfitBottom",

        currentOutfit.bottom,

        "👖",

        "Select Bottom",

        "bottom"

    );


    renderSlot(

        "outfitShoes",

        currentOutfit.shoes,

        "👟",

        "Select Shoes",

        "shoes"

    );

}



/* =========================================
   RENDER OUTFIT SLOT
========================================= */

function renderSlot(
    elementId,
    item,
    emoji,
    text,
    category
) {


    const element =
        document.getElementById(
            elementId
        );


    if (!item) {


        element.className =
            "empty-slot";


        element.innerHTML = `

            <div class="big-emoji">
                ${emoji}
            </div>


            <p>
                ${text}
            </p>


            <button
                class="choose-btn"
                onclick="
                chooseItem('${category}')
                "
            >

                Choose
                ${capitalize(category)}

            </button>

        `;


        return;

    }



    element.className =
        "selected-item";


    element.innerHTML = `

        <img
            src="${item.image}"
            alt="${escapeHTML(item.name)}"
        >


        <p>
            ${escapeHTML(item.name)}
        </p>


        <button
            class="choose-btn"
            onclick="
            chooseItem('${category}')
            "
        >

            Change

        </button>

    `;

}



/* =========================================
   RANDOM OUTFIT
========================================= */

function generateRandomOutfit() {


    const tops =
        wardrobe.filter(
            item => item.category === "top"
        );


    const bottoms =
        wardrobe.filter(
            item => item.category === "bottom"
        );


    const shoes =
        wardrobe.filter(
            item => item.category === "shoes"
        );


    if (
        tops.length === 0 ||
        bottoms.length === 0 ||
        shoes.length === 0
    ) {


        alert(
            "Add at least one top, one bottom and one pair of shoes."
        );


        return;

    }



    currentOutfit.top =
        randomItem(tops);


    currentOutfit.bottom =
        randomItem(bottoms);


    currentOutfit.shoes =
        randomItem(shoes);


    renderOutfit();

}



/* =========================================
   RANDOM ITEM
========================================= */

function randomItem(array) {

    return array[
        Math.floor(
            Math.random() * array.length
        )
    ];

}



/* =========================================
   CLEAR OUTFIT
========================================= */

function clearOutfit() {


    currentOutfit = {

        top: null,

        bottom: null,

        shoes: null

    };


    renderOutfit();


    document
        .getElementById("selectionArea")
        .innerHTML = "";

}



/* =========================================
   SAVE OUTFIT
========================================= */

function saveCurrentOutfit() {


    if (
        !currentOutfit.top ||
        !currentOutfit.bottom ||
        !currentOutfit.shoes
    ) {


        alert(
            "Please choose a top, bottom and shoes first."
        );


        return;

    }



    const outfit = {


        id: Date.now(),


        name:
            "Outfit " +
            (savedOutfits.length + 1),


        top: currentOutfit.top,


        bottom: currentOutfit.bottom,


        shoes: currentOutfit.shoes

    };



    savedOutfits.push(outfit);


    localStorage.setItem(

        "stylesyncOutfits",

        JSON.stringify(savedOutfits)

    );


    displaySavedOutfits();


    updatePlanner();


    alert(
        "Outfit saved successfully ❤️"
    );

}



/* =========================================
   DISPLAY SAVED OUTFITS
========================================= */

function displaySavedOutfits() {


    const container =
        document.getElementById(
            "savedOutfits"
        );


    if (savedOutfits.length === 0) {

        container.innerHTML = "";

        return;

    }



    container.innerHTML = `

        <h3>
            Saved Outfits ❤️
        </h3>


        ${savedOutfits.map(outfit => `

            <div class="saved-card">

                <div>

                    <strong>
                        ${escapeHTML(outfit.name)}
                    </strong>


                    <p>

                        ${escapeHTML(outfit.top.name)}

                        +

                        ${escapeHTML(outfit.bottom.name)}

                        +

                        ${escapeHTML(outfit.shoes.name)}

                    </p>

                </div>


                <button
                    class="delete-btn"
                    onclick="
                    deleteOutfit(${outfit.id})
                    "
                >

                    Delete

                </button>

            </div>

        `).join("")}

    `;

}



/* =========================================
   DELETE OUTFIT
========================================= */

function deleteOutfit(id) {


    savedOutfits =
        savedOutfits.filter(
            outfit =>
                outfit.id !== id
        );


    localStorage.setItem(

        "stylesyncOutfits",

        JSON.stringify(savedOutfits)

    );


    displaySavedOutfits();


    updatePlanner();

}



/* =========================================
   STATISTICS
========================================= */

function updateStats() {


    document.getElementById(
        "totalItems"
    ).textContent =
        wardrobe.length;


    document.getElementById(
        "topCount"
    ).textContent =
        wardrobe.filter(
            item =>
                item.category === "top"
        ).length;


    document.getElementById(
        "bottomCount"
    ).textContent =
        wardrobe.filter(
            item =>
                item.category === "bottom"
        ).length;


    document.getElementById(
        "shoeCount"
    ).textContent =
        wardrobe.filter(
            item =>
                item.category === "shoes"
        ).length;

}



/* =========================================
   WEEKLY PLANNER
========================================= */

const days = [

    "Monday",

    "Tuesday",

    "Wednesday",

    "Thursday",

    "Friday",

    "Saturday",

    "Sunday"

];



function updatePlanner() {


    const plans =

        JSON.parse(
            localStorage.getItem(
                "stylesyncPlans"
            )
        ) || {};



    days.forEach(day => {


        const select =
            document.getElementById(day);


        if (!select) return;


        select.innerHTML = `

            <option value="">
                Choose Outfit
            </option>

        `;


        savedOutfits.forEach(outfit => {


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                outfit.id;


            option.textContent =
                outfit.name;


            if (
                String(plans[day]) ===
                String(outfit.id)
            ) {

                option.selected = true;

            }


            select.appendChild(option);

        });

    });

}



/* =========================================
   SAVE PLANNER
========================================= */

function savePlan(day) {


    const select =
        document.getElementById(day);


    const plans =

        JSON.parse(
            localStorage.getItem(
                "stylesyncPlans"
            )
        ) || {};


    plans[day] =
        select.value;


    localStorage.setItem(

        "stylesyncPlans",

        JSON.stringify(plans)

    );

}



/* =========================================
   DARK MODE
========================================= */

const themeBtn =
    document.getElementById(
        "themeBtn"
    );


themeBtn.addEventListener(
    "click",
    function () {


        document.body.classList.toggle(
            "dark"
        );


        const dark =
            document.body.classList.contains(
                "dark"
            );


        themeBtn.textContent =
            dark ? "☀️" : "🌙";


        localStorage.setItem(

            "stylesyncDarkMode",

            dark

        );

    }
);



if (
    localStorage.getItem(
        "stylesyncDarkMode"
    ) === "true"
) {


    document.body.classList.add(
        "dark"
    );


    themeBtn.textContent =
        "☀️";

}



/* =========================================
   HELPER FUNCTIONS
========================================= */

function capitalize(text) {

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}



/* =========================================
   START APPLICATION
========================================= */

displayWardrobe();

updateStats();

displaySavedOutfits();

updatePlanner();

renderOutfit();