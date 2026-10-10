/* ============================================================
   TIENDA ESCOLAR SANTO TOMÁS — product.js
   Detalle de producto para LIBROS (los uniformes no usan página
   de detalle: viven directo en uniformes.html). Interpreta el
   parámetro ?id= contra data/books.json.
   ============================================================ */

(function () {
  const contenedor = document.getElementById("detalle-producto");
  if (!contenedor) return;

  let libroActual = null;
  let cantidadActual = 1;

  async function iniciar() {
    const id = TiendaUI.obtenerParametro("id");
    const libros = await TiendaApp.cargarJSON("data/books.json");

    if (!libros) {
      mostrarNoEncontrado();
      return;
    }

    const libro = libros.find((item) => item.id === id && item.active !== false);
    if (!libro || !id) {
      mostrarNoEncontrado();
      return;
    }

    libroActual = libro;
    renderizarDetalle(libro);
    renderizarRelacionados(libros, libro);
  }

  function mostrarNoEncontrado() {
    contenedor.innerHTML = `
      <div class="estado-vacio">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5"/>
          <path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <p>No encontramos este título. Puede que aún no esté publicado o que el enlace sea incorrecto.</p>
        <a class="boton boton--primario" style="margin-top:1rem" href="libros-y-lectura.html">Volver a Libros y lectura</a>
      </div>`;
  }

  function renderizarDetalle(libro) {
    document.title = `${libro.title} · Tienda Escolar Santo Tomás`;

    const nombreCategoria = TiendaLibros.NOMBRES_CATEGORIA[libro.category] || libro.category;

    const migas = document.getElementById("migas-producto");
    if (migas) {
      migas.innerHTML = `
        <a href="index.html">Inicio</a> /
        <a href="libros-y-lectura.html">Libros y lectura</a> /
        <a href="libros-y-lectura.html?categoria=${encodeURIComponent(libro.category)}">${TiendaUI.escaparTexto(nombreCategoria)}</a> /
        <span>${TiendaUI.escaparTexto(libro.title)}</span>`;
    }

    const precio = TiendaUI.formatearPrecio(libro.price, libro.currency);

    contenedor.innerHTML = `
      <div class="galeria-producto">
        <div class="galeria-producto__principal">
          <img src="${TiendaUI.escaparTexto(libro.image)}" alt="${TiendaUI.escaparTexto(libro.title)}">
        </div>
      </div>
      <div class="info-producto">
        <span class="info-producto__categoria">${TiendaUI.escaparTexto(nombreCategoria)}</span>
        <h1>${TiendaUI.escaparTexto(libro.title)}</h1>
        <p class="${precio.pendiente ? "info-producto__precio--pendiente" : "info-producto__precio"}">${precio.texto}</p>
        <p>${TiendaUI.escaparTexto(libro.description || "Descripción por confirmar.")}</p>

        <div class="info-producto__bloque">
          <h3>Datos del título</h3>
          <p style="margin-bottom:.3rem"><strong>Autor:</strong> ${TiendaUI.escaparTexto(libro.author || "Por confirmar")}</p>
          <p style="margin-bottom:.3rem"><strong>Editorial:</strong> ${TiendaUI.escaparTexto(libro.editorial || "Por confirmar")}</p>
          <p style="margin-bottom:0"><strong>Nivel/curso:</strong> ${TiendaUI.escaparTexto(libro.level || "Por confirmar")}</p>
        </div>

        <div class="info-producto__bloque">
          <h3>Cantidad</h3>
          <div class="selector-cantidad">
            <button type="button" id="restar-cantidad" aria-label="Reducir cantidad">−</button>
            <input type="number" id="entrada-cantidad" value="1" min="1" max="20" aria-label="Cantidad">
            <button type="button" id="sumar-cantidad" aria-label="Aumentar cantidad">+</button>
          </div>
        </div>

        <div class="acciones-producto">
          <button class="boton boton--primario" id="agregar-carrito">Agregar al carrito</button>
          <a class="boton boton--secundario" href="carrito.html">Ver carrito</a>
        </div>
      </div>`;

    const entradaCantidad = document.getElementById("entrada-cantidad");
    document.getElementById("restar-cantidad").addEventListener("click", () => {
      cantidadActual = Math.max(1, cantidadActual - 1);
      entradaCantidad.value = cantidadActual;
    });
    document.getElementById("sumar-cantidad").addEventListener("click", () => {
      cantidadActual = Math.min(20, cantidadActual + 1);
      entradaCantidad.value = cantidadActual;
    });
    entradaCantidad.addEventListener("change", () => {
      const valor = Math.min(20, Math.max(1, parseInt(entradaCantidad.value, 10) || 1));
      cantidadActual = valor;
      entradaCantidad.value = valor;
    });

    document.getElementById("agregar-carrito").addEventListener("click", () => {
      TiendaCarrito.agregar(
        { id: libroActual.id, name: libroActual.title, price: libroActual.price, currency: libroActual.currency },
        cantidadActual,
        null
      );
      TiendaUI.anunciar(`"${libroActual.title}" se agregó al carrito.`);
    });
  }

  function renderizarRelacionados(libros, actual) {
    const contenedorRelacionados = document.getElementById("productos-relacionados");
    if (!contenedorRelacionados) return;
    const relacionados = libros
      .filter((libro) => libro.id !== actual.id && libro.category === actual.category && libro.active !== false)
      .slice(0, 4);

    const seccion = document.getElementById("seccion-relacionados");
    if (!relacionados.length) {
      if (seccion) seccion.hidden = true;
      return;
    }
    contenedorRelacionados.innerHTML = relacionados.map(TiendaLibros.construirTarjetaLibro).join("");
  }

  document.addEventListener("DOMContentLoaded", iniciar);
})();
