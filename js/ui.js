/* ============================================================
   TIENDA ESCOLAR SANTO TOMÁS — ui.js
   Menú móvil, panel de filtros, anuncios accesibles y utilidades.
   ============================================================ */

const TiendaUI = (() => {
  /** Escapa texto antes de insertarlo como HTML, para evitar inyección. */
  function escaparTexto(valor) {
    if (valor === null || valor === undefined) return "";
    const div = document.createElement("div");
    div.textContent = String(valor);
    return div.innerHTML;
  }

  /** Formatea un precio solo si ya fue definido (no nulo). */
  function formatearPrecio(precio, moneda) {
    if (precio === null || precio === undefined) {
      return { texto: "Precio a confirmar", pendiente: true };
    }
    const formato = new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: moneda || "BOB",
      minimumFractionDigits: 2,
    });
    return { texto: formato.format(precio), pendiente: false };
  }

  /** Muestra un mensaje breve en un anunciador accesible (aria-live). */
  function anunciar(mensaje) {
    let contenedor = document.querySelector(".anunciador");
    if (!contenedor) {
      contenedor = document.createElement("div");
      contenedor.className = "anunciador";
      contenedor.setAttribute("role", "status");
      contenedor.setAttribute("aria-live", "polite");
      document.body.appendChild(contenedor);
    }
    contenedor.textContent = mensaje;
    contenedor.classList.add("anunciador--visible");
    clearTimeout(contenedor._temporizador);
    contenedor._temporizador = setTimeout(() => {
      contenedor.classList.remove("anunciador--visible");
    }, 2600);
  }

  /** Lee un valor de la query string actual. */
  function obtenerParametro(nombre) {
    return new URLSearchParams(window.location.search).get(nombre);
  }

  /** Inicializa el menú móvil (abrir/cerrar, foco, Escape). */
  function inicializarMenuMovil() {
    const boton = document.querySelector(".boton-menu-movil");
    const lista = document.querySelector(".lista-nav");
    if (!boton || !lista) return;

    const alternar = (abrir) => {
      lista.classList.toggle("abierta", abrir);
      boton.setAttribute("aria-expanded", String(abrir));
      boton.querySelector(".boton-menu-movil__icono").textContent = abrir ? "✕" : "☰";
      if (abrir) {
        const primerEnlace = lista.querySelector("a");
        if (primerEnlace) primerEnlace.focus();
      }
    };

    boton.addEventListener("click", () => {
      const abierta = lista.classList.contains("abierta");
      alternar(!abierta);
    });

    document.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape" && lista.classList.contains("abierta")) {
        alternar(false);
        boton.focus();
      }
    });

    lista.querySelectorAll("a").forEach((enlace) => {
      enlace.addEventListener("click", () => alternar(false));
    });
  }

  /** Ícono SVG de placeholder reutilizable (marcador de prenda/producto). */
  function iconoMarcador() {
    return `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M9 4h6l1.5 3H16a2 2 0 0 1 2 2v10a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9a2 2 0 0 1 2-2h.5L9 4Z"
          stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M9 4 8 7h8l-1-3" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
      </svg>`;
  }

  return {
    escaparTexto,
    formatearPrecio,
    anunciar,
    obtenerParametro,
    inicializarMenuMovil,
    iconoMarcador,
  };
})();
