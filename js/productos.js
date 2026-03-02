// ===== ESTADO GLOBAL =====
let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

const catalogoDiv = document.getElementById("catalogo");
const cartCount = document.getElementById("cartCount");
const miniCart = document.getElementById("miniCart");
const cartBtn = document.getElementById("cartBtn");

// ===== FETCH CON LOADER =====
async function cargarProductos() {
    catalogoDiv.innerHTML = `<div class="loader">Cargando productos...</div>`;

    try {
        const response = await fetch("../Json/productos.json");
        if (!response.ok) throw new Error("Error al cargar JSON");

        productos = await response.json();
        renderCatalogo();

    } catch (error) {
        catalogoDiv.innerHTML = `<p>Error al cargar productos</p>`;
        console.error(error);
    }
}

// ===== RENDER CATALOGO (optimizado) =====
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

// ===== EVENT DELEGATION =====
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
        carrito.push({ ...producto, cantidad: 1 });
    }

    guardarCarrito();
    actualizarContador();
    renderMiniCart();
}

// ===== STORAGE =====
function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

// ===== CONTADOR =====
function actualizarContador() {
    const total = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    cartCount.textContent = total;
}

// ===== MINI CART =====
function renderMiniCart() {
    miniCart.innerHTML = "";

    if (carrito.length === 0) {
        miniCart.innerHTML = "<p>Carrito vacío</p>";
        return;
    }

    let total = 0;

    carrito.forEach(item => {
        total += item.precio * item.cantidad;

        const div = document.createElement("div");
        div.className = "mini-item";
        div.innerHTML = `
            <span>${item.nombre} x${item.cantidad}</span>
            <span>$${item.precio * item.cantidad}</span>
        `;
        miniCart.appendChild(div);
    });

    const totalDiv = document.createElement("div");
    totalDiv.className = "mini-total";
    totalDiv.innerHTML = `Total: $${total}`;
    miniCart.appendChild(totalDiv);
}

// ===== TOGGLE MINI CART =====
cartBtn.addEventListener("click", (e) => {
    if (
        e.target.id === "cartCount" ||
        miniCart.contains(e.target)
    ) {
        e.preventDefault();
        miniCart.classList.toggle("active");
    }
});

// cerrar si clic afuera
document.addEventListener("click", (e) => {
    if (!cartBtn.contains(e.target)) {
        miniCart.classList.remove("active");
    }
});

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
    actualizarContador();
    renderMiniCart();
    cargarProductos();
});