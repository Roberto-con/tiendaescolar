/* ============================================================
   TIENDA ESCOLAR SANTO TOMÁS — uniformes.js
   Los uniformes viven directo en el HTML (sin JSON). Este
   módulo solo agrega interacción: pestañas de grupo y "agregar
   al carrito" para las tarjetas estáticas.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  inicializarPestanas();
  inicializarAgregarEstatico();
});

/** Pestañas Escolares / Deportivos / Todos sobre tarjetas ya presentes en el HTML. */
function inicializarPestanas() {
  const pestanas = document.querySelectorAll("[data-pestana-uniforme]");
  const tarjetas = document.querySelectorAll("[data-grupo-uniforme]");
  if (!pestanas.length || !tarjetas.length) return;

  function mostrarGrupo(grupo) {
    tarjetas.forEach((tarjeta) => {
      const coincide = grupo === "todos" || tarjeta.dataset.grupoUniforme === grupo;
      tarjeta.hidden = !coincide;
    });
    pestanas.forEach((pestana) => {
      pestana.setAttribute("aria-selected", String(pestana.dataset.pestanaUniforme === grupo));
    });
  }

  pestanas.forEach((pestana) => {
    pestana.addEventListener("click", () => mostrarGrupo(pestana.dataset.pestanaUniforme));
  });

  const inicial = document.querySelector("[data-pestana-uniforme][aria-selected='true']");
  mostrarGrupo(inicial ? inicial.dataset.pestanaUniforme : "todos");
}

/** Delegación de "Agregar al carrito" para tarjetas de uniformes escritas en el HTML. */
function inicializarAgregarEstatico() {
  document.addEventListener("click", (evento) => {
    const boton = evento.target.closest(".boton-agregar-estatico");
    if (!boton) return;

    const tarjeta = boton.closest("[data-id]");
    if (!tarjeta) return;

    const selectorTalla = tarjeta.querySelector(".selector--talla");
    const talla = selectorTalla ? selectorTalla.value : null;
    const precioAttr = tarjeta.dataset.precio;

    const producto = {
      id: tarjeta.dataset.id,
      name: tarjeta.dataset.nombre,
      price: precioAttr ? Number(precioAttr) : null,
      currency: tarjeta.dataset.moneda || "BOB",
    };

    TiendaCarrito.agregar(producto, 1, talla);
    TiendaUI.anunciar(`"${producto.name}" se agregó al carrito.`);
  });
}
