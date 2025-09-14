// Injecter le header
fetch("/header.html")
  .then(r => r.text())
  .then(html => { document.getElementById("site-header").innerHTML = html; })
  .catch(() => { /* silencieux */ });

// Déduire le chemin du fichier Markdown à partir de l'URL
// Déduire le chemin du fichier contenu à partir de l'URL
const rawPath = window.location.pathname.replace(/\/$/, ""); // supprime le / final
const path = rawPath.replace(/\.html$/, "");                  // supprime .html éventuel
const contentFile = "/content" + (path || "/index") + ".md";

// Récupérer le Markdown, extraire un éventuel front matter, convertir en HTML
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

    const html = marked.parse(md);
    const container = document.getElementById("site-content");

    // Optionnel: image de couverture si définie
    if (meta.cover) {
      const figure = document.createElement("figure");
      const img = document.createElement("img");
      img.src = meta.cover;
      img.alt = meta.title || "";
      img.loading = "lazy";
      figure.appendChild(img);
      container.appendChild(figure);
    }

    container.insertAdjacentHTML("beforeend", html);

    // Accessibilité & perfs minimales
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
    document.getElementById("site-content").innerHTML = "<p>Contenu introuvable.</p>";
  });
document.addEventListener('DOMContentLoaded', () => {
  // ... ton code header/footer ...

  const skipMd = document.body.matches('.page-contact, .page-merci');
  if (!skipMd) {
    // <= garde le code EXISTANT qui charge/injecte le Markdown
    // fetch('content/xxx.md') ...
  }
});
