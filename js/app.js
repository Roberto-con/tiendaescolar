/* ============================================================
   TIENDA ESCOLAR SANTO TOMÁS — app.js
   Inicio común: navegación activa e inicialización compartida
   entre páginas.
   ============================================================ */

const TiendaApp = (() => {
  const cache = new Map();

  /** Carga y valida un archivo JSON (usado por libros), con manejo de errores. */
  async function cargarJSON(ruta) {
    if (cache.has(ruta)) return cache.get(ruta);
    try {
      const respuesta = await fetch(ruta);
      if (!respuesta.ok) throw new Error(`No se pudo cargar ${ruta} (${respuesta.status})`);
      const datos = await respuesta.json();
      cache.set(ruta, datos);
      return datos;
    } catch (error) {
      console.error("Error cargando datos:", error);
      return null;
    }
  }

  /** Marca el enlace de navegación activo según la página actual. */
  function marcarPaginaActiva() {
    const rutaActual = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".lista-nav a").forEach((enlace) => {
      const destino = enlace.getAttribute("href").split("?")[0];
      if (destino === rutaActual) {
        enlace.setAttribute("aria-current", "page");
      }
    });
  }

  function init() {
    marcarPaginaActiva();
    TiendaUI.inicializarMenuMovil();
  }

  document.addEventListener("DOMContentLoaded", init);

  return { cargarJSON };
})();
