// ===== CONSTANTES =====
const IVA = 0.22;
const DESCUENTO_UMBRAL = 3000;
const DESCUENTO_PORC = 0.1;

// ===== PRODUCTOS =====
const productos = [
    { id: 1, nombre: "Auriculares", precio: 1200, icon: "fa-headphones" },
    { id: 2, nombre: "Mouse", precio: 900, icon: "fa-mouse" },
    { id: 3, nombre: "Teclado", precio: 1600, icon: "fa-keyboard" },
    { id: 4, nombre: "Webcam", precio: 2200, icon: "fa-camera" }
];

// ===== ESTADOS =====
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let usuario = JSON.parse(localStorage.getItem("usuario")) || null;

// ===== DOM =====
const catalogoDiv = document.getElementById("catalogo");
const carritoDiv = document.getElementById("carrito");
const totalesDiv = document.getElementById("totales");
const resumenDiv = document.getElementById("resumen");
const overlay = document.getElementById("overlay");
const registroForm = document.getElementById("registroForm");
const overlayLogin = document.getElementById("overlayLogin");
const loginForm = document.getElementById("loginForm");
const usuarioInfoDiv = document.getElementById("usuarioInfo");

// ===== FUNCIONES =====
function mostrarCatalogo() {
    catalogoDiv.innerHTML = "";
    productos.forEach(prod => {
        const div = document.createElement("div");
        div.className = "producto";
        div.innerHTML = `
            <div class="prod-info">
                <i class="fa-solid ${prod.icon} fa-2x"></i>
                <strong>${prod.nombre}</strong>
            </div>
            <p>$${prod.precio}</p>
            <button onclick="agregarAlCarrito(${prod.id})" class="addBtn">Agregar</button>
        `;
        catalogoDiv.appendChild(div);
    });
}

function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    const item = carrito.find(p => p.id === id);
    if (item) item.cantidad++;
    else carrito.push({ ...producto, cantidad: 1 });
    actualizarEstado();
}

function borrarProducto(id) {
    carrito = carrito.filter(item => item.id !== id);
    actualizarEstado();
}

function mostrarCarrito() {
    carritoDiv.innerHTML = "";
    if (carrito.length === 0) {
        carritoDiv.textContent = "El carrito está vacío.";
        return;
    }
    carrito.forEach(item => {
        const div = document.createElement("div");
        div.className = "item-carrito";
        div.innerHTML = `
            <p>${item.nombre} x${item.cantidad} - $${item.precio * item.cantidad}</p>
            <button onclick="borrarProducto(${item.id})">Eliminar</button>
        `;
        carritoDiv.appendChild(div);
    });
}

function calcularTotales() {
    const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    const descuento = subtotal >= DESCUENTO_UMBRAL ? subtotal * DESCUENTO_PORC : 0;
    const impuesto = (subtotal - descuento) * IVA;
    return { subtotal, descuento, impuesto, total: subtotal - descuento + impuesto };
}

function mostrarTotales() {
    if (carrito.length === 0) {
        totalesDiv.innerHTML = "";
        return;
    }
    const t = calcularTotales();
    totalesDiv.innerHTML = `
        <h3>Totales</h3>
        <p>Subtotal: $${t.subtotal.toFixed(2)}</p>
        <p>Descuento: $${t.descuento.toFixed(2)}</p>
        <p>IVA: $${t.impuesto.toFixed(2)}</p>
        <strong>Total: $${t.total.toFixed(2)}</strong>
    `;
}

// ===== USUARIO =====
function mostrarUsuario() {
    if (usuario) {
        usuarioInfoDiv.innerHTML = `
            Bienvenido, <strong>${usuario.nombre}</strong>
            <button id="logoutBtn">Cerrar sesión</button>
        `;
        document.getElementById("logoutBtn").addEventListener("click", logout);
    } else {
        usuarioInfoDiv.innerHTML = "";
    }
}

function logout() {
    usuario = null;
    localStorage.removeItem("usuario");
    mostrarUsuario();
    resumenDiv.innerHTML = "";
}

