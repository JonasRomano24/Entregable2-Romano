// ===== CONFIGURACIÓN =====
const IVA = 0.22;
const DESCUENTO_UMBRAL = 3000;
const DESCUENTO_PORC = 0.1;

// ===== ESTADO =====
let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let usuario = JSON.parse(localStorage.getItem("usuario")) || null;

// ===== DOM =====
const carritoDiv = document.getElementById("carrito");
const totalesDiv = document.getElementById("totales");
const recomendadosContainer = document.getElementById("recomendadosContainer");
const cartCount = document.getElementById("cartCount");

const vaciarBtn = document.getElementById("vaciarBtn");
const finalizarBtn = document.getElementById("finalizarBtn");



// ===== FETCH PRODUCTOS =====
async function cargarProductos() {
    try {
        const response = await fetch("../json/productos.json");

        if (!response.ok) {
            throw new Error("No se pudo cargar el JSON");
        }

        const data = await response.json();
        productos = data;

        mostrarRecomendados();

    } catch (error) {
        console.error("Error cargando productos:", error);
    }
}

// ===== RECOMENDADOS =====
function mostrarRecomendados() {
    if (!recomendadosContainer) return;

    const idsCarrito = carrito.map(p => p.id);

    const recomendados = productos
        .filter(p => !idsCarrito.includes(p.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);

    recomendadosContainer.innerHTML = "";

    recomendados.forEach(prod => {
        const div = document.createElement("div");
        div.className = "producto-recomendado";

        div.innerHTML = `
            <h4>${prod.nombre}</h4>
            <p>$${prod.precio}</p>
            <button onclick="agregarAlCarrito(${prod.id})">
                Agregar
            </button>
        `;

        recomendadosContainer.appendChild(div);
    });
}

// ===== CARRITO =====
function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    const item = carrito.find(p => p.id === id);

    if (item) {
        item.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    actualizarEstado();
}

function borrarProducto(id) {
    carrito = carrito.filter(item => item.id !== id);
    actualizarEstado();
}

// ===== RENDER CARRITO =====
function mostrarCarrito() {
    if (!carritoDiv) return;

    carritoDiv.innerHTML = "";

    if (carrito.length === 0) {
        carritoDiv.innerHTML = "<p>El carrito está vacío.</p>";
        return;
    }

    carrito.forEach(item => {
        const div = document.createElement("div");
        div.className = "item-carrito";

        div.innerHTML = `
            <p><strong>${item.nombre}</strong></p>
            <p>Cantidad: ${item.cantidad}</p>
            <p>$${(item.precio * item.cantidad).toFixed(2)}</p>
            <button onclick="borrarProducto(${item.id})">
                Eliminar
            </button>
        `;

        carritoDiv.appendChild(div);
    });
}

// ===== TOTALES =====
function calcularTotales() {
    const subtotal = carrito.reduce(
        (acc, item) => acc + item.precio * item.cantidad,
        0
    );

    const descuento = subtotal >= DESCUENTO_UMBRAL
        ? subtotal * DESCUENTO_PORC
        : 0;

    const impuesto = (subtotal - descuento) * IVA;

    return {
        subtotal,
        descuento,
        impuesto,
        total: subtotal - descuento + impuesto
    };
}

function mostrarTotales() {
    if (!totalesDiv || carrito.length === 0) {
        totalesDiv.innerHTML = "";
        return;
    }

    const t = calcularTotales();

    totalesDiv.innerHTML = `
        <h3>Resumen de compra</h3>
        <p>Subtotal: $${t.subtotal.toFixed(2)}</p>
        <p>Descuento: $${t.descuento.toFixed(2)}</p>
        <p>IVA: $${t.impuesto.toFixed(2)}</p>
        <strong>Total: $${t.total.toFixed(2)}</strong>
    `;
}

// ===== CONTADOR CARRITO =====
function actualizarContadorCarrito() {
    if (!cartCount) return;

    const totalItems = carrito.reduce(
        (acc, item) => acc + item.cantidad,
        0
    );

    cartCount.textContent = totalItems;
}

// ===== ACTUALIZAR ESTADO =====
function actualizarEstado() {
    localStorage.setItem("carrito", JSON.stringify(carrito));

    actualizarContadorCarrito();
    mostrarCarrito();
    mostrarTotales();
    mostrarRecomendados();
}

// ===== VACIAR CARRITO =====
if (vaciarBtn) {
    vaciarBtn.addEventListener("click", () => {
        carrito = [];
        localStorage.removeItem("carrito");
        actualizarEstado();
    });
}

// ===== FINALIZAR COMPRA =====
if (finalizarBtn) {
    finalizarBtn.addEventListener("click", () => {

        if (!usuario) {
            const opcion = confirm(
                "¿Ya tienes cuenta? Aceptar para iniciar sesión, Cancelar para registrarte."
            );

            if (opcion) overlayLogin.classList.add("active");
            else overlay.classList.add("active");

        } else {
            mostrarFormularioPago();
        }

    });
}

// ===== FORMULARIO DE PAGO =====
function mostrarFormularioPago(){

Swal.fire({

title: "Datos de la tarjeta",

html: `
<input id="titular" class="swal2-input" placeholder="Nombre del titular">

<input id="numero" class="swal2-input" placeholder="Número de tarjeta">

<input id="exp" class="swal2-input" placeholder="MM/AA">

<input id="cvv" class="swal2-input" placeholder="CVV">
`,

confirmButtonText: "Pagar",

focusConfirm:false,

didOpen:()=>{

const numeroInput=document.getElementById("numero");
const expInput=document.getElementById("exp");
const cvvInput=document.getElementById("cvv");

numeroInput.addEventListener("input",(e)=>{

let valor=e.target.value.replace(/\s/g,"").replace(/\D/g,"");
valor=valor.match(/.{1,4}/g)?.join(" ")||"";
e.target.value=valor;

});

expInput.addEventListener("input",(e)=>{

let valor=e.target.value.replace(/\D/g,"");

if(valor.length>=3){
valor=valor.slice(0,2)+"/"+valor.slice(2,4);
}

e.target.value=valor;

});

cvvInput.addEventListener("input",(e)=>{

e.target.value=e.target.value.replace(/\D/g,"").slice(0,3);

});

},

preConfirm:()=>{

const titular=document.getElementById("titular").value;
const numero=document.getElementById("numero").value;
const exp=document.getElementById("exp").value;
const cvv=document.getElementById("cvv").value;

if(!titular || !numero || !exp || !cvv){

Swal.showValidationMessage("Completa todos los campos");
return false;

}

return {titular,numero};

}

}).then((result)=>{

if(result.isConfirmed && result.value){

mostrarFactura(result.value);

}

});

}

// ===== FACTURA =====
function mostrarFactura(datosTarjeta) {

    if (!datosTarjeta) return;

    const ultimos4 = datosTarjeta.numero.slice(-4);
    const t = calcularTotales();

    const facturaHTML = `
        <div style="text-align:left">
            <h2>Factura de compra</h2>
            <p><strong>Cliente:</strong> ${usuario.nombre} ${usuario.apellido}</p>
            <p><strong>Email:</strong> ${usuario.email}</p>
            <p><strong>Tarjeta:</strong> **** **** **** ${ultimos4}</p>

            <hr>

            <h3>Productos</h3>
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

            <h3 style="color:green">
                Total: $${t.total.toFixed(2)}
            </h3>
        </div>
    `;

    Swal.fire({
        title: "Compra realizada",
        html: facturaHTML,
        icon: "success",
        width: 650,
        confirmButtonText: "Nueva compra",
        allowOutsideClick: false
    }).then(() => {

        carrito = [];
        localStorage.removeItem("carrito");

        actualizarEstado();
    });
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {

    cargarProductos();

    mostrarCarrito();
    mostrarTotales();
    actualizarContadorCarrito();

});