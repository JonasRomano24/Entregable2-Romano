// ===== CONSTANTES =====
const IVA = 0.22;
const DESCUENTO_UMBRAL = 3000;
const DESCUENTO_PORC = 0.1;

// ===== PRODUCTOS =====
let productos = [];

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

// ===== FUNCION PARA CARGAR CON FETCH =====
async function cargarProductos() {
    try {
        const response = await fetch("../Json/productos.json"); // ajustá la ruta si está en otra carpeta
        const data = await response.json();
        productos = data;
        mostrarCatalogo();
    } catch (error) {
        console.error("Error cargando productos:", error);
        catalogoDiv.innerHTML = "<p>Error al cargar productos.</p>";
    }
}

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


function actualizarContadorCarrito() {
    const cartCount = document.getElementById("cartCount");
    const carritoStorage = JSON.parse(localStorage.getItem("carrito")) || [];

    const totalItems = carritoStorage.reduce((acc, item) => acc + item.cantidad, 0);

    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

// ===== STORAGE + RENDER =====
function actualizarEstado() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContadorCarrito();
    mostrarCarrito();
    mostrarTotales();
}
document.addEventListener("DOMContentLoaded", () => {
    actualizarContadorCarrito();

    document.querySelectorAll(".nav-link").forEach(link => {
        if (link.href === window.location.href) {
            link.classList.add("active");
        }
    });
});
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
        mostrarFactura();
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
    mostrarFactura();
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
        mostrarFactura();
    } else {
        alert("Usuario no encontrado. Por favor regístrate.");
    }
});

// ===== INIT =====
cargarProductos();
mostrarCarrito();
mostrarTotales();
mostrarUsuario();

function mostrarFactura() {
    const t = calcularTotales();

    const facturaHTML = `
        <div class="factura" style="text-align:left">
            <h2>Factura de Compra</h2>
            <p><strong>Cliente:</strong> ${usuario.nombre} ${usuario.apellido}</p>
            <p><strong>Email:</strong> ${usuario.email}</p>
            <hr>
            <h3>Productos Comprados:</h3>
            <ul>
                ${carrito.map(item => `
                    <li>
                        ${item.nombre} x${item.cantidad} - 
                        $${(item.precio * item.cantidad).toFixed(2)}
                    </li>
                `).join("")}
            </ul>
            <hr>
            <p>Subtotal: $${t.subtotal.toFixed(2)}</p>
            <p>Descuento: $${t.descuento.toFixed(2)}</p>
            <p>IVA: $${t.impuesto.toFixed(2)}</p>
            <h3 style="color: green;">
                Total a pagar: $${t.total.toFixed(2)}
            </h3>
            <p style="color: green; font-weight: bold;">
                ✅ Compra realizada con éxito
            </p>
        </div>
    `;

    // Limpiamos la interfaz (opcional pero prolijo)
    catalogoDiv.innerHTML = "";
    carritoDiv.innerHTML = "";
    totalesDiv.innerHTML = "";
    resumenDiv.innerHTML = "";

    // Mostrar factura en SweetAlert2
    Swal.fire({
        title: "🧾 Factura de Compra",
        html: facturaHTML,
        icon: "success",
        width: 650,
        confirmButtonText: "Realizar nueva compra",
        confirmButtonColor: "#28a745",
        allowOutsideClick: false,
        draggable: true
    }).then(() => {
        // Limpiar carrito DESPUÉS de mostrar la factura
        carrito = [];
        localStorage.removeItem("carrito");
        actualizarEstado();

        // Volver a la tienda
        mostrarCatalogo();
        mostrarCarrito();
        mostrarTotales();
    });
}