// ===== RESUMEN =====
function mostrarResumen() {
    const t = calcularTotales();
    resumenDiv.innerHTML = `
        <h3>Resumen de compra</h3>
        <p><strong>Cliente:</strong> ${usuario.nombre} ${usuario.apellido}</p>
        <p><strong>Email:</strong> ${usuario.email}</p>
        <p><strong>Total a pagar:</strong> $${t.total.toFixed(2)}</p>
        <p>✅ Compra finalizada con éxito</p>
    `;
    carrito = [];
    localStorage.removeItem("carrito");
    actualizarEstado();
    mostrarUsuario();
}

// ===== STORAGE + RENDER =====
function actualizarEstado() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarCarrito();
    mostrarTotales();
}

// ===== EVENTOS =====
document.getElementById("vaciarBtn").addEventListener("click", () => {
    carrito = [];
    localStorage.removeItem("carrito");
    actualizarEstado();
});

document.getElementById("finalizarBtn").addEventListener("click", () => {
    if (!usuario) {
        const opcion = confirm("¿Ya tienes una cuenta? Acepta para iniciar sesión, Cancelar para registrarte.");
        if (opcion) overlayLogin.classList.add("active");
        else overlay.classList.add("active");
    } else {
        mostrarResumen();
    }
});

// ===== REGISTRO =====
registroForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const edad = Number(document.getElementById("edad").value);
    const email = document.getElementById("email").value.trim();

    if (!nombre || !apellido || !email.includes("@") || edad < 18) return;

    usuario = { nombre, apellido, edad, email };
    localStorage.setItem("usuario", JSON.stringify(usuario));
    overlay.classList.remove("active");
    mostrarUsuario();
    mostrarResumen();
});

// ===== LOGIN =====
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));

    if (usuarioGuardado && usuarioGuardado.email === email) {
        usuario = usuarioGuardado;
        overlayLogin.classList.remove("active");
        mostrarUsuario();
        mostrarResumen();
    } else {
        alert("Usuario no encontrado. Por favor regístrate.");
    }
});

// ===== INIT =====
mostrarCatalogo();
mostrarCarrito();
mostrarTotales();
mostrarUsuario();

// ===== FACTURA =====
function mostrarFactura() {
    const t = calcularTotales();

    // Limpiamos las secciones principales
    catalogoDiv.innerHTML = "";
    carritoDiv.innerHTML = "";
    totalesDiv.innerHTML = "";
    resumenDiv.innerHTML = "";

    // Creamos la factura
    const facturaDiv = document.createElement("div");
    facturaDiv.className = "factura";
    facturaDiv.innerHTML = `
        <h2>Factura de Compra</h2>
        <p><strong>Cliente:</strong> ${usuario.nombre} ${usuario.apellido}</p>
        <p><strong>Email:</strong> ${usuario.email}</p>
        <hr>
        <h3>Productos Comprados:</h3>
        <ul>
            ${carrito.map(item => `
                <li>${item.nombre} x${item.cantidad} - $${(item.precio * item.cantidad).toFixed(2)}</li>
            `).join("")}
        </ul>
        <hr>
        <p>Subtotal: $${t.subtotal.toFixed(2)}</p>
        <p>Descuento: $${t.descuento.toFixed(2)}</p>
        <p>IVA: $${t.impuesto.toFixed(2)}</p>
        <strong>Total a pagar: $${t.total.toFixed(2)}</strong>
        <h3 style="color: green; margin-top: 1rem;">✅ Compra realizada con éxito</h3>
        <button id="nuevaCompraBtn">Realizar nueva compra</button>
    `;

    resumenDiv.appendChild(facturaDiv);

    // Limpiamos carrito
    carrito = [];
    localStorage.removeItem("carrito");
    actualizarEstado();

    // Evento para volver a comprar
    document.getElementById("nuevaCompraBtn").addEventListener("click", () => {
        mostrarCatalogo();
        mostrarCarrito();
        mostrarTotales();
        resumenDiv.innerHTML = "";
    });
}

// Modificamos mostrarResumen para llamar a mostrarFactura en lugar de solo actualizar resumen
function mostrarResumen() {
    mostrarFactura(); // Ahora muestra la factura completa
}
