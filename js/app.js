// Contenedor donde se mostrarán los productos
const contenedor = document.getElementById("contenedorProductos");

// Función para cargar productos usando fetch
function cargarProductos() {
    fetch("../Json/productos.json") // ruta relativa al JSON
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al cargar el JSON");
            }
            return response.json();
        })
        .then(data => {
            mostrarProductos(data);
        })
        .catch(error => {
            console.error("Hubo un error:", error);
        });
}

// Función para mostrar productos en el HTML
function mostrarProductos(productos) {
    productos.forEach(producto => {
        const div = document.createElement("div");
        div.innerHTML = `
            <h3>${producto.nombre}</h3>
            <p>Precio: $${producto.precio}</p>
            <hr>
        `;
        contenedor.appendChild(div);
    });
}

// Cargar productos al iniciar la app (asincrónico)
cargarProductos();