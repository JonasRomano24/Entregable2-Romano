function mostrarUsuario(){

const userArea = document.getElementById("userArea")
const usuario = JSON.parse(localStorage.getItem("usuario"))

if(usuario){

userArea.innerHTML = `
<span class="user-name">👤 ${usuario.nombre}</span>
<button id="logoutBtn">Salir</button>
`

document.getElementById("logoutBtn").addEventListener("click",()=>{

localStorage.removeItem("usuario")
location.reload()

})

}else{

userArea.innerHTML = `
<button id="btnLogin">Login</button>
<button id="btnRegistro">Registro</button>
`

document.getElementById("btnLogin").addEventListener("click", abrirLogin)
document.getElementById("btnRegistro").addEventListener("click", abrirRegistro)

}

}

mostrarUsuario()
function abrirRegistro(){

Swal.fire({
title: "Registro de usuario",
html: `
<input id="swal-nombre" class="swal2-input" placeholder="Nombre">
<input id="swal-apellido" class="swal2-input" placeholder="Apellido">
<input id="swal-edad" type="number" class="swal2-input" placeholder="Edad">
<input id="swal-email" type="email" class="swal2-input" placeholder="Email">
`,
confirmButtonText: "Registrar",

preConfirm: ()=>{

const nombre = document.getElementById("swal-nombre").value
const apellido = document.getElementById("swal-apellido").value
const edad = document.getElementById("swal-edad").value
const email = document.getElementById("swal-email").value

if(!nombre || !apellido || !edad || !email){
Swal.showValidationMessage("Completa todos los campos")
return false
}

const usuario = {nombre,apellido,edad,email}

localStorage.setItem("usuario", JSON.stringify(usuario))

return usuario

}

}).then((result)=>{

if(result.isConfirmed){

Swal.fire({
icon:"success",
title:"Registro exitoso"
})

mostrarUsuario()

}

})

}
function abrirLogin(){

Swal.fire({
title:"Iniciar sesión",
input:"email",
inputPlaceholder:"Ingresa tu email",
confirmButtonText:"Ingresar",

preConfirm:(email)=>{

const usuario = JSON.parse(localStorage.getItem("usuario"))

if(!usuario || usuario.email !== email){
Swal.showValidationMessage("Usuario no encontrado")
return false
}

return usuario

}

}).then((result)=>{

if(result.isConfirmed){

Swal.fire({
icon:"success",
title:`Bienvenido ${result.value.nombre}`
})

mostrarUsuario()

}

})

}
document.addEventListener("DOMContentLoaded", ()=>{

mostrarUsuario()

})