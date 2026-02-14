//====VARIABLES GLOBALES====//
let peliculas = JSON.parse(localStorage.getItem("peliculas")) || [];
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
let usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo")) || null;
let peliculaEditando = null;

const loginSection = document.getElementById("loginSection");
const mainContent = document.getElementById("mainContent");
const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");
const btnAgregar = document.getElementById("btnAgregar");
const gridPeliculas = document.getElementById("gridPeliculas");
const sinResultados = document.getElementById("sinResultados");

const inputBuscar = document.getElementById("inputBuscar");
const selectGenero = document.getElementById("selectGenero");

//====INICIALIZAr APP====//
document.addEventListener("DOMContentLoaded", () => {
    if (usuarioActivo) {
        mostrarApp();
        renderPeliculas(peliculas);
    }
});

//====LOGIN====//
formLogin.addEventListener("submit", e => {
    e.preventDefault();

    const encontrado = usuarios.find(u =>
        u.usuario === inputUser.value &&
        u.password === inputPassword.value
    );

    if (encontrado) {
        usuarioActivo = encontrado;
        localStorage.setItem("usuarioActivo", JSON.stringify(encontrado));
        mostrarApp();
        renderPeliculas(peliculas);
    } else {
        alert("Usuario o contraseña incorrectos");
    }
});

//====REGISTRO====//
formRegistro.addEventListener("submit", e => {
    e.preventDefault();

    if (inputPasswordReg.value !== inputConfirmPassword.value) {
        alert("Las contraseñas no coinciden");
        return;
    }

    usuarios.push({
        nombre: inputNombre.value,
        email: inputEmail.value,
        usuario: inputUserReg.value,
        password: inputPasswordReg.value
    });

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    alert("Usuario registrado correctamente");
    document.getElementById("login-tab").click();
});

//====LOGOUT====//
btnLogout.addEventListener("click", () => {
    localStorage.removeItem("usuarioActivo");
    location.reload();
});

//====MOSTRAR APP====//
function mostrarApp() {
    loginSection.style.display = "none";
    mainContent.style.display = "block";
    btnLogin.style.display = "none";
    btnLogout.style.display = "inline-block";
    btnAgregar.style.display = "inline-block";
}

//====GUARDAR / EDITAR PELÍCULAS====//
btnGuardarPelicula.addEventListener("click", () => {
    const pelicula = {
        id: peliculaEditando ?? Date.now(),
        titulo: inputTitulo.value,
        genero: inputGenero.value,
        director: inputDirector.value,
        ano: inputAno.value,
        calificacion: inputCalificacion.value,
        descripcion: inputDescripcion.value,
        imagen: inputImagen.value
    };

    if (peliculaEditando) {
        peliculas = peliculas.map(p =>
            p.id === pelicula.id ? pelicula : p
        );
        peliculaEditando = null;
    } else {
        peliculas.push(pelicula);
    }

    localStorage.setItem("peliculas", JSON.stringify(peliculas));
    renderPeliculas(peliculas);

    formPelicula.reset();
    bootstrap.Modal.getInstance(modalPelicula).hide();
});

//====RENDER PELÍCULAS====//
function renderPeliculas(lista) {
    gridPeliculas.innerHTML = "";

    if (lista.length === 0) {
        sinResultados.style.display = "block";
        return;
    }

    sinResultados.style.display = "none";

    lista.forEach(p => {
        const col = document.createElement("div");
        col.className = "col-md-3 col-sm-6";

        col.innerHTML = `
            <div class="movie-card">
                <img src="${p.imagen}" class="movie-image">
                <div class="movie-content">
                    <div class="movie-title">${p.titulo}</div>
                    <span class="movie-genre">${p.genero}</span>
                    <div class="movie-meta">🎬 ${p.director}</div>
                    <div class="movie-meta">📅 ${p.ano}</div>
                    <div class="movie-rating">⭐ ${p.calificacion}</div>
                    <div class="movie-description">${p.descripcion}</div>

                    <div class="movie-actions">
                        <button class="btn btn-info btn-sm" onclick="verDetalles(${p.id})">
                            <p>Detalles</p>
                        </button>
                        <button class="btn btn-warning btn-sm" onclick="editarPelicula(${p.id})">
                            <p>Editar</p>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarPelicula(${p.id})">
                            <p>Eliminar</p>
                        </button>
                    </div>
                </div>
            </div>
        `;

        gridPeliculas.appendChild(col);
    });

    renderSlider(lista);
}

//====SLIDER====//
function renderSlider(lista) {
    const carousel = document.getElementById("carouselMovies");
    carousel.innerHTML = "";

    lista.slice(-6).reverse().forEach(p => {
        const card = document.createElement("div");
        card.className = "slider-movie-card";
        card.onclick = () => verDetalles(p.id);

        card.innerHTML = `
            <img src="${p.imagen}">
            <div class="slider-movie-info">
                <h6>${p.titulo}</h6>
            </div>
        `;

        carousel.appendChild(card);
    });
}

function scrollSlider(dir) {
    carouselMovies.scrollLeft += dir * 300;
}

//====BUSCADOR + FILTRO====//
inputBuscar.addEventListener("input", filtrarPeliculas);
selectGenero.addEventListener("change", filtrarPeliculas);

function filtrarPeliculas() {
    const texto = inputBuscar.value.toLowerCase();
    const genero = selectGenero.value;

    const filtradas = peliculas.filter(p =>
        p.titulo.toLowerCase().includes(texto) &&
        (genero === "" || p.genero === genero)
    );

    renderPeliculas(filtradas);
}

//====ELIMINAR====//
function eliminarPelicula(id) {
    if (confirm("¿Eliminar película?")) {
        peliculas = peliculas.filter(p => p.id !== id);
        localStorage.setItem("peliculas", JSON.stringify(peliculas));
        renderPeliculas(peliculas);
    }
}

//====EDITAR====//
function editarPelicula(id) {
    const p = peliculas.find(p => p.id === id);
    peliculaEditando = id;

    inputTitulo.value = p.titulo;
    inputGenero.value = p.genero;
    inputDirector.value = p.director;
    inputAno.value = p.ano;
    inputCalificacion.value = p.calificacion;
    inputDescripcion.value = p.descripcion;
    inputImagen.value = p.imagen;

    modalTitulo.innerText = "Editar Película";
    new bootstrap.Modal(modalPelicula).show();
}

//====DETALLES====//
function verDetalles(id) {
    const p = peliculas.find(p => p.id === id);

    detallesTitulo.innerText = p.titulo;
    detallesGenero.innerText = p.genero;
    detallesDirector.innerText = p.director;
    detallesAno.innerText = p.ano;
    detallesCalificacion.innerText = p.calificacion;
    detallesDescripcion.innerText = p.descripcion;
    detallesImagen.src = p.imagen;

    new bootstrap.Modal(modalDetalles).show();
}
