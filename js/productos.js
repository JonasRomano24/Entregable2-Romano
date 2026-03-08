// ===== ESTADO GLOBAL =====
let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

const catalogoDiv = document.getElementById("catalogo");
const cartCount = document.getElementById("cartCount");


// ===== FETCH PRODUCTOS =====
async function cargarProductos() {

    catalogoDiv.innerHTML = `<div class="loader">Cargando productos...</div>`;

    try {

        const response = await fetch("../json/productos.json");

        if (!response.ok) {
            throw new Error("Error cargando JSON");
        }

        productos = await response.json();
        renderCatalogo();

    } catch (error) {

        catalogoDiv.innerHTML = `<p>Error al cargar productos</p>`;
        console.error(error);

    }

}


// ===== RENDER CATALOGO =====
function renderCatalogo() {

    catalogoDiv.innerHTML = "";

    const fragment = document.createDocumentFragment();

    productos.forEach(prod => {

        const card = document.createElement("div");

        card.className = "producto";

        card.innerHTML = `
            <i class="fa-solid ${prod.icon} fa-2x"></i>
            <h3>${prod.nombre}</h3>
            <p>$${prod.precio}</p>
            <button data-id="${prod.id}">Agregar al carrito</button>
        `;

        fragment.appendChild(card);

    });

    catalogoDiv.appendChild(fragment);

}


// ===== EVENTO AGREGAR AL CARRITO =====
catalogoDiv.addEventListener("click", (e) => {

    if (e.target.tagName === "BUTTON") {

        const id = parseInt(e.target.dataset.id);

        agregarAlCarrito(id);

    }

});


// ===== AGREGAR AL CARRITO =====
function agregarAlCarrito(id) {

    const producto = productos.find(p => p.id === id);
    const item = carrito.find(p => p.id === id);

    if (item) {

        item.cantidad++;

    } else {

        carrito.push({
            ...producto,
            cantidad: 1
        });

    }

    guardarCarrito();
    actualizarContador();

}


// ===== GUARDAR EN STORAGE =====
function guardarCarrito() {

    localStorage.setItem("carrito", JSON.stringify(carrito));

}


// ===== CONTADOR HEADER =====
function actualizarContador() {

    const total = carrito.reduce((acc, item) => acc + item.cantidad, 0);

    if (cartCount) {
        cartCount.textContent = total;
    }

}


// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {

    actualizarContador();

    if (catalogoDiv) {
        cargarProductos();
    }

});