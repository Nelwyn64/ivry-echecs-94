// ===============================
// include.js – Ivry Échecs 94
// Charge header/footer et le contenu Markdown (HTML autorisé)
// ===============================

// Injecter le header
fetch("/header.html")
  .then(r => r.text())
  .then(html => {
    const h = document.getElementById("site-header");
    if (h) h.innerHTML = html;
  })
  .catch(() => { /* silencieux */ });

// Injecter le footer
fetch("/footer.html")
  .then(r => r.text())
  .then(html => {
    const f = document.getElementById("site-footer");
    if (f) f.innerHTML = html;
  })
  .catch(() => { /* silencieux */ });

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("site-content");
  if (!container) return;

  // ⛔ Ne pas charger le Markdown si la page fournit déjà son HTML
  // (ex: /contact/ et /merci/ où on veut du HTML statique)
  const skipMd =
    container.hasAttribute("data-raw") ||
    document.body.matches(".page-contact, .page-merci");

  if (skipMd) return;

  // Déduire le fichier Markdown à partir de l’URL
  const rawPath = window.location.pathname.replace(/\/$/, ""); // supprime "/" final
  const path = rawPath.replace(/\.html$/, "");                  // supprime ".html"
  const contentFile = "/content" + (path || "/index") + ".md";

  // ✅ Configurer Marked pour autoriser le HTML dans le Markdown
  // (pas de sanitation, pas de mangle, pas d'IDs auto)
  if (typeof marked?.setOptions === "function") {
    marked.setOptions({
      gfm: true,
      breaks: false,
      mangle: false,
      headerIds: false
    });
  }

  fetch(contentFile)
    .then(r => {
      if (!r.ok) throw new Error("Not found");
      return r.text();
    })
    .then(md => {
      // Front matter léger: entre --- ... ---
      let meta = {};
      if (md.startsWith("---")) {
        const end = md.indexOf("\n---", 3);
        if (end !== -1) {
          const fm = md.slice(3, end).trim();
          md = md.slice(end + 4).trim();
          fm.split("\n").forEach(line => {
            const i = line.indexOf(":");
            if (i > -1) {
              const k = line.slice(0, i).trim();
              const v = line.slice(i + 1).trim().replace(/^"|"$/g, "");
              meta[k] = v;
            }
          });
        }
      }

      // Convertit le MD -> HTML (HTML brut autorisé)
      const html = (typeof marked?.parse === "function")
        ? marked.parse(md, { gfm: true, breaks: false, mangle: false, headerIds: false })
        : md; // fallback trivial si marked absent

      // Optionnel: cover si défini dans le front matter
      if (meta.cover) {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        img.src = meta.cover;
        img.alt = meta.title || "";
        img.loading = "lazy";
        figure.className = "cover";
        figure.appendChild(img);
        container.appendChild(figure);
      }

      // Injecte le contenu rendu
      container.insertAdjacentHTML("beforeend", html);

      // Ré-exécuter les <script> insérés via innerHTML (nécessaire pour les embeds comme Lichess)
      container.querySelectorAll("script").forEach(old => {
        const s = document.createElement("script");
        // Copie tous les attributs (src, async, defer, data-*)
        for (const { name, value } of old.attributes) s.setAttribute(name, value);
        // Copie le code inline si présent
        s.textContent = old.textContent;
        // Remplace l'ancien script par le nouveau pour déclencher l'exécution
        old.replaceWith(s);
      });

      // Accessibilité & perfs basiques sur les images
      container.querySelectorAll("img").forEach(img => {
        if (!img.getAttribute("alt")) img.setAttribute("alt", "");
        img.setAttribute("loading", "lazy");
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        img.style.display = "block";
        img.style.margin = "12px auto";
      });

      // Met à jour le <title> si fourni
      if (meta.title) document.title = meta.title + " – Ivry Échecs";
    })
    .catch(() => {
      // N’écrase pas un contenu statique existant
      if (!container.innerHTML.trim()) {
        container.innerHTML = "<p>Contenu introuvable.</p>";
      }
    });
});
