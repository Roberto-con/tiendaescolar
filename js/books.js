/* ============================================================
   TIENDA ESCOLAR SANTO TOMÁS — books.js
   Catálogo de libros y lectura: búsqueda por texto, filtro por
   categoría y tarjetas, cargados desde data/books.json.
   Los productos de uniformes NO usan este módulo: viven
   directamente en uniformes.html.
   ============================================================ */

const TiendaLibros = (() => {
  const NOMBRES_CATEGORIA = {
    "libros-de-apoyo": "Libros de apoyo",
    "lectura-y-novelas": "Lectura y novelas",
  };

  /** Normaliza a minúsculas para comparar texto. */
  function normalizar(texto) {
    return String(texto || "").toLowerCase().trim();
  }

  /** Búsqueda simple: el texto escrito debe aparecer en el título, materia o autor del libro. */
  function coincideBusqueda(libro, consulta) {
    const termino = normalizar(consulta);
    if (!termino) return true;
    const textoCombinado = normalizar([libro.title, libro.subCategory, libro.author].join(" "));
    return textoCombinado.includes(termino);
  }

  function libroActivo(libro) {
    return libro && libro.active !== false;
  }

  function construirTarjetaLibro(libro) {
    const precio = TiendaUI.formatearPrecio(libro.price, libro.currency);
    const tituloSeguro = TiendaUI.escaparTexto(libro.title);
    const subcategoriaSegura = TiendaUI.escaparTexto(libro.subCategory || "");

    return `
      <a class="tarjeta-producto" href="producto.html?id=${encodeURIComponent(libro.id)}">
        <div class="tarjeta-producto__medio">
          <img src="${TiendaUI.escaparTexto(libro.image)}" alt="${tituloSeguro}" loading="lazy">
          ${libro.featured ? '<span class="etiqueta-tela">Destacado</span>' : ""}
        </div>
        <div class="tarjeta-producto__cuerpo">
          <span class="tarjeta-producto__subcategoria">${subcategoriaSegura}</span>
          <h3 class="tarjeta-producto__nombre">${tituloSeguro}</h3>
          <div class="tarjeta-producto__pie">
            <span class="${precio.pendiente ? "tarjeta-producto__precio--pendiente" : "tarjeta-producto__precio"}">${precio.texto}</span>
          </div>
        </div>
      </a>`;
  }

  function estadoVacioHTML(mensaje) {
    return `
      <div class="estado-vacio">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5"/>
          <path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <p>${mensaje}</p>
      </div>`;
  }

  /** Renderiza libros destacados (usada en Inicio). */
  async function renderizarLibrosDestacados(idContenedor, limite = 4) {
    const contenedor = document.getElementById(idContenedor);
    if (!contenedor) return;
    const libros = await TiendaApp.cargarJSON("data/books.json");
    if (!libros) return;
    const destacados = libros.filter((libro) => libroActivo(libro) && libro.featured).slice(0, limite);
    contenedor.innerHTML = destacados.length
      ? destacados.map(construirTarjetaLibro).join("")
      : estadoVacioHTML("Aún no hay libros destacados publicados.");
  }

  /** Inicializa la página de libros y lectura completa: filtros, búsqueda. */
  async function inicializarPaginaLibros() {
    const contenedorRejilla = document.getElementById("rejilla-libros");
    if (!contenedorRejilla) return;

    const libros = await TiendaApp.cargarJSON("data/books.json");
    if (!libros) {
      contenedorRejilla.innerHTML = estadoVacioHTML("No se pudo cargar el catálogo de libros en este momento.");
      return;
    }

    const activos = libros.filter(libroActivo);
    const campoBusqueda = document.getElementById("busqueda-libros");
    const conteoResultados = document.getElementById("conteo-resultados-libros");

    // La categoría inicial puede venir de un enlace (ej. desde Inicio: ?categoria=libros-de-apoyo).
    const categoriaInicial = TiendaUI.obtenerParametro("categoria") || "";
    const estado = {
      texto: "",
      categoria: categoriaInicial,
    };

    const botonesCategoria = document.querySelectorAll("[data-filtro-categoria-libro]");
    botonesCategoria.forEach((boton) => {
      const valor = boton.dataset.filtroCategoriaLibro;
      boton.setAttribute("aria-pressed", String(valor === estado.categoria));
      boton.addEventListener("click", () => {
        estado.categoria = valor;
        botonesCategoria.forEach((otro) =>
          otro.setAttribute("aria-pressed", String(otro.dataset.filtroCategoriaLibro === valor))
        );
        renderizar();
      });
    });

    if (campoBusqueda) {
      campoBusqueda.addEventListener("input", () => {
        estado.texto = campoBusqueda.value;
        renderizar();
      });
    }

    function renderizar() {
      let resultado = activos.filter((libro) => coincideBusqueda(libro, estado.texto));
      if (estado.categoria) {
        resultado = resultado.filter((libro) => libro.category === estado.categoria);
      }

      contenedorRejilla.innerHTML = resultado.length
        ? resultado.map(construirTarjetaLibro).join("")
        : estadoVacioHTML("No encontramos libros con esos criterios. Prueba con otras palabras o quita filtros.");

      if (conteoResultados) {
        conteoResultados.textContent = `${resultado.length} ${resultado.length === 1 ? "título encontrado" : "títulos encontrados"}`;
      }
    }

    renderizar();
  }

  return {
    NOMBRES_CATEGORIA,
    renderizarLibrosDestacados,
    inicializarPaginaLibros,
    coincideBusqueda,
    construirTarjetaLibro,
    estadoVacioHTML,
    libroActivo,
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  TiendaLibros.inicializarPaginaLibros();
});
