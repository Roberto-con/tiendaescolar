/* ============================================================
   TIENDA ESCOLAR SANTO TOMÁS — cart.js
   Carrito demostrativo persistido en localStorage.
   No procesa pagos: solo agrupa una solicitud para gestionar
   con la institución.
   ============================================================ */

const TiendaCarrito = (() => {
  const CLAVE_ALMACENAMIENTO = "tienda-santo-tomas:carrito";

  function leer() {
    try {
      const crudo = window.localStorage.getItem(CLAVE_ALMACENAMIENTO);
      const datos = crudo ? JSON.parse(crudo) : [];
      return Array.isArray(datos) ? datos : [];
    } catch (error) {
      console.warn("No se pudo leer el carrito local:", error);
      return [];
    }
  }

  function guardar(items) {
    try {
      window.localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(items));
    } catch (error) {
      console.warn("No se pudo guardar el carrito local:", error);
    }
    actualizarContadores();
  }

  function claveLinea(idProducto, talla) {
    return `${idProducto}::${talla || "sin-variante"}`;
  }

  function agregar(producto, cantidad, talla) {
    const items = leer();
    const clave = claveLinea(producto.id, talla);
    const existente = items.find((item) => claveLinea(item.idProducto, item.talla) === clave);

    if (existente) {
      existente.cantidad += cantidad;
    } else {
      items.push({
        idProducto: producto.id,
        nombre: producto.name,
        categoria: producto.category,
        talla: talla || null,
        precio: producto.price,
        moneda: producto.currency || "BOB",
        cantidad,
      });
    }
    guardar(items);
    return items;
  }

  function actualizarCantidad(idProducto, talla, cantidad) {
    let items = leer();
    const clave = claveLinea(idProducto, talla);
    if (cantidad <= 0) {
      items = items.filter((item) => claveLinea(item.idProducto, item.talla) !== clave);
    } else {
      const item = items.find((entrada) => claveLinea(entrada.idProducto, entrada.talla) === clave);
      if (item) item.cantidad = cantidad;
    }
    guardar(items);
    return items;
  }

  function quitar(idProducto, talla) {
    return actualizarCantidad(idProducto, talla, 0);
  }

  function vaciar() {
    guardar([]);
  }

  function totalItems() {
    return leer().reduce((suma, item) => suma + item.cantidad, 0);
  }

  function totalMonto() {
    return leer().reduce((suma, item) => suma + (item.precio ? item.precio * item.cantidad : 0), 0);
  }

  function hayPreciosPendientes() {
    return leer().some((item) => item.precio === null || item.precio === undefined);
  }

  function actualizarContadores() {
    const total = totalItems();
    document.querySelectorAll(".boton-carrito__contador").forEach((elemento) => {
      elemento.textContent = String(total);
      elemento.parentElement?.setAttribute(
        "aria-label",
        `Carrito de compras, ${total} ${total === 1 ? "producto" : "productos"}`
      );
    });
  }

  return {
    leer,
    agregar,
    actualizarCantidad,
    quitar,
    vaciar,
    totalItems,
    totalMonto,
    hayPreciosPendientes,
    actualizarContadores,
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  TiendaCarrito.actualizarContadores();
  inicializarPaginaCarrito();
});

/** Si existe el contenedor de la página de carrito, la renderiza por completo. */
function inicializarPaginaCarrito() {
  const contenedorLineas = document.getElementById("lineas-carrito");
  if (!contenedorLineas) return;

  function render() {
    const items = TiendaCarrito.leer();
    const vacio = document.getElementById("carrito-vacio");
    const contenido = document.getElementById("carrito-con-productos");

    if (!items.length) {
      if (vacio) vacio.hidden = false;
      if (contenido) contenido.hidden = true;
      return;
    }
    if (vacio) vacio.hidden = true;
    if (contenido) contenido.hidden = false;

    contenedorLineas.innerHTML = items
      .map((item) => {
        const precio = TiendaUI.formatearPrecio(item.precio, item.moneda);
        return `
        <div class="fila-carrito" data-id="${TiendaUI.escaparTexto(item.idProducto)}" data-talla="${TiendaUI.escaparTexto(item.talla || "")}">
          <div class="fila-carrito__medio">${TiendaUI.iconoMarcador()}</div>
          <div>
            <p class="fila-carrito__nombre">
              <a href="producto.html?id=${encodeURIComponent(item.idProducto)}">${TiendaUI.escaparTexto(item.nombre)}</a>
            </p>
            <p class="fila-carrito__meta">
              ${item.talla ? "Talla/variante: " + TiendaUI.escaparTexto(item.talla) : "Sin variante"} ·
              ${precio.texto}
            </p>
          </div>
          <div class="selector-cantidad">
            <button type="button" class="fila-carrito__restar" aria-label="Reducir cantidad">−</button>
            <input type="number" class="fila-carrito__cantidad" value="${item.cantidad}" min="1" max="20" aria-label="Cantidad">
            <button type="button" class="fila-carrito__sumar" aria-label="Aumentar cantidad">+</button>
          </div>
          <button type="button" class="fila-carrito__quitar">Quitar</button>
        </div>`;
      })
      .join("");

    contenedorLineas.querySelectorAll(".fila-carrito").forEach((fila) => {
      const id = fila.dataset.id;
      const talla = fila.dataset.talla || null;
      const entrada = fila.querySelector(".fila-carrito__cantidad");

      fila.querySelector(".fila-carrito__restar").addEventListener("click", () => {
        const nueva = Math.max(0, parseInt(entrada.value, 10) - 1);
        TiendaCarrito.actualizarCantidad(id, talla, nueva);
        render();
      });
      fila.querySelector(".fila-carrito__sumar").addEventListener("click", () => {
        const nueva = Math.min(20, parseInt(entrada.value, 10) + 1);
        TiendaCarrito.actualizarCantidad(id, talla, nueva);
        render();
      });
      entrada.addEventListener("change", () => {
        const nueva = Math.min(20, Math.max(0, parseInt(entrada.value, 10) || 0));
        TiendaCarrito.actualizarCantidad(id, talla, nueva);
        render();
      });
      fila.querySelector(".fila-carrito__quitar").addEventListener("click", () => {
        TiendaCarrito.quitar(id, talla);
        TiendaUI.anunciar("Producto eliminado del carrito.");
        render();
      });
    });

    const totalItems = TiendaCarrito.totalItems();
    const totalMonto = TiendaCarrito.totalMonto();
    const pendientes = TiendaCarrito.hayPreciosPendientes();

    const elementoConteo = document.getElementById("resumen-conteo");
    const elementoTotal = document.getElementById("resumen-total");
    const avisoPendiente = document.getElementById("resumen-aviso-pendiente");

    if (elementoConteo) elementoConteo.textContent = `${totalItems} ${totalItems === 1 ? "producto" : "productos"}`;
    if (elementoTotal) {
      elementoTotal.textContent = pendientes
        ? "Pendiente de validación"
        : TiendaUI.formatearPrecio(totalMonto, "BOB").texto;
    }
    if (avisoPendiente) avisoPendiente.hidden = !pendientes;
  }

  const botonVaciar = document.getElementById("vaciar-carrito");
  if (botonVaciar) {
    botonVaciar.addEventListener("click", () => {
      TiendaCarrito.vaciar();
      TiendaUI.anunciar("El carrito se vació.");
      render();
    });
  }

  render();
}
